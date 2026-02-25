import { connectDB } from "@/libs/db";
import rutas from "@/models/rutas";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// Caché de la lista completa de rutas por 5 minutos en Vercel
const getRutasCached = unstable_cache(
    async () => {
        await connectDB();
        return rutas.find().lean();
    },
    ["rutas-list"],
    { revalidate: 57600 } // 16 horas — las rutas raramente cambian
);

export async function GET(request: any) {
    try {
        const rutasList = await getRutasCached();
        return NextResponse.json(rutasList);
    } catch (error) {
        return NextResponse.json((error as Error).message, { status: 400 });
    }
}
