import { connectDB } from "@/libs/db";
import unidades from "@/models/unidades";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// Caché de la lista completa de unidades por 5 minutos en Vercel
// Evita consultar MongoDB en cada petición de la app móvil
const getUnidadesCached = unstable_cache(
  async () => {
    await connectDB();
    return unidades.find().lean();
  },
  ["unidades-list"],
  { revalidate: 57600 } // 16 horas — las unidades raramente cambian
);

export async function POST(request: any) {
  const busId = await request.json();
  console.log(busId.busId);
  try {
    const rutasList = await unidades.findOne({ _id: busId.busId }).lean();
    return NextResponse.json(rutasList);
  } catch (error) {
    console.log(error);
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}

export async function GET(request: any) {
  try {
    const rutasList = await getUnidadesCached();
    return NextResponse.json(rutasList);
  } catch (error) {
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}