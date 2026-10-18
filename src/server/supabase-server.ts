import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service role key must NEVER be exposed to frontend or prefixed with VITE_
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://iqhskbtavksjxrvyyriz.supabase.co";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isServiceRoleConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceRoleKey &&
  supabaseServiceRoleKey !== "your-supabase-service-role-key-placeholder" &&
  !supabaseServiceRoleKey.includes("placeholder"),
);

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isServiceRoleConfigured) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

export function isServerSupabaseReady(): boolean {
  return isServiceRoleConfigured;
}
