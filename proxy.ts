import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const jwt = request.cookies.get(process.env.JWT_NAME!);
  
  if (jwt) {
    try {
      const { payload } = await jwtVerify(
        jwt.value,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      console.log(payload);
      
      // Verificar permisos de rol
      if (payload.rol != 5) {
        const restrictedPaths = ["/unidades", "/fiscales", "/rutas", "/horarios"];
        if (restrictedPaths.some(path => request.nextUrl.pathname.includes(path))) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }

      // Si el usuario está autenticado y está en la página de login, redirigir a la página principal
      if (request.nextUrl.pathname.includes("/login")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Continuar con la solicitud si el usuario está autenticado
      return NextResponse.next();
    } catch (error) {
      // Si el token es inválido y no está en la página de login, redirigir a login
      if (!request.nextUrl.pathname.includes("/login")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Continuar con la solicitud si el usuario está en la página de login
      return NextResponse.next();
    }
  } else {
    // Si el usuario no está autenticado y no está en la página de login, redirigir a login
    if (request.nextUrl.pathname != "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Continuar con la solicitud si el usuario está en la página de login
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/login",
    "/fiscales/:path*",
    "/horarios/:path*",
    "/rutas/:path*",
    "/unidades/:path*",
    "/",
  ],
};
