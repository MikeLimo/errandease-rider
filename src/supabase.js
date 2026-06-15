import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://usmmllbkdfasanggemkv.supabase.co'
const supabaseKey = 'sb_publishable_Qdt5TKrc2urgaTScAbJW_A_BVrtpb4Y'

export const supabase = createClient(supabaseUrl, supabaseKey)