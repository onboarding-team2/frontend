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
  matcher: [
    /*
     * - _next/static (정적 스타일, 스크립트 파일)
     * - _next/image (Next.js 이미지 최적화 파일)
     * - favicon.ico (브라우저 탭 아이콘)
     * - 공공 API 호출이나 외부 백엔드 주소(http://localhost:8080)는 영향을 받지 않지만,
     * 혹시 모를 내부 api 경로(/api/:path*)도 예외 처리
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}