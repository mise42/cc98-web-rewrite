# syntax=docker/dockerfile:1

FROM oven/bun:1.2.22-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Optional build-time environment overrides.
# If not provided, Vite will fall back to .env.production values.
ARG VITE_API_URL
ARG VITE_OPENID_URL
ARG VITE_IMAGE_UPLOAD_URL
ARG VITE_OAUTH_CLIENT_ID
ARG VITE_OAUTH_CLIENT_SECRET
ARG VITE_OAUTH_REDIRECT_URI
ARG VITE_SIGNALR_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_LOG_LEVEL

RUN if [ -n "$VITE_API_URL" ]; then export VITE_API_URL="$VITE_API_URL"; fi \
  && if [ -n "$VITE_OPENID_URL" ]; then export VITE_OPENID_URL="$VITE_OPENID_URL"; fi \
  && if [ -n "$VITE_IMAGE_UPLOAD_URL" ]; then export VITE_IMAGE_UPLOAD_URL="$VITE_IMAGE_UPLOAD_URL"; fi \
  && if [ -n "$VITE_OAUTH_CLIENT_ID" ]; then export VITE_OAUTH_CLIENT_ID="$VITE_OAUTH_CLIENT_ID"; fi \
  && if [ -n "$VITE_OAUTH_CLIENT_SECRET" ]; then export VITE_OAUTH_CLIENT_SECRET="$VITE_OAUTH_CLIENT_SECRET"; fi \
  && if [ -n "$VITE_OAUTH_REDIRECT_URI" ]; then export VITE_OAUTH_REDIRECT_URI="$VITE_OAUTH_REDIRECT_URI"; fi \
  && if [ -n "$VITE_SIGNALR_URL" ]; then export VITE_SIGNALR_URL="$VITE_SIGNALR_URL"; fi \
  && if [ -n "$VITE_APP_NAME" ]; then export VITE_APP_NAME="$VITE_APP_NAME"; fi \
  && if [ -n "$VITE_APP_VERSION" ]; then export VITE_APP_VERSION="$VITE_APP_VERSION"; fi \
  && if [ -n "$VITE_LOG_LEVEL" ]; then export VITE_LOG_LEVEL="$VITE_LOG_LEVEL"; fi \
  && bun run build

FROM nginx:1.27-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
