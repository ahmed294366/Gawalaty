"use client"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button" 
export default function Error({ error, reset }) {
    return (
        <div className="flex w-full items-center flex-col gap-4 justify-center h-[calc(100vh-70px)]">
            <div className="flex flex-col gap-2 items-center">
                <TriangleAlert className="w-15 h-15 text-red-600" />
                <p className="text-xl capitalize font-bold">{error?.message || "Something went wrong"}</p>
            </div>
            <Button onClick={() => reset()}>Try Again</Button>
        </div>
    )
}
