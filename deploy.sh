#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./deploy.sh [options]

Build and deploy cc98-web Docker image to a remote host via SSH.

Options:
  --remote-host <host>        SSH host (default: omarchy)
  --service-dir <dir>         Remote docker-compose directory (default: /home/mise42/services/cc98)
  --service-name <name>       Compose service name (default: cc98)
  --image <name>              Docker image name (default: cc98-web)
  --tag <tag>                 Docker image tag (default: latest)
  --platform <platform>       Build platform (default: linux/amd64)
  --redirect-uri <uri>        VITE_OAUTH_REDIRECT_URI build arg override
  --remote-health-url <url>   Remote health endpoint (default: http://127.0.0.1:13000/health)
  --tailnet-health-url <url>  Optional health check URL from local machine
  --skip-build                Skip local build, only transfer+deploy existing image
  -h, --help                  Show this help

Env passthrough build args (if set):
  VITE_API_URL VITE_OPENID_URL VITE_IMAGE_UPLOAD_URL VITE_OAUTH_CLIENT_ID
  VITE_OAUTH_CLIENT_SECRET VITE_OAUTH_REDIRECT_URI VITE_SIGNALR_URL
  VITE_APP_NAME VITE_APP_VERSION VITE_LOG_LEVEL
EOF
}

log() {
  echo "[deploy] $*"
}

REMOTE_HOST="${REMOTE_HOST:-omarchy}"
SERVICE_DIR="${SERVICE_DIR:-/home/mise42/services/cc98}"
SERVICE_NAME="${SERVICE_NAME:-cc98}"
IMAGE_NAME="${IMAGE_NAME:-cc98-web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PLATFORM="${PLATFORM:-linux/amd64}"
REMOTE_HEALTH_URL="${REMOTE_HEALTH_URL:-http://127.0.0.1:13000/health}"
TAILNET_HEALTH_URL="${TAILNET_HEALTH_URL:-}"
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote-host)
      REMOTE_HOST="$2"
      shift 2
      ;;
    --service-dir)
      SERVICE_DIR="$2"
      shift 2
      ;;
    --service-name)
      SERVICE_NAME="$2"
      shift 2
      ;;
    --image)
      IMAGE_NAME="$2"
      shift 2
      ;;
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --redirect-uri)
      export VITE_OAUTH_REDIRECT_URI="$2"
      shift 2
      ;;
    --remote-health-url)
      REMOTE_HEALTH_URL="$2"
      shift 2
      ;;
    --tailnet-health-url)
      TAILNET_HEALTH_URL="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh is required" >&2
  exit 1
fi

IMAGE_REF="${IMAGE_NAME}:${IMAGE_TAG}"

if [[ "$SKIP_BUILD" != true ]]; then
  log "Building ${IMAGE_REF} for ${PLATFORM}"

  BUILD_ARGS=()
  for key in \
    VITE_API_URL \
    VITE_OPENID_URL \
    VITE_IMAGE_UPLOAD_URL \
    VITE_OAUTH_CLIENT_ID \
    VITE_OAUTH_CLIENT_SECRET \
    VITE_OAUTH_REDIRECT_URI \
    VITE_SIGNALR_URL \
    VITE_APP_NAME \
    VITE_APP_VERSION \
    VITE_LOG_LEVEL; do
    value="${!key:-}"
    if [[ -n "$value" ]]; then
      BUILD_ARGS+=(--build-arg "${key}=${value}")
    fi
  done

  docker buildx build \
    --platform "$PLATFORM" \
    -t "$IMAGE_REF" \
    --load \
    "${BUILD_ARGS[@]}" \
    .
fi

log "Backing up current remote image tag (if exists)"
ssh "$REMOTE_HOST" "set -e; if docker image inspect ${IMAGE_REF} >/dev/null 2>&1; then bk=${IMAGE_NAME}:backup-\$(date +%Y%m%d-%H%M%S); docker tag ${IMAGE_REF} \"\$bk\"; echo \"Backed up old image as \$bk\"; fi"

log "Transferring image to remote host: ${REMOTE_HOST}"
docker save "$IMAGE_REF" | gzip | ssh "$REMOTE_HOST" 'gunzip | docker load'

log "Recreating remote service ${SERVICE_NAME} in ${SERVICE_DIR}"
ssh "$REMOTE_HOST" "SERVICE_DIR='${SERVICE_DIR}' SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'EOF'
set -euo pipefail
cd "$SERVICE_DIR"
docker compose up -d --force-recreate "$SERVICE_NAME"
docker compose ps "$SERVICE_NAME"
EOF

log "Waiting for health check: ${REMOTE_HEALTH_URL}"
ssh "$REMOTE_HOST" "SERVICE_DIR='${SERVICE_DIR}' SERVICE_NAME='${SERVICE_NAME}' HEALTH_URL='${REMOTE_HEALTH_URL}' bash -s" <<'EOF'
set -euo pipefail
cd "$SERVICE_DIR"
CID="$(docker compose ps -q "$SERVICE_NAME")"
if [[ -z "$CID" ]]; then
  echo "Failed to locate container for service: $SERVICE_NAME" >&2
  exit 1
fi

for _ in $(seq 1 30); do
  HEALTH="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CID")"
  if [[ "$HEALTH" == "healthy" || "$HEALTH" == "none" ]]; then
    break
  fi
  sleep 2
done

curl -fsS "$HEALTH_URL"
echo
EOF

if [[ -n "$TAILNET_HEALTH_URL" ]]; then
  log "Checking tailnet URL from local machine: ${TAILNET_HEALTH_URL}"
  curl -fsS "$TAILNET_HEALTH_URL"
  echo
fi

log "Deploy finished: ${IMAGE_REF} -> ${REMOTE_HOST}/${SERVICE_NAME}"
