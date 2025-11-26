"use client"
import {signIn} from "next-auth/react"

export default function Providers() {
  function HandleOauth(provider){
    signIn(provider)
  }
  return (
    <div className="flex gap-4 w-full flex-col sm:flex-row my-4">
      <div 
      onClick={()=>{HandleOauth("google")}}
      className="h-16 w-full sm:w-1/2 flex shadow hover:shadow-md items-center justify-center text-3xl font-bold cursor-pointer">
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </div>

      <div 
        onClick={()=>{HandleOauth("facebook")}}
          className="h-16 w-full sm:w-1/2 flex items-center justify-center text-3xl font-bold text-blue-500 cursor-pointer shadow hover:shadow-md ">
            Facebook
        </div>
    </div>
  )
}
