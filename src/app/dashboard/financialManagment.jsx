"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Filter, Search, RefreshCw } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { getTransactionsAction, transactionInfoAction, getTransactionCount, getPaymentMethods } from './dashboardActions';
import { FinancialCards, TransactionItem, OpenedTransaction } from './FinancialComponents';
import { DashboardPagination, Empty } from "./dashboardComponents";
import { Loading } from '@/shared/loading';

export function FinancialTab() {
    const [data, setData] = useState({ all: "", pending: "", approved: "", rejected: "", netFlow: "" })
    const [transactions, setTransactions] = useState([]);
    const [pages, setPages] = useState(0);
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(0);
    const [statusAndPage, setStatusAndPage] =
        useState([{ search: "", type: "deposit", status: "pending" }, 1]);

    const [openTransaction, setOpenTransaction] = useState({
        open: false, id: "", bank: [], vcash: [], paymentAccountId: "", transactionId: "",
        newImage: null
    });
    //methods
    useEffect(() => {
        async function getPayments() {
            const payments = await getPaymentMethods();
            if (payments?.error) {
                throw new Error(payments.message)
            }
            const vcash = payments.filter(p => p.method === "vodafone");
            const bank = payments.filter(p => p.method === "bank");
            setOpenTransaction({
                vcash, bank, paymentAccountId: "", method: "", transactionId: "", open: false, id: "",
                newImage: null
            })
        }
        // 
        async function getInfo() {
            const data = await transactionInfoAction();
            if (data.error) {
                throw new Error(data.message)
            }
            const { all, pending, approved, rejected, netFlow } = data
            setData({ all, rejected, approved, pending, netFlow })
        }
        getInfo()
        getPayments()
    }, [refresh])

    //transactions
    useEffect(() => {
        async function getTrans() {
            let obj = { page: statusAndPage[1],type:statusAndPage[0]?.type, status :statusAndPage[0].status};

            if (statusAndPage[0]?.search.trim() !== "") { obj.search = statusAndPage[0].search };

            const data = await getTransactionsAction(obj);
            
            if (data?.error) {
                throw new Error(data.message)
            }

            setTransactions(data);
            setLoading(false)
        }
        getTrans()
    }, [statusAndPage, refresh]);

    useEffect(() => {
        async function getPages() {
            let obj = {status:statusAndPage[0].status,type:statusAndPage[0].type};
            
            if (statusAndPage[0]?.search.trim() !== "") { obj.search = statusAndPage[0].search }
            const items = await getTransactionCount(obj);
            if (items?.error) {
                throw new Error(items.message)

            } else if (items === 0) {
                setPages(0)
            } else {
                setPages(Math.ceil(items / 6))
            }
        }
        getPages()

    }, [statusAndPage[0], refresh]);

    return (
        <TabsContent value="financial" className="space-y-6">
            <FinancialCards data={data} />
            <Card>
                <CardHeader >
                    <CardTitle>
                        <span className="flex items-center gap-2 font-semibold text-xl">
                            <RefreshCw
                                onClick={() => [setRefresh(refresh + 1)]}
                                className="h-4 w-4 cursor-pointer" />
                            Financial Transactions
                        </span>
                    </CardTitle>
                    <div className="flex flex-col md:flex-row gap-4 mt-2">

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setStatusAndPage([{
                                    ...statusAndPage[0], search: e.currentTarget.elements.search.value
                                }, 1])
                            }}>
                                <Input
                                    spellCheck={false}
                                    placeholder="Search by user email"
                                    name="search"
                                    className="pl-10"
                                />
                            </form>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Select value={statusAndPage[0].type} onValueChange={(e) => setStatusAndPage([{
                                ...statusAndPage[0], type: e,
                            }, 1])}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deposit">Deposit</SelectItem>
                                    <SelectItem value="withdrawal">Withdraw</SelectItem>
                                    <SelectItem value="booking_deduct">Booking Deduct</SelectItem>
                                    <SelectItem value="booking_refund">Booking Refund</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusAndPage[0].status} onValueChange={(e) => {
                                setStatusAndPage([{
                                    ...statusAndPage[0], status: e
                                }, 1])
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">


                    {/* Transactions Table */}
                    <div className="space-y-3">
                        {loading ?
                            (<Loading />)
                            :
                            (
                                transactions.length <= 0 ? (
                                    <Empty text={"No Transaction Found"} Icon={DollarSign} />
                                ) : (
                                    transactions.map((transaction) => {
                                        return (
                                            <TransactionItem
                                                key={transaction.id}
                                                transaction={transaction} setOpenTransaction={setOpenTransaction} openTransaction={openTransaction}
                                            />
                                        );
                                    })
                                )
                            )
                        }
                    </div>
                </CardContent>
            </Card>

            {openTransaction.open && (
                <OpenedTransaction status={statusAndPage[0].status} setOpenTransaction={setOpenTransaction} openTransaction={openTransaction} setTransactions={setTransactions} transactions={transactions} />

            )}
            {pages > 0 &&
                <DashboardPagination page={statusAndPage[1]} type={statusAndPage[0]} setPageAndType={setStatusAndPage} pages={pages} />
            }
        </TabsContent>
    );
}