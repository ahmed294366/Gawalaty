"use client"
import { useState, useEffect } from 'react';
import { Loading } from '@/shared/loading';
import {
    CheckCircle,
    Plus,
    Trash2, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFeatureAction, removeFeatureAction } from "./dashboardActions"
import { getFeauturesAction } from '@/shared/ServerAction';
import { Separator } from '@/components/ui/separator';
import { featureSchema } from './dashboardSchema';
import { AlertDelete } from './dashboardComponents';
import { Empty } from './dashboardComponents';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';

export function FeaturesTab() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tripFeatures, setTripFeatures] = useState([]);
    const [remove, setRemove] = useState([false, ""]);
    const [loading, setLoading] = useState(true)
    const [loadingRemove, setLoadingRemove ] = useState(false);

    const handleAddTripFeature = async () => {
        let obj = { name };
        if (description.trim() !== "") { obj.description = description }
        const { error } = featureSchema(obj);
        if (error) { return toast.error(error.details[0].message) }

        const exist = tripFeatures.filter(f => f.name === name.trim());
        if (exist.length > 0) {
            return toast.error("this feature already exists")
        }
        const newFeature = await createFeatureAction(obj);
        if (newFeature?.error) {
            return toast.error(newFeature.message)
        } else {
            setDescription("");
            setName("")
            setTripFeatures([...tripFeatures, newFeature]);
            toast.success("feature created successfully")
        }
    };

    const handleDeleteTripFeature = async (id) => {
        setLoadingRemove(true);
        const response = await removeFeatureAction(id);
        setLoadingRemove(false);
        if (response?.error) {
            return toast.error(response.message)
        } else {
            toast.success("deleted successfully");
            setTripFeatures(tripFeatures.filter(f => f.id !== id))
        }
        setRemove([false, ""])
    };

    useEffect(() => {
        async function getFeatures() {
            const data = await getFeauturesAction();
            if (data?.error) {
                throw new Error(data.message)
            }
            setTripFeatures(data);
        }
        getFeatures();
        setLoading(false);
    }, []);
    
    return (
        <>
            <TabsContent value="features" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className={"font-semibold text-xl"}>Manage Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add New Feature Form */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="mb-4 font-bold">New Trip Feature</h3>
                            <div className="space-y-4">
                                <div className='space-y-2'>
                                    <Label>Name</Label>
                                    <Input
                                        spellCheck={false}
                                        placeholder="Enter trip feature (e.g., Hotel pickup and drop-off)..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Description</Label>
                                    <Input
                                        spellCheck={false}
                                        placeholder="Enter feature description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <Button className={"w-full mt-4"} onClick={handleAddTripFeature}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Feature
                            </Button>
                        </div>

                        <Separator />

                        {/* Existing Features List */}
                        {loading?
                        (<Loading/>)
                        :
                        (
                            tripFeatures.length <=0 ?
                            (<Empty text={"not features add at yet"} Icon={CheckCircle} />)
                            :
                            (
                                <div>
                                    <h3 className="mb-4 font-semibold">Existing Trip Features ({tripFeatures.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tripFeatures.map((feature) => (
                                           <FeatureItem 
                                           key={feature.id}
                                           feature={feature} setRemove={setRemove}/>
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
                <AlertDelete loadingRemove={loadingRemove} 
                remove={remove} setRemove={setRemove}
                HandleDelete={handleDeleteTripFeature} object="feature" />
            }
        </>
    )
}

function FeatureItem({feature, setRemove}) {
    return (
        <div
            className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <p className="font-semibold">{feature.name}</p>
                    {feature.description && <p className="text-sm text-gray-500">
                        {feature.description}
                    </p>}
                </div>
            </div>
            <Button
                size="sm"
                variant="destructive"
                onClick={() => setRemove([true, feature.id])}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
