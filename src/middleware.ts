import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 쿠키에서 토큰 확인
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl


  if (pathname === '/') {
    if (token) {
      const planType = request.cookies.get('planType')?.value?.toLowerCase() || 'dc'
      return NextResponse.redirect(new URL(`/pension/${planType}/dashboard`, request.url))
    }
    return NextResponse.next()
  }

  // 토큰이 없다면 로그인 화면으로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// 미들웨어 간섭 예외 설정
export const config = {
  matcher: ['/pension/:path*'],
}