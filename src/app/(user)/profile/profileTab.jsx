"use client"
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLanguageAction } from '@/shared/ServerAction';
import { Camera, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProfileEditing, RoleMenubar, RateThisGuide, GuideLanguages } from './profileTabComponents';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from 'react';
import { getRoleColor } from '@/shared/tripUtils';
import { ChangeUserImageAction } from '../userActions';
import { UserImageSchema } from '../userSchema';
import { UserContext } from '@/context/userContextProvider';
import { UploadImage } from '@/utils/cloudinary';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { useState, useContext } from 'react';
import { Separator } from '@/components/ui/separator';
import { renderStars } from '@/app/trip/tripComponents';

export function ProfileTab({ profile, user }) {
    const [Languages, setLangugaes] = useState([]);
    const [newImage, setNewImage] = useState([null, false]);
    const { setUserImage } = useContext(UserContext);
    const [Profile, setProfile] = useState(profile);
    const userLanguagesIds = Profile.languages.map(l => l.languageId);
    const [openLanguages, setOpenLanguages] = useState(false);

    useEffect(() => {
        async function getLanguages() {
            const data = await getLanguageAction();
            if (data?.error) {
                throw new Error(data.message)
            }
            setLangugaes(data)
        }
        getLanguages()
    }, []);

    async function HandleChangeImage() {
        if (newImage[0] === null) {
            return toast.error("image not found")
        }
        const ImageUploaded = await UploadImage(newImage[0]);
        const { error } = UserImageSchema(ImageUploaded[0]);
        if (error) {
            return toast.error(error.details[0].message)
        }
        const response = await ChangeUserImageAction({ ImageUploaded });
        if (response?.error) {
            return toast.error(response.message)
        }
        setUserImage(ImageUploaded.url);
        setNewImage([newImage[0], false]);
        toast.success("image updated successfully")
    }
    
    
    let guideRate;
    if (Profile?.role === "guide") {
        const sum = Profile?.guideReviewsAsGuide?.map(r => r.rate).reduce((a, e) => +a + +e, 0);
        guideRate = sum / Profile?.guideReviewsAsGuide?.length
    }

    let notRatedBefore = false;
    if (user && Profile?.role === "guide") {
        const Ids = Profile.guideReviewsAsGuide?.map(r => r.userId);
        if (!Ids?.includes(user?.id)) {
            notRatedBefore = true
        }

    }
    return (
        <TabsContent
            onClick={() => {
                if (openLanguages) {
                    setOpenLanguages(false)
                }
            }}
            value="profile" 
            className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className={"text-xl font-bold"}>{user?.id === profile?.id && "Personal Information"}</CardTitle>
                    <CardDescription>
                        {user?.id === profile?.id &&
                            <span className='font-semibold text-zinc-500 '>Update your profile information and photo</span>
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex  space-x-4 justify-between flex-col sm:flex-row gap-3 items-start">
                        <div className='flex gap-2 items-center flex-wrap'>
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={newImage[0] ? URL.createObjectURL(newImage[0]) : profile?.image ? profile?.image : null} alt={profile?.name} />
                                <AvatarFallback className="text-lg">
                                    {profile?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {user?.id === profile?.id &&
                                <div className='h-full flex gap-2 flex-col   items-center justify-center'>
                                    <Button variant="outline" size="sm">
                                        <Label htmlFor="new-image">
                                            <Camera className="h-4 w-4 " />
                                            Change Photo
                                        </Label>
                                    </Button>
                                    {newImage[1] &&
                                        <div className='flex w-full justify-center gap-2'>
                                            <Check
                                                onClick={() => { HandleChangeImage() }}
                                                className='text-green-600 hover:text-green-400 h-7 w-7' />
                                            <X
                                                onClick={() => setNewImage([null, false])}
                                                className='text-red-600 hover:text-red-400 h-7 w-7' />
                                        </div>}
                                </div>
                            }
                            {user?.id === profile?.id &&
                                <input
                                    style={{ display: "none" }}
                                    id="new-image"
                                    type="file"
                                    onChange={(e) => setNewImage([e.target.files[0], true])}
                                />
                            }
                        </div>
                        <div
                            className='flex flex-col gap-2 w-fit items-start'>
                            {Profile?.role === "guide" &&
                                <>
                                    {renderStars(guideRate)}
                                    <p className='text-zinc-500 font-semibold'>
                                        {Profile.guideReviewsAsGuide.length + " people rate this guide"}
                                    </p>
                                </>
                            }
                            {user?.role === "admin" ?

                                (<div className='flex gap-2 w-fit'>
                                    <RoleMenubar Profile={Profile} setProfile={setProfile} />

                                    {Profile?.role === "guide" && <GuideLanguages
                                        userLanguagesIds={userLanguagesIds}
                                        Languages={Languages}
                                        profile={Profile} openLanguages={openLanguages} setOpenLanguages={setOpenLanguages} setProfile={setProfile} />}


                                </div>)
                                :
                                (
                                <Badge variant="secondary" className={`capitalize  ${getRoleColor(profile.role)}`}>
                                    {profile.role}
                                </Badge>
                                )
                            }
                        </div>
                    </div>
                    {profile.role === "guide" && <ProfileInfo Profile={Profile} Languages={Languages} userLanguagesIds={userLanguagesIds} />}

                    {notRatedBefore &&
                        <RateThisGuide setProfile={setProfile} Profile={Profile} user={user} />}

                    {(profile?.id === user?.id || user.role === "admin") && <ProfileEditing Profile={Profile} setProfile={setProfile} user={user} />}
                </CardContent>
            </Card>
        </TabsContent>
    )
}

function ProfileInfo({ Profile, userLanguagesIds, Languages }) {
    let languages = []
    languages = Languages?.filter(l => userLanguagesIds.includes(l.id))
    const languagesNames = languages.map(l => l.name).join(", ")

    return (
        <div>
            <Separator />
            <div className="mt-6 space-y-3">
                <p className="text-xl font-bold">{Profile?.bio}</p>
                <p>
                    <span className="text-xl font-bold">languages: </span>
                    <span className="text-xl font-semibold">{"[ " + languagesNames + ' ]'}</span>
                </p>
                {Profile?.phone&&<p>
                    <span className="text-xl font-bold">Phone: </span>
                    <span className="text-xl font-semibold">{Profile?.phone||"Not Provided Yet"}</span>
                </p>}
            </div>
        </div>
    )
}