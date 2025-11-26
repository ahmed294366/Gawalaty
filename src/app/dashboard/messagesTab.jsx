"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Loading } from '@/shared/loading';
import { Separator } from '@/components/ui/separator';
import { getQuestionsAction, countQuestionsAction, getRepliesAction, replyToQuestionAction, closeMessageAction } from './dashboardActions';
import {
  Mail,
  Search,
  X, 
  ArchiveRestore,
  Send,
  MessageSquare,
  User,
  Clock,
  UserStar,
  RefreshCw, ImageUp
} from 'lucide-react';
import { replySchema } from './dashboardSchema';
import { TabsContent } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { DashboardPagination } from './dashboardComponents';
import Link from 'next/link';
import { UploadImage } from '@/utils/cloudinary';
import { DisplayImages } from '@/shared/displayImages';

export const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "waiting_for_admin": return "bg-green-100 text-green-800";
    case "waiting_for_user": return "bg-blue-100 text-blue-800";
    case "closed": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
export const getStatusIcon = (status) => {
  switch (status) {
    case "pending": return <Clock className="h-4 w-4" />;
    case "waiting_for_user": return <User className="h-4 w-4" />;
    case 'waiting_for_admin': return <UserStar className="h-4 w-4" />;
    case "closed": return <X className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};


export function MessagesTab({ session }) {
  const [questions, setQuestions] = useState([]);
  const [statusAndPage, setStatusAndPage] = useState([{ status: "pending", search: "" }, 1])
  const [pages, setPages] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [openReplies, setOpenReplies] = useState([false, ""]);
  const [loading, setLoading] = useState(true);
  const [openImages, setOpenImages] = useState([false, [], 0]);

  useEffect(() => {
    async function fetchQuestions() {
      let obj = { page: statusAndPage[1], status: statusAndPage[0].status }
      if (statusAndPage[0].search.trim() !== "") {
        obj.search = statusAndPage[0].search
      }
      const data = await getQuestionsAction(obj);
      if (data?.error) {
        throw new Error(data.message)
      }
      setQuestions(data);
      setLoading(false)
    }
    fetchQuestions()
  }, [statusAndPage, refresh]);

  useEffect(() => {
    async function countQuestions() {
      let obj = { status: statusAndPage[0].status }
      if (statusAndPage[0].search.trim() !== "") {
        obj.search = statusAndPage[0].search
      }
      const items = await countQuestionsAction(obj);
      if (items?.error) {
        throw new Error(items.message)
      }
      if (items <= 0) {
        setPages(0)
      } else {
        setPages(Math.ceil(items / 6))
      }
    }
    countQuestions()
  }, [statusAndPage[0], refresh]);


  const [searchTerm, setSearchTerm] = useState('');

  async function handleClose(id) {
    const response = await closeMessageAction(id);
    if (response?.error) {
      return toast.error(response.message)
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  return (
    <>
      <TabsContent value="messages" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row items-start justify-between">
              <CardTitle className={"font-semibold text-xl flex items-center gap-2 select-none"}>
                <RefreshCw
                  onClick={() => setRefresh(refresh + 1)}
                  className="h-4 w-4 cursor-pointer"
                />
                Messages Management

              </CardTitle>
              <div className="flex items-center flex-wrap gap-4">

                <div className="relative">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setStatusAndPage([{ status: statusAndPage[0].status, search: e.currentTarget.search.value }, 1])
                  }}>
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by email ..."
                      value={searchTerm}
                      name="search"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </form>

                </div>

                <Select
                  value={statusAndPage[0].status}
                  onValueChange={(e) => {
                    setStatusAndPage([{ status: e, search: statusAndPage[0].search }, 1]);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="waiting_for_admin">waiting for admin</SelectItem>
                    <SelectItem value="waiting_for_user">waiting for user</SelectItem>
                    <SelectItem value="closed">closed</SelectItem>
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
                questions.length === 0 ?
                  (<div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No messages found</p>
                  </div>)
                  :
                  (questions.map((question) => (
                    <MessageItem key={question.id} question={question} setOpenReplies={setOpenReplies} handleClose={handleClose} />)
                  )
                  )
              }
            </div>
          </CardContent>
        </Card>

        {pages > 0 && <DashboardPagination
          page={statusAndPage[1]}
          type={statusAndPage[0]}
          setPageAndType={setStatusAndPage}
          pages={pages}
        />}
        {openReplies[0] && <Replies message={openReplies[1]} setOpenReplies={setOpenReplies} questions={questions} setQuestions={setQuestions} session={session} setOpenImages={setOpenImages} />}
      </TabsContent>

      {openImages[0] &&
        <DisplayImages images={openImages[1]} setOpenImages={setOpenImages} index={openImages[2]} />
      }
    </>


  );
}

function MessageItem({ question, setOpenReplies, handleClose }) {

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col items-start justify-between md:items-center md:flex-row p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors overflow-x-auto">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <div className="flex gap-2 items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={question?.user?.image}
                    alt={question?.name}
                  />
                  <AvatarFallback>{question?.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center">
                  {question.user ?
                    <Link
                      className='text-nowrap underline text-blue-800 font-semibold'
                      href={`/profile/${question.user.id}`}>{question?.name}
                    </Link> :
                    <span className='text-nowrap font-semibold'>{question?.name}</span>
                  }
                  <p className="text-sm text-gray-900 mb-1 font-semibold">
                    <span className="capitalize font-bold text-amber-600">
                      {question?.category?.split("_")?.join(" ")}
                    </span>
                  </p>
                </div>
              </div>

              <Badge className={getStatusColor(question?.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(question?.status)}
                  {question?.status}
                </span>
              </Badge>
            </div>
            {question.subject &&
              <div className='font-semibold pl-2'>
                <span className='font-bold'>Subject:</span> {question.subject}
              </div>}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs text-gray-500 pt-1 pl-2 w-full">
              {/* EMAIL */}
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate w-full whitespace-nowrap text-ellipsis">
                  {question?.email}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {new Date(question?.createdAt).toLocaleString()}
              </div>


              <div className="flex items-center gap-1 ">
                <MessageSquare className="h-3 w-3" />
                {question?._count?.replies} {question?._count?.replies <= 1 ? "reply" : "replies"}
              </div>

            </div>

            <div className="font-semibold pl-2 text-amber-600 mt-2">
              Message:
              <p className="text-black font-semibold">
                {question?.question}
              </p>
            </div>
          </div>
        </div>

        <div className="flex mt-4 flex-col items-start gap-2">
          <Button
            onClick={() => setOpenReplies([true, question])}
            size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            View / Reply
          </Button>
          {question?.status === "closed" ? (
            <Button onClick={() => { handleClose(question.id) }} size="sm" variant="outline">
              <ArchiveRestore className="h-4 w-4 mr-1" />
              Restore
            </Button>
          ) : (
            <Button onClick={() => { handleClose(question.id) }} size="sm" variant="outline">
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          )}
        </div>
      </div>
    </div>

  )
}

function Replies({ message, setOpenReplies, questions, setQuestions, session, setOpenImages }) {
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");
  const [img, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getReplies() {
      const data = await getRepliesAction(message.id);
      if (data?.error) {
        throw new Error(data.message)
      }
      setReplies(data)
    }
    getReplies()
  }, []);

  async function handleReply() {
    let obj = { questionId: message.id };

    if (text?.trim() !== "") {
      const { error } = replySchema({ text });
      if (error) {
        return toast.error(error.details[0].message)
      }
      obj.text = text;
    } else {
      if (!img) {
        return toast.error("No faileds found to create reply")
      }
    }
    setLoading(true);

    if (img) {
      const uploadedIMG = await UploadImage(img);
      if (!uploadedIMG?.url || !uploadedIMG?.publicid) {
        setLoading(false);
        return toast.error("Failed to upload image")
      }
      obj.image = uploadedIMG
    }
    const response = await replyToQuestionAction(obj);
    setLoading(false);
    if (response?.error) {
      return toast.error(response.message)
    }
    setReplies([...replies, response]);
    setText("");
    setImage(null);
    if (message.status === "pending") {
      if (session.user.id !== message.userId) {
        setQuestions(questions.filter((q) => q.id !== message.id))
      }
    }
  }

  return (
    <div
      onClick={() => { if (!loading) setOpenReplies([false, ""]) }}
      className="fixed top-0 left-0 w-full bg-black/40 flex items-center justify-center h-screen">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-2xl relative p-4 rounded-md h-[80vh] flex flex-col bg-white">
        <div
          onClick={() => {if(!loading)setOpenReplies([false,""])}}
          className={`absolute top-3 right-3 rounded-full w-7 h-7 bg-zinc-100 flex items-center justify-center cursor-pointer`}>
          <X className="text-red-600 hover:text-red-500" />
        </div>
        <div className='pb-2'>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={message?.user?.image} alt={message?.name} />
              <AvatarFallback>{message?.name[0]}</AvatarFallback>
            </Avatar>
            <div className='max-w-full'>
              <div className="flex items-center gap-2">
                <span className='font-semibold'>{message?.user?.name}</span>
                <Badge className={getStatusColor(message?.status)}>
                  {message?.status}
                </Badge>
              </div>
              {<p className="text-sm text-gray-500">{message?.user?.email}</p>}
            </div>
          </div>
        </div>

        <Separator />

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Original Message */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={message?.user?.image} alt={message?.name} />
              <AvatarFallback>{message?.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center flex-wrap-reverse justify-between mb-1">
                  <span className="font-semibold text-sm">{message?.user?.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message?.createdAt).toLocaleString()}
                  </span>
                </div>
                {message.question &&
                  <p className="text-sm mt-2">{message?.question}</p>}
                {message.url &&
                  <Image
                    onClick={() => setOpenImages([true, [message.url], 0])}
                    src={message.url} width={300} height={300} alt="image" className="rounded-md mt-2" />
                }
              </div>
            </div>
          </div>

          {/* Responses */}
          {replies?.map((reply) => {
            const isOwner = reply?.senderId === message.userId;
            return (
              <div key={reply?.id} className={`flex gap-3 ${isOwner ? '' : 'flex-row-reverse'}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply?.sender?.image} alt={reply?.sender?.name} />
                  <AvatarFallback>
                    {reply?.sender?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className={`rounded-lg p-3 ${isOwner ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                    <div className="flex flex-wrap-reverse items-center justify-between mb-1">
                      <span className="font-semibold text-sm">
                        {reply?.sender?.name}
                        {!isOwner && <Badge className="ml-2 text-xs bg-emerald-600">Admin</Badge>}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply?.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {reply.text &&
                      <p className="text-sm mt-2">{reply?.text}</p>
                    }
                    {reply.url &&
                      <Image
                        onClick={() => setOpenImages([true, [reply.url], 0])}
                        src={reply.url} width={300} height={300} alt="image" className="rounded-md mt-2" />
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />
        {img &&
          <div className="relative w-fit p-4 ">
            <Image
              alt="Image"
              width={130}
              height={130}
              className="rounded-md"
              src={URL.createObjectURL(img)}
            />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100">
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        }
        {/* Reply Input */}
        {message?.status !== 'Closed' && (
          <div className="space-y-3 pt-2">
            <Textarea
              placeholder="Type your reply..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end items-center gap-1">
              <label htmlFor="image">
                <ImageUp className="w-8 h-8 cursor-pointer" /></label>
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <Button disabled={loading || (!img && !text)} onClick={handleReply}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}