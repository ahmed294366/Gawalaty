"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/select';
import { getMessagesAction, getRepliesAction, createMessageAction, createReplyAction, removeMessageAction, countMessagesAction } from '../userActions';
import { Separator } from '@/components/ui/separator';
import {
  Send, MessageSquare, Clock, Plus, Trash, RefreshCw, ChevronLeft, ChevronRight, ImageUp, X, Mail
} from 'lucide-react';
import { UploadImage } from '@/utils/cloudinary';
import toast from 'react-hot-toast';
import { TabsContent } from '@/components/ui/tabs';
import { questionSchema, replySchema } from '../userSchema';
import { getStatusIcon, getStatusColor } from '@/app/dashboard/messagesTab';
import { Loading } from '@/shared/loading';
import { DisplayImages } from '@/shared/displayImages';
export function MessagesTab({ profile, user }) {
  const [messages, setMessages] = useState([]);
  const [openNewMessage, setOPenNewMessage] = useState(false);
  const [openReplies, setOpenReplies] = useState([false, ""]);
  const [pages, setpages] = useState(0);
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true);
  const [remove, setRemove] = useState([false, ""]);
  const [openImages, setOpenImages] = useState([false, [], 0]);

  useEffect(() => {
    async function fetchMessages() {
      const data = await getMessagesAction({ email: profile.email, page });

      if (data?.error) {
        throw new Error(data.message)
      }
      setMessages(data);
      setLoading(false);
    }
    fetchMessages()
  }, [page]);

  useEffect(() => {
    async function count() {
      const items = await countMessagesAction(profile.email);

      if (items?.error) {
        throw new Error(items.message)
      }
      if (items <= 0) {
        setpages(0)
      } else {
        setpages(Math.ceil(items / 6))
      }

    }
    count()
  }, [])

  return (
    <>
      <div className="space-y-6">
        <TabsContent value="messages">
          <Card className={"relative"}>

            <CardHeader>
              <CardTitle className={"font-bold flex items-center"}>
                <Mail className="h-5 w-5 mr-2" />
                My Messages
              </CardTitle>
              <CardDescription className={"font-semibold text-zinc-500"}>
                {user?.id === profile?.id && "Write your message here and our team will get back to you as soon as possible"}
              </CardDescription>
              {profile?.id === user?.id &&
                <Button
                  className={"bg-amber-600 hover:bg-amber-500 w-fit mt-2"}
                  onClick={() => setOPenNewMessage(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              }
            </CardHeader>

            <CardContent>
              {loading ? (<Loading />) : (
                messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-2 font-semibold text-gray-900">No messages yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start a conversation with our support team
                    </p>
                    <Button onClick={() => setOPenNewMessage(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Send Your First Message
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 px-2">
                    {messages.map((message) => {
                      return (
                        <MessageItem key={message.id}
                          profile={profile} user={user}
                          setRemove={setRemove}
                          message={message}
                          setOpenReplies={setOpenReplies} />
                      );
                    })}
                    {pages > 1 &&
                      <div className='flex items-center gap-1'>
                        <ChevronLeft
                          onClick={() => {
                            if (page > 1) {
                              setPage(page - 1)
                            }
                          }}
                          className='rounded-full p-2 bg-white hover:bg-gray-50 w-10 h-10' />
                        {page}
                        <p className='font-bold'>From</p>
                        {pages}
                        <ChevronRight
                          onClick={() => {
                            if (page < pages) {
                              setPage(page + 1)
                            }
                          }}
                          className='rounded-full p-2 bg-white hover:bg-gray-50 w-10 h-10' />
                      </div>
                    }
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {openReplies[0] &&
          <Replies profile={profile} setOpenReplies={setOpenReplies} message={openReplies[1]} user={user} messages={messages} setMessages={setMessages} setOpenImages={setOpenImages} />}

        {openNewMessage &&
          <NewMessage setOPenNewMessage={setOPenNewMessage} messages={messages} setMessages={setMessages} page={page} setPage={setPage} />
        }
        {remove[0] &&
          <AlertRemove setRemove={setRemove} remove={remove} messages={messages} setMessages={setMessages} />
        }
      </div>
      {openImages[0] &&
        <DisplayImages images={openImages[1]} setOpenImages={setOpenImages} index={openImages[2]} />
      }
    </>
  );
}

function MessageItem({ message, setOpenReplies, setRemove, profile, user }) {

  return (
    <div className="flex  justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex-col sm:flex-row items-start gap-3">

      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <h4 className="font-semibold">{message.category}</h4>
          <Badge className={getStatusColor(message.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(message.status)}
              {message.status}
            </span>
          </Badge>
          {message.status === 'responded' && (
            <Badge className="bg-blue-100 text-blue-800">New Reply</Badge>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(message.createdAt).toLocaleString()}
          </span>

          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {message?._count.replies} {message?._count.replies === 1 ? 'reply' : 'replies'}
          </span>
        </div>
      </div>

      <div>
        {user?.id === profile?.id &&
          <Button
            variant={"destructive"}
            className={"mr-2"}
            onClick={() => { setRemove([true, message.id]) }}
            size="sm">
            <Trash className="h-4 w-4" />
          </Button>
        }
        <Button
          variant={"outline"}
          onClick={() => setOpenReplies([true, message])}
          size="sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>
    </div>
  )
}

function AlertRemove({ remove, setRemove, messages, setMessages }) {
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    const response = await removeMessageAction(remove[1]);
    setLoading(false);
    if (response?.error) {
      return toast.error(response.message);
    }
    toast.success(response.message);
    setMessages(messages.filter(m => m.id !== remove[1]));
    setRemove([false, ""]);
  }
  return (
    <div
      onClick={() => { if (!loading) setRemove([false, ""]) }}
      className="fixed w-full h-screen top-0 left-0 flex items-center justify-center z-50 bg-black/40">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-2xl p-4 space-y-2 rounded-md">
        <h2 className="text-xl font-semibold">Are you sure</h2>
        <span className="font-semibold text-zinc-500">This will remove this message from our system</span>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button
            variant={"outline"}
            onClick={() => setRemove([false, ""])}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={handleRemove}
          >
            Continue
          </Button>
        </div>
      </div>

    </div>
  )
}

function Replies({ message, profile, user, setOpenReplies, messages, setMessages, setOpenImages }) {

  const [text, setText] = useState("");
  const [replies, setReplies] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [img, setImage] = useState(null);

  async function CreateReply() {
    let obj = { id: message.id };

    if (text?.trim() !== "") {
      const { error } = replySchema({ text });
      if (error) {
        return toast.error(error.details[0].message);
      }
      obj.text = text;
    } else {
      if (!img) {
        return toast.error("No faileds found to create reply");
      }
    }

    setLoading(true);
    let uploadedIMG = null;
    if (img) {
      uploadedIMG = await UploadImage(img);
      if (!uploadedIMG?.url || !uploadedIMG.publicid) {
        return toast.error("Failed to upload image, try again")
      }
    }

    if (uploadedIMG) { obj.image = uploadedIMG };
    const response = await createReplyAction(obj);
    setLoading(false);

    if (response?.error) {
      return toast.error(response.message);
    }

    setReplies([...replies, response.reply]);
    setMessages(messages.map(m => {
      if (m.id === message.id) {
        m.status = response.status
      }
      return m
    }))
    setText("");
    setImage(null)
  }

  useEffect(() => {
    async function fetchReplies() {
      const data = await getRepliesAction(message.id);
      if (data?.error) {
        return toast.error(data.message)
      }
      setReplies(data)
    }
    fetchReplies()
  }, [refresh]);

  return (
    <div
      onClick={() => { if (!loading) setOpenReplies([false, ""]) }}
      className="w-full fixed top-0 left-0 bg-black/40 h-screen flex items-center justify-center">

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-2xl p-4 pt-8 h-[80vh] flex flex-col bg-white rounded-md relative">
        <div
          onClick={() => {if(!loading)setOpenReplies([false,""])}}
          className={`absolute top-2.5 right-2.5 rounded-full w-7 h-7 bg-zinc-100 flex items-center justify-center cursor-pointer`}>
          <X className="text-red-600 hover:text-red-500" />
        </div>
        <div className='flex justify-between flex-wrap mt-3 gap-2 pb-2'>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            <div>
              <div className="flex items-center gap-2 flex-wrap-reverse">
                <span>Conversation</span>
                <Badge className={getStatusColor(message.status)}>
                  {message.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Support Chat</p>
            </div>
          </div>
          <Button
            variant="outline"
          >
            <RefreshCw
              onClick={() => setRefresh(refresh + 1)}
              className="h-4 w-4 cursor-pointer"
            />
            Refresh
          </Button>

        </div>

        <Separator />

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Original Message */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.image} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{profile?.id === user?.id ? "You" : profile?.name} </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                {message.question &&
                  <p className="text-sm">{message.question}</p>
                }
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
            const isCurrentUser = reply?.senderId === user?.id;
            const isAdmin = user?.role === 'admin' && profile?.id !== user?.id;

            return (
              <div
                key={reply?.id}
                className={`flex gap-3 ${isCurrentUser ? '' : 'flex-row-reverse'}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply?.sender?.image} alt={reply?.sender?.name} />
                  <AvatarFallback>
                    {isAdmin ? 'A' : reply?.sender?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                    <div className="flex items-center justify-between mb-1 flex-wrap-reverse">
                      <span className="font-semibold text-sm">
                        {isCurrentUser ? "You" : reply?.sender?.name}
                        {reply.sender.id !== profile?.id && <Badge className="ml-2 text-xs bg-emerald-600">Admin</Badge>}
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
        {message.status !== 'closed' ? (
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
              <Button
                onClick={CreateReply}
                disabled={!(text.trim() || img) || loading}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center font-semibold py-3 bg-zinc-100">
            This Conversation is now closed
          </div>
        )}

        {message.status === 'archived' && (
          <div className="bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-600">
            This conversation has been archived
          </div>
        )}
      </div>
    </div>
  )
}

function NewMessage({ setOPenNewMessage, messages, setMessages, page, setPage }) {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [img, setImage] = useState(null);

  async function handleCreateMessage() {
    let obj = { category };
    if (question?.trim() !== "") {
      obj.question = question
    } else {
      if (!img) {
        return toast.error("No faileds found to create message")
      }
    }
    const { error } = questionSchema(obj);
    if (error) {
      return toast.error(error.details[0].message)
    }
    setLoading(true);
    if (img) {
      if (!img.type.startsWith("image/")) {
        setLoading(false);
        return toast.error("accept image only");
      }
      if (img.size > (1024 * 1024 * 5)) {
        setLoading(false);
        return toast.error("image max size is 5mb");
      };
      const uploadedIMG = await UploadImage(img);
      if (!uploadedIMG?.url || !uploadedIMG?.publicid) {
        setLoading(false);
        return toast.error("Failed to upload image, try again");
      }
      obj.image = uploadedIMG;
    }

    const response = await createMessageAction(obj);
    setLoading(false);
    if (response?.error) {
      return toast.error(response.message);
    }
    if (page === 1) {
      setMessages([response, ...messages]);
    } else {
      setPage(1);
    }

    toast.success("message sent successfully");
    setOPenNewMessage(false);
  }

  return (
    <div
      onClick={() => { if (!loading) { setOPenNewMessage(false) } }}
      className="flex fixed justify-center items-center w-full top-0 left-0 z-50 bg-black/40 h-screen">

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-md w-xl p-4 relative">
        <div
          onClick={() =>{ if(!loading)setOPenNewMessage(false)}}
          className={`absolute top-3 right-3 rounded-full w-7 h-7 bg-zinc-100 flex items-center justify-center cursor-pointer`}>
          <X className="text-red-600 hover:text-red-500" />
        </div>

        <div>
          <h2 className='font-semibold text-xl'>Send New Message</h2>
          <span className="text-zinc-600">
            Send a message to our support team. We'll respond as soon as possible.
          </span>
        </div>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="category">
              Category <span className="text-red-500 text-xl">*</span>
            </Label>
            <Select name="category" value={category} required onValueChange={(e) => setCategory(e)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking_inquiry">Booking Inquiry</SelectItem>
                <SelectItem value="technical_support">Technical Support</SelectItem>
                <SelectItem value="cancellation">Cancellation/Refund</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="become_a_guide">Become a Guide</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">
              Question
            </Label>
            <Textarea
              id="question"
              placeholder="Describe your question or issue..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {!img &&
              <Button asChild variant={"outline"}>
                <label htmlFor="Image">
                  <ImageUp className="w-8 h-8 mr-2" />Image
                </label>
              </Button>
            }

            <input
              type="file"
              id="Image"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
            {img &&
              <div className="relative w-fit p-4">
                <Image
                  src={URL.createObjectURL(img)}
                  width={200}
                  height={200}
                  className="rounded-md"
                  alt="image"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100">
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            }
          </div>

          <div className="flex flex-col sm:flex-row  justify-end gap-2">
            <Button
              disabled={loading}
              variant="outline" onClick={() => setOPenNewMessage(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => { handleCreateMessage() }}
              disabled={!(question.trim() || img) || !category || loading}>

              {loading ?
                <span className="w-4 h-4 rounded-full border-white border-t-transparent border-2 animate-spin"></span>
                :
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

