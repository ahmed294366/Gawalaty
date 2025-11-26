"use client"
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MapPin, CheckCircle, CalendarCheck2,
    CreditCard, ClockFading,
    CircleUserRound, LocateFixed,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateDateAction, CreateReviewAction } from "./tripActions"
import { CreateDateSchema, RateSchema, ReviewImageSchema } from "./tripSchema";
import { DotsLoading } from '../(user)/profile/walletComponents';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Star, X, Send, ChevronDownIcon, ImagePlus } from 'lucide-react';
import { Calendar as CalendarIcon } from "lucide-react"
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar"
import toast from 'react-hot-toast';
import { UploadImage } from '@/utils/cloudinary';
import { getCategoryColor } from '@/shared/tripUtils';
import { getFeauturesAction } from '@/shared/ServerAction';

export const CurrentImage = function ({ images, selectedImage }) {
    return (
        <div className="mb-4 ">
            {images[selectedImage] &&
                <Image
                    width={800}
                    height={800}
                    src={images[selectedImage]?.url}
                    alt={"trip image"}
                    className="w-full h-96 md:h-[450px] lg:h-[550px] object-cover rounded-lg"
                />
            }
        </div>
    )
}

export function TripInfo({ trip, reviews }) {

    let rate = 0;
    if (reviews.length > 0) {
        const allrate = reviews.map(r => r.rate);
        rate = allrate.reduce((acc, num) => +acc + +num) / reviews.length;
    }

    return (
        <div>
            <h1
                className="text-3xl md:text-4xl font-bold mb-2">
                {trip.title}
            </h1>
            <p
                className="text-zinc-700 text-2xl md:font-semibold leading-relaxed mb-6">
                {trip.description}
            </p>

            <div className="flex items-center">
                <MapPin className="h-10 w-10 mr-2" />
                <span className='text-xl font-bold'>
                    {trip.location}
                </span>
            </div>

            <div className="flex flex-wrap gap-0 items-center space-x-4 mb-2 space-y-2">
                {renderStars(rate)}
                <span className="text-sm text-zinc-600 font-semibold">
                    ({reviews.length} reviews)
                </span>
                <Badge className={getCategoryColor(trip.category.name) + " text-md capitalize "}>
                    {trip.category.name}
                </Badge>
            </div>
        </div>
    )
}

export function GuideInfo({ guide }) {
    return (
        <div className="p-5 mt-5 rounded-lg border bg-white">

            <div className="text-2xl flex flex-col gap-1 font-bold ml-1 mb-0">
                Guide
                <div className='flex gap-1 flex-wrap'>{renderStars(
                    guide.guideReviewsAsGuide.length > 0
                        ? guide.guideReviewsAsGuide
                            .map(r => r.rate)
                            .reduce((a, e) => +a + +e, 0) /
                        guide.guideReviewsAsGuide.length
                        : 0
                )}
                    <span className='font-semibold text-sm text-zinc-500'>{"( " + guide.guideReviewsAsGuide.length + " People Rate This Guide)"}</span>
                </div>
            </div>



            <div className="flex items-center space-x-3">
                <Avatar>
                    <AvatarImage src={guide.image} alt={guide.name} />
                    <AvatarFallback>{guide.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="max-w-full overflow-hidden">
                    <Link
                        href={`/profile/${guide.id}`}
                        className="font-semibold text-blue-800"
                    >
                        {guide.name}
                    </Link>

                    <p className="font-bold flex flex-wrap">
                        <span className='mr-1'>Languages:</span>
                        <span
                            className="font-semibold capitalize truncate block"
                            title={guide.languages.map(l => l.language.name).join(", ")}
                        >
                            {"[ " +
                                guide.languages.map(l => l.language.name).join(", ") +
                                " ]"}
                        </span>
                    </p>
                </div>
            </div>

        </div>
    );
}

export function WhatsInclude({ features }) {

    const [Features, setFeatures] = useState([]);

    useEffect(() => {
        async function getFeatures() {
            const data = await getFeauturesAction();
            if (data?.error) {
                throw new Error(data.message)
            }
            setFeatures(data)
        }
        getFeatures()
    }, []);

    const featuresid = features.map(f => f.featureId);
    const currentFeatures = Features.filter(f => featuresid.includes(f.id));

    return (
        <div className={"p-5 mt-5 bg-white border rounded-lg"}>
            <h2 className='text-2xl font-bold ml-1 mb-5'>
                What's Included
            </h2>

            <div>
                <ul className="space-y-2">
                    {currentFeatures.map(feature => {
                        return (
                            <li key={feature.id} className="flex items-center space-x-2">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                                <span className="text-gray-500 text-xl">{feature.name}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

export function AboutTrip({ Trip }) {
    return (
        <div className="space-y-3 bg-white border mt-5 rounded-lg p-5">

            <h2 className='text-2xl font-bold ml-1 mb-5'>
                About This Trip
            </h2>

            <div className="space-y-4">
                <div className="flex items-start space-x-3">
                    <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-2">
                        <CalendarCheck2 />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl capitalize">Free cancellation</h3>
                        <p className="text-zinc-500 text-xl">Cancel up to 24 hours in advance for a full refund</p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-2">
                        <CreditCard />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl capitalize">
                            Reserve now & pay later</h3>
                        <p className="text-zinc-500 text-xl">Keep your travel plans flexible — book your spot and pay nothing today.</p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-2">
                        <ClockFading />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl capitalize">
                            Duration {Trip.duration}</h3>
                        <p className="text-zinc-500 text-xl">Check availability to see starting times</p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-2">
                        <CircleUserRound />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl capitalize">
                            Live tour guide</h3>
                        <p className="text-zinc-500 text-xl">
                            {Trip?.guide.languages.join(", ")}
                        </p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-2">
                        <MapPin />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl capitalize">
                            Location
                        </h3>
                        <p className="text-zinc-500 text-xl">
                            {Trip.location}
                        </p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <div className="bg-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-2">
                        <LocateFixed />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl capitalize">
                            place-meeting</h3>
                        <p className="text-zinc-500 text-xl">
                            {Trip.meetingPlace}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const renderStars = (rating, interactive = false, onRate) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-5 w-5 ${star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
                    onClick={() => interactive && onRate?.(star)}
                />
            ))}
        </div>
    );
};

export function CreateDate({ dates, setdates, tripid }) {

    const [Open, setOpen] = useState(false)
    const [date, setDate] = useState(undefined);
    const [maxPeople, setmaxPeople] = useState(1);

    async function HandleDateCreate() {
        const { error } = CreateDateSchema({ date, maxPeople, tripid });
        if (error) {
            return toast.error(error.details[0].message);
        }
        if (new Date(date) - new Date(Date.now()) < (86400000)) {

            return toast.error("Date You Created Less Than 48 Hours")
        }

        const response = await CreateDateAction({ date, maxPeople, tripid });
        if (response?.error) {
            return toast.error(response.message)
        }
        setdates([...dates, response]);
    }
    return (
        <div
            className="space-y-3 bg-white border rounded-lg p-5">
            <h2 className='text-2xl font-bold ml-1 mb-5'>
                Create New Date
            </h2>
            <Popover open={Open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-81 max-w-full justify-between font-normal text-xl ">
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 1}
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            setDate(date)
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
            <div className='flex '>
                <Label className={"text-xl ml-1"} htmlFor="maxpeople">Max-People :</Label>
                <Input
                    style={{ fontSize: "20px" }}
                    type="number"
                    id={"maxpeople"}
                    placeholder="Available Seats"
                    className="w-48 shadow ml-2"
                    spellCheck={false}
                    value={maxPeople}
                    onChange={(e) => setmaxPeople(e.target.value)}
                />
            </div>

            <div className='flex flex-wrap gap-2 w-full ml-1'>
                {dates?.map((date) => (
                    <div key={date?.id} className='bg-black text-white w-fit rounded py-2 px-4 font-semibold'>
                        {new Date(date?.date).toLocaleDateString()}
                    </div>
                ))}
                {dates?.length === 0 && <div className='text-xl font-semibold '>waiting for create  <DotsLoading /></div>}
            </div>

            <Button
                className=" text-2xl py-5 cursor-pointer font-semibold mt-2 bg-emerald-600 hover:bg-emerald-500 w-full"
                onClick={() => { HandleDateCreate() }}>
                Create Date
            </Button>
        </div>
    )
}

export function CreateBooking({ dates, price, user, booking, setBooking }) {
    return (
        <div
            className="space-y-3 bg-white border rounded-lg p-5 mt-5">

            <h2 className='text-2xl font-bold ml-1 mb-5'>
                Book This Tour
            </h2>

            <div className="space-y-4">
                <div className="text-2xl font-semibold text-amber-600">{price} LE <span className="text-sm text-gray-600 font-semibold">per person</span>
                </div>
                <Select onValueChange={(e) => {
                    setBooking({ ...booking, dateId: e })
                }}>
                    <SelectTrigger
                        className={"text-xl w-full  border-xl"}>
                        <SelectValue placeholder="Select date" />
                    </SelectTrigger>

                    <SelectContent>
                        {dates?.map((date) => (
                            <SelectItem
                                className="text-xl" key={date.id} value={date.id}>
                                {
                                    new Date(date.date).toLocaleDateString()
                                }
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => {
                        return !user ? toast.error("signIn to book, trip") : booking.dateId === "" ? toast.error("select your date") : setBooking({ ...booking, open: true })
                    }}
                    className={"w-full bg-amber-600 font-semibold text-2xl hover:bg-amber-500 py-5 cursor-pointer"}>
                    <CalendarIcon className='w-5 h-5' />
                    Book Now
                </Button>
                {!user && (
                    <p className="text-sm text-gray-600 text-center">
                        <Link href="/login" className="text-amber-600 hover:underline">
                            Login to book this tour
                        </Link>
                    </p>
                )}
            </div>
        </div>
    )
}

export function AddReviewForm({ tripid, setTripReviews, tripReviews }) {

    const [rate, setRate] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewImages, setReviewImages] = useState([]);
    const [loading, setLoading] = useState(false);

    async function HandleReview() {
        let obj = { tripid, rate };
        if (comment.trim() !== "") { obj.comment = comment }
        const { error } = RateSchema(obj);
        if (error) { return toast.error(error.details[0].message) };
        setLoading(true);
        let uploadedImages = null
        if (reviewImages.length > 0) {
            const err = ReviewImageSchema(reviewImages);
            if (err?.error) {
                return toast.error(err.error.details[0].message)
            }
            const uploadResults = await Promise.allSettled(
                reviewImages.map(img => UploadImage(img))
            );
            const successUploads = uploadResults
                .filter(r => r.status === "fulfilled" && r.value?.url && r.value?.publicid)
                .map(r => ({
                    url: r.value.url,
                    publicid: r.value.publicid
                }));
            const failedUploads = uploadResults.filter(r => r.status === "rejected" || !r.value?.url);
            if (failedUploads.length > 0) {
                toast.error(`failed to upload ${failedUploads.length} image(s)`);
            }
            if (successUploads.length > 0) {
                uploadedImages = successUploads;
            }
        }
        const response = await CreateReviewAction({ obj, images: uploadedImages });
        setLoading(false);
        if (response.error) {
            return toast.error(response.message);
        }
        setTripReviews([...tripReviews, response]);
    }
    return (
        <div className="border-b pb-6 mb-6">
            <div className=' border rounded-md py-5 px-3'>
                <h3 className='text-xl mb-3 font-semibold'>Rate This Trip</h3>
                <label className="text-xl mt-4 block mb-2 text-gray-500"> Rate</label>
                {renderStars(rate, true, setRate)}
                <Label className="text-xl mt-4 block mb-2 text-gray-500"> Comment</Label>
                <Textarea
                    value={comment}
                    className={"border-2 border-neutral-100 "}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                />
                <div>
                    <input
                        style={{ display: "none" }}
                        type="file" id='review-image'
                        multiple
                        onChange={(e) => setReviewImages([...reviewImages, ...Array.from(e.target.files)])}
                    />
                    <Button asChild className={"mt-4 bg-emerald-600 text-[18px] hover:bg-emerald-500"}>
                        <label htmlFor="review-image">
                            <ImagePlus className='h-6 w-6' />
                            Add-Images
                        </label>
                    </Button>
                    {reviewImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {reviewImages.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Selected ${index}`}
                                        className="h-20 w-20 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const NewImages = reviewImages.filter((_, i) => i !== index);
                                            setReviewImages(NewImages)
                                        }}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                                    >
                                        <X className="h-3 w-3 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    disabled={loading}
                    className={"bg-amber-600 hover:bg-amber-500 text-[18px] mt-5 w-42 max-w-full "}
                    onClick={() => { HandleReview() }} >
                    {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        :
                        <><Send className="h-6 w-6 " /> Submit Review</>
                    }
                </Button>
            </div>
        </div>
    )
}
