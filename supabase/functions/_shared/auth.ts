import { HttpError } from "./httpErrors.ts";

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function requireBearerToken(req: Request): string {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) {
    throw new HttpError(401, "Missing or invalid authorization header");
  }
  return token;
}

export async function requireAuthorizedUser(
  supabase: {
    auth: { getUser: (jwt: string) => Promise<{ data: { user: { id: string } | null }; error: unknown }> };
  },
  jwt: string,
  expectedUserId: string,
): Promise<void> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(jwt);

  if (error || !user || user.id !== expectedUserId) {
    throw new HttpError(403, "Unauthorized");
  }
}
