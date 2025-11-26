"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CircleCheckBig, XCircle, Calendar, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GetBookingsAction, GetBookingCountAction } from "./dashboardActions"

import { ConfirmBookingAction, rejectBookingAction } from '@/shared/ServerAction';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DashboardPagination, Empty } from './dashboardComponents';
import { getStatusColor } from '@/shared/tripUtils';
import { Loading } from '@/shared/loading';

export default function BookingsTab() {

    const [filter, setFilter] = useState([{ date: "upcoming", status: "all" }, 1]);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true)
    const [pages, setPages] = useState(1);
    const [Bookings, setBookings] = useState([]);
    const [rejectBooking, setRejectBooking] = useState([false, ""]);

    useEffect(() => {
        async function GetBookings() {
            const bookings = await GetBookingsAction({ date: filter[0].date, status: filter[0].status, page: filter[1] });
            if (bookings?.error) {
                throw new Error(bookings?.message)
            }
            setBookings(bookings);
            setLoading(false)
        }
        GetBookings()
    }, [filter, refresh]);

    useEffect(() => {
        async function getCount() {
            const items = await GetBookingCountAction({ status: filter[0].status, date: filter[0].date });
            if (items?.error) {
                throw new Error(items?.message)
            }

            if (items <= 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        getCount()
    }, [filter[0], refresh]);

    return (
        <>
            <TabsContent value="bookings" >
                <Card>
                    <CardHeader className={"flex flex-col gap-2 justify-between items-start sm:items-center sm:flex-row"}>

                        <CardTitle className={"flex flex-wrap justify-between gap-2 flex-col sm:flex-row items-start"} >

                            <span className={"font-semibold flex items-center gap-2 text-xl "}>
                                <RefreshCw
                                    onClick={() => setRefresh(refresh + 1)}
                                    className="h-4 w-4 cursor-pointer"
                                />
                                Manage Bookings
                            </span>
                        </CardTitle>

                        <div className="flex items-center  flex-wrap gap-4 ">
                            <Select value={filter[0].date} onValueChange={(e) => { setFilter([{ date: e, status: filter[0].status }, 1]) }}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="old">Old</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filter[0].status} onValueChange={(e) => { setFilter([{ status: e, date: filter[0].date }, 1]) }}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>

                        {loading ?
                            (<Loading />)
                            :
                            (
                                Bookings.length <= 0 ? (
                                    <Empty text={"No booking found"} Icon={Calendar} />
                                ) : (
                                    <div className="space-y-4">
                                        {Bookings?.map((booking) => (
                                            <BookingItem
                                                key={booking.id}
                                                booking={booking} Bookings={Bookings}
                                                filter={filter} setBookings={setBookings}
                                                setRejectBooking={setRejectBooking} />
                                        ))}
                                    </div>)
                            )
                        }
                    </CardContent>
                    {Bookings?.length > 0 &&
                        <DashboardPagination page={filter[1]} type={filter[0]} setPageAndType={setFilter} pages={pages} />
                    }
                </Card>

            </TabsContent>
            {rejectBooking[0] &&
                <AlertRejectBooking rejectBooking={rejectBooking} setRejectBooking={setRejectBooking} Bookings={Bookings} setBookings={setBookings} status={filter[0].status} />}
        </>
    )
}

function BookingItem({ booking, Bookings, setBookings, filter, setRejectBooking }) {
    const [loading, setloading] = useState(false);

    async function HandleConfirm() {
        setloading(true);
        const response = await ConfirmBookingAction(booking.id);
        setloading(false);
        if (response?.error) {
            return toast.error(response.message)
        }

        toast.success(response.message);
        if (filter[0].status === "all") {
            setBookings(Bookings.map(b => {
                if (b.id === booking.id) {
                    b.status = "confirmed"
                }
                return b
            }))
        } else {
            setBookings(Bookings.filter(b => b.id !== booking.id))
        }

    };

    return (
        <div className='bg-gray-50 rounded-lg p-4'>
            <div className="flex flex-col sm:flex-row items-start gap-2 justify-between max-w-full overflow-hidden flex-wrap">

                <h4 className="font-bold text-nowrap">{booking.trip.title}</h4>

                <Link href={`/profile/${booking.user.id}`} className='text-nowrap underline text-blue-800 font-semibold'>{booking.user.name}</Link>

                <span

                    className="truncate max-w-full"
                >
                    {booking.user.email}
                </span>

                <span className='text-nowrap'>{"• "} {booking.people} people</span>
                <span className='text-nowrap'>{"• "}{new Date(booking.date.date).toLocaleDateString()}</span>

                <span className=" font-semibold text-nowrap">
                    {`• ${booking.people * booking.trip.price} LE`}
                </span>

                <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                </Badge>
            </div>
            <div className='mt-3 flex flex-col sm:flex-row gap-2'>
                <Button size="sm" variant="outline" asChild>
                    <Link href={`/trip/${booking.trip.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Trip
                    </Link>
                </Button>

                {booking?.status === "pending" &&
                    <>
                        <Button
                            disabled={loading}
                            onClick={() => { HandleConfirm(booking) }}
                            className={"bg-emerald-600 hover:bg-emerald-500"}
                            size="sm">

                            <CircleCheckBig className="h-4 w-4 mr-1" />
                            Confirm

                        </Button>

                        <Button
                            disabled={loading}
                            onClick={() => setRejectBooking([true, booking.id])}
                            size="sm"
                            className={"bg-red-600 hover:bg-red-500 text-white hover:text-white"}
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </>
                }

            </div>
        </div>
    )
}

function AlertRejectBooking({ rejectBooking, setRejectBooking, Bookings, setBookings, status }) {

    const [loading, setLoading] = useState(false);

    async function HandleReject() {
        setLoading(true);
        const response = await rejectBookingAction(rejectBooking[1]);
        setLoading(false);
        if (response?.error) {
            return toast.error(response.message)
        }
        toast.success(response.message);
        if (status !== "all") {
            setBookings(Bookings.filter(b => b.id !== rejectBooking[1]))
        } else {
            setBookings(Bookings.map(b => {
                if (b.id === rejectBooking[1]) {
                    b.status = "rejected"
                }
                return b
            }))
        }
        setRejectBooking([false, ""])
    }
    return (
        <div
            onClick={() => { if (!loading) setRejectBooking([false, ""]) }}
            className='flex items-center justify-center fixed top-0 left-0 bg-black/40 w-full h-screen z-50'>

            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white rounded-md w-lg space-y-4 p-4'>
                <h2 className='font-bold text-xl'>
                    Are you sure ?
                </h2>
                <span className='text-zinc-500 font-semibold'>
                    This will reject this booking ,cant be un-done
                </span>
                <div className='flex flex-col sm:flex-row gap-2 mt-4 justify-end'>
                    <Button
                        disabled={loading}
                        variant={"outline"}
                        onClick={() => setRejectBooking([false, ""])}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={HandleReject}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}