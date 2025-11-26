"use client"
import { useState, useEffect } from 'react';
import {
    Plus, Trash2, CreditCard, Smartphone, Building2,
    Power, Pencil
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { paymentBankSchema, vodafonePaymentSchema } from "./dashboardSchema"
import { addPaymentAction, getPaymentsAction, togglePaymentActive, removePaymentMethodAction, updatePaymentAction } from './dashboardActions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { AlertDelete } from './dashboardComponents';
import { Loading } from '@/shared/loading';


export function PaymentTab() {
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [loading, setLoading] = useState(true)
    const [method, setMethod] = useState('vodafone');
    const [remove, setRemove] = useState([false, ""]);
    const [open, setOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bank, setBank] = useState({
        iban: "", accountName: "", accountNumber: "", bankName: ""
    });
    const [edit, setEdit] = useState([false, ""]);
    const [loadingRemove, setLoadingRemove ] = useState(false);

    useEffect(() => {
        async function getpayment() {
            const data = await getPaymentsAction();
            if (data?.error) {
                throw new Error(data.message);
            }
            setPaymentMethods(data);
            setLoading(false);
        }
        getpayment();
    }, []);

    const handleAdd = async () => {
        if (method !== "vodafone" && method !== "bank") {
            return toast.error("payment type is not defined")
        }
        if (method === "vodafone") {
            const { error } = vodafonePaymentSchema({ phoneNumber });
            if (error) {
                return toast.error(error.details[0].message)
            }
        } else if (method === "bank") {
            const { error } = paymentBankSchema(bank);
            if (error) {
                return toast.error(error.details[0].message)
            }
        }
        const data = await addPaymentAction({ method, phoneNumber, ...bank });
        if (data?.error) {
            return toast.error(data.message)
        }
        setPaymentMethods([...paymentMethods, data]);
        resetForm()
    };

    const handleToggle = async (payment) => {

        const response = await togglePaymentActive({ id: payment.id });
        if (response?.error) {
            return toast.error(response?.message)
        }

        const newMethods = paymentMethods.map(m => {
            if (m.id === payment.id) {
                m.isActive = response.isActive
            }
            return m
        });
        setPaymentMethods(newMethods)

    };

    const handleDeletePaymentMethod = async (id) => {
        setLoadingRemove(true);
        const data = await removePaymentMethodAction(id);
        setLoadingRemove(false);
        if (data.error) {
            return toast.error(data.message)
        }
        setPaymentMethods(paymentMethods.filter(m => m.id !== id));
        toast.success(data.message);
        setRemove([false, ""])
    };

    function resetForm() {
        setBank({
            iban: "", accountName: "", accountNumber: "", bankName: ""
        })
        setPhoneNumber("");
        setOpen(false)

    };
    return (
        <>
            <TabsContent value="payments" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className={"font-semibold text-xl"}>Manage Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add New Payment Method Button */}
                        <AddMethod method={method} setBank={setBank} bank={bank} setMethod={setMethod} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} resetForm={resetForm}
                            handleAdd={handleAdd} open={open} setOpen={setOpen} />

                        <Separator />

                        {/* Existing Payment Methods List */}
                        <div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-5">
                                <h3>Payment Methods ({paymentMethods?.length})</h3>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <span className="text-gray-600">
                                            Active: {paymentMethods.filter(m => m.isActive).length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                        <span className="text-gray-600">
                                            Inactive: {paymentMethods.filter(m => !m.isActive).length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {loading ?
                                (<Loading />)
                                :
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {
                                        (paymentMethods.length <= 0 ?
                                            (
                                                <div className="text-center py-12 text-gray-500">
                                                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                    <p>No payment methods available. Add your first payment method above.</p>
                                                </div>
                                            )
                                            :
                                            (paymentMethods.map((method) => (
                                                <MethodItem key={method.id} method={method}
                                                    setRemove={setRemove}
                                                    setEdit={setEdit}
                                                    handleToggle={handleToggle} />
                                            )))

                                        )}
                                </div>
                            }


                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {remove[0] &&
                <AlertDelete loadingRemove={loadingRemove} setRemove={setRemove} remove={remove} HandleDelete={handleDeletePaymentMethod} object={"payment method"} />}
            {edit[0] &&
                <EditMethod method={edit[1]} setPaymentMethods={setPaymentMethods} setEdit={setEdit} paymentMethods={paymentMethods} resetForm={resetForm} />
            }
        </>
    )
}

function AddMethod({ method, setBank, bank, setMethod, phoneNumber, setPhoneNumber, resetForm, handleAdd, open, setOpen }) {
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="mb-4">Payment Methods</h3>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Payment Method</DialogTitle>
                        <DialogDescription>
                            Add a bank account or Vodafone Cash number for users to send deposits
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="payment-type">Payment Type *</Label>
                            <Select value={method} onValueChange={(value) => setMethod(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                                    <SelectItem value="bank">Bank Account</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {method === 'bank' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="payment-label">Bank Name *</Label>
                                    <Input
                                        id="payment-label"
                                        placeholder={'e.g., National Bank of Egypt'}
                                        value={bank.bankName}
                                        spellCheck={false}
                                        onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-name">Account Name</Label>
                                    <Input
                                        id="account-name"
                                        placeholder="e.g., Egypt Travel Platform"
                                        value={bank.accountName}
                                        onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-number">Account Number *</Label>
                                    <Input
                                        id="account-number"
                                        placeholder="e.g., EG1234567890"
                                        value={bank.accountNumber}
                                        onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-number">Iban*</Label>
                                    <Input
                                        id="account-number"
                                        placeholder="insert iban"
                                        spellCheck={false}
                                        value={bank.iban}
                                        onChange={(e) => setBank({ ...bank, iban: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="phone-number">Phone Number *</Label>
                                <Input
                                    id="phone-number"
                                    placeholder="e.g., +20 100 000 0000"
                                    spellCheck={false}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        )}


                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Method
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function MethodItem({ method, setRemove, setEdit, handleToggle }) {
    return (
        <div
            key={method.id}
            className={`flex flex-col sm:flex-row items-start justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all  ${!method.isActive ? 'opacity-60' : ''
                }`}
        >
            <div className="flex w-full h-full items-start gap-3 flex-1">

                <div className={`h-10 w-10 hidden sm:flex rounded-full items-center justify-center ${method.method === 'bank' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                    {method.method === 'bank' ? (
                        <Building2 className={`h-5 w-5 text-blue-600`} />
                    ) : (
                        <Smartphone className="h-5 w-5 text-green-600" />
                    )}
                </div>



                {/*  */}
                <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="flex items-start flex-wrap gap-2 mb-1">
                        <p className="font-semibold text-center">{method.bankName || "vodaphone cash"}</p>
                        <div className='flex gap-1'>
                            <Badge variant="outline" className="text-xs">
                                {method.method === 'bank' ? 'Bank' : 'Vodafone Cash'}
                            </Badge>
                            <Badge
                                variant={method.isActive ? "default" : "secondary"}
                                className={`text-xs ${method.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                            >
                                {method.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>

                    {method.accountName && (
                        <p className="text-sm text-gray-600 mb-1">{method.accountName}</p>
                    )}
                    {method.method === 'bank' && method.accountNumber && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <CreditCard className="h-3 w-3" />
                            {method.accountNumber}
                        </div>
                    )}
                    {method.method === 'vodafone' && method.phoneNumber && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Smartphone className="h-3 w-3" />
                            {method.phoneNumber}
                        </div>
                    )}

                    {/* Active/Inactive Toggle */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Power className={`h-4 w-4 ${method.isActive ? 'text-green-600' : 'text-gray-400 '}`} />

                        <Label htmlFor={`active-${method.id}`} className="text-sm cursor-pointer flex-1">
                            {method.isActive ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                            id={`active-${method.id}`}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                            checked={method.isActive}
                            onCheckedChange={() => handleToggle(method)}
                        />
                    </div>
                </div>
            </div>

            {method?._count?.transactions <= 0 &&
                <div className='flex flex-col gap-1 w-full sm:w-fit items-center'>
                    <Button
                        size={"sm"}

                        variant="destructive"
                        className={"w-full sm:w-fit mt-3 sm:mt-0"}
                        onClick={() =>
                            setRemove([true, method.id])}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                        size={"sm"}
                        variant="outline"
                        className={"w-full sm:w-fit "}
                        onClick={() =>
                            setEdit([true, method])}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>}
        </div>
    )
}

function EditMethod({ method, setPaymentMethods, paymentMethods, setEdit, resetForm }) {
    const [bank, setBank] = useState({
        iban: method.iban, accountName: method.accountName, accountNumber: method.accountNumber, bankName: method.bankName
    })
    const [phoneNumber, setPhoneNumber] = useState(method.phoneNumber);

    const handleUpdate = async () => {
        if (method.method !== "vodafone" && method.method !== "bank") {
            return toast.error("payment type is not defined")
        }
        if (method.method === "vodafone") {
            const { error } = vodafonePaymentSchema({ phoneNumber });
            if (error) {
                return toast.error(error.details[0].message)
            }
        } else if (method.method === "bank") {
            const { error } = paymentBankSchema(bank);
            if (error) {
                return toast.error(error.details[0].message)
            }
        }
        const response = await updatePaymentAction({ id: method.id, phoneNumber, ...bank });
        if (response?.error) {
            return toast.error(response.message)
        }

        
        setPaymentMethods((paymentMethods.map(m => {
            if (m.id === method.id) {
                return response
            }
            return m
        })));
        toast.success("Updated successfully")
        setEdit([false, ""]);
        resetForm();
    };

    return (
        <div
            onClick={() => {
                resetForm();
                setEdit([false, ""])
            }}
            className='fixed top-0 left-0 z-50 bg-black/40 flex items-center justify-center w-full h-screen'>
            <div
                onClick={(e) => e.stopPropagation()}
                className="grid gap-2 max-w-md w-full p-4 rounded-md bg-white">
                <div className='mb-4'>
                    <h3 className='font-bold '>Edit Payment</h3>
                    <p className='text-zinc-400 font-semibold '> Make changes to payment method here. Click save when you&apos;re</p>
                </div>

                {method?.method === "vodafone" &&
                    <div className="space-y-2">
                        <Label htmlFor="phone-number">Phone Number *</Label>
                        <Input
                            spellCheck={false}
                            id="phone-number"
                            placeholder="e.g., +20 100 000 0000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                }
                {method.method === "bank" &&
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="payment-label">Bank Name *</Label>
                            <Input
                                spellCheck={false}
                                id="payment-label"
                                placeholder={'e.g., National Bank of Egypt'}
                                value={bank.bankName}
                                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-name">Account Name *</Label>
                            <Input
                                spellCheck={false}
                                id="account-name"
                                placeholder="e.g., Egypt Travel Platform"
                                value={bank.accountName}
                                onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-number">Account Number *</Label>
                            <Input
                                spellCheck={false}
                                id="account-number"
                                placeholder="e.g., EG1234567890"
                                value={bank.accountNumber}
                                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-number">Iban *</Label>
                            <Input
                                spellCheck={false}
                                id="account-number"
                                placeholder="insert iban"
                                value={bank.iban}
                                onChange={(e) => setBank({ ...bank, iban: e.target.value })}
                            />
                        </div>
                    </>
                }
                <div className='w-full justify-end gap-2 flex'>
                    <Button onClick={() => {
                        resetForm();
                        setEdit([false, ""])
                    }} variant="outline">Cancel</Button>

                    <Button type="submit"
                        onClick={handleUpdate}
                    >Save changes</Button>
                </div>
            </div>
        </div>
    )
}
