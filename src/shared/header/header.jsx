import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Itim } from "next/font/google";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MyLogout, UserAvatar, HeaderWrapper, NavComponent } from "./HeaderClient";
import { User, LayoutDashboard, Plane, Megaphone } from 'lucide-react';
import styles from "./header.module.css"
import Link from 'next/link';

const itim = Itim({
    subsets: ["latin"],
    weight: "400",
});


export default async function Header() {
    const session = await auth()
    const user = session?.user
    return (
        <HeaderWrapper>

            <Link href="/"
                className={`pl-10 flex items-start space-x-2  ${itim.className}`}>
                <span className="text-3xl font-bold text-amber-600">Gawalaty</span>
            </Link>
            <NavComponent/>
            <div className={styles.headerUserActions}>
                {user ? (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <UserAvatar user={user} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuItem className="flex flex-col items-start">
                                <div className="text-sm">{user?.name}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user?.role === "admin" && <DropdownMenuItem asChild>
                                <Link href="/announcementsManage" className="flex items-center">
                                    <Megaphone className="mr-2 h-4 w-4" />
                                    Announcements
                                </Link>
                            </DropdownMenuItem>}
                            {user?.role === "admin" && <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="flex items-center">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>}
                            {user?.role === "guide" && <DropdownMenuItem asChild>
                                <Link href="/create-trip" className="flex items-center">
                                    <Plane className="mr-2 h-4 w-4" />
                                    Create-Trip
                                </Link>
                            </DropdownMenuItem>}
                            <DropdownMenuItem asChild>
                                <Link href={`/profile/${user.id}`} className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <MyLogout />
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center space-x-2">
                        <Button asChild className="bg-amber-600 hover:bg-amber-500 text-white text-xl font-semibold">
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild className="text-amber-600 bg-white hover:bg-amber-500 hover:text-white text-xl font-semibold">
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    </div>
                )}
            </div>
        </HeaderWrapper>
    )
}