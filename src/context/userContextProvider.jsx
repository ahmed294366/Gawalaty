"use client"
import { createContext, useState } from "react";
export const UserContext = createContext({});

export function UserContextProvider({ children, userImage  ,userWishlist}) {
    const [UserWishlist , setUserwishlist] = useState(userWishlist)
    const [UserImage, setUserImage] = useState(userImage);
    const [toggle, settoggle] = useState(false)
    return (
        <UserContext.Provider value={{ toggle,settoggle, UserImage, setUserImage , UserWishlist , setUserwishlist }}>
            <div onClick={()=>{if(toggle){settoggle("")}}}>
            {children}
            </div>
        </UserContext.Provider>
    )
}