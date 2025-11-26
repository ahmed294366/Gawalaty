"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsContent } from "@/components/ui/tabs";
import { useState } from 'react';
import { CancelBookAction } from "../userActions"
import toast from 'react-hot-toast';
import { getStatusColor, getStatusIcon } from '@/shared/tripUtils';


export function BookingsTab({ profile, user }) {
    const [bookings, setBookings] = useState(profile.booking)
    if (user?.id !== profile?.id && user?.role !== "admin") {
        return null;
    }
    const [cancelBook, setCancelBook] = useState([false, ""])
    return (
        <>
            <TabsContent value="bookings" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className={"flex items-center font-bold"}>
                            <Calendar className="h-5 w-5 mr-2" />
                            My Bookings
                        </CardTitle>
                        <CardDescription className={"font-semibold text-zinc-500"}>
                            View and manage your trip bookings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {bookings?.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No bookings yet</p>
                                <p className="text-sm text-gray-400">Book your first Egyptian adventure!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings?.map((booking) => (
                                    <BookingItem setCancelBook={setCancelBook}
                                        key={booking.id}
                                        booking={booking}
                                        user={user}
                                        profile={profile} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {cancelBook[0] &&
                <AlertCancelBooking setCancelBook={setCancelBook} book={cancelBook[1]} setBookings={setBookings} bookings={bookings} />}
        </>
    )
}



function BookingItem({ booking, setCancelBook, user, profile }) {

    return (
        <div className="flex  flex-col sm:flex-row  justify-between p-4 bg-gray-50 rounded-lg items-start sm:items-center gap-2">
            <div className="flex flex-col gap-1">
                <h4 className="font-semibold">{booking?.trip?.title}</h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>Travel: {new Date(booking.date.date).toLocaleDateString()}</span>
                    <span>{booking.people} people</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">total: <span className="font-semibold text-amber-600">${booking.people * booking.trip.price}</span>
                </p>

                <p className="text-sm text-gray-500 mt-1">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-500 mt-1">status: {" "}
                    <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                    </Badge>
                </p>

            </div>
            <div className="flex mt-3 sm:mt-0 flex-col gap-2 w-full sm:flex-row  sm:w-fit items-center ">
                <Button
                    variant="outline" asChild>
                    <Link href={`/trip/${booking.trip?.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Trip
                    </Link>
                </Button>
                {(booking.status !== "rejected" &&
                    booking.status !== "cancelled" &&
                    (user?.id === profile?.id && ((new Date() - new Date(booking.createdAt)) / (1000 * 60 * 60)) < 48)) &&
                    (((new Date(booking.date.date) - new Date()) / (1000 * 60 * 60)) > 48) &&
                    <Button
                        onClick={() => setCancelBook([true, booking])}
                        variant="destructive"
                        className={"bg-emerald-600 hover:text-white text-white hover:bg-emerald-700 w-full flex sm:w-fit"}
                        size="sm">
                        <X className="h-4 w-4 mr-0" />
                        Cancel Booking
                    </Button>
                }
            </div>
        </div>
    )
}

function AlertCancelBooking({ bookings, setBookings, setCancelBook, book }) {
    const [loading, setLoading] = useState(false);

    async function HandleBookCancel() {
        

        if (book.status === "cancelled" || book.status === "rejected") {
            return toast.error(`this book is already ${book.status} before`)
        }

        setLoading(true);
        const response = await CancelBookAction(book.id);
        setLoading(false);

        if (response?.error) {
            return toast.error(response.message)
        } else {
            setBookings(bookings.map(b => {
                if (b.id === book.id) {
                    b.status = "cancelled"
                }
                return b
            }));
            setCancelBook([false, ""])
            return toast.success(response.message);
        }

    }

    return (
        <div
            onClick={() => {if(!loading)setCancelBook([false, ""])}}
            className='w-full fixed top-0 left-0 bg-black/40 h-screen flex items-center justify-center'>
            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white p-4 rounded-md w-lg space-y-4'>
                <h2 className="text-xl font-bold">Are you absolutely sure?</h2>
                <span className="text-zinc-500 font-semibold">
                    {book.status === "confirmed" ? <p className='font-semibold text-xl text-zinc-500'>You will cancel this booking</p> : "This book will be cancelled"}
                </span>
                <div className='w-full flex flex-col gap-2 sm:flex-row justify-end mt-4'>
                    <Button
                        disabled={loading}
                        onClick={() => setCancelBook([false, ""])}
                        variant={"outline"}>
                        cancel
                    </Button>

                    <Button
                        disabled={loading}
                        onClick={() => { HandleBookCancel() }}
                    >
                        continue
                    </Button>
                </div>
            </div>
        </div>
    )
}