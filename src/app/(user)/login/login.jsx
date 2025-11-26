"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Link from 'next/link';
import Providers from '@/shared/providers';
import { LoginAction } from '../userActions';
import { LoginSchema } from '../userSchema';
import { toast } from "react-hot-toast";
import { CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    
    const { error } = LoginSchema({ email, password });
    if (error) {
      return toast.error(error.details[0].message);
    }
    setIsLoading(true);
    const response = await LoginAction({ email, password });
    if (response?.error) {
      setIsLoading(false);
      return toast.error(response.message);
    } else if(response?.success){
      signIn("credentials", { email, password });
    }

  };

  return (
    <div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              spellCheck={false}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-sm text-amber-600 hover:text-amber-500"
          >
            Forgot password?
          </Link>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          onClick={handleSubmit}
          className="w-full mt-3" disabled={isLoading}>
          {isLoading ? 
          <span className="w-4 h-4 rounded-full border-white border-t-transparent animate-spin border-2"></span> 
          : 'Sign In'}
        </Button>
        <Providers />
        <p className="text-center text-sm text-gray-600">
          Don't have an account?
          <Link href="/sign-up" className="text-amber-600 hover:text-amber-500 font-semibold">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </div>
  )
}