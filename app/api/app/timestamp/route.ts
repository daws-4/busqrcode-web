import { connectDB } from "@/libs/db";
import timestamps from "@/models/timestamps";
import fiscales from "@/models/fiscales";
import { NextResponse } from "next/server";

connectDB();

export async function POST(request: any) {
  const {id_ruta, id_unidad, id_fiscal, timestamp_telefono, timestamp_salida} = await request.json();
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
  try {

    const findFiscal = await fiscales.findOne({ _id: id_fiscal });

      if(findFiscal.sethora){
        const timestamp = new timestamps({
          id_ruta,
          id_unidad,
          id_fiscal,
          timestamp_telefono,
          timestamp_salida
        });;
        const saveTimestamp = await timestamp.save();
        return NextResponse.json(saveTimestamp);
      }else{
        // Obtener la fecha de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Buscar registros de timestamps donde coincidan id_unidad, id_ruta y createdAt sea del día de hoy
        const unidTimeStamps = await timestamps.find({
          id_unidad,
          id_ruta,
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          },
        });

        // Ordenar unidTimeStamps de más antigua a más reciente, dejando la más reciente en posición 0
        unidTimeStamps.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log(unidTimeStamps[0], "Unidad más reciente de la misma ruta");

        // falta comparar tiempos entre los puntos para ofrecer una respuesta diferente en caso de retardo -------------------
        const timestamp = new timestamps({
          id_ruta,
          id_unidad,
          id_fiscal,
          timestamp_telefono,
          timestamp_salida: null,
        });
        const saveTimestamp = await timestamp.save();
        return NextResponse.json(saveTimestamp);
      }


  } catch (error) {
    console.log(error);
    return NextResponse.json((error as Error).message, { status: 400 });
  }
}
