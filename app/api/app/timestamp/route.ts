import { connectDB } from "@/libs/db";
import timestamps from "@/models/timestamps";
import fiscales from "@/models/fiscales";
import { NextResponse } from "next/server";

connectDB();

export async function POST(request: any) {
  const { id_ruta, id_unidad, id_fiscal, timestamp_telefono, timestamp_salida } = await request.json();
  console.log(id_ruta, id_unidad, id_fiscal, timestamp_telefono, timestamp_salida);

  const convertToMinutes = (timeString: string) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };

  const compareTimestamps = (
    time1: string,
    time2: string,
    maxDelay: number
  ) => {
    const minutes1 = convertToMinutes(time1);
    const minutes2 = convertToMinutes(time2);
    const diff = minutes2 - minutes1;
    return {
      onTime: diff <= maxDelay,
      onTimeText: diff <= maxDelay ? "A tiempo" : "Retardado",
      diff,
      delay: diff > maxDelay ? diff - maxDelay : 0,
    };
  };


  try {
    // Obtener la fecha de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Buscar registros de timestamps donde coincidan id_unidad, id_ruta y createdAt sea del día de hoy
    const unidTimestamps = await timestamps.find({
      id_unidad,
      id_ruta,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    unidTimestamps.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    console.log(unidTimestamps[0], "Unidad anterior de la misma ruta");


    // Buscar el fiscal con ubicación 'Terminal' o 'Barrancas'
    const findFiscales = await fiscales.find();
    const terminalFiscal = findFiscales.find((fiscal) => fiscal.ubicacion === "Terminal");
    const barrancasFiscal = findFiscales.find((fiscal) => fiscal.ubicacion === "Barrancas");

    // Filtrar el registro anterior más cercano en el lapso de 60 minutos
    const closestTimestamp = unidTimestamps.find((timestamp) => {
      const fiscalId = terminalFiscal?._id || barrancasFiscal?._id;
      if (timestamp.id_fiscal.toString() === fiscalId?.toString()) {
        const timeDiff = Math.abs(new Date().getTime() - new Date(timestamp.createdAt).getTime());
        const diffInMinutes = timeDiff / (1000 * 60); // Convertir diferencia a minutos
        return diffInMinutes <= 60;
      }
      return false;
    });

    // Si no se encuentra un registro válido, devolver null
    if (!closestTimestamp) {
      console.log("No se encontró un registro válido en el lapso de 60 minutos");
      return null;
    }
    const findFiscal2 = await fiscales.findOne({ _id: closestTimestamp.id_fiscal}) 
    const findFiscal = await fiscales.findOne({ _id: id_fiscal });


    if (findFiscal.sethora) {
      const timestamp = new timestamps({
        id_ruta,
        id_unidad,
        id_fiscal,
        timestamp_telefono,
        timestamp_salida
      });;
      const saveTimestamp = await timestamp.save();
      return NextResponse.json(saveTimestamp);
    } else {



      let tiempo;
      if (
        findFiscal.ubicacion == "Centro" &&
        findFiscal2.ubicacion == "Terminal"
      ) {
        tiempo = 23;
      } else if (
        findFiscal.ubicacion == "3 esquinas" &&
        findFiscal2.ubicacion == "Terminal"
      ) {
        tiempo = 45;
      } else if (
        findFiscal.ubcicacion == "Panaderia" &&
        findFiscal2.ubicacion == "Terminal"
      ) {
        tiempo = 47;
      } else if (
        findFiscal.ubcicacion == "Panaderia" &&
        findFiscal2.ubicacion == "Barrancas"
      ) {
            const isBefore8am = closestTimestamp.timestamp_salida < 8 * 60; // 8am in minutes
            const threshold = isBefore8am ? 12 : 14;
            tiempo = threshold
      }

      //formathour30 secs y mejorar el código
      const timestamp = new timestamps({
        id_ruta,
        id_unidad,
        id_fiscal,
        timestamp_telefono,
        timestamp_salida: null,
      });

      if (unidTimestamps.length > 0) {
        const lastTimestamp = unidTimestamps[unidTimestamps.length - 1];
        const comparison = compareTimestamps(
          lastTimestamp.timestamp_telefono,
          timestamp_telefono,
          23
        );
        console.log("Comparison Result:", comparison);
      }

      console.log(timestamp, unidTimestamps)
      const saveTimestamp = await timestamp.save();
      return NextResponse.json(saveTimestamp);
    }


  } catch (error) {
    console.log(error);
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}
