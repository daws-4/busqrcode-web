import unidades from "@/models/unidades";
import { connectDB } from "@/libs/db";
import { ObjectId } from "mongodb";
import Unidades_id from "@/components/pages/Unidades_id";

connectDB()

export default async function Home(props: { params: Promise<{ unid: any }> }) {
    const param = await props.params;
    const grupId = await param.unid
    const unid = await unidades.find();

    if (!ObjectId.isValid(grupId)) {
        return
    }
    const unidad = await unidades.findOne({ _id: grupId });
    return (
        <>
            <Unidades_id unidad={JSON.stringify(unidad)} params={param} unidades={JSON.stringify(unid)} />
        </>
    )
}