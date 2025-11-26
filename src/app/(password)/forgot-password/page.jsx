"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, ArrowLeft } from 'lucide-react';
import { forgetPasswordAction } from '@/app/(user)/userActions';
import { emailSchema } from '@/app/(user)/userSchema';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {

        setIsLoading(true);
        const { error } = emailSchema({ email });

        if (error) {
            setIsLoading(false)
            return toast.error(error.details[0].message)
        }

        const response = await forgetPasswordAction(email);
        if (response?.error) {
            toast.error(response.message)


        } else if (response?.message) {
            setIsSubmitted(true)
        }
        setIsLoading(false)
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center">
                            <MapPin className="h-12 w-12 text-amber-600" />
                        </div>
                        <h2 className="mt-6 text-3xl text-gray-900">Check your email</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Password reset instructions sent to {email}
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <Mail className="h-16 w-16 text-amber-600 mx-auto" />
                                <h3 className="text-lg font-semibold">Email Sent!</h3>
                                <p className="text-gray-600">
                                    We've sent password reset link to your email address.
                                    Please check your inbox and follow the link to reset your password.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => {
                                            setIsSubmitted(false);
                                            setEmail('');
                                        }}
                                        className="text-amber-600 hover:text-amber-500 underline"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/login">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <MapPin className="h-12 w-12 text-amber-600" />
                    </div>
                    <h2 className="mt-6 text-3xl text-gray-900">Forgot your password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            Enter the email address associated with your account
                        </CardDescription>
                    </CardHeader>
                    <div>
                        <CardContent>
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        spellCheck={false}
                                        placeholder="Enter your email address"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button
                                onClick={handleSubmit}
                                type="submit" 
                                className="w-full mt-4" disabled={isLoading}>
                                {isLoading ? 
                                <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin'></span> 
                                :
                                'Send Reset Link'}
                            </Button>
                            <Button 
                            disabled={isLoading}
                            variant="outline" 
                            className="w-full mt-2" asChild>
                                <Link href="/login">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Link>
                            </Button>
                        </CardFooter>
                    </div>
                </Card>

                {/* Help Text */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
                        <p className="text-sm text-blue-700 mb-2">
                            If you're having trouble accessing your account, please contact our support team.
                        </p>
                        <p className="text-xs text-blue-600">
                            Email: support@egyptexplorer.com | Phone: +20 123 456 7890
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}