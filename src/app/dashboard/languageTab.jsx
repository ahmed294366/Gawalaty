"use client"
import { useState, useEffect } from 'react';
import { AlertDelete } from './dashboardComponents';
import { Plus, Trash2, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLanguageAction, removeLanguageAction } from "./dashboardActions"
import { Separator } from '@/components/ui/separator';
import { languageSchema } from './dashboardSchema';
import { getLanguageAction } from '@/shared/ServerAction';
import { Loading } from '@/shared/loading';
import { Empty } from './dashboardComponents';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';

export function LanguageTab() {
    const [name, setName] = useState('');
    const [Languages, setLanguages] = useState([]);
    const [remove, setRemove] = useState([false, ""]);
    const [loading, setLoading] = useState(true);
    const [loadingRemove, setLoadingRemove ] = useState(false);

    const handleAddLanguage = async () => {
        let obj = { name };
        const { error } = languageSchema(obj);
        if (error) { return toast.error(error.details[0].message) }

        const exist = Languages.filter(f => f.name === name.trim());
        if (exist.length > 0) {
            return toast.error("this language already exists")
        }
        const newLanguage = await createLanguageAction(obj);
        if (newLanguage?.error) {
            return toast.error(newLanguage.message)
        } else {
            setLanguages([...Languages, newLanguage]);
            setName("")
            toast.success("Language created successfully")
        }
    };

    const handleDeleteLanguage = async (id) => {
        setLoadingRemove(true);
        const response = await removeLanguageAction(id);
        setLoadingRemove(false);
        if (response?.error) {
            return toast.error(response.message)
        } else {
            toast.success(response.message);
            setLanguages(Languages.filter(f => f.id !== id))
        }
        setRemove([false, ""])
    };

    useEffect(() => {
        async function getLanguages() {
            const languages = await getLanguageAction();
            if (languages?.error) {
                throw new Error(languages?.message)
            }
            setLanguages(languages)
            setLoading(false)
        }
        getLanguages();
    }, []);

    return (
        <>
            <TabsContent value="languages" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className={"text-xl font-semibold"}>Manage Languages</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add New Feature Form */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="mb-4 font-bold">New Language</h3>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    spellCheck={false}
                                    placeholder="Enter Language name (e.g., English)..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flex-1"
                                />
                            </div>
                            <Button className={"w-full mt-4"} onClick={handleAddLanguage}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Language
                            </Button>
                        </div>

                        <Separator />

                        {/* Existing Features List */}
                        {loading ?
                            (<Loading />)
                            :
                            (
                                Languages.length <= 0 ?
                                    (<Empty text={"No Languages Add Yet"} Icon={Globe} />)
                                    :
                                    (
                                        <div>
                                            <h3 className="mb-4 font-semibold">Existing Languages ({Languages.length})</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Languages.map((language) => (
                                                    <LanguageItem language={language}
                                                        key={language.id}
                                                        setRemove={setRemove}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                            )
                        }
                    </CardContent>
                </Card>
            </TabsContent>

            {remove[0] &&
                <AlertDelete loadingRemove={loadingRemove} setRemove={setRemove} remove={remove} object="language" HandleDelete={handleDeleteLanguage} />}
        </>
    )
}

function LanguageItem({ language, setRemove }) {

    return (
        <div
            key={language.id}
            className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <p className="font-semibold">{language.name}</p>

                </div>
            </div>
            <Button
                size="sm"
                variant="destructive"
                onClick={() => setRemove([true, language.id])}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}