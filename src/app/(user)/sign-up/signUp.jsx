"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Providers from '@/shared/providers';
import { CardContent, CardFooter } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Lock, CalendarDays, Phone } from 'lucide-react';
import { RegisterAction } from '../userActions';
import { RegisterSchema } from '../userSchema';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
export function SignUpForm() {

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [openDate, setOpenDate] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(null)
    const [email, setEmail] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit() {
        let obj = { email, name, password }
        if (dateOfBirth) { obj.dateOfBirth = dateOfBirth }
        if (phone.trim() !== "") { obj.phone = phone }
        const { error } = RegisterSchema(obj);
        if (error) {
            return toast.error(error.details[0].message)
        }
        if (password !== confirmPassword) {
            return toast.error("password not equal to it's confirm")
        }
        setIsLoading(true);
        const response = await RegisterAction(obj);
        if (response?.error) {
            setIsLoading(false);
            return toast.error(response.message)
        } else if (response?.success) {
            setIsLoading(false);
            return toast.success(response.message)
        }

    }
    return (
        <div>
            <div>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">{"phone (optional)"}</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="phone"
                                name="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter your email"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <Label>{"Date Of Birth (optional)"}</Label>
                        <div>
                            <Popover open={openDate} onOpenChange={setOpenDate}>
                                <PopoverTrigger asChild>
                                    <div className='rounded-md shadow-sm pl-3 py-2 flex gap-2 items-center'>
                                        <CalendarDays  className=" h-4 w-4 text-gray-400" />
                                        <span>

                                            {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : "select date"}


                                        </span>
                                    </div>

                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <Calendar
                                        mode="single"
                                        selected={dateOfBirth}
                                        onSelect={(e) => setDateOfBirth(e)}
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
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
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
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
                    <p className='mb-2 text-sm text-center font-semibold text-gray-400'>By creating an account, you agree to our <span className='cursor-pointer font-bold text-amber-500'>Terms and Conditions</span>. See our <span className='cursor-pointer font-bold text-amber-500'>Privacy Policy</span>.</p>

                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        onClick={handleSubmit}
                        type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 
                        <span className="w-4 h-4 rounded-full border-white border-2 border-t-transparent animate-spin"></span> 
                        : 'Create Account'}
                    </Button>
                    <Providers />
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-amber-600 hover:text-amber-500 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </div>
        </div>
    )
}
