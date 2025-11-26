"use client"
import { Label } from "@/components/ui/label"
import { Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { questionAction } from "./contactAction";
import { questionSchema } from "./contactSchema";
import toast from "react-hot-toast";
export function QuestionComponent({ session }) {
    const user = session?.user
    const data = {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        question: ''
    }
    const [formData, setFormData] = useState(data);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [category, setCategory] = useState("")
    const handleChanges = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async (e) => {

        e.preventDefault();
        if (category === "") { return toast.error("category is requried") }
        setIsSubmitting(true);

        let obj = {
            category,
            name: formData.name,
            email: formData.email,
            question: formData.question
        }
        if (formData.phone.trim() !== "") { obj.phone = formData.phone }
        const { error } = questionSchema(obj);
        if (error) {
            setIsSubmitting(false);
            return toast.error(error.details[0].message)
        }

        const response = await questionAction(obj);
        if (response?.error) {
            setIsSubmitting(false);
            return toast.error(response.message)
        }
        setCategory(null)
        setFormData(data)
        setIsSubmitting(false);
        toast.success(response.message)


    };

    return (
        <form onSubmit={(e) => { handleSubmit(e) }} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="name">
                        Full Name <span className="text-red-500 text-xl">*</span>
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChanges}
                        disabled={user ? true : false}
                        type="text"
                        placeholder="John Doe"
                        required
                        spellCheck={false}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handleChanges}
                        disabled={(user && user.phone) ? true : false}
                        name="phone"
                        type="tel"
                        placeholder="+20 123 456 7890"
                        className="mt-2"
                        spellCheck={false}
                    />
                </div>
                <div>
                    <Label htmlFor="email">
                        Email Address <span className="text-red-500 text-xl">*</span>
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled={user ? true : false}
                        onChange={handleChanges}
                        type="email"
                        placeholder="john@example.com"
                        required
                        spellCheck={false}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label htmlFor="category">
                        Category <span className="text-red-500 text-xl">*</span>
                    </Label>
                    <Select name="category" value={category} required onValueChange={(e) => setCategory(e)}>
                        <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="booking_inquiry">Booking Inquiry</SelectItem>
                            <SelectItem value="technical_support">Technical Support</SelectItem>
                            <SelectItem value="cancellation">Cancellation/Refund</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="become_a_guide">Become a Guide</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

            </div>





            <div>
                <Label htmlFor="message">
                    Message <span className="text-red-500 text-xl">*</span>
                </Label>
                <Textarea
                    id="message"
                    name="question"
                    value={formData.question}
                    onChange={handleChanges}
                    placeholder="Please provide as much detail as possible..."
                    required
                    rows={6}
                    spellCheck={false}
                    className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-2">
                    {formData.question.length} / 1000 characters
                </p>
            </div>


            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                    </>
                )}
            </Button>

            <p className="text-sm text-gray-500 text-center">
                We typically respond within 24 hours during business days.
            </p>
        </form>
    )
}