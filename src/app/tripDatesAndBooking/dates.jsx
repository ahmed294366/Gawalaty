"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { useState } from 'react';
import { getDatesAction, countDatesAction, toggleDateAction, editDateAction, getBookingsAction, dateCancelledAction } from './tripDatesAction';
import { Calendar, Users, Banknote, Phone, Clock, ArrowLeft, CircleX } from 'lucide-react';
import { getStatusColor } from '@/shared/tripUtils';
import { useEffect } from 'react';
import { DashboardPagination } from '../dashboard/dashboardComponents';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as Calendr } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { editDateSchema } from './tripDatesSchema';
import { useRouter } from 'next/navigation';
import { ConfirmBookingAction, rejectBookingAction } from '@/shared/ServerAction';

export function DateComponent({ id, price, user }) {
    const [Dates, setDates] = useState([])
    const [filter, setFilter] = useState(["Upcoming", 1]);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const dateControlObj = { edit: false, ban: false, date: "", bookings: false, cancel: false }
    const [dateControl, setDateControl] = useState(dateControlObj);

    useEffect(() => {
        async function getDates() {
            const data = await getDatesAction({ id, date: filter[0], page: filter[1] });
            setLoading(false)
            if (data?.error) {
                throw new Error(data.message)
            }
            setDates(data)
        }
        getDates();
    }, [filter]);

    useEffect(() => {
        async function countDates() {
            const items = await countDatesAction({ id, date: filter[0] });
            if (items?.error) {
                throw new Error(items.message)
            }
            if (items <= 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        countDates()
    }, [filter[0]]);


    return (
        <div>
            <div className='flex flex-wrap items-center gap-6 justify-between w-full'>
                <h2
                    className="text-2xl font-bold mb-6">
                    Trip Dates & Bookings
                </h2>
                <div>
                    <div className="flex items-center flex-wrap gap-4">
                        <Select value={filter[0]} onValueChange={(e) => {
                            setFilter([e, 1])
                            setLoading(true)
                        }}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Upcoming">Upcoming</SelectItem>
                                <SelectItem value="Old">Old</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            {/*  */}
            {loading ? (
                <div className='w-full flex flex-col items-center justify-center h-40 pt-10'>
                    <span className="w-10 h-10 border-5 border-zinc-500 border-t-transparent rounded-full animate-spin"></span>
                </div>
            )
                :
                (
                    Dates.length <= 0 ?
                        (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">No dates available</h3>
                                    <p className='font-semibold text-zinc-500'>{`No ( ${filter[0]} ) Dates Found`}</p>
                                </CardContent>
                            </Card>
                        )
                        :
                        (
                            Dates?.map(date => {
                                return (
                                    <DateItem user={user} key={date.id} date={date} setDateControl={setDateControl} dateControlObj={dateControlObj} />
                                )
                            }
                            )
                        )
                )
            }
            {!loading && pages > 0 &&
                <DashboardPagination page={filter[1]} type={filter[0]} setPageAndType={setFilter} pages={pages} />}

            {dateControl.ban &&
                <AlertBan dateControlObj={dateControlObj} dateControl={dateControl} Dates={Dates} setDates={setDates} setDateControl={setDateControl} />}

            {dateControl.edit &&
                <AlertEdit Dates={Dates} setDates={setDates} dateControlObj={dateControlObj} dateControl={dateControl} setDateControl={setDateControl} />}

            {dateControl.bookings &&
                <BookingsComponent Dates={Dates} setDates={setDates} price={price} user={user} dateControlObj={dateControlObj} dateControl={dateControl} setDateControl={setDateControl} />}

            {dateControl.cancel &&
                <AlertCancel Dates={Dates} setDates={setDates} dateControlObj={dateControlObj} dateControl={dateControl} setDateControl={setDateControl} />}

        </div>
    );
}

function DateItem({ date, setDateControl, user, dateControlObj }) {
    return (
        <Card className="mb-6" key={date.id}>
            <CardHeader className="pb-4">
                <div
                    className="flex flex-col space-y-4">
                    <div className="flex items-center gap-3 w-full">
                        <CardTitle className="text-xl w-full">
                            <div className='flex flex-col gap-4 w-full items-start sm:flex-row justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    {new Date(date.date).toLocaleDateString()}
                                </div>
                                {user?.role === "admin" &&
                                    <div className='flex gap-2 w-fit flex-wrap'>
                                        <Button
                                            onClick={() => setDateControl({ ...dateControlObj, date, ban: true })}
                                            className={"bg-zinc-200 text-zinc-600 hover:bg-zinc-300"}
                                            size={"sm"}>
                                            {date?.banned ? "Un-ban" : "Ban"}
                                        </Button>
                                        <Button
                                            onClick={() => setDateControl({ ...dateControlObj, date, edit: true })}
                                            className={"bg-amber-200 text-amber-600 hover:bg-amber-300"}
                                            size={"sm"}>
                                            edit
                                        </Button>
                                        <Button
                                            onClick={() => setDateControl({ ...dateControlObj, date, cancel: true })}
                                            className={"bg-red-200 text-red-600 hover:bg-red-300"}
                                            size={"sm"}>
                                            Cancel
                                        </Button>
                                    </div>}
                            </div>
                        </CardTitle>
                    </div>

                    {/* Date Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        <div className="bg-blue-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-blue-600">{date.bookings.length}</div>
                            <div className="text-xs text-blue-600">Total Bookings</div>
                        </div>
                        <div className="bg-green-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-green-600">{date.confirmedBookingsCount}</div>
                            <div className="text-xs text-green-600">Confirmed</div>
                        </div>
                        <div className="bg-yellow-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-yellow-600">{date.rejectedBookingsCount}</div>
                            <div className="text-xs text-yellow-600">Rejected</div>
                        </div>
                        <div className="bg-yellow-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-yellow-600">{date.pendingBookingsCount}</div>
                            <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="bg-emerald-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-emerald-600">{date.confirmedPeople}</div>
                            <div className="text-xs text-emerald-600">Total confirmed People</div>
                        </div>
                        <div className="bg-yellow-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-yellow-600">{date.pendingPeople}</div>
                            <div className="text-xs text-yellow-600">Total Pending People</div>
                        </div>
                        <div className="bg-emerald-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-emerald-600">{date.rejectedPeople}{" LE"}</div>
                            <div className="text-xs text-emerald-600">Total Pending People</div>
                        </div>


                        <div className="bg-blue-50 px-3 py-2 rounded-lg text-center">
                            <div className="font-semibold text-blue-600">{date.maxpeople}</div>
                            <div className="text-xs text-blue-600">Remaining-Places</div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setDateControl({ ...dateControlObj, bookings: true, date })}
                        className={"mt-3 bg-zinc-100 text-black font-bold hover:bg-zinc-200"}>
                        Show Bookings
                    </Button>
                </div>
            </CardHeader>
        </Card>
    )
}

function BookingsComponent({ price, setDateControl, user, dateControl, dateControlObj }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("confirmed");

    useEffect(() => {
        async function getBookings() {
            const data = await getBookingsAction({ dateid: dateControl.date.id, tripid: dateControl.date.tripid, status })
            if (data?.error) {
                setDateControl(dateControlObj)
                return toast.error(data.message)
            }
            setLoading(false);
            setBookings(data)
        }
        getBookings()
    }, [status]);
    return (
        <div
            onClick={() => setDateControl(dateControlObj)}
            className='flex fixed w-full h-screen top-0 left-0 bg-black/40 z-50 items-center justify-center'>
            <div
                onClick={(e) => e.stopPropagation()}
                className='w-11/12 max-w-7xl max-h-screen overflow-y-auto bg-white p-4 rounded-md  space-y-4  '>

                <div className='flex  justify-between'>
                    <span className='flex gap-2 font-semibold'><Calendar className='text-blue-600' /> Date: {new Date(dateControl.date.date).toLocaleDateString()}</span>
                    <CircleX
                        onClick={() => setDateControl(dateControlObj)}
                        className=' text-red-500 hover:text-red-600 cursor-pointer ' />
                </div>

                <div className='flex items-center gap-1'>
                    <span className='font-semibold '>Status:</span>
                    <Select
                        value={status}
                        onValueChange={(e) => {
                            setStatus(e)
                            setLoading(true)
                        }}>
                        <SelectTrigger className="w-32 font-semibold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent  >
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    {loading ? (
                        <div className='w-full flex items-center justify-center h-40'>
                            <span
                                className="w-10 h-10 rounded-full border-5 border-zinc-500 border-t-transparent "></span>
                        </div>
                    ) : (
                        bookings?.length <= 0 ?
                            (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-semibold">No {<span className='font-bold'>{"( " + status + " )"}</span>} Bookings Found</p>
                                    <p className="text-sm text-gray-400">Bookings will appear here when travelers book this date</p>
                                </div>
                            )
                            :
                            (
                                bookings.map(booking => (<BookingItem booking={booking} price={price} bookings={bookings} setBookings={setBookings} key={booking.id} user={user} />))
                            )
                    )}
                </div>
            </div>
        </div>
    )
}

function BookingItem({ booking, price, user, bookings, setBookings }) {
    async function handleConfirm() {
        const response = await ConfirmBookingAction(booking.id);
        if (response?.error) {
            return toast.error(response.message)
        } else {
            toast.success(response.message);
            setBookings(bookings.filter(b => b.id !== booking.id))
        }
    }
    async function handleReject() {
        const response = await rejectBookingAction(booking.id);
        if (response?.error) {
            return toast.error(response.message)
        } else {
            toast.success(response.message);
            setBookings(bookings.filter(b => b.id !== booking.id))
        }
    }

    return (
        <div key={booking.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors pb-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3 sm:mb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 max-w-full">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={booking.user.image} />
                        <AvatarFallback className="text-sm">
                            {booking?.user?.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className='overflow-x-hidden text-ellipsis max-w-full'>
                        <h4 className="font-semibold">{booking?.user?.name}</h4>
                        <p className="text-sm text-gray-600 overflow-x-hidden text-ellipsis">{booking?.user?.email}
                        </p>
                    </div>
                </div>
                <p>
                    <span className='sm:hidden text-sm text-gray-600'>status{" "}</span>
                    <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                    </Badge>
                </p>

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{booking.people} {booking.people === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Booked At {new Date(booking?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{booking.people * price}{" LE"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">            {booking?.user?.phone || "not provided"}
                    </span>
                </div>
            </div>
            {booking.status === "pending" && user.role === "admin" && <div className='flex gap-2 flex-col mt-6 w-full'>
                <Button
                    onClick={handleConfirm}
                    className={"bg-emerald-500 hover:bg-emerald-600 font-semibold text-xl"}>Confirm</Button>
                <Button
                    onClick={handleReject}
                    variant={"outline"} className={"font-semibold text-xl"}>Reject</Button>
            </div>}

        </div>
    )
}

function AlertEdit({ dateControl, setDateControl, dateControlObj, Dates, setDates }) {
    const [date, setDate] = useState(dateControl.date.date);
    const [maxpeople, setMaxPeople] = useState(dateControl.date.maxpeople);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleEdit() {
        let obj = {};
        if (new Date(dateControl.date.date).getTime() !== new Date(date).getTime()) {
            obj.date = date
        };
        if (maxpeople !== dateControl.date.maxpeople) {
            obj.maxpeople = +maxpeople
        }
        const { error } = editDateSchema(obj);
        if (error) {
            return toast.error(error.details[0].message)
        }
        setLoading(true);
        const response = await editDateAction({ obj, id: dateControl.date.id });
        setLoading(false);
        if (response?.error) {
            return toast.error(response.message)
        } else if (response?.success) {
            setDates(Dates.map(d => {
                if (d.id === dateControl.date.id) {
                    d.maxpeople = maxpeople;
                    d.date = date
                }
                return d
            }));
            toast.success(response.message)
        }
        setDateControl(dateControlObj)
    }

    return (
        <div
            onClick={() => { if (!loading) setDateControl(dateControlObj) }}
            className='flex fixed items-center justify-center z-50 top-0 left-0 w-full h-screen bg-black/40'>
            <div
                onClick={(e) => e.stopPropagation()}
                className='p-4 bg-white w-lg space-y-4 rounded-md'>
                <h2>{`Update Date (${new Date(dateControl.date.date).toDateString()})`}</h2>
                <div className='space-y-4'>
                    <Label>
                        Date
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline">
                                {new Date(date).toDateString()}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <Calendr
                                mode="single"
                                selected={date}
                                onSelect={(e) => {
                                    setOpen(false)
                                    setDate(e)
                                }}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>

                    <Label>
                        max-People
                    </Label>
                    <Input
                        type="number"
                        value={maxpeople}
                        onChange={(e) => setMaxPeople(e.target.value)}
                        spellCheck={false}
                    />
                </div>
                <div className='flex flex-col gap-2 w-full justify-end sm:flex-row'>
                    <Button
                        disabled={loading}
                        onClick={() => setDateControl(dateControlObj)}
                        variant={"outline"}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleEdit}
                    >
                        {loading ?
                            <span className="rounded-full w-4 h-4 animate-spin border-white border-t-transparent"></span>
                            : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AlertBan({ dateControl, setDateControl, dateControlObj, Dates, setDates }) {
    const [loading, setLoading] = useState(false);

    async function handleBan() {
        setLoading(true);
        const response = await toggleDateAction({ id: dateControl.date.id, banned: dateControl.date.banned });
        setLoading(false);
        if (response?.error) {
            toast.error(response.message)
        } else {
            toast.success(response.message);
            setDates(Dates.map(d => {
                if (d.id === dateControl.date.id) {
                    d.banned = response.banned
                }
                return d
            }))
        }
        setDateControl(dateControlObj)
    }
    return (
        <div
            onClick={() => { if (!loading) setDateControl(dateControlObj) }}
            className='fixed flex items-center justify-center top-0 left-0 w-full h-screen z-50 bg-black/40'>
            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white p-4  rounded-md w-lg'>
                <h2 className='text-xl font-bold'>
                    Are You Sure?
                </h2>
                <span className='text-xl font-semibold text-zinc-500'>
                    This Date Cant Be Booked While Banned
                </span>
                <div className='flex flex-col gap-2 w-full sm:flex-row justify-end mt-4'>
                    <Button
                        disabled={loading}
                        onClick={() => setDateControl(dateControlObj)} variant={"outline"}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleBan}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AlertCancel({ dateControl, setDateControl, dateControlObj, Dates, setDates }) {
    const [loading, setLoading] = useState(false);
    async function handleCancel() {
        setLoading(true);
        const response = await dateCancelledAction({ id: dateControl.date.id });
        setLoading(false);
        if (response?.error) {
            return toast.error(response.message)
        }
        setDates(Dates.filter(d => d.id !== dateControl.date.id))
        toast.success(response.message)
    }
    return (
        <div
            onClick={() => { if (!loading) setDateControl(dateControlObj) }}
            className="flex items-center justify-center fixed top-0 left-0 w-full h-screen bg-black/40 z-50">
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-2xl bg-white p-4 rounded-md space-y-4">
                <h2 className="font-semibold">Are you sure</h2>
                <span className="font-semibold text-red-600">This action can't be un-done, this will permentally cancel this Date, all booking linked to this date will be cancelled</span>
                <div className="flex gap-2 mt-4 w-full flex-col sm:flex-row justify-end">
                    <Button
                        disabled={loading}
                        onClick={() => setDateControl(dateControlObj)}
                        variant={"outline"}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleCancel}>
                        {loading ?
                            <span className="rounded-full w-4 h-4 border-2 animate-spin border-white border-t-transparent"></span>
                            : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function BackBtn() {
    const router = useRouter()
    return (
        <Button
            className={"mb-2"}
            variant={"outline"} onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
    )
}