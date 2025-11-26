"use client"
import { useState, useEffect } from 'react';

import { Plus, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSettingAction, fetchSettingAction, removeSettingAction, ToggleSettingAction } from "./dashboardActions"
import { Separator } from '@/components/ui/separator';
import { settingSchema } from './dashboardSchema';
import { AlertDelete } from './dashboardComponents';
import { Empty } from './dashboardComponents';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Loading } from '@/shared/loading';

export function SettingTab() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRemove, setLoadingRemove ] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const data = await fetchSettingAction();
            if (data?.error) {
                throw new Error(data?.message);
            }
            setSettings(data);
            setLoading(false)
        }
        fetchSettings();
    }, []);
    const [key, setKey] = useState("");
    const [value, setValue] = useState(true);
    const [remove, setRemove] = useState([false, ""]);

    async function handleCreate() {
        const { error } = settingSchema({ key, value });
        if (error) {
            return toast.error(error.details[0].message);
        }
        const response = await createSettingAction({ key, value });
        if (response?.error) {
            return toast.error(response.message);
        }
        setSettings([...settings, response]);
        setKey("");
        setValue(true);
    }

    async function handleDelete() {
        setLoadingRemove(true);
        const response = await removeSettingAction(remove[1]);
        setLoadingRemove(false);
        if (response?.error) {
            return toast.error(response.message);
        }
        setSettings(settings.filter(s => s.id !== remove[1]));
        setRemove([false, ""]);
    }
    return (
        <>
            <TabsContent value="setting" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className={"font-semibold text-xl"}>Manage Setting</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add New Feature Form */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="mb-4 font-bold">New Setting</h3>
                            <div className="space-y-4">
                                <div className='space-y-2'>
                                    <Label htmlFor="key">Key</Label>
                                    <Input
                                        spellCheck={false}
                                        placeholder="Enter key name"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        id="key"
                                        className="flex-1"
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor="value">Value</Label>
                                    <Select value={value} onValueChange={(e) => setValue(e)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={true}>True</SelectItem>
                                            <SelectItem value={false}>False</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleCreate} className={"w-full mt-4"} >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        <Separator />

                        {/* Existing Features List */}
                        {loading ? 
                        (<Loading/>)
                        :
                        (
                            settings.length<=0 ?
                            (<Empty text={"Not setting added yet"} Icon={Settings} />)
                            :
                            (
                                <div>
                                    <h3 className="mb-4 font-semibold">Existing ({settings.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {settings.map((setting) => (
                                            <SettingItem
                                                key={setting.id}
                                                setting={setting} settings={settings} setRemove={setRemove} setSettings={setSettings} />
                                        ))}
                                    </div>
                                </div>
                            )
                        )}

                    </CardContent>
                </Card>
            </TabsContent>

            {remove[0] &&
                <AlertDelete loadingRemove={loadingRemove} remove={remove} setRemove={setRemove}
                    HandleDelete={handleDelete} object="setting" />}
        </>
    )
}

function SettingItem({ setting, setRemove, setSettings, settings }) {
    return (
        <div
            className="flex justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow flex-col items-start gap-3"
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-zinc-600" />
                </div>
                <div>
                    <p className="font-semibold">{setting.key}</p>
                    <p className="text-sm text-gray-500">
                        {setting.value ? "True" : "False"}
                    </p>
                </div>
            </div>
            <div className='flex justify-between w-full'>
                <Button
                    size="sm"
                    // className={"w-full"}
                    variant="destructive"
                    onClick={() => setRemove([true, setting.id])}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <ToggleSetting setting={setting} setSettings={setSettings} settings={settings} />
            </div>

        </div>
    )
}

function ToggleSetting({ setting, setSettings, settings }) {
    async function handleToggle() {
        const response = await ToggleSettingAction(setting.id);
        if (response?.error) {
            return toast.error(response.message);
        }
        setSettings(settings.map(s => {
            if (s.id === setting.id) {
                s.value = response;
            }
            return s
        }));

    }
    return (
        <div className="flex items-center space-x-2">
            <Label htmlFor="switch">{setting.value ? "On" : "Off"}</Label>
            <Switch
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                checked={setting.value}
                onClick={handleToggle}
                id="switch" />
        </div>
    )
}