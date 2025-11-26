import Link from 'next/link';
import { PaginationComponent } from '@/shared/Pagination';
import { GetTripsCountServerAction, GetTripsServerAction } from '@/shared/ServerAction';
import { Filter } from '@/shared/Filter';
import { Button } from '@/components/ui/button';
import { prisma } from "@/utils/prisma";
import { TripCard } from "@/shared/tripCard";

export default async function Home({ searchParams }) {

  const { page, category, sort } = await searchParams;

  const categories = await prisma.categories.findMany({ select: { name: true, id: true } });
  if (categories?.error) { throw new Error("failed to fetch trips") }

  const items = await GetTripsCountServerAction({ category });
  if (items?.error) { throw new Error("failed to fetch trips") }
  const pages = Math.ceil(items / 6);
  const trips = await GetTripsServerAction({ category, sort, page })
  if (trips?.error) { throw new Error("failed to fetch trips") }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-amber-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6">
            Discover Ancient Egypt
          </h1>
          <p className=" mb-8 md:text-2xl max-w-3xl mx-auto">
            Embark on extraordinary journeys through pyramids, temples, and timeless landscapes.
            Experience the magic of Egypt with our expert guides.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/announcements">See Announcements</Link>
          </Button>
        </div>
      </section>

      {/* Trips Section */}
      <section id="trips" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Amazing Tours</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully curated selection of Egyptian adventures
            </p>
          </div>
          <Filter categories={categories} sort={sort} category={category} page={page} />
          {/* Trip Cards */}
          {trips?.length <= 0 ?
            <div className='w-full text-center py-10 text-2xl font-semibold text-zinc-500'>
              No trips {category && category !== "all" ? "with category ( " + categories.filter(t => t.id === +category)[0]?.name + " )" : ""} found
            </div>
            :
            (<>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 pt-0">
                {trips?.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              <PaginationComponent page={page} pages={pages} category={category} sort={sort} />
            </>
            )}
        </div>
      </section>
    </div>
  );
}
