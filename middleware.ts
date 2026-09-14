import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_PREFIXES = ['/dashboard', '/atletas', '/organizadores', '/torneios']
const ORGANIZER_PREFIXES = ['/meus-torneios', '/buscar-atleta']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  function matchesPrefix(prefixes: string[]) {
    return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
  }

  const needsAdmin = matchesPrefix(ADMIN_PREFIXES)
  const needsOrganizer = matchesPrefix(ORGANIZER_PREFIXES)

  if (needsAdmin || needsOrganizer) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (needsAdmin) {
      if (role !== 'super_admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        return NextResponse.redirect(url)
      }
    } else if (needsOrganizer) {
      let allowed = role === 'super_admin'
      if (!allowed) {
        const { data: organizerRow } = await supabase
          .from('organizers')
          .select('id')
          .eq('profile_id', user.id)
          .maybeSingle()
        allowed = !!organizerRow
      }
      if (!allowed) {
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
