import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Check for environment variables to prevent build crashes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // During build time or if env vars are missing, return a safe fallback with warning
    if (!supabaseUrl || !supabaseKey) {
        if (typeof window !== 'undefined') {
            console.warn('Supabase credentials missing! Using placeholder client. Authentication/Data fetch will fail.')
        }
        return createBrowserClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseKey || 'placeholder-key'
        )
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
