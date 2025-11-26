"use client"
import { TabsContent } from '@/components/ui/tabs';
import { useState, useContext } from 'react';
import { Heart, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RemoveFromWishList } from '../userActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { UserContext } from '@/context/userContextProvider';

export function WishlistTab({ profile, user }) {
    if (profile?.id !== user?.id && user?.role !== "admin") {
        return null;
    }
    const {UserWishlist , setUserwishlist } = useContext(UserContext);
    const [ wishlist , setWishlist ] = useState(profile?.wishlist);

    async function RemoveFromWishlist(tripid) {
        const response = await RemoveFromWishList(tripid);
        if (response?.error) {
            return toast.error(response.message);
        } else {
            const wishlistIds = UserWishlist.filter(w=>w!==tripid);
            setUserwishlist(wishlistIds);
            const wishes = wishlist.filter(w=>w.id!==tripid);
            setWishlist(wishes);
            return toast.success(response.message);
        }
    }
    return (
        <TabsContent value="wishlist" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center font-bold">
                        <Heart className="h-5 w-5 mr-2" />
                        {user?.id === profile?.id && "My"} Wishlist
                    </CardTitle>
                    <CardDescription className={"font-semibold text-zinc-500"}>
                        {user?.id === profile?.id && "Trips you want to book in the future"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {wishlist?.length === 0 ? (
                        <div className="text-center py-8">
                            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Your wishlist is empty</p>
                            <p className="text-sm text-gray-400">Start adding trips you'd like to book!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {wishlist?.map((item) => (
                                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                    <Image
                                        width={800}
                                        height={800}
                                        src={item?.trip?.images[0]?.url}
                                        alt={item.trip?.title}
                                        className="w-full h-48 object-cover rounded mb-4"
                                    />
                                    <h4 className="font-semibold mb-2">{item.trip?.title}</h4>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-semibold text-amber-600">${item.trip?.price}</span>
                                        <span className="text-sm text-gray-500">
                                            Added {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" asChild className="flex-1">
                                            <Link href={`/trip/${item?.trip?.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Trip
                                            </Link>
                                        </Button>
                                        {user?.id === profile?.id && <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => RemoveFromWishlist(item.tripid)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    )
}
