

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {SignUpForm} from './signUp';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
export default async function RegisterPage() {
  const session = await auth();
  if(session?.user){redirect("/?page=1")}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Gawalaty and start your adventure
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amber-500">Sign Up</CardTitle>
            <CardDescription>
              Create a new account to explore amazing trips
            </CardDescription>
          </CardHeader>
          <SignUpForm/>
          {/* form */}
        </Card>
      </div>
    </div>
  );
}