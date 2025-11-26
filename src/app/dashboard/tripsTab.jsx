"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MapPin, Star, Calendar, Banknote, RefreshCw } from 'lucide-react';
import { Loading } from '@/shared/loading';
import { getTripsAction, tripsCountAction } from "./dashboardActions"
import Link from 'next/link';
import { getCategories } from '@/shared/ServerAction';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DashboardPagination, Empty } from './dashboardComponents';

export default function TripsTab() {
    const [Categories, setCategories] = useState([]);
    const [pageAndCategory, setPageAndCategory] = useState(["all", 1]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);
    const [trips, setTrips] = useState([]);
    const [pages, setPages] = useState(0);

    useEffect(() => {
        async function GetTrips() {
            const categoryid = pageAndCategory[0] === "all" ? false : Categories.filter(t => t.name === pageAndCategory[0])[0].id

            const data = await getTripsAction({ categoryid, page: pageAndCategory[1] });

            setTrips(data);
            setLoading(false)
        }
        GetTrips()
    }, [pageAndCategory, refresh]);

    useEffect(() => {
        async function GetPages() {
            let categoryid = false;
            if (pageAndCategory[0] !== "all") {
                categoryid = Categories?.filter(t => t.name === pageAndCategory[0])[0]?.id
            }

            const items = await tripsCountAction({ categoryid });
            if (items?.error) {
                throw new Error(items?.message)
            }
            if (items <= 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        GetPages()
    }, [pageAndCategory[0], refresh]);



    useEffect(() => {
        async function GetCategories() {
            const categoriesDB = await getCategories();
            if (categoriesDB?.error) {
                throw new Error(categoriesDB.message)
            }
            setCategories(categoriesDB)
        }
        GetCategories()
    }, []);


    return (
        <TabsContent value="trips" className="space-y-6">
            <Card>
                <CardHeader className={"flex items-start gap-2 justify-between sm:items-center flex-col sm:flex-row"}>
                    <CardTitle className={"font-semibold text-xl flex items-center gap-2"}>
                        <RefreshCw
                            onClick={() => setRefresh(refresh + 1)}
                            className="h-4 w-4 cursor-pointer"
                        />
                        Manage Trips
                    </CardTitle>
                    <Select value={pageAndCategory[0]} onValueChange={(e) => setPageAndCategory([e, 1])}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Trips</SelectItem>
                            {Categories?.map(c => {
                                return (
                                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {
                        loading ?
                            (<Loading />)
                            :
                            (
                                trips.length <= 0 ?
                                    (<Empty text={"No trips found"} />)
                                    :
                                    (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {trips?.map((trip) => (
                                                <TripItem
                                                    trip={trip}
                                                    key={trip.id} />
                                            )
                                            )
                                            }
                                        </div>
                                    )
                            )
                    }
                </CardContent>
            </Card>
            {trips.length > 0 && 
            <DashboardPagination page={pageAndCategory[1]} type={pageAndCategory[0]} setPageAndType={setPageAndCategory} pages={pages} />}
        </TabsContent>
    )
}

function TripItem({ trip }) {
    function GetRate(reviews) {
        if (reviews?.length > 0) {
            const totalRate = reviews?.map(r => r.rate)?.reduce((a, e) => +a + +e);
            return totalRate / reviews?.length
        } else {
            return 0
        }
    }
    return (
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <Image
                width={800}
                height={800}
                src={trip.images[0].url}
                alt={trip.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h3 className="font-semibold mb-2">{trip.title}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {trip.location}
                    </div>
                    <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {GetRate(trip.reviews)}
                        rating
                    </div>
                    <div className="flex items-center">
                        <Banknote className="h-4 w-4 mr-1" />
                        <span className='font-bold text-amber-600'>{trip.price}</span><span className='font-bold ml-1 mr-2'>LE</span> per person
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link href={`/trip/${trip.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Trip
                        </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                        <Link href={`/tripDatesAndBooking/${trip.id}`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            Manage
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}