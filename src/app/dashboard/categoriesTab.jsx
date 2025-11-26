"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { RemoveCategory, CreateCategory, banrelatedTripsAction } from "./dashboardActions"
import { CategorySchema } from "./dashboardSchema"
import { getCategories } from '@/shared/ServerAction';
import { Empty, AlertDelete } from './dashboardComponents'; import toast from 'react-hot-toast';
import { Loading } from '@/shared/loading';

export function CategoriesTab() {
    const [categories, setCategories] = useState([]);
    const [remove, setRemove] = useState([false, ""]);
    const [newCategory, setNewCategory] = useState("");
    const [ban, setBan] = useState([false, ""]);
    const [loading, setLoading] = useState(true);
    const [loadingRemove, setLoadingRemove] = useState(false);

    async function handleDeleteCategory(id) {
        setLoadingRemove(true);
        const response = await RemoveCategory(id);
        setLoadingRemove(false);
        if (response?.error) {
            return toast.error(response.message)
        } 
        const newCategory = categories.filter(t => t.id !== id);
        setCategories(newCategory);
        setRemove([false, ""]);
        return toast.success(response.message)
    }

    async function handleCreateCategory() {
        const { error } = CategorySchema({ name: newCategory });
        if (error) {
            return toast.error(error.details[0].message)
        }
        const Categoriesname = categories.map(t => t.name);
        if (Categoriesname.includes(newCategory.trim())) {
            return toast.error(`Category ${e.target.type.value} is already exists`);
        }
        const response = await CreateCategory(newCategory);
        if (response?.error) {
            return toast.error(response.message);
        } else {
            setCategories([...categories, response]);
            setNewCategory("");
            toast.success("created successfully")
        }
    }
    useEffect(() => {
        async function GetCategories() {
            const CategoryTab = true
            const data = await getCategories(CategoryTab);
            if (data?.error) {
                throw new Error(data.message)
            }
            setCategories(data);
            setLoading(false)
        }
        GetCategories()
    }, []);

    return (
        <>
            <TabsContent value="categories" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className={"font-smeibold text-xl"}>Manage Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add New Type Form */}

                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="mb-4 font-bold ">New Category</h3>
                            <div

                                className="flex flex-col sm:flex-row gap-3">
                                <Input
                                    spellCheck={false}
                                    placeholder="Enter trip type (e.g., cruise, safari)..."
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleCreateCategory}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Category
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {loading ?
                            (<Loading />)
                            :
                            (categories.length <= 0 ?
                                (<Empty text={"No categories available. Add your first category above."} Icon={Tag} />)
                                :
                                (<div>
                                    <h3 className="mb-4 font-semibold">Existing Categories ({categories?.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories.map((category) => (
                                            <CategoryItem
                                                key={category.id}
                                                category={category} setBan={setBan} setRemove={setRemove} />
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
                <AlertDelete loadingRemove={loadingRemove} remove={remove} setRemove={setRemove} HandleDelete={handleDeleteCategory} object="category" />
            }

            {ban[0] &&
                <BanTrips ban={ban} setBan={setBan} categories={categories} setCategories={setCategories} />
            }
        </>
    )
}

function CategoryItem({ category, setBan, setRemove }) {
    return (
        <div
            className="flex flex-col gap-3  p-4 bg-white border justify-between rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
        >

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold capitalize">{category.name}</p>
                        <p className="text-sm text-gray-500">Trip category</p>
                    </div>
                </div>
                {category?._count?.trips > 0 &&
                    <Badge className={"bg-purple-100 text-purple-800 w-fit sm:w-fit text-md"}>{category._count.trips} {category?._count.trips > 1 ? "Trips" : "Trip"}</Badge>}
            </div>


            <div className='flex flex-col gap-2 w-full'>
                {
                    category?._count.trips === 0 &&
                    <Button
                        className={"w-full "}
                        size="sm"
                        variant="destructive"
                        onClick={() => setRemove([true, category?.id])}
                    >
                        Remove
                    </Button>

                }
                {category?._count.trips > 0 &&
                    <Button
                        onClick={() => {
                            setBan([true, category])
                        }}
                        className={"bg-zinc-100 text-black hover:bg-zinc-200"}>
                        {category?.banned ? "Un-Ban related Trips" : "Ban Related Trips"}
                    </Button>}
            </div>

        </div>
    )
}


function BanTrips({ ban, setBan, categories, setCategories }) {
    async function handleBanAllTrips() {
        const response = await banrelatedTripsAction(ban[1].id);
        if (response?.error) {
            return toast.error(response.message)
        } else if (response?.success) {
            setCategories(categories.map(c => {
                if (c.id == ban[1].id) {
                    c.banned = !c.banned
                }
                return c
            }))
            toast.success(response.message)
        }
        setBan([false, ""])
    }
    return (
        <div
            className="w-full h-screen bg-black/40 z-50 fixed top-0 left-0 flex items-center justify-center"
            onClick={() => setBan([false, ""])}>
            <div
                className='w-2xl bg-white rounded-md p-4 space-y-2'
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className='font-bold text-xl'>
                    Are You Sure?
                </h2>
                <span className='font-semibold text-red-500 text-xl'>
                    This Action will ban all trips that related to this category {"( " + ban[1].name + " )"}
                </span>
                <div
                    className={"flex gap-2 justify-end mt-6 w-full flex-col sm:flex-row"}
                >
                    <Button
                        variant={"outline"}
                        onClick={() => setBan([false, ""])}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBanAllTrips}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}