"use client"
import { useState } from "react";
import { BannedReviewAction, DeleteReviewAction, ResetReviewAction, ReportAction } from "./tripActions";
import { ReportSchema } from "./tripSchema"
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AlertBooking({ user, dates, price, booking, setBooking, tripid }) {

    const [loading, setLoading] = useState(false);

    const date = dates.filter(d => d.id === +booking.dateId)[0]?.date

    async function HandleBooking() {

        if (!user) {
            return toast.error("ghosts cant book our trips");
        }

        const { error } = CreateBookingSchema({ dateid: booking.dateId, people: booking.people, tripid });

        if (error) {
            return toast.error(error.details[0].message);
        }
        setLoading(true);
        const response = await CreateBookAction({ dateid: booking.dateId, tripid, people: +booking.people });
        setLoading(false);

        if (response?.error) {
            return toast.error(response.message);
        } else {
            toast.success(response.message);
            setBooking({ dateId: booking.dateId, people: 1, open: false });
        }
    }
    return (
        <div
            onClick={() => { if (!loading) setBooking({ dateId: booking.dateId, people: 1, open: false }) }}
            className="w-full bg-black/40 h-screen fixed top-0 left-0 flex items-center justify-center">
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-lg max-w-full bg-white rounded-md p-4 space-y-4">
                <div>
                    <h2
                        className="font-bold text-xl mb-2">
                        Confirm Your Booking
                    </h2>
                    <p className="text-zinc-500 font-semibold">
                        Please select the number of guests for your booking.
                        The total price will be calculated automatically.
                    </p>
                </div>

                <span className="text-xl text-zinc-700 mr-2">Selected-Date: {new Date(date).toLocaleDateString()
                }</span>
                <div className="flex items-center text-zinc-700">
                    <span className="text-xl mr-2">People: </span>
                    <Input
                        style={{ fontSize: "20px" }}
                        spellCheck={false}
                        type={"number"}
                        value={booking.people}
                        onChange={(e) => { setBooking({ ...booking, people: e.target.value }) }}
                    />
                </div>
                <span className="text-xl text-zinc-700 mr-2">total: {price * booking.people} LE</span>
                <div className="flex mt-2 flex-col sm:flex-row gap-2 justify-end">
                    <Button
                        disabled={loading}
                        variant={"outline"}
                        onClick={() => { setBooking({ dateId: booking.dateId, people: 1, open: false }) }}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={loading}
                        className={"bg-amber-600 hover:bg-amber-500"}
                        onClick={() => HandleBooking()}
                    >
                        {loading ?
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            : "Confirm Booking"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function AlertReset({ reviewStates, reviewNative, setReviewStates, setTripReviews, tripReviews }) {

    const [loading, setLoading] = useState(false);

    async function HandleReset() {
        setLoading(true);
        const response = await ResetReviewAction({ id: reviewStates.review.id });
        setLoading(false);
        if (response?.error) {
            return toast.error(response.message)
        }
        const newtripreveiws = tripReviews.map(rev => {
            if (rev.id === response.id) {
                return response
            }
            return rev
        });
        setTripReviews(newtripreveiws);
        setReviewStates(reviewNative)
    }
    return (
        <div
            onClick={() => { if (!loading) setReviewStates(reviewNative) }}
            className="fixed flex top-0 left-0 w-full z-50 h-screen bg-black/40">
            <div
                onClick={(e) => e.stopPropagation()}
                className="space-y-2 w-2xl bg-white rounded-md p-4">
                <h2 className="text-lg font-semibold">Are you absolutely sure?</h2>
                <span className="text-lg text-zinc-500 font-semibold">
                    This will reset your review.
                </span>
                <div
                    className="w-full flex justify-end flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        disabled={loading}
                        onClick={() => setReviewStates(reviewNative)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => { HandleReset() }}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function AlertBanned({ reviewStates, reviewNative, setReviewStates, setTripReviews, tripReviews }) {

    const [loading, setLoading] = useState(false);

    async function HandleBanned() {
        setLoading(true);
        const response = await BannedReviewAction({ id: reviewStates.review.id });
        setLoading(false);
        if (response?.error) {
            return toast.error(response.message)
        }
        const newtripreveiws = tripReviews.filter(rev => {
            return rev.id !== reviewStates.review.id
        });
        setTripReviews(newtripreveiws);
        setReviewStates(reviewNative)
        return toast.success("review banned successfully")
    }
    return (
        <div
            onClick={() => { if (!loading) setReviewStates(reviewNative) }}
            className="flex items-center justify-center fixed top-0 left-0 z-50 w-full bg-black/40 h-screen">
            <div
                onClick={(e) => e.stopPropagation()}
                className="rounded-md w-lg max-w-full bg-white p-4 space-y-4">
                <h2 className="font-bold text-xl">
                    Are you absolutely sure?
                </h2>
                <span className="text-zinc-500 font-semibold">
                    This will ban this
                    review.
                </span>

                <div className="mt-4 flex flex-col w-full gap-2 sm:flex-row justify-end">
                    <Button
                        disabled={loading}
                        variant={"outline"}
                        onClick={() => setReviewStates(reviewNative)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => { HandleBanned() }}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function AlertDeleteReview({ reviewStates, reviewNative, setReviewStates, setTripReviews, tripReviews }) {

    const [loading, setLoading] = useState(false);

    async function HandleDelete() {
        setLoading(true);
        const response = await DeleteReviewAction({ id: reviewStates.review.id });
        setLoading(false);
        if (response?.error) {
            return toast.error(response.message)
        }
        const newtripreveiws = tripReviews.filter(rev => {
            return rev.id !== reviewStates.review.id
        });
        setTripReviews(newtripreveiws);
        setReviewStates(reviewNative)
        return toast.success("review deleted successfully")
    }
    return (
        <div
            onClick={() => { if (!loading) setReviewStates(reviewNative) }}
            className="flex items-center justify-center fixed top-0 left-0 z-50 w-full bg-black/40 h-screen">
            <div
                onClick={(e) => e.stopPropagation()}
                className="rounded-md w-lg max-w-full bg-white p-4 space-y-4">
                <h2 className="font-bold text-xl">
                    Are you absolutely sure?
                </h2>
                <span className="text-zinc-500 font-semibold">
                    This will Delete this
                    review.
                </span>
                <div className="mt-4 flex flex-col w-full gap-2 sm:flex-row justify-end">
                    <Button
                        disabled={loading}
                        variant={"outline"}
                        onClick={() => setReviewStates(reviewNative)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => { HandleDelete() }}>
                        {loading ?
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function AlertReport({ reviewStates, reviewNative, setReviewStates }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    async function HandleReport() {
        const { error } = ReportSchema({ reviewid: reviewStates.review.id, text });
        if (error) {
            return toast.error(error.message)
        }
        setLoading(true);
        const response = await ReportAction({ reviewid: reviewStates.review.id, text });
        setLoading(false);
        if (response?.error) {
            setOpen(false);
            return toast.error(response.message)
        }
        setReviewStates(reviewNative)
        return toast.success(response?.message)
    }
    return (
        <div
            onClick={() => { if (!loading) setReviewStates(reviewNative) }}
            className="fixed top-0 left-0 bg-black/40 flex items-center h-screen w-full z-50 justify-center">

            <div
                onClick={(e) => e.stopPropagation()}
                className="rounded-md bg-white p-4 w-lg max-w-full space-y-4 ">

                <h2 className="text-xl font-bold">Report This Review</h2>

                <div>
                    <Label
                        className={" text-zinc-700 ml-1 mb-3"}
                        htmlFor="report">Report:</Label>
                    <Textarea
                        id="report"
                        className={""}
                        spellCheck={false}
                        placeholder="Write Your Report Here . . ."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2 w-full justify-end sm:flex-row">
                    <Button
                        disabled={loading}
                        variant={"outline"}
                        onClick={() => { setReviewStates(reviewNative) }}>
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => { HandleReport() }}>
                        {loading ?
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            : "Report"}
                    </Button>
                </div>

            </div>
        </div>
    )
}