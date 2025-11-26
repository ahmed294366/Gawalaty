"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Star, ExternalLink, XCircle, Ban, StarHalf, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Loading } from '@/shared/loading';
import { getReviewsAction, deleteReviewAction, banReviewAction, reviewsCountAction } from "./dashboardActions";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DashboardPagination, Empty, AlertDelete } from './dashboardComponents';
import { DisplayImages } from '@/shared/displayImages';

export default function ReviewsTab() {
    const [reviews, setReviews] = useState([]);
    const [remove, setRemove] = useState([false, ""]);
    const [statusAndPage, setStatusAndPage] = useState(["Active", 1]);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const [loadingRemove, setLoadingRemove] = useState(false);
    const [openImages, setOpenImages] = useState([false, [], 0]);

    useEffect(() => {
        async function GetReviews() {
            const reviews = await getReviewsAction({ status: statusAndPage[0], page: statusAndPage[1] });
            if (reviews?.error) {
                throw new Error(reviews?.message)
            }
            setReviews(reviews);
            setLoading(false);
        };
        GetReviews()
    }, [statusAndPage, refresh]);
    useEffect(() => {
        async function GetCount() {
            const items = await reviewsCountAction({ status: statusAndPage[0] });
            if (items?.error) {
                throw new Error(items?.message)
            }
            if (items <= 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        GetCount()
    }, [statusAndPage[0], refresh]);

    async function HandleDeleteReview(review) {
        setLoadingRemove(true);
        const response = await deleteReviewAction({ id: review.id });
        setLoadingRemove(false);
        if (response?.error) {
            return toast.error(response.message)
        }
        const newReviews = reviews.filter(r => r.id !== review.id)
        setReviews(newReviews);
        setRemove([false, ""]);
        return toast.success(response.message)
    }

    return (
        <>
            <TabsContent value="reviews" className="space-y-6">
                <Card>
                    <CardHeader className={"flex flex-col gap-2 justify-between items-start sm:items-center sm:flex-row"}>
                        <CardTitle className={"font-semibold text-xl flex items-center gap-2"}>
                            <RefreshCw
                                onClick={() => setRefresh(refresh + 1)}
                                className="h-4 w-4 cursor-pointer"
                            />
                            Manage Reviews
                        </CardTitle>
                        <Select value={statusAndPage[0]} onValueChange={(e) => setStatusAndPage([e, 1])}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value={"Banned"}>Banned</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {loading ?
                            (<Loading />)
                            :
                            (
                                reviews.length <= 0 ?
                                    (<Empty text={"No reviews found"} Icon={StarHalf} />)
                                    :
                                    (<div className="space-y-4">
                                        {
                                            reviews?.map(review => (
                                                <ReviewItem
                                                    statusAndPage={statusAndPage}
                                                    key={review.id}
                                                    review={review} setRemove={setRemove} reviews={reviews} setReviews={setReviews}
                                                    setOpenImages={setOpenImages}
                                                />
                                            ))
                                        }
                                    </div>
                                    )
                            )
                        }
                    </CardContent>
                </Card>
                {reviews.length > 0 &&
                    <DashboardPagination page={statusAndPage[1]} type={statusAndPage[0]} setPageAndType={setStatusAndPage} pages={pages} />}
            </TabsContent>
            {remove[0] &&
                <AlertDelete loadingRemove={loadingRemove} remove={remove} setRemove={setRemove} HandleDelete={HandleDeleteReview} object="review" />}
            {openImages[0] &&
                <DisplayImages images={openImages[1]} setOpenImages={setOpenImages} index={openImages[2]} />
            }
        </>
    )
}

function ReviewItem({ review, setRemove, reviews, setReviews, setOpenImages }) {

    async function HandleBan() {
        const response = await banReviewAction({ id: review.id });
        if (response?.error) {
            return toast.error(response.message)
        }
        const newReviews = reviews.filter(r => r.id !== review?.id);
        setReviews(newReviews);
        return toast.success(response.message)
    }

    return (
        <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row-reverse gap-2 items-start justify-between mb-3">

                <div className="flex items-center gap-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rate ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm  font-semibold">
                        {review.rate}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={review?.user?.image} alt={review?.user?.name} />
                        <AvatarFallback>{review?.user?.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link
                            href={`/profile/${review?.user?.id}`}
                            className="font-semibold text-blue-800">{review?.user?.name}</Link>
                        <p className="text-sm text-gray-600">on {review?.trip?.title}</p>
                    </div>
                </div>

            </div>
            <p className="text-gray-700">{review?.comment}</p>
            {review?.images?.length > 0 &&
                <div
                    className='w-full flex flex-wrap gap-1 mt-2'>
                    {review.images.map((img,i) => {
                        return (
                            <Image
                            onClick={()=>setOpenImages([true, review.images.map(r=>r.url),i])}
                                key={img?.id}
                                src={img?.url}
                                width={100}
                                height={100}
                                alt='photo'
                                className='rounded-sm'
                            />
                        )
                    })}
                </div>
            }
            <div className='flex flex-col sm:flex-row gap-3 items-center flex-wrap w-full mt-3'>
                <Button size="sm"
                    className={"max-w-full w-full sm:w-fit"} variant="outline" asChild >
                    <Link href={`/trip/${review?.trip.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Trip
                    </Link>
                </Button>
                <Button
                    className={"max-w-full w-full sm:w-fit"}
                    onClick={() => { HandleBan(review) }}
                    size="sm" variant="outline">
                    <Ban className="h-4 w-4 mr-1" />
                    {review?.banned ? "Un-Ban This Review" : "Ban This Review"}
                </Button>
                <Button size="sm"
                    onClick={() => { setRemove([true, review]) }}
                    className={"max-w-full w-full sm:w-fit"} variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Remove This Review
                </Button>
            </div>

        </div>
    )
}