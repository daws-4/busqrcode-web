import { connectDB } from "@/libs/db";
import timestamps from "@/models/timestamps";
import fiscales from "@/models/fiscales";
import { NextResponse } from "next/server";

connectDB();

export async function POST(request: any) {
    const {numero_fiscal, id_fiscal} = await request.json();
    console.log(numero_fiscal, id_fiscal);
    try {
      // Obtener la fecha de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Buscar registros de timestamps donde createdAt esté dentro del rango del día de hoy y id_fiscal sea igual a id_fiscal
      const registros = await timestamps.find({
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
        id_fiscal: id_fiscal,
      });

           return NextResponse.json(
             registros ,
             { status: 200 }
           );
    } catch (error) {
        console.log(error);
        return NextResponse.json((error as Error).message, { status: 400 });
    }
}

