import { DollarSign, Clock, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GetTripAction } from "../tripDatesAction";
import { BackBtn ,DateComponent} from '../dates';
import Link from 'next/link';
export default async function TripDatesPage({ params }) {
    const session = await auth();
    const { id } = await params
    const user = session?.user;
    const trip = await GetTripAction(id);
    if (trip?.error) {
        throw new Error(trip.message)
    }
    if (!user || (user?.role !== "admin" && (user?.role !== "guide" && user?.id === trip.guideid))) {
        redirect("/")
    }


    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <BackBtn />
                    {/* Trip Overview */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <Image
                                width={800}
                                height={800}
                                src={trip.images[0].url}
                                alt={trip.title}
                                className="w-full md:w-48 h-48 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <Link href={`/trip/${trip.id}`} className="text-3xl font-bold mb-3">{trip.title}</Link>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{trip.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{trip.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-gray-400" />
                                        <span>{4} rating</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span>${trip.price} per person</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-3 line-clamp-2">{trip.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <DateComponent id={trip?.id} price={trip.price} user={user} />
            </div>
        </div>
    );
}