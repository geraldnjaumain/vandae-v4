import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow SEO routes to bypass authentication
    if (
        pathname.startsWith('/sitemap') ||
        pathname.startsWith('/robots') ||
        pathname.startsWith('/manifest') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') ||
        pathname === '/favicon.ico' ||
        pathname === '/logo.svg' ||
        pathname === '/og-image.png'
    ) {
        return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

    // Public routes that don't require authentication
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/']
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/legal')

    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated
    if (user) {
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('major, university, interests')
            .eq('id', user.id)
            .maybeSingle()

        // If profile doesn't exist or has error, treat as incomplete onboarding
        const hasCompletedOnboarding = !profileError && profile?.major && profile?.university && profile?.interests && profile.interests.length > 0

        // Redirect to onboarding if not completed and not already there
        if (!hasCompletedOnboarding && pathname !== '/onboarding') {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/onboarding'
            return NextResponse.redirect(redirectUrl)
        }

        // Redirect to dashboard if trying to access login/signup while authenticated
        if (isPublicRoute && pathname !== '/' && hasCompletedOnboarding) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/dashboard'
            return NextResponse.redirect(redirectUrl)
        }

        // Redirect to dashboard if on onboarding but already completed
        if (pathname === '/onboarding' && hasCompletedOnboarding) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/dashboard'
            return NextResponse.redirect(redirectUrl)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
