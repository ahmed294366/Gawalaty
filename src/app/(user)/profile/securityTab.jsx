"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Lock, Shield } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ChangePasswordAction, toggleGuestMessageAction } from '../userActions';
import { ChangePasswordSchema } from '../userSchema';
import { Separator } from '@/components/ui/separator';

export function SecurityTab({ profile, user }) {
    if (user?.id !== profile?.id) {
        return null;
    }
    const passwordsObj = { currentPassword: "", newPassword: "", confirmPassword: "" };
    const [passwords, setPasswords] = useState(passwordsObj);
    const [loading, setLoading] = useState(false);
    const [allowGuest, setAllowGuest] = useState(profile?.allowGuestMessages);


    async function handleChangePassword() {
        const { error } = ChangePasswordSchema(passwords)
        if (error) {
            return toast.error(error.details[0].message)
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("new password and it's confirm must be identical");
        }

        setLoading(true);
        const response = await ChangePasswordAction(passwords);
        setLoading(false);

        if (response?.error) {
            if (response?.provider) {
                toast.error(`You signed up using ${response.provider}. Please manage your password from your ${response.provider} account settings`)
            } else {
                toast.error(response?.message)
            }
        } else {
            toast.success(response.message)
        }
        setPasswords(passwordsObj);
    }

    async function handleToggle() {
        const response = await toggleGuestMessageAction(profile.id);
        if (response?.error) {
            return toast.error(response.message);
        }
        setAllowGuest(!allowGuest);
    }

    return (

        <TabsContent value="security" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className={"font-bold flex items-center"}>
                        <Shield className="h-5 w-5 mr-2" />
                        Security Settings
                    </CardTitle>
                    <CardDescription className={"font-semibold text-zinc-500"}>
                        Manage your account security and password
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-4">Allow Guest Messages</h4>
                            <div className="max-w-md pl-4 flex gap-2">
                                <Switch
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 cursor-pointer"
                                    checked={allowGuest}
                                    onClick={handleToggle}
                                    id="guestMessage" />
                                <Label htmlFor="guestMessage" className={"cursor-pointer"}>{allowGuest ? "Allowed" : "Block"}</Label>
                            </div>
                        </div>
                        {profile?.password &&
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-4">Change Password</h4>
                                    <div className="space-y-4 max-w-md pl-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={passwords.currentPassword}
                                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={passwords.newPassword}
                                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={passwords.confirmPassword}
                                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                    className="pl-10"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleChangePassword}
                                            disabled={
                                                !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword || loading
                                            }
                                        >
                                            {loading ?
                                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                                : "Update Password"}
                                        </Button>
                                    </div>
                                </div>
                            </>}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    )
}
