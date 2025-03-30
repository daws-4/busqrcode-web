import { connectDB } from "@/libs/db";
import rutas from "@/models/rutas";
import { NextResponse } from "next/server";

connectDB()

export async function GET(request: any) {
    try {
        const rutasList = await rutas.find();
        return NextResponse.json(rutasList);
    } catch (error) {
        return NextResponse.json((error as Error).message, { status: 400 });
    }
}
