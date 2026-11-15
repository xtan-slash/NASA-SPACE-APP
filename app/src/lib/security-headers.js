import { createMiddleware } from "@tanstack/react-start";

// Apply conservative browser security headers to app-owned page and API responses.
// CSP is report-only initially because map tiles, fonts and Base44-managed scripts
// need a production browser review before an enforcing policy can safely be enabled.
export const securityHeadersRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const response = await next();
    if (!(response instanceof Response)) return response;

    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set(
      "Content-Security-Policy-Report-Only",
      "default-src 'self' https: data: blob: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'unsafe-eval'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https:",
    );
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
);