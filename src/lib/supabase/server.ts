import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient(request: Request) {
  const headers = new Headers();

  return {
    supabase: createServerClient<Database>(
      process.env["VITE_SUPABASE_URL"]!,
      process.env["VITE_SUPABASE_ANON_KEY"]!,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get("Cookie") ?? "")
              .filter((c): c is { name: string; value: string } => c.value !== undefined);
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              headers.append("Set-Cookie", serializeCookieHeader(name, value, options)),
            );
          },
        },
      },
    ),
    headers,
  };
}
