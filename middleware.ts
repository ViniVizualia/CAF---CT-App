import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_PREFIXES = ['/dashboard', '/atletas', '/organizadores', '/torneios']
const ORGANIZER_PREFIXES = ['/meus-torneios', '/buscar-atleta']

const roleHome: Record<string, string> = {
  super_admin: '/dashboard',
  organizer: '/meus-torneios',
  athlete: '/home',
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

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

  const needsAdmin = matchesPrefix(pathname, ADMIN_PREFIXES)
  const needsOrganizer = matchesPrefix(pathname, ORGANIZER_PREFIXES)

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

    const allowed = needsAdmin
      ? role === 'super_admin'
      : role === 'super_admin' || role === 'organizer'

    if (!allowed) {
      const url = request.nextUrl.clone()
      url.pathname = roleHome[role ?? ''] ?? '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
