import { auth } from '@/auth';
import { GetProfileAction } from '../../userActions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingsTab } from '../bookingsTab';
import { ProfileTab } from '../profileTab';
import { WishlistTab } from '../wishlistTab';
import { SecurityTab } from '../securityTab';
import { TripsTab } from '../tripsTab';
import { WalletTab } from '../walletTab';
import { MessagesTab } from '../messagesTab';
export default async function Page({ params }) {
    const session = await auth();
    const user = session?.user
    const { id } = await params;
    const profile = await GetProfileAction(id);
    if (profile?.error) {
        throw new Error(profile.message)
    } else if (profile?.hidden) {
        return (
            <div className="w-full h-screen flex items-center justify-center font-bold text-3xl ">
                {profile.message}
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {profile.email &&
                    <div className="mb-8">
                        <h1 className="text-3xl text-gray-900 mb-2 font-semibold">Profile Settings</h1>

                        <p className='text-md font-semibold overflow-hidden text-ellipsis'>{profile?.email}</p>
                        <p className="text-gray-600">
                            Manage your account information and bookings
                        </p>
                    </div>
                }

                <Tabs defaultValue="profile" className="space-y-6">
                    {(user?.role == "admin" || user?.id === profile?.id || profile?.role === "guide") &&

                        <TabsList className="flex flex-wrap max-w-full w-fit h-fit">
                            {(user?.id === profile?.id || 
                                profile?.role === "guide" || 
                                user?.role === "admin") && <TabsTrigger className={"min-w-[165px]"} value="profile">Profile</TabsTrigger>
                            }

                            {(user?.id === profile?.id)
                                &&
                                <TabsTrigger className={"min-w-[165px]"} value="wallet">wallet</TabsTrigger>
                            }

                            {(user?.id === profile?.id || user?.role === "admin")
                                &&
                                <TabsTrigger className={"min-w-[165px]"} value="wishlist">Wishlist</TabsTrigger>
                            }

                            {(user?.role === "admin" || profile?.id === user?.id)
                                &&
                                <TabsTrigger 
                                className={"min-w-[165px]"} value="bookings">
                                    {profile?.id === user?.id ? "My Bookings" : "Bookings"}
                                </TabsTrigger>
                            }

                            {profile?.role === 'guide'
                                &&
                                <TabsTrigger className={"min-w-[165px]"} value="guided-trips">Trips</TabsTrigger>
                            }

                            {
                                (user?.id === profile?.id || user?.role === "admin")
                                &&
                                <TabsTrigger className={"min-w-[165px]"} value="messages">Messages</TabsTrigger>
                            }

                            {user?.id === profile?.id
                                &&
                                <TabsTrigger className={"min-w-[165px]"} value="security">Security</TabsTrigger>
                            }

                        </TabsList>
                    }

                    {(user?.id === profile?.id || profile?.role === "guide" || user?.role === "admin") && <ProfileTab profile={profile} user={user}/>
                    }

                    {profile?.id === user?.id &&
                        <WalletTab profile={profile} user={user}/>
                    }

                    {(user?.id === profile?.id || user?.role === "admin") && 
                    <WishlistTab profile={profile} user={user}/>
                    }

                    {(profile?.id === user?.id || user?.role === "admin") && 
                    <BookingsTab profile={profile} user={user}/>
                    }

                    {(profile?.role === "guide") &&
                        <TripsTab profile={profile} user={user}/>
                    }

                    {(profile?.id===user?.id || user?.role==="admin") &&
                        <MessagesTab profile={profile} user={user}/>
                    }

                    {user?.id === profile?.id  &&
                        <SecurityTab profile={profile} user={user}/>
                    }
                </Tabs>
            </div>
        </div>
    )
}
