"use client"
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, X, LogOut } from 'lucide-react';
import { UserContext } from '@/context/userContextProvider';
import styles from "./header.module.css";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function MyLogout() {
  const router = useRouter()
  const handleLogout = () => {
    signOut()
    router.replace('/');
  };
  return (
    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  )
}

export function UserAvatar({ user }) {
  const { UserImage } = useContext(UserContext)
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={UserImage} alt={user?.name} />
      <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function HeaderWrapper({ children }) {
  const { toggle, settoggle } = useContext(UserContext)
  return (
    <header className={styles.header}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={toggle ? styles.menuOn : styles.menuOff}>
        {children}
        {toggle ?
          <X
            onClick={() => settoggle(false)}
            className={styles.menuBtn + " text-amber-600 h-8 w-8"} />
          :
          <Menu
            className={styles.menuBtn + " text-amber-600 h-8 w-8"}
            onClick={() => settoggle(true)}
          />}
      </div>
    </header>
  )
}

export function NavComponent() {
  const { toggle, settoggle } = useContext(UserContext)
  return (
    <nav
      onClick={() => { if (toggle) settoggle(false) }}
      className={styles.nav + " text-2xl font-semibold"}>
      <Link href="/?page=1" className="text-gray-700 hover:text-amber-600 transition-colors">
        Home
      </Link>
      <Link href="/about" className="text-gray-700 hover:text-amber-600 transition-colors">
        About
      </Link>
      <Link href="/contact" className="text-gray-700 hover:text-amber-600 transition-colors">
        Contact
      </Link>
    </nav>
  )
}
