const API_BASE_URL = process.env.VITE_API_URL || 'https://qsh.api.cc98.top'

async function proxyRequest(request: Request, pathParts: string[]) {
  const url = new URL(request.url)
  const targetUrl = new URL(pathParts.join('/'), API_BASE_URL)
  targetUrl.search = url.search

  const headers = new Headers(request.headers)
  headers.delete('host')

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

type RouteContext = {
  params: Promise<{ path?: string[] }>
}

async function getPathParts(context: RouteContext) {
  const params = await context.params
  return params.path ?? []
}

export async function GET(request: Request, context: RouteContext) {
  const pathParts = await getPathParts(context)
  return proxyRequest(request, pathParts)
}

export async function POST(request: Request, context: RouteContext) {
  const pathParts = await getPathParts(context)
  return proxyRequest(request, pathParts)
}

export async function PUT(request: Request, context: RouteContext) {
  const pathParts = await getPathParts(context)
  return proxyRequest(request, pathParts)
}

export async function PATCH(request: Request, context: RouteContext) {
  const pathParts = await getPathParts(context)
  return proxyRequest(request, pathParts)
}

export async function DELETE(request: Request, context: RouteContext) {
  const pathParts = await getPathParts(context)
  return proxyRequest(request, pathParts)
}

export async function OPTIONS(request: Request, context: RouteContext) {
  const pathParts = await getPathParts(context)
  return proxyRequest(request, pathParts)
}
