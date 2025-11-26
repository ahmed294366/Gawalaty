"use client"
import toast from "react-hot-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { banTripAction } from "./tripActions"
import { Ellipsis, Settings } from "lucide-react";
import Link from "next/link";

export function ReviewControl({user, review ,reviewNative, setReviewStates }) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="absolute top-4 right-1 " asChild>
                <Ellipsis className='text-neutral-500' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20" align="end" side="bottom">
                {
                    review?.userid === user?.id &&
                    <>
                        <DropdownMenuItem
                            onClick={() => {
                                setReviewStates({...reviewNative,edit:true ,review})
                            }}
                        >
                            Edit
                        </DropdownMenuItem >
                        <DropdownMenuItem
                            onClick={() => {
                                setReviewStates({...reviewNative,reset:true ,review})
                            }}
                        >
                            Reset
                        </DropdownMenuItem>
                    </>
                }
                {user?.role === "admin" &&
                    <>
                        <DropdownMenuItem
                            onClick={() => {
                                setReviewStates({...reviewNative,ban:true ,review})
                            }}
                        >
                            Banned
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setReviewStates({...reviewNative,delete:true ,review})
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </>
                }
                {user&&
                    <DropdownMenuItem
                        onClick={() => {
                            setReviewStates({...reviewNative,report:true ,review})
                        }}
                    >
                        Report
                    </DropdownMenuItem>
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function TripControl({ trip, setTrip , setTripStates }) {

    async function HandleBanned() {
        const result = await banTripAction({ id:trip.id ,banned:trip.banned});
        if (result?.error) {
            return toast.error(result.message)
        }
        toast.success(result.message)
        setTrip({ ...trip, banned: result.banned })
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="absolute top-4 right-4 " asChild>
                <Settings className='text-zinc-200 hover:text-zinc-100 w-8 h-8' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20" align="end" side="bottom">
                <DropdownMenuItem
                    onClick={() =>setTripStates({edit:true ,delete:false,ban:false})}
                >
                    Edit
                </DropdownMenuItem >
                <DropdownMenuItem
                    onClick={() => { HandleBanned() }}
                >
                    {trip.banned ? "Un-Ban" : "Ban"}

                </DropdownMenuItem>

                <DropdownMenuItem>
                    <Link href={`/tripDatesAndBooking/${trip.id}`}>Manage</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}