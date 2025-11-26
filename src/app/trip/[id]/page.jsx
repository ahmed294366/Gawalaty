import TripMainComponent from '../mainComponent';
import { auth } from '@/auth';
import { getTripAction } from '../tripActions';

export default async function Page({ params }) {
  const { id } = await params
  const trip = await getTripAction(+id);
  if (trip?.error) {
    throw new Error(trip?.message)
  }
  const session = await auth();
  if (trip?.hidden && (session?.user?.role !== "admin" || !session?.user)) {
    return (
      <div className="w-full h-screen flex items-center justify-center font-bold text-3xl ">
        {trip.message}
      </div>
    )
  }
  
  return (
    <div>
      <TripMainComponent trip={trip} session={session} />
    </div>
  )
}
