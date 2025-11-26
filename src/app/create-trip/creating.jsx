"use client"
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Banknote, X } from 'lucide-react';
import { UploadImage } from '@/utils/cloudinary';
import { CreateTripAction } from './tripActions';
import { CreateTripSchema } from './tripSchema';

export default function Creating({ categories }) {
    const [description, setdescription] = useState("")
    const [title, settitle] = useState("")
    const [category, setCategory] = useState("");
    const categoryid = categories?.filter(t => t.name === category)[0]?.id
    const [duration, setduration] = useState("")
    const [location, setlocation] = useState("")
    const [meetingPlace, setmeetingPlace] = useState("");
    const [price, setprice] = useState("");
    const [images, setimages] = useState([]);
    const [loading, setloading] = useState(false);


    const router = useRouter()

    async function HandleSubmit() {
        
        const obj = { title, description, category: categoryid, duration, location, meetingPlace, price: +price }
        const { error } = CreateTripSchema(obj)
        if (error) {
            return toast.error(error.details[0].message)
        }

        const UploadImages = await Promise.allSettled(
            images.map(img => UploadImage(img)));

        const successUploads = UploadImages.filter(r => r.status === "fulfilled" && r.value?.url && r.value?.publicid).map(r =>
            ({ url: r.value.url, publicid: r.value.publicid })
        )
        const failedUploads = UploadImages.filter((r) => r.state = "failed" && !r.value.url && !r.value.publicid);
        if (failedUploads.lenght > 0) {
            toast.error(`there is a ${failedUploads.length} image fialed to uploaded`)
        }
        if (successUploads.length === 0) {
            return toast.error(`failed to upload all image(s) to the cloud`)
        }
        setloading(true);
        const response = await CreateTripAction({ obj, UploadedImages: successUploads });
        if (response?.error) {
            setloading(false);
            return toast.error(response.message)
        }
        setloading(false);
        router.replace(`/trip/${response.id}`)
    }

    return (
        <div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Trip Title *</Label>
                                <Input
                                    spellCheck={false}
                                    id="title"
                                    value={title}
                                    onChange={(e) => settitle(e.target.value)}
                                    placeholder="Enter trip title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>

                                <Select
                                    id="category"
                                    value={category} onValueChange={(e) => setCategory(e)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Choose Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => {
                                            return (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.name}>{c.name}</SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setdescription(e.target.value)}
                                spellCheck={false}
                                placeholder="Describe the trip experience..."
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration *</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="duration"
                                        className="pl-10"
                                        value={duration}
                                        onChange={(e) => setduration(e.target.value)}
                                        spellCheck={false}
                                        placeholder="e.g., 3 days"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="location"
                                        className="pl-10"
                                        value={location}
                                        onChange={(e) => setlocation(e.target.value)}
                                        spellCheck={false}
                                        placeholder="e.g., Cairo, Egypt"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (LE) *</Label>
                                <div className="relative">
                                    <Banknote className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="price"
                                        type="number"
                                        className="pl-10"
                                        value={price}
                                        onChange={(e) => setprice(e.target.value)}
                                        spellCheck={false}
                                        placeholder="Enter price"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="meetingPlace">Meeting Place *</Label>
                                <Input
                                    id="meetingPlace"
                                    value={meetingPlace}
                                    onChange={(e) => setmeetingPlace(e.target.value)}
                                    spellCheck={false}
                                    placeholder="Where participants will meet"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="file"
                                multiple
                                id='upload'
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    setimages((prev) => [...prev, ...files]);
                                }}
                            />
                            <label className='border-2 rounded hover:bg-gray-50 px-3 py-1' htmlFor="upload">Select Images</label>
                        </div>

                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Selected ${index}`}
                                            className="h-20 w-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const NewImages = images.filter((_, i) => i !== index);
                                                setimages(NewImages)
                                            }}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                                        >
                                            <X className="h-3 w-3 text-red-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="flex justify-end space-x-4">
                    <Button variant="outline" asChild >
                        <Link href={"/?page=1"}>Cancel</Link>
                    </Button>

                    <Button 
                    onClick={HandleSubmit}
                    disabled={loading} className='w-[105px] px-4' >
                        {loading ?
                            <span className=' border-2 rounded-full border-white h-[18px] w-[18px] border-t-black animate-spin'></span>
                            : 'Create Trip'}
                    </Button>
                </div>
            </div>
        </div>
    );
}