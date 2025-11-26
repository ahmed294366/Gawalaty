"use client"
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, User, Calendar, Eye, ArrowUpCircle, ArrowDownCircle, DollarSign, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { rejectTransactionAction, approveTransactionAction, getTransactionInfoAction } from "./dashboardActions";
import { UploadImage } from "@/utils/cloudinary";
import { withdrawalApproveBankSchema, withdrawalApproveVodafoneSchema } from "./dashboardSchema";
import { useState, useEffect } from "react";
import { LoadingDots } from "@/app/(user)/profile/walletComponents"

const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const getTransactionColor = (type) => {
    if (type === 'deposit' || type === 'booking_refund') return 'text-green-600';
    return 'text-red-600';
};

const getStatusIcon = (status) => {
    const icons = {
        pending: Clock,
        approved: CheckCircle,
        rejected: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
};

export function FinancialCards({ data }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Transactions</p>
                            <h3 className="text-2xl font-bold mt-1">{data.all}</h3>
                        </div>
                        <Banknote className="h-8 w-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <h3 className="text-2xl font-bold mt-1">{data?.pending}</h3>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <h3 className="text-2xl font-bold mt-1">{data.approved}</h3>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rejected</p>
                            <h3 className="text-2xl font-bold mt-1">{data?.rejected}</h3>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Net Flow</p>
                            <h3 className={`text-2xl font-bold mt-1 ${data?.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data?.netFlow} LE
                            </h3>
                        </div>
                        {data.netFlow >= 0 ? (
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        ) : (
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function TransactionItem({ transaction, setOpenTransaction, openTransaction }) {
    
    const getTransactionLabel = (type) => {
        const labels = {
            withdraw: 'Withdraw',
            deposit: 'Deposit',
            booking_deduct: 'Booking Deduction',
            booking_refund: 'Booking Refund'
        };
        return labels[type] || type;
    };

    const getTransactionIcon = (type) => {
        const icons = {
            withdraw: ArrowUpCircle,
            deposit: ArrowDownCircle,
            booking_deduct: TrendingDown,
            booking_refund: TrendingUp
        };
        const Icon = icons[type] || DollarSign;
        return Icon;
    };

    const TransactionIcon = getTransactionIcon(transaction.type);
    return (
        <div
            className="flex items-start sm:items-center gap-3 justify-between flex-col sm:flex-row p-4 border rounded-lg hover:bg-gray-50"
        >
            <div className="flex flex-wrap items-start gap-4 flex-1">
                <div className={`p-2 rounded-lg bg-gray-100 ${getTransactionColor(transaction.type)}`}>
                    <TransactionIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                        <p className="font-medium">{getTransactionLabel(transaction.type)}</p>
                        <Badge className={getStatusColor(transaction.status)}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {transaction.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                        {transaction.userPhoneNumber && (
                            <span className="text-xs">To: {transaction.userPhoneNumber}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' || transaction.type === 'booking_refund' ? '+' : '-'}
                        {transaction.amount.toFixed(2)} LE
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setOpenTransaction({
                            ...openTransaction, paymentAccountId: "", transactionId: "", open: true, id: transaction.id,
                            newImage: null
                        })
                    }}
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                </Button>
            </div>
        </div>
    )
}

export function OpenedTransaction({ setOpenTransaction, openTransaction, setTransactions, transactions, status }) {
    const [children, setChildren] = useState([]);
    const [adminNotes, setAdminNotes] = useState("");
    const [loading, setLoading] = useState(true)
    const [transaction, setTransaction] = useState(null);
    const [submit, setSubmit] = useState(false);

    useEffect(() => {
        async function getTransaction() {
            const trans = await getTransactionInfoAction(openTransaction.id);
            setLoading(false);
            if (trans?.error) {
                throw new Error(trans.message)
            }
            setTransaction(trans)
        }
        getTransaction()
    }, [openTransaction.id]);

    async function handleReject() {
        setSubmit(true);
        if (adminNotes.trim() === "") {
            setSubmit(false);
            return toast.error("your reason is required..")
        }
        const response = await rejectTransactionAction({ id: transaction.id, adminNotes });
        if (response?.error) {
            toast.error(response.message)
        } else if (response?.success) {
            if (status === "all") {
                setTransactions(transactions.map((t) => {
                    if (t.id === transaction.id) {
                        t.status = "rejected"
                    }
                    return t
                }));
            } else {
                setTransactions(transactions.filter(t => t.id !== transaction.id))
            }

            toast.success("rejected")
        }
        setSubmit(false);
        setAdminNotes("")
        setOpenTransaction({
            ...openTransaction, paymentAccountId: "", transactionId: "", open: false, id: "", vcash: openTransaction.vcash, bank: openTransaction.bank,
            newImage: null
        })
    }

    async function handleApprove() {
        setSubmit(true);
        let response;
        if (transaction.type === "deposit") {
            response = await approveTransactionAction({ id: transaction.id, adminNotes: adminNotes?.trim() !== "" ? adminNotes : null });
        } else if (transaction.type === "withdrawal") {

            if (openTransaction.newImage === null) {
                setSubmit(false);
                return toast.error("transaction image is required")
            }

            const images = await UploadImage(openTransaction.newImage);
            if (!images.url || !images.publicid) {
                setSubmit(false);
                return toast.error("failed to upload this image, try again")
            }


            let obj = { paymentAccountId: openTransaction.paymentAccountId, proofId: images.url, proofUrl: images.publicid };
            if (adminNotes?.trim() !== "") { obj.adminNotes = adminNotes };

            if (isNaN(+openTransaction.paymentAccountId)) {
                setSubmit(false);
                return toast.error("select one of available bank accounts");
            }
            if (transaction.userAccountNumber) {
                obj.transactionId = openTransaction.transactionId
                const { error } = withdrawalApproveBankSchema(obj);
                if (error) {
                    setSubmit(false);
                    return toast.error(error.details[0].message)
                }
            } else {
                const { error } = withdrawalApproveVodafoneSchema(obj);
                if (error) {
                    setSubmit(false);
                    return toast.error(error.details[0].message)
                }
            }
            obj.id = transaction.id
            response = await approveTransactionAction(obj)
        }
        if (response?.error) {
            setSubmit(false);
            return toast.error(response.message)
        }
        if (response?.success) {
            toast.success("Approved");
            if (status === "all") {
                setTransactions(transactions.map((t) => {
                    if (t.id === transaction.id) {
                        t.status = "approved"
                    }
                    return t
                }));
            } else {
                setTransactions(transactions.filter(t => t.id !== transaction.id))
            }
            if (adminNotes) { setAdminNotes("") }
            setSubmit(false);
            setOpenTransaction({
                ...openTransaction, paymentAccountId: "", transactionId: "", open: false, id: "",
                newImage: null
            });
        }
    }

    return (
        <div
            onClick={() => {
                if(!submit) setOpenTransaction({
                    ...openTransaction, paymentAccountId: "", transactionId: "", open: false, id: "",
                    newImage: null
                })
            }}
            className='w-full h-screen bg-black/40 fixed flex items-center justify-center top-0 left-0 z-50'>

            <div
                onClick={(e) => e.stopPropagation()}
                className="space-y-4 max-w-2xl w-full max-h-[calc(100vh-5%)] overflow-y-auto bg-white p-4 relative rounded-md">
                <div
                    onClick={() => {
                        if(!submit) setOpenTransaction({
                            ...openTransaction, paymentAccountId: "", transactionId: "", open: false, id: "",
                            newImage: null
                        })
                    }}
                    className={`absolute top-3 right-3 rounded-full w-7 h-7 bg-zinc-100 flex items-center justify-center cursor-pointer`}>
                    <X className="text-red-600 hover:text-red-500" />
                </div>
                {loading ?
                    (
                        <div className="text-center flex items-center gap-2 flex-col py-10 text-gray-600 ">
                            <span className="font-semibold text-xl">Loading transaction details </span><LoadingDots />
                        </div>
                    ) :
                    transaction ?
                        (<>
                            <div className="flex justify-between flex-col-reverse gap-2 sm:flex-row">
                                <div>
                                    <h2 className='capitalize font-semibold'>{transaction.type} Details</h2>
                                    <span className='text-gray-500'>Review and manage this transaction</span>
                                </div>
                                {(transaction?.parentTransactionId || children.length > 0) &&
                                    <div className="flex gap-1 flex-wrap">
                                        <Button
                                            disabled={!transaction.parentTransactionId}
                                            onClick={
                                                () => {
                                                    setChildren([transaction.id, ...children])
                                                    setOpenTransaction({ id: transaction.parentTransactionId, newImage: null, paymentAccountId: "", open: true, transactionId: "", vcash: openTransaction.vcash, bank: openTransaction.bank })
                                                }
                                            }>
                                            show parent
                                        </Button>

                                        <Button
                                            className={"ml-1"}
                                            disabled={children.length <= 0}
                                            onClick={

                                                () => {

                                                    setOpenTransaction({ id: children[0], newImage: null, paymentAccountId: "", open: true, transactionId: "", vcash: openTransaction.vcash, bank: openTransaction.bank });

                                                    setChildren(children.slice(1))
                                                }

                                            }>
                                            children
                                        </Button>
                                    </div>
                                }
                            </div>
                            <div >
                                {/* user informations */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-600">User Name</Label>
                                        <Link
                                            className={"text-blue-800 font-bold"}
                                            href={`/profile/${transaction.user.id}`}>{transaction.user.name}</Link>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-600">Email</Label>
                                        <p className="text-sm">{transaction.user.email}</p>
                                    </div>

                                </div>
                            </div>

                            {/* Transaction Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <Label className="text-xs text-gray-600">Amount</Label>
                                    <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                                        {transaction.type === 'deposit' || transaction.type === 'booking_refund' ? '+' : '-'}
                                        ${transaction.amount.toFixed(2)}
                                    </p>
                                </div>


                                {transaction.transactionId &&
                                    <div>
                                        <Label className="text-xs text-gray-600">Transaction ID</Label>
                                        <p className="font-mono text-sm">{transaction.transactionId}</p>
                                    </div>
                                }

                                <div>
                                    <Label className="text-xs text-gray-600">Status</Label>
                                    <Badge className={getStatusColor(transaction.status)}>
                                        {getStatusIcon(transaction.status)}
                                        <span className="ml-1">{transaction.status}</span>
                                    </Badge>
                                </div>
                                {transaction?.userBankName && (
                                    <div>
                                        <Label className="text-xs text-gray-600">User Bank Name</Label>
                                        <p className="font-medium">{transaction.userBankName}</p>
                                    </div>
                                )}

                                {transaction?.userAccountName && (
                                    <div>
                                        <Label className="text-xs text-gray-600">User Account Name</Label>
                                        <p className="font-medium">{transaction.userAccountName}</p>
                                    </div>
                                )}
                                {transaction?.userAccountNumber && (
                                    <div>
                                        <Label className="text-xs text-gray-600">User Account Number</Label>
                                        <p className="font-medium">{transaction.userAccountNumber}</p>
                                    </div>
                                )}

                                {transaction?.userPhoneNumber && (
                                    <div>
                                        <Label className="text-xs text-gray-600">User Phone Number</Label>
                                        <p className="font-medium">{transaction.userPhoneNumber}</p>
                                    </div>
                                )}


                                {transaction?.paymentAccount?.phoneNumber && (
                                    <div className="">
                                        <Label className="text-xs text-gray-600">Gawalaty Phone Number</Label>
                                        <p className="font-medium">{transaction.paymentAccount.phoneNumber}</p>
                                    </div>
                                )}

                                {transaction?.paymentAccount?.bankName && (
                                    <div className="">
                                        <Label className="text-xs text-gray-600">Gawalaty Bank Name</Label>
                                        <p className="font-medium">{transaction.paymentAccount.bankName}</p>
                                    </div>
                                )}
                                {transaction?.paymentAccount?.accountName && (
                                    <div className="">
                                        <Label className="text-xs text-gray-600">Gawalaty Account Name</Label>
                                        <p className="font-medium">{transaction.paymentAccount.accountName}</p>
                                    </div>
                                )}
                                {transaction?.paymentAccount?.accountNumber && (
                                    <div className="">
                                        <Label className="text-xs text-gray-600">Gawalaty Account Number</Label>
                                        <p className="font-medium">{transaction.paymentAccount.accountNumber}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-xs text-gray-600">Created Date</Label>
                                    <p className="font-medium">
                                        {new Date(transaction.createdAt).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {transaction.userNotes && (
                                    <div>
                                        <Label className="text-xs text-gray-600">User Notes</Label>
                                        <p className="font-medium">{transaction.userNotes}</p>
                                    </div>
                                )}

                            </div>
                            {(transaction.admin || transaction.adminNotes) && (
                                <div className="border-t pt-4">
                                    {transaction.adminNotes && (
                                        <div>
                                            <Label className="text-xs text-gray-600">Admin Notes</Label>
                                            <p className="text-sm bg-gray-50 p-3 rounded">{transaction.adminNotes}</p>
                                        </div>)}
                                    {transaction?.admin &&
                                        <div>
                                            <Label className="text-xs text-gray-600">admin</Label>
                                            <div className="">
                                                <p className="font-medium">
                                                    {transaction?.admin?.name}
                                                </p>
                                                <p className="font-medium overflow-x-hidden text-ellipsis">
                                                    {transaction?.admin?.email}
                                                </p>
                                            </div>
                                        </div>
                                    }
                                </div>
                            )}

                            {/*  */}
                            {transaction.status === "pending" && transaction.type === "withdrawal" &&
                                <div className='flex gap-2 items-center w-full border-t pt-4'>
                                    {transaction.userAccountNumber && transaction.type === "withdrawal" && transaction.status === "pending" &&
                                        <Select value={openTransaction.paymentAccountId} onValueChange={(e) => { setOpenTransaction({ ...openTransaction, paymentAccountId: e }) }}>
                                            <SelectTrigger className="w-full font-semibold">
                                                <SelectValue placeholder="Choose Account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {openTransaction?.bank.map(b => (
                                                    <SelectItem value={b.id} key={b.id}>{b.accountName}{` (${b.isActive ? "active" : "Inactive"})`}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    }

                                    {transaction.userPhoneNumber && transaction.type === "withdrawal" && transaction.status === "pending" &&
                                        <Select value={openTransaction.paymentAccountId} onValueChange={(e) => { setOpenTransaction({ ...openTransaction, paymentAccountId: e }) }}>
                                            <SelectTrigger className="w-full font-semibold">
                                                <SelectValue placeholder="Choose Number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {openTransaction?.vcash.map(v => <SelectItem value={v.id} key={v.id}>{v.phoneNumber}{` (${v.isActive ? "active" : "Inactive"})`}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    }
                                </div>
                            }

                            {transaction?.status === 'pending' && transaction?.type === 'withdrawal' && transaction.userAccountNumber && (
                                <div className="border-t pt-4">
                                    <Label htmlFor="action-note">Transaction Id</Label>
                                    <Input
                                        id="action-note"
                                        placeholder="Add a note about this transaction..."
                                        type={"text"}
                                        spellCheck={false}
                                        value={openTransaction.transactionId}
                                        onChange={(e) => setOpenTransaction({ ...openTransaction, transactionId: e.target.value })}
                                        className="mt-2"
                                    />
                                </div>
                            )}

                            {transaction.status === 'pending' && (
                                <div className="border-t pt-4">
                                    <Label htmlFor="action-note">Admin Note (Optional for approval, Required for rejection)</Label>
                                    <Textarea
                                        spellCheck={false}
                                        id="action-note"
                                        placeholder="Add a note about this transaction..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                            )}


                            {transaction.proofUrl && (
                                <div className="border-t pt-4">
                                    <Label className="text-xs text-gray-600 mb-2 block">Transaction Receipt</Label>
                                    <div className="border rounded-lg p-2 bg-gray-50">
                                        <Image
                                            width={800}
                                            height={800}
                                            src={transaction.proofUrl}
                                            alt="Transaction receipt"
                                            className="w-full h-auto max-h-96 object-contain rounded"
                                        />
                                    </div>
                                </div>
                            )}

                            {transaction.type === "withdrawal" && transaction.status === "pending" && openTransaction.paymentAccountId && <TransactionProof openTransaction={openTransaction} setOpenTransaction={setOpenTransaction} />}

                            <div className="flex w-full justify-end gap-1 flex-col sm:flex-row sm:gap-2 mt-4">
                                {transaction.status === 'pending' && (transaction.type === "deposit" || transaction.type === "withdrawal") ? (
                                    <>
                                        <Button 
                                        disabled={submit}
                                        variant="outline" 
                                        onClick={() => {
                                            setOpenTransaction({
                                                ...openTransaction, paymentAccountId: "", transactionId: "", open: false, id: "",
                                                newImage: null
                                            })
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={submit}
                                            className={"sm:w-27"}
                                            onClick={handleReject}
                                            variant="destructive">
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                        <Button
                                            disabled={submit}
                                            onClick={handleApprove}
                                            className={"bg-emerald-600 hover:bg-emerald-500 sm:w-27"}>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => {
                                        setOpenTransaction({
                                            ...openTransaction, paymentAccountId: "", transactionId: "", open: false, id: "",
                                            newImage: null
                                        })
                                    }}>
                                        Close
                                    </Button>
                                )}
                            </div>
                        </>)
                        :
                        (
                            <div className="text-center py-10 text-gray-600">
                                No transaction found
                            </div>
                        )
                }
            </div>
        </div>
    )
}

function TransactionProof({ setOpenTransaction, openTransaction }) {
    return (
        <div className="w-full max-w-md mx-auto mt-6">
            {openTransaction.newImage ? (
                <div className="relative">
                    <Image
                        width={800}
                        height={800}
                        src={URL.createObjectURL(openTransaction.newImage)}
                        alt="Deposit receipt"
                        className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setOpenTransaction({ ...openTransaction, newImage: null })}
                    >
                        Remove
                    </Button>
                </div>
            ) : (
                <div
                    className={`bg-gray-50 border border-gray-200 rounded-xl p-6 text-center shadow-sm transition-all duration-500"
                    }`}
                >
                    <Upload className="mx-auto h-10 w-10 text-gray-500 mb-3" />
                    <p className="text-gray-700 mb-3 font-medium">
                        Upload your receipt
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setOpenTransaction({ ...openTransaction, newImage: e.target.files[0] })}
                        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer 
                       focus:outline-none file:bg-blue-600 file:text-white file:border-0 
                       file:px-3 file:py-1.5 hover:file:bg-blue-700"
                    />
                </div>)
            }
        </div>
    );
}