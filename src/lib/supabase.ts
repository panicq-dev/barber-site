import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://fmutugzjppcpwwajmndk.supabase.co"
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_avQ8YoJ7k2levSdmgM1WVA_Z8F7Qipc"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
