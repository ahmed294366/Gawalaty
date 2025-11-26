import { EditUserAction, BanUserAction, RateGuideAction, changeUserRoleAction, setLanguageAction } from "../userActions";
import { Calendar } from '@/components/ui/calendar';
import toast from 'react-hot-toast';
import { ProfileEditSchema } from "../userSchema"
import { User, Phone, MapPin, Settings, Pen, Trash2, Ban, Check, X } from 'lucide-react';
import { DeleteUserAction } from "@/shared/ServerAction";
import {
    Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger
} from "@/components/ui/menubar";
import { renderStars } from '@/app/trip/tripComponents';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export function ProfileEditing({ Profile, setProfile, user }) {

    const [Disabled, setDisabled] = useState(true);
    const profileStatus = {
        name: Profile?.name,
        phone: Profile?.phone, location: Profile?.location, dateOfBirth: Profile.dateOfBirth, bio: Profile?.bio,
    };

    const [profileStates, setProfileStates] = useState(profileStatus);
    const [open, setOpen] = useState({
        ban: false, remove: false
    });
    const [openDate, setOpenDate] = useState(false);

    async function HandleEdit() {
        let obj = {};
        if (profileStates.name.trim() !== Profile.name) {
            obj.name = profileStates.name;
        }
        if (profileStates.bio) {
            if (profileStates.bio.trim() !== Profile.bio) {
                obj.bio = profileStates.bio;
            }
        }
        if (profileStates.location) {
            if (profileStates.location.trim() !== Profile.location) {
                obj.location = profileStates.location
            }
        }

        if (profileStates.phone) {
            if (profileStates.phone.trim() !== Profile.phone) {
                obj.phone = profileStates.phone
            }
        }


        if (profileStates.dateOfBirth !== Profile.dateOfBirth) {
            obj.dateOfBirth = profileStates.dateOfBirth

        }


        const { error } = ProfileEditSchema(obj)
        if (error) {
            toast.error(error.details[0].message)
        } else {
            const response = await EditUserAction({ obj, id: Profile?.id });
            if (response?.error) {
                setProfileStates(profileStatus);
                setDisabled(true)
                return toast.error(response?.message);
            } else if (response?.success) {
                setProfileStates({ ...profileStates, ...response.newUser })
                setProfile({ ...Profile, ...response.newUser });
                setDisabled(true)
                return toast.success(response?.message);
            }

        }


    }

    return (
        <div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {(Profile?.role === "guide" || Profile?.id == user?.id || user?.role === "admin") &&
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="name"
                                type={"text"}
                                spellCheck={false}
                                value={profileStates.name}
                                onChange={(e) => setProfileStates({ ...profileStates, name: e.target.value })}
                                disabled={!(!Disabled && ((user?.id === Profile?.id && Profile?.role !== "guide") || (Profile.role === "guide" && user?.role === "admin")))}
                                className="pl-10"
                            />
                        </div>
                    </div>
                }


                {/* if guide and user booking in his trip */}
                {(user?.id === Profile?.id || user?.role === "admin" || Profile?.phone) &&
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="insert your phone number"
                                id="phone"
                                type={"text"}
                                spellCheck={false}
                                value={profileStates.phone || ""}
                                onChange={(e) => setProfileStates({ ...profileStates, phone: e.target.value })}
                                disabled={!(!Disabled && ((user?.id === Profile?.id && Profile.role !== "guide") || (user?.role === "admin" && Profile?.role === "guide")))}
                                className="pl-10"
                            />
                        </div>
                    </div>
                }

                {(Profile?.id === user?.id || user?.role === "admin") &&
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id={"location"}
                                type={"text"}
                                value={profileStates.location || ""}
                                onChange={(e) => setProfileStates({ ...profileStates, location: e.target.value })}
                                spellCheck={false}
                                disabled={!(!Disabled && user?.id === Profile?.id)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                }

                {(Profile?.id === user?.id || user?.role === "admin") &&
                    <div className="space-y-2">
                        <Label >Date Of Birth</Label>
                        <div className="relative">
                            <Popover open={openDate} onOpenChange={setOpenDate}>
                                <PopoverTrigger asChild>
                                    <Button
                                        disabled={!(!Disabled && user?.id === Profile?.id)} variant="outline">
                                        {profileStates.dateOfBirth ? `${new Date(profileStates.dateOfBirth).toLocaleDateString()}` : "Select-Date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <Calendar
                                        disabled={!(!Disabled && user?.id === Profile?.id)}
                                        mode="single"
                                        selected={profileStates.dateOfBirth}
                                        onSelect={(e) => setProfileStates({ ...profileStates, dateOfBirth: e })}
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                }


                {(Profile?.role === "guide") &&
                    <div className="space-y-2 text-black">
                        <Label htmlFor="bio">Bio</Label>
                        <div className="relative">
                            <Pen className="absolute left-3 top-3 h-4 w-4 " />
                            <Input
                                type={"text"}
                                id={"bio"}
                                spellCheck={false}
                                value={profileStates.bio || ""}
                                onChange={(e) => setProfileStates({ ...profileStates, bio: e.target.value })}
                                disabled={!(!Disabled && user?.id === Profile?.id && Profile?.role === "guide")}
                                className="pl-10 text-black"
                            />
                        </div>
                    </div>
                }

            </div>

            <div className="mt-6">
                <Separator />
                <div className="flex justify-between flex-col-reverse gap-2 w-full sm:flex-row items-start mt-6">
                    {((user?.id === Profile?.id && Profile?.role !== "guide") || user?.role === "admin") &&
                        <div className='flex flex-col gap-2'>

                            {user?.role === "admin" &&
                                <Button
                                    onClick={() => setOpen({ ban: true, remove: false })}
                                    variant="outline"
                                >
                                    <Ban className="h-4 w-4 mr-2" />
                                    {Profile.banned ? "Un-Ban" : "Ban"}
                                </Button>
                            }
                            <Button
                                onClick={() => setOpen({ edit: false, remove: true })}
                                variant="destructive" >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                            </Button>
                        </div>
                    }

                    {((user?.role === "admin" && Profile?.role === "guide") || Profile?.id === user?.id) &&
                        <div className="flex space-x-3 " >
                            {!Disabled ? (
                                <>
                                    <Button variant="outline" onClick={() => {
                                        setProfileStates(profileStatus);
                                        setDisabled(true)
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={HandleEdit}>
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size={"lg"}
                                    className={"w-39"}
                                    variant={"outline"}
                                    onClick={() => setDisabled(false)}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    }
                </div>
            </div>

            {
                open.ban &&
                <AlertBanProfile user={user} setOpen={setOpen} Profile={Profile} setProfile={setProfile} profileStates={profileStates} setProfileStates={setProfileStates} />
            }

            {
                open.remove && <AlertEdeleteProfile profile={Profile} user={user} setOpen={setOpen} />
            }
        </div>
    )
}

function AlertBanProfile({ user, Profile, setOpen, setProfile, profileStates, setProfileStates }) {

    async function HandleUserBan() {
        if (user?.role !== "admin") {
            return toast.error("not allowed, access denied")
        }
        const response = await BanUserAction(Profile?.id);
        if (response?.error) {
            return toast.error(response.message)
        }
        else if (response?.success) {
            setProfile({ ...Profile, banned: response.banned })
            setProfileStates({ ...profileStates, banned: response.banned });
            setOpen({ ban: false, remove: false });
            return toast.success(`user ${response?.banned ? "banned" : "Un-Ban"} successfully`)
        }
    }

    return (
        <div
            onClick={() => setOpen({ ban: false, remove: false })}
            className='fixed top-0 left-0 bg-black/40 w-full h-screen z-50 flex items-center justify-center'>
            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white rounded-md p-4 space-y-4 w-xl'>
                <h2 className='text-xl font-bold'>
                    Are you absolutely sure?
                </h2>
                <span className='font-semibold text-zinc-500'>
                    {Profile.ban ? "This Will Un-Ban This User's Account . . ." : "This Will Ban This User's Account . . ."}
                </span>
                <div className='flex justify-end w-full flex-col gap-2 sm:flex-row mt-4'>
                    <Button
                        onClick={() => setOpen({ ban: false, remove: false })}
                        variant={"outline"}>
                        Cancel
                    </Button>
                    <Button onClick={HandleUserBan}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AlertEdeleteProfile({ setOpen, profile, user }) {
    const router = useRouter()

    async function handleDeleteAccount() {
        const response = await DeleteUserAction(profile?.id);
        if (response?.error) {
            setOpen({ ban: false, remove: false });
            return toast.error(response.message)
        } else {
            toast.success(response.message)
            if (profile.id === user.id) {
                await signOut()
            }
            router.replace("/")
        }

    }

    return (
        <div
            onClick={() => setOpen({ ban: false, remove: false })}
            className='fixed top-0 left-0 bg-black/40 w-full h-screen z-50 flex items-center justify-center'>
            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white rounded-md p-4 space-y-4 w-xl'>
                <h2 className='text-xl font-bold'>
                    Are you absolutely sure?
                </h2>
                <span className='font-semibold text-zinc-500'>
                    This action cannot be undone. This will permanently delete this account
                    and remove all data from our servers.
                </span>
                <div className='flex justify-end w-full flex-col gap-2 sm:flex-row mt-4'>
                    <Button
                        onClick={() => setOpen({ ban: false, remove: false })}
                        variant={"outline"}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteAccount}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function RateThisGuide({ Profile, user, setProfile }) {
    const [rate, setRate] = useState(null);

    async function handleRate() {
        if (!user) {
            return toast.error("Login to Rating")
        }
        if (rate === null) {
            return toast.error("choose rate")
        }
        const response = await RateGuideAction({ id: Profile.id, rating: rate });

        if (response?.error) {
            return toast.error(response.message)
        } else if (response?.success) {
            toast.success(response.message);
            setProfile({ ...Profile, guideReviewsAsGuide: [...Profile.guideReviewsAsGuide, response.newRate] })
        }
    }

    return (
        <div className='flex gap-6 flex-col'>
            <Separator />
            <div className='flex flex-col gap-3'>
                <p className='text-xl font-bold'>Rate This Guide</p>
                <div className='flex items-center gap-2'>
                    {renderStars(rate || 0, true, setRate)}
                    <span className='font-semibold'>{(rate || 0) + " From 5"}</span>
                </div>

                <Button
                    className={"mt-3"}
                    onClick={handleRate}
                >Submit</Button>
            </div>

        </div>
    )
}

export function RoleMenubar({ Profile, setProfile }) {
    const [role, setRole] = useState(Profile.role);
    const [open, setOpen] = useState(false);

    async function HandleChangeRole() {
        const roles = ["user", "guide", "admin"]
        if (!roles.includes(role)) {
            return toast.error(`role must be one of (${roles.join(" or ")})`)
        }
        const response = await changeUserRoleAction({ role, id: Profile?.id });
        if (response?.error) {
            return toast.error(response.message)
        } else if (response?.success) {
            setProfile({ ...Profile, role });
            toast.success("role changed successfully")
        }
        setOpen(false)
    }

    return (

        <>
            {open &&
                <div
                    onClick={() => {
                        setOpen(false);
                        setRole(Profile.role)
                    }}
                    className='flex fixed top-0 items-center left-0 justify-center bg-black/40 z-50 w-full h-screen'>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className='rounded-md bg-white p-4 space-y-2 w-lg'>
                        <h2 className='text-xl font-bold'> Are you absolutely sure?</h2>
                        <span className='text-xl font-semibold text-zinc-500'>This account will set as <span className='font-bold'>{role}</span>  account</span>
                        <div
                            className='flex justify-end gap-2 flex-col w-full sm:flex-row mt-4'>
                            <Button variant={"outline"} onClick={() => {
                                setOpen(false)
                                setRole(Profile.role)
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={HandleChangeRole}>
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            }

            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger>{role}</MenubarTrigger>
                    <MenubarContent>

                        {role !== "admin" &&
                            <>
                                <MenubarItem onClick={() => {
                                    setRole("admin")
                                    setOpen(true)
                                }}>
                                    admin
                                </MenubarItem>
                                <MenubarSeparator />
                            </>
                        }


                        {role !== "guide" &&
                            <MenubarItem onClick={() => {
                                setRole("guide");
                                setOpen(true)
                            }}>
                                guide
                            </MenubarItem>
                        }

                        {role === "admin" && <MenubarSeparator />}
                        {role !== "user" &&
                            <MenubarItem onClick={() => {
                                setRole("user");
                                setOpen(true)
                            }}>
                                user
                            </MenubarItem>
                        }
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </>
    )
}

export function GuideLanguages({ Languages, userLanguagesIds, openLanguages, setOpenLanguages, profile, setProfile }) {

    const [selectedLanToAdd, setSelectedLanToAdd] = useState([]);
    const [selectedLanToDel, setSelectedLanToDel] = useState([]);

    async function handleLanguages() {
        const response = await setLanguageAction({ addIds: selectedLanToAdd, id: profile.id, deleteIds: selectedLanToDel });
        if (response?.error) {
            return toast.error(response.message)
        } else {
            toast.success("languages (added , removed) successfully");
            setSelectedLanToAdd([]);
            setSelectedLanToDel([]);
            setProfile(prev => ({
                ...prev,
                languages: [...response]
            }));
        }
    }

    const userLanguages = Languages?.filter(l => userLanguagesIds.includes(l.id));
    const languagesToAdd = Languages?.filter(l => !userLanguagesIds.includes(l.id));

    return (
        <div onClick={(e) => e.stopPropagation()} className="w-20 relative">
            <Button variant={"outline"} onClick={() => setOpenLanguages(true)}>
                Languages
            </Button>

            {openLanguages &&
                <div className="absolute capitalize top-10 right-0 z-50 bg-white py-2 px-3 w-40 font-semibold text-zinc-500 space-y-1 border rounded-md">

                    <div className="font-bold text-sm text-blue-800 border-b border-b-blue-800 mt-2">Current</div>
                    {userLanguages?.map((lan) => {
                        return (
                            <div className={`flex items-center justify-between hover:text-black cursor-default ${selectedLanToDel.includes(lan.id) && "text-black"}`}
                                onClick={() => {
                                    if (selectedLanToDel.includes(lan.id)) {
                                        setSelectedLanToDel(selectedLanToDel.filter((l) => l !== lan.id))
                                    } else {
                                        setSelectedLanToDel([...selectedLanToDel, lan.id])
                                    }
                                }}
                                key={lan.id}>
                                {lan.name}
                                {selectedLanToDel.includes(lan.id) && <X className="w-5 h-5 text-red-500" />}
                            </div>
                        )
                    })}
                    <div className="font-bold text-sm text-blue-800 border-b border-b-blue-800 mt-2">Other</div>
                    {languagesToAdd?.map((lan) => {
                        return (
                            <div className={`flex justify-between hover:text-black cursor-default ${selectedLanToAdd.includes(lan.id) && "text-black"}`}
                                onClick={() => {
                                    if (selectedLanToAdd.includes(lan.id)) {
                                        setSelectedLanToAdd(selectedLanToAdd.filter((l) => l !== lan.id))
                                    } else {
                                        setSelectedLanToAdd([...selectedLanToAdd, lan.id])
                                    }
                                }}
                                key={lan.id}>
                                {lan.name}
                                {selectedLanToAdd.includes(lan.id) && <Check className="w-5 h-5 text-emerald-500" />}
                            </div>
                        )
                    })}
                    <Button
                        disabled={(selectedLanToAdd.length === 0 && selectedLanToDel.length === 0)}
                        onClick={handleLanguages}
                        variant={"outline"} className={"w-full mt-2"}>Add & delete</Button>
                </div>
            }
        </div>
    )
}