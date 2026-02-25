import Index from "@/components/pages/Index";
import { connectDB } from "@/libs/db";
import { unstable_cache } from "next/cache";
import rutas from "@/models/rutas";
import horarios from "@/models/horarios";
import unidades from "@/models/unidades";
import fiscales from "@/models/fiscales";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Cachear los catálogos estáticos por 1 hora (3600 segundos)
// Solo se consultará MongoDB una vez por hora para estos datos
const getCatalogos = unstable_cache(
  async () => {
    await connectDB();
    const [ruta, horario, unidad, fiscal] = await Promise.all([
      rutas.find().lean(),
      horarios.find().lean(),
      unidades.find().lean(),
      fiscales.find().lean(),
    ]);
    return { ruta, horario, unidad, fiscal };
  },
  ["catalogos-estaticos"],
  { revalidate: 3600 }
);

export default async function Home(request: any) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(process.env.JWT_NAME as any);
  let payloadd = null;
  if (jwt) {
    try {
      payloadd = await jwtVerify(jwt.value, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch (error) {
      console.log(error);
    }
  }

  // Obtener catálogos desde caché (evita queries repetidas a MongoDB)
  const { ruta, horario, unidad, fiscal } = await getCatalogos();

  return (
    <Index
      payload={payloadd}
      horarios={JSON.stringify(horario)}
      rutas={JSON.stringify(ruta)}
      unidades={JSON.stringify(unidad)}
      fiscales={JSON.stringify(fiscal)}
    />
  );
}
