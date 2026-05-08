const MARKDOWN_PATHS = new Set(["/", "/index.html"]);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const wantsMarkdown = request.headers
    .get("Accept")
    ?.toLowerCase()
    .includes("text/markdown");

  if (wantsMarkdown && MARKDOWN_PATHS.has(url.pathname)) {
    const markdownUrl = new URL("/index.md", url);
    const markdownRequest = new Request(markdownUrl, request);
    const markdownResponse = await fetch(markdownRequest);
    const headers = new Headers(markdownResponse.headers);

    headers.set("Content-Type", "text/markdown; charset=utf-8");
    headers.set("Vary", "Accept");
    headers.set("Link", '</index.md>; rel="service-doc"; type="text/markdown"');

    return new Response(markdownResponse.body, {
      status: markdownResponse.status,
      statusText: markdownResponse.statusText,
      headers,
    });
  }

  const response = await next();

  if (MARKDOWN_PATHS.has(url.pathname)) {
    const headers = new Headers(response.headers);
    headers.append("Vary", "Accept");
    headers.set("Link", '</index.md>; rel="service-doc"; type="text/markdown"');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
