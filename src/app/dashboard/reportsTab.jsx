"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getReportsAction, resolveReportAction, banReviewAction, deleteReviewAction, countReportsAction } from "./dashboardActions"
import { Star, ExternalLink, AlertTriangle, CheckCircle, XCircle, Ban, Flag, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';
import { DashboardPagination, Empty, AlertDelete } from './dashboardComponents';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/shared/loading';
import { DisplayImages } from '@/shared/displayImages';

export default function ReportsTab() {

    const [reports, setReports] = useState([]);
    const [statusAndPage, setStatusAndPage] = useState(["Pending", 1]);
    const [remove, setRemove] = useState([false, ""]);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState(0);
    const [refresh, setRefresh] = useState(0);
    const [loadingRemove, setLoadingRemove] = useState(false);
    const [openImages, setOpenImages] = useState([false, [], 0]);

    useEffect(() => {
        async function GetReports() {
            const data = await getReportsAction({ status: statusAndPage[0], page: statusAndPage[1] });
            if (data?.error) {
                throw new Error(data?.message)
            }
            setReports(data);
            setLoading(false)
        }
        GetReports()
    }, [statusAndPage, refresh]);

    useEffect(() => {
        async function getCount() {
            const items = await countReportsAction({ status: statusAndPage[0] });
            if (items?.error) {
                throw new Error(items.message)
            }
            if (items.length <= 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        getCount()
    }, [statusAndPage[0], refresh])

    async function HandleDelete(report) {

        setLoadingRemove(true);
        const response = await deleteReviewAction({ id: report.review.id });
        setLoadingRemove(false);

        if (response?.error) {
            return toast.error(response.message)
        }
        const newReports = reports.filter(r => r.id !== report.id);
        setReports(newReports);
        setRemove([false, ""]);
        return toast.success(response.message)
    }
    return (
        <>
            <TabsContent value="reports" className="space-y-6">
                <Card>
                    <CardHeader className={"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"}>
                        <CardTitle className={"font-semibold text-xl flex items-center gap-2"}>
                            <RefreshCw
                                onClick={() => setRefresh(refresh + 1)}
                                className="h-4 w-4 cursor-pointer"
                            />
                            Manage Reports

                        </CardTitle>
                        <Select value={statusAndPage[0]} onValueChange={(e) => setStatusAndPage([e, 1])}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value={"Resolved"}>Resolved</SelectItem>
                            </SelectContent>
                        </Select>

                    </CardHeader>
                    <CardContent>
                        {loading ?
                            (<Loading />)
                            :
                            (
                                reports?.length <= 0 ?
                                    (
                                        <Empty text={"No reports found"} Icon={Flag} />
                                    )
                                    :
                                    (
                                        <div className="space-y-6">
                                            {reports?.map((report) => (
                                                <ReportItem
                                                    key={report.id}
                                                    report={report} setRemove={setRemove} reports={reports} setReports={setReports}
                                                    setOpenImages={setOpenImages}
                                                />
                                            ))}
                                        </div>)
                            )
                        }
                    </CardContent>
                </Card>
                {reports.length > 0 && <DashboardPagination page={statusAndPage[1]} type={statusAndPage[0]} setPageAndType={setStatusAndPage} pages={pages} />}
            </TabsContent>

            {remove[0] &&
                <AlertDelete loadingRemove={loadingRemove} remove={remove} setRemove={setRemove} HandleDelete={HandleDelete} object="review" />
            }

            {openImages[0] &&
                <DisplayImages images={openImages[1]} setOpenImages={setOpenImages} index={openImages[2]} />
            }
        </>
    )
}

function ReportItem({ report, setRemove, reports, setReports, setOpenImages }) {

    async function HandleResolve() {
        if (report.resolve) {
            return toast.success("resolved")
        }
        const response = await resolveReportAction(report.id);
        if (response?.error) {
            return toast.error(response.message)
        }
        const newReports = reports.filter(r => r.id !== report?.id);
        setReports([...newReports]);
        return toast.success(response.message)
    }

    async function HandleBan() {
        const response = await banReviewAction({ id: report?.review.id });
        if (response?.error) {
            return toast.error(response.message)
        }
        setReports(reports.map(report => {
            if (report.id === report.id) {
                report.review.banned = !report.review.banned
            }
            return report
        }));
        return toast.success(response.message)
    }

    return (
        <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-6 w-6 ${report.isResolved ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                        <h4 className="font-semibold">Report on {report?.trip?.title}</h4>
                        <p className="text-sm text-gray-600">
                            Reported by {report?.user?.name} on {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <Badge className={report?.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {report.resolved ? 'Resolved' : 'Pending'}
                </Badge>
            </div>
            <Alert className="mb-4">
                <AlertDescription>
                    <strong>Report Reason:</strong> {report?.text}
                </AlertDescription>
            </Alert>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 ${i < report.review?.rate ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">{new Date(report?.review?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={report?.review?.user?.image} alt={report?.review?.user?.name} />
                        <AvatarFallback>{report?.review?.user?.name[0]}</AvatarFallback>
                    </Avatar>
                    <Link href={`/profile/${report?.review?.user?.id}`}>
                        <span className="font-semibold text-blue-800">{report?.review?.user?.name}</span>
                    </Link>

                </div>
                <p className="text-gray-700">{report?.review?.comment}</p>
                {report?.review?.images?.length > 0 &&
                    <div className='flex flex-wrap w-full gap-1 mt-2'>
                        {
                            report?.review?.images?.map((img,i) => {
                                return (
                                    <Image
                                    onClick={()=>setOpenImages([true, report.review.images.map(i=>i.url),i])}
                                        key={img.id}
                                        src={img.url}
                                        width={100}
                                        height={100}
                                        alt="photo"
                                        className='rounded-sm'
                                    />
                                )
                            })
                        }
                    </div>
                }

            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full">
                <Button
                    size="sm"
                    className={"max-w-full"}
                    variant="outline" asChild>
                    <Link href={`/trip/${report?.review.trip?.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Trip
                    </Link>
                </Button>
                {!report.resolved &&
                    <Button
                        className={"max-w-full"}
                        onClick={() => { HandleResolve(report) }}
                        size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Resolved
                    </Button>}

                <Button
                    className={"max-w-full"}
                    onClick={() => { HandleBan(report) }}
                    size="sm" variant="outline">
                    <Ban className="h-4 w-4 mr-1" />
                    {report?.review?.banned ? "Un-ban Thhis Review" : "Ban This Review"}
                </Button>

                <Button size="sm"
                    onClick={() => { setRemove([true, report]) }}
                    className={"max-w-full"} variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Remove This Review
                </Button>
            </div>
        </div>
    )
}

