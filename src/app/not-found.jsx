"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold mb-4 text-red-600">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Sorry, the page you’re looking for doesn’t exist or might have been moved.
      </p>
      <Button onClick={() => router.push("/")} className="flex items-center gap-2">
        <Home className="w-4 h-4" />
        Back to Home
      </Button>
    </main>
  )
}
