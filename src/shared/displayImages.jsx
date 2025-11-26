"use client"
import Image from "next/image";
import { ChevronRight, ChevronLeft, X } from "lucide-react"
import { useState } from "react";

export function DisplayImages({ images, setOpenImages,index }) {
    const [source, setSource] = useState(index);
    return (
        <div
            className="fixed w-full h-screen bg-black/90 z-50 top-0 left-0 select-none">

            <div 
            onClick={()=>setOpenImages([false,[],0])}
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center absolute top-5 right-8 text-zinc-300 hover:text-white cursor-pointer">
                <X className="" />
            </div>


            <div className="flex items-center justify-center gap-2 h-full w-full">

                <div 
                onClick={() => { if (source > 0) setSource(source - 1) }}
                className={`w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center cursor-pointer text-zinc-500 ${source > 0 && "hover:text-zinc-400"}`}>
                    <ChevronLeft className="h-9 w-9"/>
                </div>

                <Image
                    src={images[source]}
                    width={800}
                    height={800}
                    alt="photo"
                    className="max-h-[80%]"
                ></Image>


                <div 
                onClick={() => { if (source < (images.length - 1)) setSource(source + 1) }}
                className={`w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center cursor-pointer text-zinc-500 ${(source < images.length-1) && "hover:text-zinc-400"}`}>
                    <ChevronRight 
                        className="w-9 h-9" />
                </div>

            </div>
        </div>

    )
}