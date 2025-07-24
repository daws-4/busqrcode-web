import { NextResponse } from "next/server";
import {connectDB} from "@/libs/db";
import timestamps from "@/models/timestamps";
import moment from "moment-timezone";
connectDB();

export async function POST(request: any) {
  const { fecha } = await request.json(); // fecha en formato yyyy-mm-dd

  try {
    const startOfDayVenezuela = moment.tz(
      `${fecha}T00:00:00`,
      "America/Caracas"
    );
    const endOfDayVenezuela = moment.tz(
      `${fecha}T23:59:59.999`,
      "America/Caracas"
    );

    // Convertir a hora UTC
    const startOfDayUTC = startOfDayVenezuela.utc().toDate();
    const endOfDayUTC = endOfDayVenezuela.utc().toDate();

    // console.log(startOfDayUTC, endOfDayUTC);

    const registrosDeHoy = await timestamps.find({
      createdAt: {
        $gte: startOfDayUTC,
        $lte: endOfDayUTC,
      },
    });
    //id_fiscal : ObjectId('672ba1914234ebf7a715124f')
    // console.log(registrosDeHoy);
    // console.log(fecha);
    return NextResponse.json(registrosDeHoy);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los registros" },
      { status: 500 }
    );
  }
}
