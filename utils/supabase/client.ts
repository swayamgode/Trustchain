import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_URL = "https://odyswtjvukwpytcizfft.supabase.co";
const DEFAULT_KEY = "sb_publishable_a2KpLBvNlbxI5zh0ZjjXhQ_oDW9-fwL";

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_KEY;
  return createBrowserClient(url, key);
};
