import LoginForm from './login';
import { Card, CardDescription, CardHeader, CardTitle } 
from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Login() {
  const session = await auth();
  if(session?.user){redirect("/?page=1")};
  
  return (
    <div className={"min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"} >
      <div className={"max-w-md w-full space-y-8"} >
        <div className={"text-center"} >
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Gawalaty account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amber-500">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <LoginForm/>
        </Card>
        
      </div>
    </div>
  );
}