'use client'
import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify'
import axios from 'axios'
import { useEffect, useState } from "react";
import QRCode from 'qrcode'

interface Plantillas_Pizarras_idProps {
    unidad?: any
    params?: any
    unidades?: any
}

export default function Unidades_id({ unidad, params, unidades }: Plantillas_Pizarras_idProps) {
    const router = useRouter()
    const unid = JSON.parse(unidad)
    const unids = JSON.parse(unidades)
    const [nombre_conductor, setNombre_conductor] = useState(unid.nombre_conductor)
    const [telefono_conductor, setTelefono_conductor] = useState(unid.telefono_conductor)
    const [numero, setNumero] = useState(unid.numero)
    const [placa, setPlaca] = useState(unid.placa)
    const [src, setSrc] = useState('')



    const nextUnid = unids.find((u: any) => u.numero == unid.numero + 1)
    const prevUnid = unids.find((u: any) => u.numero == unid.numero - 1)
    console.log(nextUnid, prevUnid)


    const submitForm = async (e: any) => {
        e.preventDefault();
        const data = {
            nombre_conductor,
            telefono_conductor,
            numero,
            placa
        }
        try {
            const response = await axios.put(`/api/unidades`, { ...data, _id: params.unid });
            if (response.status === 400) {
                throw new Error('Error al editar la unidad');
            } else if (response.status == 401) {
                toast.error(response.data.error);
                console.log(response)
            } else if (response.status === 409) {
                console.log(response);
                toast.error('No se encuentra ninguna unidad con ese ID');
            } else if (response.status === 200) {
                toast.success('Unidad Editada', {
                    onClose: () => router.push('/unidades')
                });
            }

        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.error);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    }

    const deletePizarra = async () => {
        const deletedPizarra = window.confirm('¿Estás seguro de eliminar la Unidad?, esta acción no se puede deshacer')
        if (deletedPizarra) {
            try {
                const response = await axios.delete(`/api/unidades`, { data: { id: params.unid } });
                console.log(response)
                if (response.status == 200) {
                    toast.success('Unidad eliminada con éxito', { onClose: () => router.push('/unidades') })
                } else if (response.status == 409) {
                    console.log(response)
                    throw new Error('No se encuentra ninguna unidad con ese ID')
                }
            } catch (error) {
                console.log(error)
                toast.error('Error al eliminar la unidad')
            }
        }
        return
    }
    const generateQR = async (text: string | QRCode.QRCodeSegment[]) => {
        try {
            setSrc(await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' }))
        } catch (err) {
            console.error(err)
        }
    }
    useEffect(() => {
        generateQR(unid._id)
    }, [])
    return (
        <>
            <div className="mb-10 rounded-sm border border-stroke dark:bg-slate-800 bg-slate-200 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex justify-between items-center m-4">
                    <Button className='hover:cursor-pointer' onPress={() => prevUnid ? router.push(`/unidades/${prevUnid._id}`) : null} disabled={!prevUnid} variant="shadow">
                        Unidad Anterior
                    </Button>
                    <Card>
                        <CardHeader className="mx-4 flex flex-col justify-center items-center">
                            <h1 className="font-bold text-2xl my-3">Editar Unidad</h1>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <form onSubmit={submitForm} >
                                <div className="grid grid-cols-2 gap-4 m-6">
                                    <Input size='lg' name="nombre_conductor" isRequired required type='text' value={nombre_conductor} label='Nombre del Conductor' onChange={(e) => setNombre_conductor(e.target.value)} />
                                    <Input size='lg' name="placa" isRequired required type='text' value={placa} label='Placa' onChange={(e) => setPlaca(e.target.value)} />
                                    <Input size='lg' name="telefono_conductor" isRequired required type='number' value={telefono_conductor} label='Teléfono del Conductor' onChange={(e) => setTelefono_conductor(e.target.value)} />
                                    <Input size='lg' name="numero" isRequired required type='number' value={numero} label='Numero de la Unidad' onChange={(e) => setNumero(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 justify-center items-center">
                                    <Button type="submit" variant="shadow" className="w-full bg-green-700 text-slate-100 text-lg py-6"> Editar Unidad</Button>
                                    <Button onClick={() => deletePizarra()} variant="shadow" className="lg:w-full  bg-red-700 text-slate-100 text-lg py-6">Eliminar Unidad</Button>
                                </div>
                            </form>
                        </CardBody>
                        <Divider />
                        <CardFooter className="flex flex-row justify-between items-center">
                            <h1 className="text-xl my-3 font-bold">Código QR de la Unidad</h1>
                            {src ? (
                                <div className="flex flex-col items-center">
                                    <Image className="mx-16" src={src} alt="QR" />
                                    <a href={src} download={`unidad${numero}`} className="mt-2 text-blue-500 underline">
                                        Descargar QR
                                    </a>
                                </div>
                            ) : ''}
                        </CardFooter>
                    </Card>
                    <Button className='hover:cursor-pointer' onPress={() => nextUnid ? router.push(`/unidades/${nextUnid._id}`) : null} disabled={!nextUnid} variant="shadow">
                        Siguiente Unidad
                    </Button>
                </div>

                <div className="m-5">

                </div>
            </div>
        </>
    )
}