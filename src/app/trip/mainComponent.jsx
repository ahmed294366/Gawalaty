"use client";
import { useState, useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WhatsInclude, TripInfo, CurrentImage, GuideInfo, AboutTrip, CreateDate, CreateBooking, AddReviewForm, renderStars } from './tripComponents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertReport, AlertBanned, AlertReset, AlertDeleteReview, AlertBooking } from './Alerts';
import { EditTripForm, EditReview } from './EditComponents';
import { TripControl, ReviewControl } from './Controllers';
import { WashListAction } from "./tripActions";
import { UserContext } from '@/context/userContextProvider';
import { Heart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { DisplayImages } from '@/shared/displayImages';

export default function TripMainComponent({ trip, session }) {
  const { UserWishlist, setUserwishlist } = useContext(UserContext);

  const [openImages, setOpenImages] = useState([false, [],0]);
  const user = session?.user;

  const [dates, setdates] = useState(trip?.dates);

  const [booking, setBooking] = useState({
    dateId: "", people: 1, open: false
  });

  const [tripReviews, setTripReviews] = useState(trip?.reviews);
  const [selectedImage, setSelectedImage] = useState(0);

  const reviewNative = {
    edit: false, ban: false, review: "", report: false, delete: false, reset: false
  };

  const [reviewStates, setReviewStates] = useState(reviewNative);
  const [tripStates, setTripStates] = useState({
    edit: false, delete: false, ban: false
  });

  const [Trip, setTrip] = useState(trip);

  async function HandleWishList() {
    const response = await WashListAction(trip?.id);
    if (response?.error) {
      return toast.error(response.message);
    }
    if (response?.wish) {
      setUserwishlist([...UserWishlist, trip.id]);
    } else {
      const newwishlist = UserWishlist.filter(w => w !== trip.id)
      setUserwishlist(newwishlist);
    }
    return toast.success(response.message);
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Trip not found</h2>
          <Button asChild>
            <Link href="/?page=1">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  let ratedBefore = null;
  if (user) {
    ratedBefore = tripReviews?.some(r => r?.userid === user.id);
  }

  return (
    <>
      {booking.open &&
        <AlertBooking
          user={user} dates={Trip.dates} booking={booking} setBooking={setBooking} price={Trip.price} tripid={trip.id} />
      }

      {reviewStates.edit &&
        <EditReview setTripReviews={setTripReviews} tripReviews={tripReviews} reviewStates={reviewStates} reviewNative={reviewNative} setReviewStates={setReviewStates} />
      }

      {reviewStates.reset &&
        <AlertReset setTripReviews={setTripReviews} tripReviews={tripReviews} reviewStates={reviewStates} reviewNative={reviewNative} setReviewStates={setReviewStates} />
      }

      {reviewStates.ban &&
        <AlertBanned setTripReviews={setTripReviews} tripReviews={tripReviews} reviewStates={reviewStates} reviewNative={reviewNative} setReviewStates={setReviewStates} />
      }

      {reviewStates.report &&
        <AlertReport reviewStates={reviewStates} reviewNative={reviewNative} setReviewStates={setReviewStates} />
      }

      {reviewStates.delete &&
        <AlertDeleteReview
          setTripReviews={setTripReviews} tripReviews={tripReviews} reviewStates={reviewStates} reviewNative={reviewNative} setReviewStates={setReviewStates} />
      }

      {tripStates.edit &&
        <EditTripForm setSelectedImage={setSelectedImage} trip={Trip} setTripStates={setTripStates} setTrip={setTrip} />
      }
      {openImages[0] && 
      <DisplayImages images = {openImages[1]} setOpenImages={setOpenImages} index={openImages[2]}/>}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tours
            </Link>
          </Button>
          <div className="mb-8 relative">
            {user?.role === "admin" &&
              <TripControl
                trip={Trip} setTrip={setTrip} setTripStates={setTripStates} />
            }

            <CurrentImage
              selectedImage={selectedImage} images={Trip.images} />

            <div className='flex gap-2.5 flex-wrap'>
              {Trip.images?.map((image, index) => (
                <Image
                  width={800}
                  height={800}
                  key={index}
                  src={image.url}
                  alt={`${Trip?.title} ${index + 1}`}
                  className={`w-28 h-28 object-cover rounded cursor-pointer transition-opacity ${selectedImage === index ? 'opacity-100 ring-2 ring-amber-600' : 'opacity-70 hover:opacity-100'
                    }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-start justify-between mb-4 gap-4">
            <TripInfo trip={Trip} reviews={tripReviews} />
            {user &&
              <Button
                onClick={() => { HandleWishList() }}
                className={"py-5 px-1 cursor-pointer"} variant="outline" size="sm" >
                <Heart className={`h-5 w-5 mr-2 
                           ${UserWishlist.includes(trip?.id) ? 'fill-red-500 stroke-red-500' : ''}`} />
                <span className='text-2xl font-semibold'>Add to washlist</span>
              </Button>
            }

          </div>

          {user?.id === Trip?.guideid || true &&
            <CreateDate dates={dates} setdates={setdates} tripid={trip.id} />
          }

          <CreateBooking dates={dates} price={Trip.price} user={session?.user} booking={booking} setBooking={setBooking} />

          <AboutTrip Trip={Trip} />

          <WhatsInclude features={Trip.features} />

          <GuideInfo guide={Trip.guide} />

          <div className="mt-5 p-5 bg-white rounded-lg border">
            <h2 className='text-2xl font-bold ml-1 mb-5'>
              Reviews & Rating
            </h2>
            <div>
              {user && !ratedBefore && (
                <AddReviewForm tripid={trip?.id} setTripReviews={setTripReviews} tripReviews={tripReviews} />
              )
              }

              <div className="space-y-6">
                {tripReviews?.map((review) => (
                  <div key={review.id} className="flex py-4 border-b-2 border-b-neutral-300 flex-col space-x-4 relative">
                    {user &&
                      <ReviewControl user={user} review={review} reviewNative={reviewNative} setReviewStates={setReviewStates}
                      />
                    }

                    {renderStars(review.rate)}

                    <div className='flex mb-4 items-start mt-4 gap-2 justify-start'>
                      <Avatar>
                        <AvatarImage src={review.user.image} alt={review.userName} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start justify-start mb-2">
                        <h5 className="font-semibold">
                          {review.user.name}
                        </h5>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {review?.images?.map((img, i) => {
                        return (
                          <Image
                          onClick={()=>{
                            setOpenImages([true, review.images.map(i=>i.url),i])
                          }}
                            key={i}
                            alt="travel-image"
                            width={100}
                            height={100}
                            className='object-cover rounded-md'
                            src={img.url} />
                        )
                      })}
                    </div>
                    <p className="text-gray-700 mt-2 text-xl">{review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
