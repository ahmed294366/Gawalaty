import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { MapPin, Star, Heart, Eye, Banknote } from "lucide-react"
import Link from 'next/link';
import Image from 'next/image';

export async function TripsTab({ profile, user }) {
    
    if (profile?.role !== "guide") {
        return null;
    }

    return (
        <TabsContent value="guided-trips" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{profile?.id === user?.id ? "My Guided Trips" : "Guide's Trips"}</CardTitle>
                    <CardDescription>
                        {profile?.id === user?.id && "Trips that you guide for travelers"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile?.Trip?.length === 0 ? (
                        <div className="text-center py-8">
                            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                                No guided trips found
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile?.Trip.map((trip) => (
                                <TripItem trip={trip} key={trip?.id} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    )
}

function TripItem({ trip }) {

    function GetTripReview(reviews) {
        if (reviews.length > 0) {
            const Rates = reviews?.map(t => t.rate)?.reduce((a, e) => +a + +e, 0);
            return (Rates / reviews.length)
        } else {
            return 0
        }
    }

    return (
        <div key={trip.id} className="bg-gray-50 rounded-lg p-4">
            <Image
                src={trip?.images[0]?.url}
                alt={trip.title}
                width={800}
                height={800}
                className="w-full h-48 object-cover rounded mb-4"
            />
            <h4 className="font-semibold mb-2">{trip.title}</h4>
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {trip.location}
                </div>

                <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {GetTripReview(trip.reviews)} ({trip.reviews.length} reviews)
                </div>
                <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {trip?._count?.wishlist} wishes
                </div>
                <div className='flex items-center'>
                    <Banknote className="h-4 w-4 mr-1" />
                    <span className="font-bold text-amber-600 underline">
                        {trip.price}
                    </span>
                    <span className='font-bold ml-1'>LE</span>
                </div>
            </div>
            <Button size="sm" variant="outline" asChild className="mt-4 w-full">
                <Link href={`/trip/${trip.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Trip
                </Link>
            </Button>
            {(profile?.id === user?.id || user?.role === "admin") &&
                <Button size="sm" asChild className="mt-2 w-full">
                    <Link href={`/tripDatesAndBooking/${trip?.id}`}>
                        Manage
                    </Link>
                </Button>
            }
        </div>
    )
}
