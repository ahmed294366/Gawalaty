"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { createAnnounceAction, getTripsAction, getAnnouncementAction, removeAnnouncementAction, toggleAnnouncementAction, getAnnouncementsCountAction } from "./announcementAction";
import { getCategories } from "@/shared/ServerAction";
import { Megaphone, Trash2, Calendar, Map, ChevronLeft, ChevronRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { announceSchema } from "./announceSchema";

export function ManageAnnouncementsComponent() {
    const announcementObj = { title: "", description: "", expiresAt: "", trip: null };
    const [announcement, setAnnouncement] = useState(announcementObj);
    const [announcements, setAnnouncements] = useState([]);
    const [trips, setTrips] = useState([]);
    const [remove, setRemove] = useState([false, ""]);
    const [loadingRemove, setLoadingRemove] = useState(false);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("Select Category");
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [refresh, setRefresh] = useState(1)


    useEffect(() => {
        async function getAnnouncements() {
            setLoading(true);
            const data = await getAnnouncementAction(page);
            setLoading(false);
            if (data?.error) {
                throw new Error(data.message)
            }
            setAnnouncements(data)
        }
        getAnnouncements()
    }, [page]);

    useEffect(() => {
        async function getAnnouncementsCount() {
            const items = await getAnnouncementsCountAction();
            if (items?.error) {
                throw new Error(items.message)
            } else {
                if (items.length === 0) {
                    setPages(0)
                } else {
                    setPages(Math.ceil(items / 6))
                }
            }
        }
        getAnnouncementsCount()
    }, [refresh]);

    useEffect(() => {
        async function getCategory() {
            const data = await getCategories();
            if (data?.error) {
                throw new Error(data.message)
            } else {
                setCategories(data)
            }
        }
        getCategory()
    }, []);

    useEffect(() => {
        async function getTrips() {
            if (category !== "Select Category") {
                const data = await getTripsAction(category);
                if (data?.error) {
                    throw new Error(data.message);
                }
                setTrips(data);
            } else {
                setTrips([]);
            }
        }
        getTrips();
    }, [category]);



    async function handleSubmit() {
        let obj = { description: announcement.description, expiresAt: announcement.expiresAt };
        if (announcement.title.trim() !== "") {
            obj.title = announcement.title
        }
        if (announcement.trip) { obj.trip = announcement.trip }

        const { error } = announceSchema(obj);
        if (error) {
            return toast.error(error.details[0].message)
        }
        const data = await createAnnounceAction(obj);
        if (data?.error) {
            return toast.error(data.message)
        } else {
            setRefresh(refresh + 1);
            setAnnouncement(announcementObj);
            setAnnouncements([data, ...announcements.slice(0, 5)]);
        }

    }

    const handleToggle = async (id) => {
        const response = await toggleAnnouncementAction(id);
        if (response?.error) {
            return toast.error(response.message)
        } else {
            setAnnouncements(announcements.map(a => {
                if (a.id === id) {
                    a.show = response.show
                }
                return a
            }));
        }
    };

    const handleDelete = async (id) => {
        setLoadingRemove(true);
        const response = await removeAnnouncementAction(id);
        setLoadingRemove(false);
        if (response?.error) {
            return toast.error(response.message)
        } else {
            setAnnouncements(announcements.filter(a => a.id !== id));
            toast.success(response.message);
            setRemove([false, ""])
        }
    };



    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8">
                    <h1 className="flex items-center gap-3 mb-2 font-semibold text-xl">
                        <Megaphone className="h-8 w-8 text-primary" />
                        Announcement Management
                    </h1>
                    <p className="text-zinc-500">
                        Create and manage announcement for users
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Create new announcement</CardTitle>
                        <CardDescription>Add new announcement to display</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">{"Title (optional)"}</Label>
                                <Input
                                    id="title"
                                    value={announcement.title}
                                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                    placeholder="Add title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Description
                                    <span className="text-red-500 text-xl">*</span>
                                </Label>
                                <Textarea
                                    id="content"
                                    value={announcement.description}
                                    onChange={(e) => setAnnouncement({ ...announcement, description: e.target.value })}
                                    placeholder="Add description"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expire date <span className="text-red-500 text-xl">*</span>
                                </Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={announcement.expiresAt}
                                    onChange={(e) => setAnnouncement({ ...announcement, expiresAt: e.target.value })}

                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tripId">{"Select Trip (optional)"}</Label>

                                    {category === "Select Category"
                                        ?
                                        <CategorySelect category={category}
                                            setCategory={setCategory} categories={categories} />
                                        :
                                        <TripsSelect
                                            setCategory={setCategory}
                                            trips={trips} setAnnouncement={setAnnouncement}
                                            announcement={announcement} />
                                    }

                                </div>

                            </div>

                            <Button
                                onClick={handleSubmit}
                                type="submit" className="w-full">
                                <Megaphone className="mr-2 h-4 w-4" />
                                Create
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Announcements */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Current announcement</h2>
                    {loading ? (
                        <div className="h-36 w-full flex items-center justify-center">
                            <span
                                className="w-10 h-10 rounded-full border-5 border-zinc-500 border-t-transparent animate-spin"
                            ></span>

                        </div>
                    ) : (
                        announcements.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-zinc-500 font-semibold text-xl">
                                    No announcement at this moment
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {announcements.map(announcement => (
                                    <AnnouncementItem key={announcement.id}
                                        setRemove={setRemove}
                                        announcement={announcement} handleToggle={handleToggle} />
                                ))}
                            </div>
                        )
                    )}

                </div>
                {true  &&
                    <div className='flex items-center gap-1 mt-2'>
                        <ChevronLeft
                            onClick={() => {
                                if (page > 1) {
                                    setPage(page - 1)
                                }
                            }}
                            className='rounded-full p-2 bg-white hover:bg-gray-50 w-10 h-10' />
                        {page}
                        <p className='font-bold'>From</p>
                        {pages}
                        <ChevronRight
                            onClick={() => {
                                if (page < pages) {
                                    setPage(page + 1)
                                }
                            }}
                            className='rounded-full p-2 bg-white hover:bg-gray-50 w-10 h-10' />
                    </div>
                }
            </div>
            {remove[0] &&
                <AlertDelete remove={remove} setRemove={setRemove} loading={loadingRemove} handleDelete={handleDelete} />
            }
        </>
    );
}

function AnnouncementItem({ announcement, handleToggle, setRemove }) {
    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };
    return (
        <Card className={isExpired(announcement.expiredAt) ? 'opacity-60' : ''}>
            <CardContent >
                <Megaphone className="h-5 w-5 mb-4" />
                <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex-1 space-y-3">
                        <div className="flex-1">
                            <h3 className="mb-1">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {announcement.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Expire in: {new Date(announcement.expiresAt).toLocaleDateString()}
                                </span>
                                {isExpired(announcement.expiresAt) && (
                                    <span className="text-red-500">{"(expired)"}</span>
                                )}
                            </div>

                            {announcement.trip &&
                                <div className="flex items-center gap-2">
                                    <Map className="h-4 w-4" />
                                    <span>
                                        Trip: {announcement.trip.title}
                                    </span>
                                </div>
                            }
                        </div>

                        <div className="text-xs text-muted-foreground">
                            Created at: {new Date(announcement.createdAt).toLocaleDateString({
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`show`} className="text-sm cursor-pointer">
                                {announcement.show ? 'Active' : 'Hidden'}
                            </Label>
                            <Switch
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 cursor-pointer"
                                id={`show`}
                                checked={announcement.show}
                                onCheckedChange={() => handleToggle(announcement.id)}
                            />
                        </div>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRemove([true, announcement.id])}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function AlertDelete({ remove, setRemove, loading, handleDelete }) {

    return (
        <div
            onClick={() => { if (!loading) setRemove([false, ""]) }}
            className="flex fixed z-50 top-0 left-0 w-full h-screen items-center justify-center bg-black/40">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-4 rounded-md space-y-1 w-2xl">
                <h2 className="font-semibold text-xl">Are you sure?</h2>
                <span className="text-xl text-zinc-500">This action will permenantly remove this announcement</span>

                <div className="w-full flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    <Button
                        variant={"outline"}
                        onClick={() => setRemove([false, ""])}>
                        Cancel
                    </Button>
                    <Button onClick={() => { handleDelete(remove[1]) }}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>

    )
}

function CategorySelect({ categories, category, setCategory }) {
    let name = "Select Category";

    if (category !== "Select Category") {
        name = categories.filter(c => c.id === category)[0]?.name
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem onClick={() => setCategory("Select Category")}>
                    No trip
                </DropdownMenuItem>
                {categories?.map(c => {
                    return (
                        <DropdownMenuItem key={c.id}
                            onClick={() => {
                                if (category === c.id) {
                                    setCategory("Select Category");
                                } else {
                                    setCategory(c.id)
                                }
                            }
                            }>
                            {c.name}
                        </DropdownMenuItem>
                    )
                })}


            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function TripsSelect({ trips, setAnnouncement, setCategory, announcement }) {
    let name = "";
    if (announcement.trip) {
        name = trips.filter(t => t.id === announcement.trip)[0].title;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{name ? name.length > 18 ? name.slice(18) + "..." : name : "Select Trip"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem onClick={() => {
                    setCategory("Select Category");
                    setAnnouncement({ ...announcement, trip: null });
                }
                }>
                    No trip
                </DropdownMenuItem>
                {trips?.map(Trip => {
                    return (
                        <DropdownMenuItem key={Trip.id}
                            onClick={() => {
                                if (announcement.trip === Trip.id) {
                                    setCategory("Select Category")
                                    setAnnouncement({ ...announcement, trip: null });
                                } else {
                                    setAnnouncement({ ...announcement, trip: Trip.id });
                                }
                            }
                            }>
                            {Trip.title.length < 18 ? Trip.title : Trip.title.slice(18) + "..."}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}