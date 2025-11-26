"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { passwordSchema } from '@/app/(user)/userSchema';
import { resetPasswordAction } from '@/app/(user)/userActions';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

export default function ResetPasswordPage() {
    const params = useParams();
    let { email, token } = params;
    email = decodeURIComponent(email);
    const [isSuccess, setIsSuccess] = useState(false);

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center">
                            <MapPin className="h-12 w-12 text-amber-600" />
                        </div>
                        <h2 className="mt-6 text-3xl text-gray-900">Password Reset Complete</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your password has been successfully reset
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                                <h3 className="text-lg font-semibold">Success!</h3>
                                <p className="text-gray-600">
                                    Your password has been reset successfully. You can now sign in with your new password.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" asChild>
                                <Link
                                    href={"/login"}
                                >
                                    Continue to Login
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
                    <h2 className="mt-6 text-3xl text-gray-900">Reset your password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create a new strong password for your account
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Password</CardTitle>
                        <CardDescription>
                            Your new password must be different from previous passwords
                        </CardDescription>
                    </CardHeader>
                    <ResetForm email={email} token={token} setIsSuccess={setIsSuccess}/>
                </Card>

                {/* Security Notice */}
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-6">
                        <h3 className="font-medium text-amber-900 mb-2">Security Tips</h3>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li>• Use a unique password you haven't used before</li>
                            <li>• Consider using a password manager</li>
                            <li>• Don't share your password with anyone</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ResetForm({ email, token, setIsSuccess }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        const { error } = passwordSchema({ password });
        if (error) {
            setIsLoading(false)
            return toast.error(error.details[0].message)
        }

        if (password !== confirmPassword) {
            setIsLoading(false);
            return toast.error("password and its confirm should be identical")
        }
        
        const response = await resetPasswordAction({ token, email, password });
        if (response?.error) {
            toast.error(response.message)
        } else if (response?.success) {
            setIsSuccess(true)
        }
        setIsLoading(false)
    };

    return (
        <div className="space-y-4">
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="pl-10 pr-10"
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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="pl-10 pr-10"
                            required
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Password Requirements */}

            </CardContent>

            <CardFooter className={"flex flex-col"}>
                <Button
                    onClick={handleSubmit}
                    type="submit"
                    className={`w-full ${(isLoading || password !== confirmPassword || password.length < 8) && "bg-zinc-700 hover:bg-zinc-700"}`}
                >
                    {isLoading ? 
                    <span
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                    ></span> 
                    : 'Reset Password'}
                </Button>
                <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/login">Back to Login</Link>
                </Button>
            </CardFooter>
        </div>
    )
}