import { corsHeaders } from "./cors.ts";
import { HttpError, isHttpError } from "./httpErrors.ts";

export const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response("ok", { headers: corsHeaders });
}

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: jsonHeaders,
  });
}

export function assertMethod(req: Request, allowedMethod: string): void {
  if (req.method !== allowedMethod) {
    throw new HttpError(405, "Method not allowed");
  }
}

export function parseLimit(
  url: URL,
  {
    key = "limit",
    defaultValue = 20,
    min = 1,
    max = 50,
  }: { key?: string; defaultValue?: number; min?: number; max?: number } = {},
): number {
  const parsed = Number.parseInt(url.searchParams.get(key) ?? `${defaultValue}`, 10);
  return Math.min(Math.max(parsed || defaultValue, min), max);
}

export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return await req.json() as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export function handleFunctionError(error: unknown, fallbackCode: string): Response {
  if (isHttpError(error)) {
    return jsonResponse(
      error.code ? { message: error.message, code: error.code } : { message: error.message },
      error.status,
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  return jsonResponse({ message, code: fallbackCode }, 500);
}
