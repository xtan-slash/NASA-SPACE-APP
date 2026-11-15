import { createStart } from "@tanstack/react-start";
import { authMiddleware, base44RequestMiddleware } from "@/lib/auth-middleware";
import { errorCaptureFunctionMiddleware, errorCaptureRequestMiddleware } from "@/lib/error-capture";
import { securityHeadersRequestMiddleware } from "@/lib/security-headers";

// Every server function and server route gets `context.getBase44()`, acting as the visitor.
// Error capture goes first, so it sees what the other middlewares and the handlers throw.
export const startInstance = createStart(() => ({
  requestMiddleware: [errorCaptureRequestMiddleware, securityHeadersRequestMiddleware, base44RequestMiddleware],
  functionMiddleware: [errorCaptureFunctionMiddleware, authMiddleware],
}));