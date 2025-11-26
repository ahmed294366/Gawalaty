"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TabsContent } from '@/components/ui/tabs';
import { bankDepositSchema, vodaphoneDepositSchema, withdrawVodafoneSchema, withdrawBankSchema } from '../userSchema';

import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  ChevronLeft,
  Banknote, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UploadImage } from '@/utils/cloudinary';
import { depositAction, getTransactionsAction, getTransactionsCount, getActiveBankAndVcash, withdrawAction } from '../userActions';
import { DepositInstructions, ChooseMethod, BankMethod, VodafoneMethod, TransactionHistory } from './walletComponents';
import { Textarea } from '@/components/ui/textarea';

export function WalletTab({ user, profile }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState(["pending", 1]);
  const [refresh, setRefresh] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const mainStateObj = {
    vcash: "", bank: "", method: "", withdraw: false, deposit: false, amount: 10, userAccountName: "", userAccountNumber: "",
    userBankName: "", userPhoneNumber: "", transactionId: "",
    showUpload: false, depositImage: null
  }

  const [mainState, setMainState] = useState(mainStateObj);

  useEffect(() => {
    async function getPayments() {
      const response = await getActiveBankAndVcash();
      if (response?.error) {
        throw new Error(response.message)
      } else {
        setMainState({ ...mainState, vcash: response.vodafone, bank: response.bank })
      }
    }
    getPayments()
  }, []);

  useEffect(() => {
    async function getTransaction() {
      if (user) {
        const response = await getTransactionsAction({ status: filter[0], page: filter[1], id: user?.id });
        if (response?.error) {
          throw new Error(response?.message)
        }
        setTransactions(response);
        setLoading(false);
      }
    }
    getTransaction()
  }, [filter, refresh]);

  useEffect(() => {
    async function getTransactionCount() {
      const items = await getTransactionsCount({ status: filter[0], id: user?.id });
      if (items?.error) {
        throw new Error(items?.message)
      }
      if (items === 0) {
        setPages(0)
      } else {
        setPages(Math.ceil(items / 6));
      }
    }
    getTransactionCount()
  }, [filter[0], refresh]);

  return (
    <>
      <TabsContent value="wallet" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-bold">
              <Wallet className="h-5 w-5" />
              Wallet Balance
            </CardTitle>
            <CardDescription className={"font-semibold text-zinc-500"}>Manage your wallet and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Balance Display */}
              <div className="bg-linear-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Available Balance</p>
                    <h2 className="text-3xl sm:text-4xl font-bold">{profile.wallet} LE</h2>
                  </div>
                  <Wallet className="h-12 w-12 opacity-50 hidden sm:block" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash, withdraw: true })}
                  variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <ArrowUpCircle className="h-6 w-6" />
                  <span>Withdraw</span>
                </Button>

                <Button
                  onClick={() => setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash, deposit: true })}
                  variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <ArrowDownCircle className="h-6 w-6" />
                  <span>Deposit</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TransactionHistory setTransactions={setTransactions} transactions={transactions} setFilter={setFilter} filter={filter} pages={pages} setRefresh={setRefresh} refresh={refresh} loading={loading} />

      </TabsContent>

      {mainState.deposit &&
        <DepositDialog mainState={mainState} setMainState={setMainState} mainStateObj={mainStateObj} filter={filter} transactions={transactions} setTransactions={setTransactions} />}

      {mainState.withdraw &&
        <WithdrawDialog wallet={profile.wallet} mainState={mainState} setMainState={setMainState} mainStateObj={mainStateObj} filter={filter} transactions={transactions} setTransactions={setTransactions} />}

    </>
  );
}

function DepositDialog({ mainState, setMainState, mainStateObj, filter, transactions, setTransactions }) {

  const [loading, setLoading] = useState(false);

  async function handleDeposit() {
    setLoading(true)
    let obj = { amount: mainState.amount }
    if (mainState?.userNotes?.trim() !== "") { obj.userNotes = mainState.userNotes }

    if (mainState.method === "vodafone") {
      obj.userPhoneNumber = mainState.userPhoneNumber;
      const { error } = vodaphoneDepositSchema(obj);
      if (error) {
        setLoading(false)
        return toast.error(error.details[0].message)
      }

      obj.method = "vodafone";
      obj.paymentAccountId = mainState.vcash.id
    } else if (mainState?.method === "bank") {
      obj.transactionId = mainState.transactionId;
      const { error } = bankDepositSchema(obj);
      if (error) {
        setLoading(false);
        return toast.error(error.details[0].message);
      }
      obj.method = "bank";
      obj.paymentAccountId = mainState?.bank?.id;
    } else {
      setLoading(false);
      return toast.error("select your method");
    }

    if (mainState.depositImage === null) {
      setLoading(false);
      return toast.error("require deposit image");
    }

    if (!mainState.depositImage.type.startsWith("image/")) {
      setLoading(false);
      return toast.error("accept image only");
    }

    if (mainState.depositImage.size > (1024 * 1024 * 5)) {
      setLoading(false);
      return toast.error("image max size is 5mb");
    };

    const image = await UploadImage(mainState.depositImage);
    if (!image?.url || !image?.publicid) {
      setLoading(false);
      return toast.error("failed to upload image ,please try again");
    }
    obj.image = image;
    const response = await depositAction(obj);

    if (response?.error) {
      setLoading(false);
      return toast.error(response.message)
    } else {
      if (filter[0] === "pending") {
        if (filter[1] === 1) {
          setTransactions([response, ...transactions.slice(6)]);
        }
      }
      setLoading(false)
      setMainState({ ...mainStateObj, vcash: mainState.vcash, bank: mainState.bank })
      toast.success("deposit request created successfully, admin will approved as soon as posible");
    }
  }

  return (
    <div
      onClick={() => {
        if (!loading) { setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash }) }
      }
      }
      className='fixed flex items-center justify-center top-0 left-0 bg-black/40 z-50 h-screen w-full'>

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[calc(100vh-5%)] space-y-4 overflow-y-auto bg-white p-4 rounded-md relative">
        <div
          onClick={() => {
            if (!loading) { setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash }) }
          }}
          className={`absolute top-3 right-3 rounded-full w-7 h-7 bg-zinc-100 flex items-center justify-center cursor-pointer`}>
          <X className="text-red-600 hover:text-red-500" />
        </div>

        <div className={"flex flex-row w-full items-center justify-start"}>
          {mainState.method &&
            <ChevronLeft
              onClick={() => setMainState({ ...mainState, method: "" })}
              className='rounded-full bg-white p-2 w-10 h-10 text-gray-400 hover:text-black' />
          }
          <div>
            <h1 className='text-lg font-semibold'>Deposit Funds</h1>
            <span>
              Transfer money to your wallet
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {!mainState.method &&
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Choose account, transfer funds and upload the transaction receipt
              </AlertDescription>
            </Alert>
          }

          {/* Platform Account Details */}

          {!mainState.method && (
            <ChooseMethod method="Deposit" setMainState={setMainState} mainState={mainState} vcash={mainState.vcash} bank={mainState.bank} />
          )}

          {mainState.method === "vodafone" &&
            <VodafoneMethod mainState={mainState} setMainState={setMainState} />}

          {/* {method === "bank" && <BankInfo bank={bank} />} */}

          {mainState.method === "bank" &&
            <BankMethod setMainState={setMainState} mainState={mainState} />
          }

          {mainState.method &&
            <div>
              <Label
                className={"mb-1"}
                htmlFor="deposit-amount">Amount Deposited (LE)</Label>
              <Input
                spellCheck={false}
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={mainState.amount}
                onChange={(e) => setMainState({ ...mainState, amount: e.target.value })}
              />
            </div>}
          {mainState.method &&
            <DepositInstructions setMainState={setMainState} mainState={mainState} />
          }
        </div>
        <div className="mt-4 flex gap-2 flex-col-reverse sm:flex-row justify-end">
          <Button
            disabled={loading}
            variant="outline" onClick={() => setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash })} >
            Cancel
          </Button>

          <Button className={"sm:w-40"} disabled={loading} onClick={handleDeposit}>
            {loading ? <span className="rounded-full w-4 h-4 animate-spin border-2 border-white border-t-transparent"></span> : "Submit Request"}
          </Button>

        </div>
      </div>
    </div>
  )
}

function WithdrawDialog({ wallet, mainStateObj, mainState, setMainState, filter, transactions, setTransactions }) {

  const [loading, setLoading] = useState(false);

  async function handleWithdrawal() {
    setLoading(true);
    if (mainState.amount > wallet) {
      setLoading(false);
      return toast.error("not enough amount in your wallet");
    }
    const obj = { amount: mainState.amount, method: mainState.method };

    if (mainState.method === "bank") {
      obj.userAccountName = mainState.userAccountName;
      obj.userAccountNumber = mainState.userAccountNumber;
      obj.userBankName = mainState.userBankName;
      obj.userNotes = mainState.userNotes;

      const { error } = withdrawBankSchema(obj);
      if (error) {
        setLoading(false);
        return toast.error(error.details[0].message);
      }

    } else {
      obj.userPhoneNumber = mainState.userPhoneNumber
      const { error } = withdrawVodafoneSchema(obj);
      if (error) {
        setLoading(false);
        return toast.error(error.details[0].message);
      }
    }
    const data = await withdrawAction(obj);

    if (data?.error) {
      setLoading(false);
      return toast.error(data.message);
    } else {
      if (filter[0] === "pending") {
        if (filter[1] === 1) {
          setTransactions([data, ...transactions.slice(0, 4)]);
        }
      }
      setMainState({ ...mainStateObj, vcash: mainState.vcash, bank: mainState.bank });
      toast.success("withdrawal request created successfully, admin will approved as soon as posible");
      setLoading(false);
    }
  }
  return (
    <div
      onClick={() => {
        if (!loading) {
          setMainState({ ...mainStateObj, vcash: mainState.vcash, bank: mainState.bank });
        }
      }
      }
      className='fixed z-50 bg-black/40 flex items-center justify-center top-0 left-0 h-screen w-full'>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[calc(100vh-5%)] w-full max-w-md overflow-y-auto bg-white p-4 rounded-md space-y-4 relative">
        <div
          onClick={() => {
            if (!loading) { setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash }) }
          }}
          className={`absolute top-3 right-3 rounded-full w-7 h-7 bg-zinc-100 flex items-center justify-center cursor-pointer`}>
          <X className="text-red-600 hover:text-red-500" />
        </div>
        <DialogHeader className={"flex flex-row w-full items-center justify-start"}>
          {mainState.method &&
            <ChevronLeft
              onClick={() => setMainState({ ...mainStateObj, bank: mainState.bank, vcash: mainState.vcash, withdraw: true })}
              className='rounded-full bg-white p-2 w-10 h-10 text-gray-400 hover:text-black' />}
          <div>
            <h1 className="text-lg font-semibold">Withdraw Funds</h1>
            <span>
              Request a withdrawal from your wallet balance
            </span>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Available balance: {wallet.toFixed(2)} LE
            </AlertDescription>
          </Alert>
          {mainState.method &&
            <Alert className="border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm rounded-2xl">
              <Banknote className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="font-semibold">Withdrawal Instructions</AlertTitle>
              <AlertDescription className="mt-1 text-sm leading-relaxed">
                Ensure all withdrawal details are <span className="font-semibold">accurate and match your bank account</span>

                <p>For <span className="font-medium">bank transfers</span>, double-check the account name and number.</p>

                <p>For <span className="font-medium">Vodafone Cash</span>, make sure the phone number is <span className="font-semibold">correct and active</span>.</p>

                <p>Requests may take up to <span className="font-medium">24 hours</span> to process.</p>

                Withdrawals can’t be edited after approval — review before submitting.
              </AlertDescription>
            </Alert>}
          {!mainState.method &&
            <ChooseMethod vcash={mainState.vcash} bank={mainState.bank} method="Withdraw" setMainState={setMainState} mainState={mainState} />
          }

          {mainState.method &&
            <div className='relative'>
              {mainState.amount > wallet && <span className='text-red-400 text-sm absolute -top-0.5 left-21 font-semibold'>Not available*</span>}
              <Label
                className={"mb-2"}
                htmlFor="withdraw-amount">Amount (LE)</Label>
              <Input
                spellCheck={false}
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={mainState.amount}
                onChange={(e) => setMainState({ ...mainState, amount: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          }

          {mainState.method === "vodafone" &&
            <div className='mb-4'>
              <Label className={"mb-2"} htmlFor="target-number">Your Phone Number</Label>
              <Input
                spellCheck={false}
                id="target-number"
                type="text"
                value={mainState.userPhoneNumber}
                onChange={(e) => setMainState({ ...mainState, userPhoneNumber: e.target.value })}
                placeholder="+20 123 456 7890"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the phone number where you want to receive the funds
              </p>
            </div>
          }

          {mainState.method === "bank" &&
            <>
              <div>
                <Label
                  className={"mb-2"}
                  htmlFor="bank_name">Your Bank Name</Label>
                <Input
                  id="bank_name"
                  type="text"
                  value={mainState.userBankName}
                  onChange={(e) => setMainState({ ...mainState, userBankName: e.target.value })}
                  spellCheck={false}
                  placeholder="+20 123 456 7890"
                />
              </div>
              <div>
                <Label
                  className={"mb-2"}
                  htmlFor="account_name">Your Account Name</Label>
                <Input
                  spellCheck={false}
                  id="account_name"
                  type="text"
                  value={mainState.userAccountName}
                  onChange={(e) => setMainState({ ...mainState, userAccountName: e.target.value })}
                  placeholder="+20 123 456 7890"
                />
              </div>
              <div>
                <Label
                  className={"mb-2"}
                  htmlFor="account-number">Your Account Number</Label>
                <Input
                  spellCheck={false}
                  id="account-number"
                  type="text"
                  value={mainState.userAccountNumber}
                  onChange={(e) => setMainState({ ...mainState, userAccountNumber: e.target.value })}
                  placeholder="+20 123 456 7890"
                />

              </div>

            </>
          }
          {mainState.method && <div>
            <Label
              className={"mb-2"}
              htmlFor="account-number">Your Notes (optional)</Label>
            <Textarea
              id="account-number"
              type="text"
              spellCheck={false}
              value={mainState.userNotes}
              onChange={(e) => setMainState({ ...mainState, userNotes: e.target.value })}

            />
          </div>
          }


        </div>
        <DialogFooter>
          <Button
            disabled={loading}
            onClick={() => setMainState({ ...mainStateObj, withdraw: false, bank: mainState.bank, vcash: mainState.vcash })}
            variant="outline">
            Cancel
          </Button>
          <Button
            disabled={loading}
            className={"w-40"}
            onClick={handleWithdrawal}
          >
            {loading ? <span className="rounded-full w-4 h-4 animate-spin border-2 border-white border-t-transparent"></span> : "Submit Request"}
          </Button>
        </DialogFooter>
      </div>
    </div>
  )
}