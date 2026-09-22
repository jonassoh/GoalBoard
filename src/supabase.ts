import { createClient } from '@supabase/supabase-js'
import type { GoalData } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export async function loadCloudData(userId: string): Promise<GoalData | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('goalboard_data')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return (data?.data as GoalData | undefined) ?? null
}

export async function saveCloudData(userId: string, data: GoalData): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('goalboard_data')
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw error
}
