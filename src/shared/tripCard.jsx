import Image from "next/image";
import { Star, MapPin, Clock} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCategoryColor } from "./tripUtils";
export async function TripCard({trip}) {
    let rate = trip.reviews.map(r=>r.rate);
    let Rate;
    if(trip.reviews.length>0){
        const total = rate.reduce((a,e)=>+a + +e);
        Rate = total / trip.reviews.length
    }
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
            <div className="relative">
                <Image style={{ height: "280px", objectFit: "cover" }} src={trip.images[0].url} width={800} height={100} alt='trip image' />
                <Badge className={`absolute top-3 text-md right-3 ${getCategoryColor(trip.category.name)}`}>
                    {trip.category.name}
                </Badge>
            </div>
            <CardContent className="px-4 ">
                <h3 className="text-2xl font-semibold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{trip.title}</h3>
                <div className="flex items-center mt-3 text-gray-500 mb-2">
                    <MapPin className="h-6 w-6 mr-1" />
                    <span className="text-xl">{trip.location}</span>
                </div>
                <div className="flex items-center text-gray-500 mb-4">
                    <Clock className="h-5 w-5 ml-1 mr-1" />
                    <span className="text-xl">{trip.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-end">
                        <Star className="h-7 w-7 text-yellow-400 fill-current mr-1" />
                        <span className="text-xl text-bold">{Rate||0}</span>
                        <span className="text-gray-500 text-l ml-1">({trip.reviews.length} reviews)</span>
                    </div>
                    <div className="text-2xl underline font-bold text-amber-600">{trip.price} <span className="text-xl "><span className="text-black font-bold text-2xl">LE</span></span></div>
                </div>
            </CardContent>
            <div className="px-4">
                <Button asChild className="w-full py-5 text-xl bg-amber-600 font-semibold hover:bg-amber-500">
                    <Link href={`/trip/${trip.id}`}>View Details</Link>
                </Button>
            </div>
        </Card>
    )
}