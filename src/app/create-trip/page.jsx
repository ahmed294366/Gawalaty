import { redirect } from "next/navigation";
import Creating from "./creating";
import { auth } from "@/auth";
import { getCategories } from '@/shared/ServerAction';
export default async function creating() {
  const session = await auth();
  if (!session?.user || session?.user.role !== "guide") { redirect("/?page=1") }
  const categories = await getCategories();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">
            Create New Trip
          </h1>
          <p className="text-gray-600">
            Add a new travel experience to your collection
          </p>
        </div>
        <Creating categories={categories} />
      </div>
    </div>
  )
}



