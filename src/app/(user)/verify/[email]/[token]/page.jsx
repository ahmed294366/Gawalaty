import { BadgeCheck } from 'lucide-react';
import { ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { VerifyEmailAction } from '@/app/(user)/userActions';
import { Button } from '@/components/ui/button';
export default async function Verify({ params }) {
    let { email, token } = await params;
    email = decodeURIComponent(email);
    const { verified, message } = await VerifyEmailAction({ email, token });

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            {verified ?
                (<div className='flex flex-col gap-3 items-center'>
                    <BadgeCheck className='w-20 h-20 text-green-400' />
                    <span className="font-semibold text-3xl">{message}</span>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/login">Return To Login</Link>
                    </Button>
                </div>)
                :
                (<div className='flex flex-col gap-3 items-center justify-center'>
                    <ShieldOff className='text-red-500 w-20 h-20' />
                    <span className="font-semibold text-3xl">{message}</span>
                    <Button asChild className="mt-4">
                        <Link href="/login">Return To Login</Link>
                    </Button>
                </div>)}
        </div>
    )
}
