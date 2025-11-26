"use client"
import { Loading } from '@/shared/loading';
import { getTransferDetails, updateDepositAction, updateWithdrawalAction } from '../userActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import styles from "./profile.module.css"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadImage } from '@/utils/cloudinary';
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Upload,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Phone,
    Pen,
    Eye,
    CircleX,
    CreditCard,
    SquarePen
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { Textarea } from '@/components/ui/textarea';
import { bankDepositSchema, uploadedImageSchema, vodaphoneDepositSchema, withdrawUpdateSchema } from '../userSchema';
import { Separator } from '@/components/ui/separator';

const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
    const icons = {
        pending: Clock,
        approved: CheckCircle,
        rejected: XCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
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

const getTransactionColor = (type) => {
    if (type === 'deposit' || type === 'booking_refund') return 'text-green-600';
    return 'text-red-600';
};

const getTransactionLabel = (type) => {
    const labels = {
        withdraw: 'Withdraw',
        deposit: 'Deposit',
        booking_deduct: 'Booking Deduction',
        booking_refund: 'Booking Refund'
    };
    return labels[type] || type;
};

export function DepositInstructions({ setMainState, mainState }) {
    return (
        <div className="w-full max-w-md mx-auto mt-6">
            {!mainState.showUpload ? (
                <div
                    className={`bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm transition-all duration-500 ${mainState?.showUpload ? "opacity-0 scale-95" : "opacity-100 scale-100"}`
                    }>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                        <div className="text-sm text-gray-700 leading-relaxed">
                            <p className="font-semibold text-blue-700 mb-2">
                                Before uploading your deposit receipt:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 marker:text-blue-600">
                                <li>
                                    Ensure the image is{" "}
                                    <span className="font-medium">clear and readable</span>.
                                </li>
                                <li>
                                    The <span className="font-medium">amount</span> must match the
                                    deposit form.
                                </li>
                                <li>
                                    Show the{" "}
                                    <span className="font-medium">
                                        sender account or wallet number
                                    </span>{" "}
                                    clearly.
                                </li>
                                <li>
                                    Include{" "}
                                    <span className="font-medium">
                                        Transaction ID / Reference number
                                    </span>{" "}
                                    if available.
                                </li>
                                <li>
                                    Avoid{" "}
                                    <span className="font-medium text-red-600">edited</span>{" "}
                                    images — they’ll be rejected.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={() => setMainState({ ...mainState, showUpload: true })}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow-md 
                       hover:bg-blue-700 transition 
                       animate-pulse hover:animate-none"
                    >
                        Got it, Continue
                    </button>
                </div>



            ) : (
                mainState.depositImage ? (

                    <div className="relative">
                        <Image
                            width={800}
                            height={800}
                            src={URL.createObjectURL(mainState.depositImage)}
                            alt="Deposit receipt"
                            className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setMainState({ ...mainState, depositImage: null })}
                        >
                            Remove
                        </Button>
                    </div>
                ) : (<div
                    className={`bg-gray-50 border border-gray-200 rounded-xl p-6 text-center shadow-sm transition-all duration-500 ${mainState?.showUpload ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                >
                    <Upload className="mx-auto h-10 w-10 text-gray-500 mb-3" />
                    <p className="text-gray-700 mb-3 font-medium">
                        Upload your deposit receipt
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setMainState({ ...mainState, depositImage: e.target.files[0] })}
                        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer 
                       focus:outline-none file:bg-blue-600 file:text-white file:border-0 
                       file:px-3 file:py-1.5 hover:file:bg-blue-700"
                    />
                </div>)

            )}
        </div>
    );
}

export function ChooseMethod({ setMainState, vcash, bank, method, mainState }) {
    return (
        <>
            <span className='font-semibold text-zinc-600'>
                Choose {method} Method
            </span>
            <div
                className="bg-zinc-100 mt-2  rounded-xl  shadow-sm">
                <div
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-t-lg ${vcash ? "bg-red-50 hover:bg-red-100" : "bg-zinc-50 hover:bg-zinc-100"}  transition`}
                    onClick={() => {
                        if (vcash) {
                            setMainState({ ...mainState, method: "vodafone" })
                        } else { toast.error("this method not available now") }
                    }}
                >
                    <Phone className={vcash ? "text-red-600" : "text-zinc-600"} />
                    <span className={vcash ? "text-red-700 font-semibold text-lg" : "text-zinc-700 font-semibold text-lg"}>
                        Vodafone Cash
                    </span>
                </div>

                <Separator />

                <div
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-b-lg ${bank ? "bg-blue-50 hover:bg-blue-100" : "bg-zinc-50 hover:bg-zinc-100"}  transition`}
                    onClick={() => {
                        if (bank) {
                            setMainState({ ...mainState, method: "bank" })
                        } else { toast.error("this method not available now") }
                    }}
                >
                    <CreditCard
                        className={bank ? "text-blue-600" : "text-zinc-600"} />
                    <span className={bank ? "text-blue-700 font-semibold text-lg" : "text-zinc-700 font-semibold text-lg"}>
                        Bank Account
                    </span>
                </div>
            </div>
        </>
    )
}

export function BankMethod({ setMainState, mainState }) {
    return (
        <div className='space-y-4'>
            <div className="bg-white shadow-sm border border-zinc-200 rounded-xl w-full p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-y-2">
                    <div>
                        <Label className="text-xs text-zinc-500">Bank Name</Label>
                        <p className="font-semibold text-zinc-800">{mainState?.bank?.bankName}</p>
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-500">Account Name</Label>
                        <p className="font-semibold text-zinc-800">{mainState?.bank?.accountName}</p>
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-500">Account Number</Label>
                        <p className="font-semibold text-zinc-800 tracking-wide">{mainState?.bank?.accountNumber}</p>
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-500">Branch</Label>
                        <p className="font-semibold text-zinc-800">{mainState?.bank?.branch}
                        </p>
                    </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200 mt-3">
                    <AlertDescription className="text-amber-700 text-xs leading-relaxed">
                        ⚠️ Please make sure the
                        <span className="font-semibold">
                            account name
                        </span>
                        matches exactly before transferring.
                    </AlertDescription>
                </Alert>
            </div>
            <div>
                <Label
                    className={"mb-1"}
                    htmlFor="transaction-id">Transaction_Id</Label>
                <Input
                    id="transaction-id"
                    type="text"
                    spellCheck={false}
                    placeholder="Insert tansaction id"
                    value={mainState?.transactionId}
                    onChange={(e) => setMainState({ ...mainState, transactionId: e.target.value })}
                />
            </div>
            <div>
                <Label
                    className={"mb-1"}
                    htmlFor="transaction-id">Notes</Label>
                <Textarea
                    id="transaction-id"
                    type="text"
                    spellCheck={false}
                    placeholder="Insert tansaction id"
                    value={mainState?.userNotes}
                    onChange={(e) => setMainState({ ...mainState, userNotes: e.target.value })}
                />
            </div>
        </div>
    )
}

export function VodafoneMethod({ setMainState, mainState }) {

    return (
        <div className='space-y-4'>
            <div className="bg-white shadow-sm border border-zinc-200 rounded-xl w-full p-4 text-sm mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-zinc-500">Vodafone Cash Number</Label>
                    <button
                        onClick={() => navigator.clipboard.writeText(mainState?.vcash?.phoneNumber || '')}
                        className="text-xs text-blue-600 hover:text-blue-800 transition"
                    >
                        Copy
                    </button>
                </div>
                <p className="font-semibold text-zinc-800 tracking-wide">{mainState?.vcash?.phoneNumber}</p>

                <Alert
                    className="bg-amber-50 border-amber-200 mt-3">
                    <AlertDescription className="text-amber-700 text-xs leading-relaxed">
                        ⚠️ Please make sure the phone number is correct before transferring.
                    </AlertDescription>
                </Alert>
            </div>
            <div>
                <Label
                    className={"mb-1"}
                    htmlFor="user-phone">Phone Number</Label>
                <Input
                    id="user-phone"
                    type="text"
                    spellCheck={false}
                    placeholder="Insert your phone number"
                    value={mainState.userPhoneNumber}
                    onChange={(e) => setMainState({ ...mainState, userPhoneNumber: e.target.value })}
                />
            </div>
            <div>
                <Label
                    className={"mb-1"}
                    htmlFor="user-phone">Notes</Label>
                <Textarea
                    id="user-phone"
                    type="text"
                    spellCheck={false}
                    placeholder="Insert your phone number"
                    value={mainState.userNotes}
                    onChange={(e) => setMainState({ ...mainState, userNotes: e.target.value })}
                />
            </div>
        </div>
    )
}

export function TransactionHistory({ transactions, setTransactions, setFilter, filter, pages, setRefresh, refresh, loading }) {

    const [showDetails, setShowDetails] = useState([false, ""]);
    const [showEdit, setShowEdit] = useState([false, {}]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <CardTitle>Transaction History</CardTitle>
                        <div className='flex flex-col sm:flex-row justify-start items-start sm:items-center gap-1'>
                            <Button
                                onClick={() => { setRefresh(refresh + 1) }}
                                className={"bg-white text-black shadow-xs font-normal hover:bg-white"} >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Select
                                value={filter[0]}
                                onValueChange={(e) => { setFilter([e, 1]) }}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
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
                <CardContent>

                    <div className="space-y-3">
                        {loading ?
                            (<Loading />)
                            :
                            (
                                transactions.length === 0 ?
                                    (
                                        <div className="text-center py-12 text-zinc-500">
                                            <Wallet
                                                className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>
                                                No {filter[0]} transactions yet
                                            </p>
                                        </div>
                                    )
                                    :
                                    (
                                        transactions.map((transaction) => <TransactionItem
                                            setShowDetails={setShowDetails}
                                            setShowEdit={setShowEdit}
                                            key={transaction.id} transaction={transaction} />)
                                    )

                            )}
                        <div className='flex items-center gap-1'>
                            <ChevronLeft
                                onClick={() => {
                                    if (filter[1] > 1) {
                                        setFilter([filter[0], filter[1] - 1])
                                    }
                                }}
                                className='rounded-full p-2 bg-white hover:bg-gray-50 w-10 h-10' />
                            {filter[1]}
                            <p className='font-bold'>From</p>
                            {pages}
                            <ChevronRight
                                onClick={() => {
                                    if (filter[1] < pages) {
                                        setFilter([filter[0], filter[1] + 1])
                                    }
                                }}
                                className='rounded-full p-2 bg-white hover:bg-gray-50 w-10 h-10' />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showDetails[0] &&
                <TransactionDetails showDetails={showDetails} setShowDetails={setShowDetails} />
            }

            {showEdit[0] &&
                <EditTransaction setTransactions={setTransactions} transactions={transactions} showEdit={showEdit} setShowEdit={setShowEdit} filter={filter} setFilter={setFilter} />
            }
        </>
    )
}

function TransactionItem({ transaction, setShowDetails, setShowEdit }) {

    const TransactionIcon = getTransactionIcon(transaction.type);

    const diffInMinutes = (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60);

    return (
        <div
            key={transaction.id}
            className="flex flex-col items-center p-4 border rounded-lg gap-3 hover:bg-gray-50">

            <div className='flex w-full justify-between flex-col sm:flex-row'>
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-gray-100 ${getTransactionColor(transaction.type)}`}>
                        <TransactionIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-medium">{getTransactionLabel(transaction.type)}
                            {
                                transaction?.type === "deposit" &&
                                <span>
                                    ({transaction?.userPhoneNumber ? "VCASH" : "BANK"})
                                </span>
                            }
                        </span>
                        <p className="text-sm text-gray-500">
                            {
                                new Date(transaction.createdAt).toLocaleDateString()
                            }
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {transaction.amount} LE
                    </p>
                    <Badge className={`${getStatusColor(transaction.status)} mt-1`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                    </Badge>
                </div>
            </div>
            <div className='w-full flex flex-wrap  gap-1'>
                <Button
                    variant={"outline"}
                    onClick={() => { setShowDetails([true, transaction.id]) }}>
                    <Eye />
                    Show Details
                </Button>

                {transaction.status !== "approved" && !transaction.isEdited && !(transaction.type === "withdrawal" && diffInMinutes >= 15) &&
                    <Button
                        onClick={() => {
                            setShowEdit([true, transaction])
                        }}
                        className={" bg-emerald-500 hover:bg-emerald-600  "}
                    >
                        <Pen />
                        Edit
                    </Button>
                }
            </div>
        </div>
    )
}

export function TransactionDetails({ showDetails, setShowDetails }) {
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        async function getTransaction() {
            const data = await getTransferDetails(showDetails[1]);
            setLoading(false)
            if (data?.error) {
                throw new Error(data.message)
            }
            setTransaction(data);
        }
        getTransaction();
    }, []);

    let cairoTime;
    if (transaction) {
        cairoTime = new Date(
            new Date(transaction.createdAt).toLocaleString("en-US", { timeZone: "Africa/Cairo" })
        );
    }

    return (
        <div onClick={() => setShowDetails([false, ""])}
            className="fixed inset-0 h-screen bg-black/50 z-50 flex items-center justify-center">
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-2xl shadow-lg max-w-md w-full p-6 mx-4 relative transform transition-all duration-500 
                  max-h-[calc(100vh-5%)] overflow-y-auto  `}
            >
                {loading ? (
                    <div className="text-center py-10 text-gray-600 animate-pulse">
                        Loading transaction details <LoadingDots />
                    </div>
                ) : transaction ? (
                    <>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center capitalize">
                            {transaction?.type} Details
                        </h2>

                        <div className="space-y-3 text-sm">

                            {transaction.transactionId &&
                                <InfoRow label="Transaction ID" value={transaction.transactionId} />}

                            <InfoRow label="Amount" value={`${transaction.amount} EGP`} highlight />

                            {transaction.type == "deposit" &&
                                <InfoRow label="Method"
                                    value={
                                        transaction?.paymentAccount?.method === "bank" ? "Bank transaction" : "Vodafone Cash"
                                    }
                                />}

                            <InfoRow label="Status" value={transaction?.status}
                                color={
                                    transaction.status === "pending"
                                        ? "text-yellow-600"
                                        : transaction.status === "approved"
                                            ? "text-green-600"
                                            : "text-red-600"
                                }
                            />
                            <InfoRow label="Date"
                                value={cairoTime.toLocaleString("en-EG", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            />
                        </div>

                        <div className="mt-5 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Recipient Account
                            </h3>

                            {transaction?.type === "deposit" &&

                                <div className="space-y-1 text-sm">

                                    {transaction.paymentAccount.bankName &&
                                        <InfoRow label="Bank Name" value={transaction.paymentAccount.bankName} />
                                    }

                                    {transaction.paymentAccount.accountName &&
                                        <InfoRow label="Account Name" value={transaction.paymentAccount.accountName} />
                                    }

                                    {transaction.paymentAccount.accountNumber &&
                                        <InfoRow label="Account Number" value={transaction.paymentAccount.accountNumber} />
                                    }

                                    {transaction.paymentAccount.branch &&
                                        <InfoRow label="Branch" value={transaction.paymentAccount.branch} />
                                    }

                                    {transaction?.paymentAccount.phoneNumber &&
                                        <InfoRow label="Phone Number" value={transaction.paymentAccount.phoneNumber} />
                                    }
                                </div>
                            }
                            {transaction?.type === "withdrawal" &&
                                <>
                                    <div className="space-y-1 text-sm">

                                        {transaction.userBankName &&
                                            <InfoRow label="Bank Name" value={transaction.userBankName} />
                                        }

                                        {transaction.userAccountName &&
                                            <InfoRow label="Account Name" value={transaction.userAccountName} />
                                        }

                                        {transaction.userAccountNumber &&
                                            <InfoRow label="Account Number" value={transaction.userAccountNumber} />
                                        }

                                        {transaction.userPhoneNumber &&
                                            <InfoRow label="Phone Number" value={transaction.userPhoneNumber} />
                                        }
                                    </div>
                                </>
                            }
                        </div>

                        <div className="mt-5 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                Transferer Account
                            </h3>
                            {transaction?.type === "withdrawal" ?
                                transaction?.paymentAccount ?
                                    (<div className="text-sm space-y-1">
                                        {transaction.paymentAccount.bankName &&
                                            <InfoRow label="Bank Name" value={transaction.paymentAccount.bankName} />
                                        }

                                        {transaction.paymentAccount.accountName &&
                                            <InfoRow label="Account Name" value={transaction.paymentAccount.accountName} />
                                        }

                                        {transaction.paymentAccount.accountNumber &&
                                            <InfoRow label="Account Number" value={transaction.paymentAccount.accountNumber} />
                                        }

                                        {transaction.paymentAccount.branch &&
                                            <InfoRow label="Branch" value={transaction.paymentAccount.branch} />
                                        }

                                        {transaction?.paymentAccount.phoneNumber &&
                                            (<InfoRow label="Phone Number" value={transaction.paymentAccount.phoneNumber} />)
                                        }
                                    </div>)
                                    :
                                    (<div className='text-gray-500 text-sm'>
                                        {transaction.status === "pending" ? <>Waiting to approve <DotsLoading /></> : "Rejected from admin, read admin note and edit this transaction again"}
                                    </div>)

                                :
                                (<div>
                                    {
                                        transaction?.userPhoneNumber ? <InfoRow label="Your Phone Number" value={transaction.userPhoneNumber} />
                                            :
                                            <InfoRow label="Transaction ID" value={transaction.transactionId} />
                                    }
                                </div>)
                            }
                        </div>

                        {transaction.userNotes &&
                            <div className="mt-5 border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    Your notes
                                </h3>

                                <p className="text-gray-500">{transaction.userNotes}
                                </p>
                            </div>
                        }
                        {transaction.adminNotes &&
                            <div className="mt-5 border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    Admin Notes
                                </h3>

                                <p className="text-gray-500">{transaction.adminNotes}
                                </p>
                            </div>
                        }

                        {transaction.proofUrl &&
                            <div className="mt-5 border-t pt-4">
                                <Image
                                    src={transaction.proofUrl}
                                    width={800}
                                    height={800}
                                    className='max-h-40'
                                    alt='photo'
                                />
                            </div>
                        }
                        <Button
                            onClick={() => {
                                setShowDetails([false, ""])
                            }}
                            className="w-full mt-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 active:scale-95 transition-transform"
                        >
                            Got it
                        </Button>
                    </>
                )
                    :
                    (<div className="text-center py-10 text-gray-600">
                        No transaction found.
                    </div>)
                }
            </div>
        </div>
    );
}

export function DotsLoading() {
    return (
        <span className={styles.dots + " ml-1 font-semibold"}>
        </span>
    );
}

function EditTransaction({ showEdit, setShowEdit, setTransactions, transactions, filter, setFilter }) {
    const [amount, setAmount] = useState(showEdit[1]?.amount)
    const [userPhoneNumber, setUserPhoneNumber] = useState(showEdit[1]?.userPhoneNumber);
    const [userNotes, setUserNotes] = useState(showEdit[1]?.userNotes || "");
    const [userBankName, setUserBankName] = useState(showEdit[1].userBankName)
    const [userAccountName, setUserAccountName] = useState(showEdit[1].userAccountName)
    const [userAccountNumber, setUserAccountNumber] = useState(showEdit[1].userAccountNumber);

    const [transactionId, setTransactionId] = useState(showEdit[1]?.transactionId)
    const [newImage, setNewImage] = useState(null);
    const [loading, setLoading] = useState(false)


    async function handleUpdateDeposit() {
        setLoading(true);
        let obj = {}
        if (showEdit[1].userPhoneNumber) {
            obj = { userPhoneNumber, amount };
            if (userNotes.trim() !== "") { obj.userNotes = userNotes }
            const { error } = vodaphoneDepositSchema(obj);
            if (error) {
                setLoading(false);
                return toast.error(error.details[0].message)
            }
        }
        if (showEdit[1].transactionId) {
            obj = { transactionId, amount };
            if (userNotes.trim() !== "") { obj.userNotes = userNotes }
            const { error } = bankDepositSchema(obj);
            if (error) {
                setLoading(false);
                return toast.error(error.details[0].message)
            }
        }
        let uploadedImg;
        if (newImage) {
            const uploadIMG = await UploadImage(newImage);
            const { error } = uploadedImageSchema(uploadIMG);
            if (error) {
                setLoading(false);
                return toast.error(error.details[0].message)
            }
            uploadedImg = uploadIMG
        }
        obj = { id: showEdit[1].id, userPhoneNumber, amount, transactionId, uploadedImg };
        if (userNotes.trim() !== "") { obj.userNotes = userNotes }
        const response = await updateDepositAction(obj);
        if (response?.error) {
            toast.error(response.message)
        } else if (response?.success) {
            if (response?.isNew) {
                setTransactions(transactions.map(t => {
                    if (t.id === showEdit[1].id) {
                        t.isEdited = true
                    }
                    return t
                }))
                setFilter([filter[0], 1]);

            } else {
                setTransactions(transactions.map((t) => {
                    if (t.id === response.newTransaction.id) {
                        return response.newTransaction
                    }
                    return t
                }))
            }
            toast.success("Updated successfully")
        }
        setLoading(false);
        setShowEdit([false, {}])
    }

    async function handleUpdateWithdrawal() {
        setLoading(true);
        let obj = { amount }
        if (userNotes) { obj.userNotes = userNotes }
        if (showEdit[1].userPhoneNumber) { obj.userPhoneNumber = userPhoneNumber }
        if (showEdit[1].userBankName) { obj.userBankName = userBankName }
        if (showEdit[1].userAccountName) { obj.userAccountName = userAccountName }
        if (showEdit[1].userAccountNumber) { obj.userAccountNumber = userAccountNumber }

        const { error } = withdrawUpdateSchema(obj);
        if (error) {
            setLoading(false);
            return toast.error(error.details[0].message)
        }

        const data = await updateWithdrawalAction({ obj, id: showEdit[1].id });
        if (data?.error) {
            setLoading(false);
            return toast.error(data.message)
        } else {
            if (data.isNew) {
                setFilter([filter[0], 1])
            } else {
                setTransactions(transactions.map(t => {
                    if (t.id === data.newTransaction.id) {
                        return data.newTransaction
                    }
                    return t
                }))
            }
            toast.success("Updated successfully")
        }
        setLoading(false);
        setShowEdit([false, {}])
    }

    return (
        <div onClick={() => { if (!loading) { setShowEdit([false, ""]) } }}
            className="fixed inset-0 h-screen bg-black/50 z-50 flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-2xl shadow-lg max-w-md w-full p-6 mx-4 relative transform transition-all duration-500 
                    `}
            >
                <CircleX
                    onClick={() => setShowEdit([false, {}])}
                    className='absolute top-4 text-zinc-500 hover:text-zinc-900 right-4' />

                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    Edit {showEdit[1]?.type === "deposit" ? "Deposit" : "Withdrawal"}
                </h2>
                <div className="space-y-3 text-sm">
                    <div>
                        <Label href="amount">Amount</Label>
                        <Input
                            className={"mt-1"}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number" />
                    </div>
                    {
                        ((showEdit[1]?.type === "deposit" || showEdit[1]?.type === "withdrawal") && userPhoneNumber) &&
                        <div>
                            <Label href="amount">
                                Phone Number
                            </Label>
                            <Input
                                className={"mt-1"}
                                spellCheck={false}
                                value={userPhoneNumber}
                                onChange={(e) => setUserPhoneNumber(e.target.value)}
                                type="text" />
                        </div>
                    }
                    {showEdit[1]?.type === "deposit" && transactionId &&
                        <div>
                            <Label href="amount">
                                Transaction_Id
                            </Label>
                            <Input
                                className={"mt-1"}
                                spellCheck={false}
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                type="text" />
                        </div>
                    }
                    {/*  */}

                    {showEdit[1]?.type === "withdrawal" && showEdit[1]?.userBankName &&
                        <div>
                            <Label href="amount">Bank Name</Label>
                            <Input
                                className={"mt-1"}
                                value={userBankName}
                                spellCheck={false}
                                onChange={(e) => setUserBankName(e.target.value)}
                                type="text" />
                        </div>
                    }

                    {showEdit[1]?.type === "withdrawal" && showEdit[1]?.userAccountName &&
                        <div>
                            <Label href="amount">Account Name</Label>
                            <Input
                                className={"mt-1"}
                                value={userAccountName}
                                spellCheck={false}
                                onChange={(e) => setUserAccountName(e.target.value)}
                                type="text" />
                        </div>
                    }
                    {showEdit[1]?.type === "withdrawal" && showEdit[1]?.userAccountNumber &&
                        <div>
                            <Label href="amount">Account Number</Label>
                            <Input
                                className={"mt-1"}
                                value={userAccountNumber}
                                spellCheck={false}
                                onChange={(e) => setUserAccountNumber(e.target.value)}
                                type="text" />
                        </div>
                    }

                    <div>
                        <Label href="amount">Notes</Label>
                        <Textarea
                            className={"mt-1"}
                            spellCheck={false}
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                        />
                    </div>
                    {showEdit[1].type === "deposit" &&
                        <div className="relative">
                            <Image
                                width={800}
                                height={800}
                                src={newImage ? URL.createObjectURL(newImage) : showEdit[1].proofUrl}
                                alt="Deposit receipt"
                                className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Label
                                htmlFor="IMG"><SquarePen className='text-emerald-500 rounded-full bg-white absolute cursor-pointer bottom-2 p-2 right-2 w-9 h-9 hover:bg-zinc-50' />
                            </Label>
                            <Input
                                id="IMG"
                                className={"hidden"}
                                type={"file"}
                                onChange={(e) => setNewImage(e.target.files[0])}
                            />
                        </div>
                    }


                </div>
                <div className='flex justify-end gap-2 mt-4'>
                    <Button
                        disabled={loading}
                        variant={"outline"}
                        onClick={() => {
                            setShowEdit([false, {}])
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={
                            () => {
                                if (showEdit[1].type === "deposit") {
                                    handleUpdateDeposit()
                                } else if (showEdit[1].type === "withdrawal") {
                                    handleUpdateWithdrawal()
                                }
                            }
                        }
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

function InfoRow({ label, value, highlight, color }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span
                className={`font-medium ${highlight && "text-green-600 font-semibold"} ${color || ""}`}>
                {value}
            </span>
        </div>
    );
}

export function LoadingDots() {
    return (
        <div className="flex items-center justify-center space-x-2">
            <span
                className="w-2.5 h-2.5 bg-gray-500 rounded-full"
                style={{
                    animation: "dotFlashing 1s infinite linear",
                    animationDelay: "0s",
                }}
            ></span>
            <span
                className="w-2.5 h-2.5 bg-gray-500 rounded-full"
                style={{
                    animation: "dotFlashing 1s infinite linear",
                    animationDelay: "0.2s",
                }}
            ></span>
            <span
                className="w-2.5 h-2.5 bg-gray-500 rounded-full"
                style={{
                    animation: "dotFlashing 1s infinite linear",
                    animationDelay: "0.4s",
                }}
            ></span>

            <style jsx>{`
        @keyframes dotFlashing {
          0% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }
      `}</style>
        </div>
    );
}
