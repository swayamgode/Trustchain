import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEFAULT_URL = "https://odyswtjvukwpytcizfft.supabase.co";
const DEFAULT_KEY = "sb_publishable_a2KpLBvNlbxI5zh0ZjjXhQ_oDW9-fwL";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_KEY;
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
