"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, XCircle, Ban, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUsersAction, BanUserAction, getUserCount } from "./dashboardActions";
import { DeleteUserAction } from '@/shared/ServerAction';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { DashboardPagination, AlertDelete } from './dashboardComponents';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { getRoleColor } from '@/shared/tripUtils';
import { Loading } from '@/shared/loading';
export default function UsersTab({session}) {
    const [filter, setFilter] = useState([{ search: "", role: "all" }, 1])
    const [users, setUsers] = useState([]);
    const [remove, setRemove] = useState([false, ""]);
    const [pages, setPages] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingRemove, setLoadingRemove ] = useState(false)

    async function HandleDeleteUser(user) {
        setLoadingRemove(true);
        const response = await DeleteUserAction(user.id);
        setLoadingRemove(false);
        if (response?.error) {
            setRemove([false, ""])
            return toast.error(response.message)
        }
        const newUsers = users.filter(u => u.id !== user?.id);
        setUsers(newUsers);
        setRemove([false, ""])
        toast.success(response.message);
        if (session.id === user.id) {
            await signOut()
        }
    }
    useEffect(() => {
        async function getUsers() {
            const users = await getUsersAction({ role: filter[0].role.trim() === "all" ? false : filter[0].role, search: filter[0].search.trim() === "" ? false : filter[0].search, page: filter[1] });
            if (users?.error) {
                throw new Error(users?.message)
            }
            setUsers(users);
            setLoading(false)
        }
        getUsers()
    }, [filter, refresh]);

    useEffect(() => {
        async function getCount() {
            const items = await getUserCount({ search: filter[0].search.trim() === "" ? false : filter[0].search, role: filter[0].role === "all" ? false : filter[0].role });
            if (items?.error) {
                throw new Error(items.message)
            }
            if (items <= 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        getCount()
    }, [filter[0], refresh]);

    return (
        <>
            <TabsContent value="users" className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 md:flex-row items-start justify-between">
                            <CardTitle className={"font-semibold text-xl flex items-center gap-2"}>
                                <RefreshCw
                                    onClick={() => setRefresh(refresh + 1)}
                                    className="h-4 w-4 cursor-pointer"
                                />
                                Manage Users

                            </CardTitle>
                            <div className="flex items-center flex-wrap gap-4">
                                <div className="relative">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        setFilter([{ role: filter[0].role, search: e.target.search.value }, 1])
                                    }}>
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            spellCheck={false}
                                            placeholder="Search users..."
                                            name="search"
                                            className="pl-10  max-w-full"
                                        />
                                    </form>
                                </div>
                                <Select value={filter[0].role} onValueChange={(e) => { setFilter([{ search: filter[0].search, role: e }, 1]) }}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="guide">Guide</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ?
                                <Loading />
                                :
                                users?.map((user) => (
                                    <UserItem key={user.id} user={user} setUsers={setUsers} users={users} setRemove={setRemove}/>)
                                )
                            }
                        </div>
                    </CardContent>

                    <DashboardPagination page={filter[1]} type={filter[0]} setPageAndType={setFilter} pages={pages} />
                </Card>
            </TabsContent>
            {remove[0] && 
            <AlertDelete remove={remove} setRemove={setRemove} HandleDelete={HandleDeleteUser} object="user" 
            loadingRemove={loadingRemove}/>}
        </>
    )
}

function UserItem({ user, setUsers, users, setRemove }) {

    async function HandleBan() {
        const response = await BanUserAction(user?.id);
        if (response?.error) {
            return toast.error(response.message)
        }
        setUsers(users.map(u=>{
            if(u.id === user.id){
                u.banned = !u.banned
            };
            return u
        }));
    }
    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>

                <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <Badge className={getRoleColor(user.role)}>
                        {user.role}
                    </Badge>
                </div>
            </div>

            <div className="flex pl-1 mt-2 flex-col gap-1">
                {user?.deletedUser && <p className="text-ellipsis overflow-hidden max-w-full text-sm text-gray-600">
                    <span className='font-semibold '>details: </span>{user.deletedUser}
                </p>}
                <p className="text-ellipsis overflow-hidden max-w-full text-sm text-gray-600">
                    <span className='font-semibold '>Email: </span>{user.email}
                </p>
                <p className="text-sm text-gray-600">
                    <span className='font-semibold'>Phone: </span>{user.phone || "not provided"}
                </p>

                {(user?.role === "guide" || user?.languages?.length > 0) &&

                    <p className="text-sm text-gray-600">
                        <span className='font-semibold'>Language: </span>
                        {user?.languages?.length <= 0 ? "no languages add" :
                            "[ " + user?.languages.map(l => l.language.name).join(", ") + " ]"

                        }
                    </p>

                }

                <p className="text-sm text-gray-600">
                    <span className='font-semibold '>Location: </span>{user.location || "not provided"}
                </p>
                <p className="text-sm text-gray-600">
                    <span className='font-semibold '>Ban: </span>{user.banned ? "True" : "False"}
                </p>
                <p className="text-sm text-gray-600">
                    <span className='font-semibold '>JoinedAt: </span>{new Date(user.createdAt).toLocaleDateString()}
                </p>


            </div>
            <div className='mt-2 flex flex-col sm:flex-row gap-2'>
                <Button size="sm" asChild variant="outline">
                    <Link href={`/profile/${user.id}`}><Eye className="h-4 w-4 mr-1" />View</Link>
                </Button>

                <Button
                    onClick={() => { HandleBan(user) }}
                    className={"bg-emerald-500 hover:bg-emerald-400 text-white hover:text-white"}
                    size="sm" variant="outline">
                    <Ban className="h-4 w-4 mr-1" /> {user?.banned ? "Active" : "Ban"}
                </Button>

                <Button size="sm"
                    onClick={() => { setRemove([true, user]) }}
                    className={"bg-red-500 hover:bg-red-400 text-white hover:text-white"}
                    variant="outline">
                    <XCircle className="h-4 w-4 mr-1" />Delete
                </Button>
            </div>
        </div>
    )
}
