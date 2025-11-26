"use server"
import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { editDateSchema } from "./tripDatesSchema";
import { sendCancelledDateMessage } from "@/shared/sendEmail";

export async function GetTripAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user.role !== "admin" && session?.user.role !== "guide") {
            return { error: true, message: "not allowed, access denied" }
        }

        const trip = await prisma.trip.findUnique({
            where: { id: +id },
            include: { images: true }
        });
        if (session?.user?.role === "guide") {
            if (trip?.guideid !== session?.user.id) {
                return { error: true, message: "not allowed, access denied" }
            }
        };
        return trip
    } catch (error) {
        return { error: true, message: "failed to fetch trip (server error), try again" }
    }
}

export async function getDatesAction(obj) {
    try {
        const session = await auth();

        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" };
        }

        if (session.user.role !== "admin" && session.user.role !== "guide") {
            return { error: true, message: "not allowed, access denied" };
        }
        const { id, page, date } = obj;

        const trip = await prisma.trip.findUnique({ where: { id } });
        if (!trip) {
            return { error: true, message: "trip not found" };
        }

        if (
            session.user.role !== "admin" &&
            !(session.user.role === "guide" && session.user.id === trip.guideid)
        ) {
            return { error: true, message: "not allowed, access denied" };
        }

        const dateCondition =
            date === "Upcoming"
                ? { gte: new Date() }
                : { lte: new Date() };


        const dates = await prisma.date.findMany({
            where: {
                tripid: id,
                date: dateCondition,
                cancelled:false
            },
            include: {
                bookings: true,
            }
            , take: 6, skip: (page - 1) * 6
        });

        const finalDates = dates.map(date => {
            const confirmedBookings = date.bookings.filter(b => b.status === "confirmed");
            const pendingBookings = date.bookings.filter(b => b.status === "pending");
            const rejectedBookings = date.bookings.filter(b => b.status === "rejected");

            const rejectedPeople = rejectedBookings.reduce((acc, cur) => acc + (cur.people || 0), 0);
            const confirmedPeople = confirmedBookings.reduce((acc, cur) => acc + (cur.people || 0), 0);
            const pendingPeople = pendingBookings.reduce((acc, cur) => acc + (cur.people || 0), 0);

            return {
                ...date,
                confirmedBookingsCount: confirmedBookings.length,
                rejectedBookingsCount: rejectedBookings.length,
                pendingBookingsCount: pendingBookings.length,
                confirmedPeople,
                pendingPeople, rejectedPeople
            };
        });

        return finalDates;
    } catch (error) {
        return { error: true, message: "failed to fetch dates (server error), try again" };
    }
}

export async function getBookingsAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) return { error: true, message: "Unauthorized, access denied" }
        if (session.user.role !== "admin" && session.user.role !== "guide") {
            return { error: true, message: "not allowed, access denied" }
        }

        const trip = await prisma.trip.findUnique({ where: { id: obj.tripid } });

        if (!trip) return { error: true, message: "trip not found, try again" };

        if (session.user.role === "guide" && trip.guideid !== session.user.id) {
            return { error: true, message: "not allowed, access denied" }
        };

        const bookings = await prisma.booking.findMany({
            where: { dateid: obj.dateid, status: obj.status },
            include: { user: { select: { name: true, email: true, phone: true, id: true } } }
        });
        let finalBookings = bookings
        if (session.user.role === "guide") {
            finalBookings = finalBookings.map(book => {
                if (book.status !== "confirmed") {
                    book.user.email = "user_booking_email@example.com"
                    book.user.phone = "(+20) 2-XXXX-XXXX"
                }
                return book
            })
        }
        return finalBookings
    } catch (error) {
        return { error: true, message: "failed to fetch bookings (server error), try again" }
    }
}

export async function countDatesAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" };
        }
        const trip = await prisma.trip.findUnique({ where: { id: obj.id } });

        if (!trip) {
            return { error: true, message: "trip not found" };
        };

        if (
            (session.user.role !== "admin" && session.user.role !== "guide")
            || (session.user.role === "guide" && session.user.id !== trip.guideid)
        ) {
            return { error: true, message: "not allowed, access denied" };
        };

        const selectedDate = obj.date === "Upcoming" ? { gte: new Date() } : { lte: new Date() }

        const count = await prisma.date.count({
            where: {
                tripid: obj.id,
                date: selectedDate,cancelled:false
            }
        });

        return count;
    } catch (error) {
        return { error: true, message: "failed to count dates (server error), try again" };
    }
}

export async function toggleDateAction({ id, banned }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }
        const date = await prisma.date.findUnique({ where: { id } });
        if (!date) {
            return { error: true, message: "date not found" }
        }

        await prisma.date.update({
            where: { id },
            data: {
                banned: date.banned ? false : true
            }
        });
        return { success: true, banned: !date.banned, message: `date ${date.banned ? "Un-banned" : "Banned"} successfully` }
    } catch (error) {
        return { error: true, message: `failed to ${banned ? "Un-Ban" : "Ban"} this date` }
    }
}

export async function editDateAction({ id, obj }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.banned || admin?.isDeleted || admin?.role !== "admin") {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        if (!obj?.date && !obj?.maxpeople) {
            return { error: true, message: "No valid fields provided for update (date or maxpeople required)" }
        }

        const { error } = editDateSchema(obj);
        if (error) return { error: true, message: error.details[0].message };


        await prisma.$transaction(async (trx) => {
            const date = await trx.date.findUnique({ where: { id } });
            if(!date){
                throw new Error("Date not found")
            }

            if (date.cancelled) {
                throw new Error("This date is cancelled before")
            }
            if(new Date(date.date) < new Date()){
                throw new Error("Cannot edit a date that already passed")
            }
                 
            if (obj.date) {

                if (((new Date(obj.date) - new Date()) / 3600000) < 48 && new Date(obj.date).getTime() !== new Date(date.date).getTime()) {
                    throw new Error("the new date must be at least 48 hours ahead of now");
                }

                const confirmedBooking = await trx.booking.findFirst({
                    where: { dateid: id, status: "confirmed" }
                });
                if (confirmedBooking) {
                    const diffHours = Math.abs((new Date(obj.date) - new Date(date.originalDate)) / 3600000);
                    if (diffHours > 72) {
                        throw new Error("maximum allowed difference is 3 days between old and new date");
                    }
                }
            }

            await trx.date.update({
                where: { id },
                data: {
                    ...obj
                }
            })
        });
        return { success: true, message: "updated successfully" }
    } catch (error) {
        return { error: true, message: error.message || "failed to update this date (server error), try again" }
    }
}

export async function dateCancelledAction({id}){
    try{
        const session = await auth();
        if(!session?.user){
            return {error:true, message:"Unauthorized, access denied"}
        }
        if(session.user.role!=="admin" || session.user.banned || session.user.isDeleted){
            return {error:true, message:"Not allowed, access denied"}
        }else {
            const admin = await prisma.user.findUnique({
                where:{id:session.user.id}
            });
            if(!admin || admin?.role!=="admin" || admin?.banned || admin?.isDeleted){
                return {error:true, message:"Noot allowed, access denied"}
            }
        }
        let users=[];
        let trip;
        let DATE;
        await prisma.$transaction(async (trx)=>{
            const date = await trx.date.findUnique({
                where:{id},include:{trip:true}
            });
            if(!date){
                throw new Error("Date not found")
            }
            
            if(new Date(date.date) < new Date() || date.cancelled){
                throw new Error("Can't cancel this date")
            }
            DATE = new Date(date.date).toLocaleDateString()
            trip = date.trip.title
            const confirmedBookings = await trx.booking.findMany({
                where:{dateid:id,status:"confirmed"}
            });
            
            if(confirmedBookings.length>0){
                const confirmedBookingIds = confirmedBookings.map(b=>b.id);
                await trx.booking.updateMany({
                    where:{id:{in:confirmedBookingIds}},
                    data:{
                        status:"rejected"
                    }
                });
                const transactions = await trx.transactions.findMany({
                    where:{bookingid:{in:confirmedBookingIds}},
                    include:{user:true}
                });
                
                for(let i=0 ; i<transactions.length ;i++){
                    await trx.user.update({
                        where:{id:transactions[i].user.id},
                        data:{
                            wallet:{increment:transactions[i].amount}
                        }
                    });
                   
                    await trx.transactions.create({
                        data:{
                            type:"booking_refund",
                            adminNotes:"date cancelled",
                            bookingid:transactions[i].bookingid,
                            amount:transactions[i].amount,
                            userId:transactions[i].user.id,
                            adminId:session.user.id,
                            status:"approved"
                        }
                    })
                    users.push({name:transactions[i].user.name,email:transactions[i].user.email})
                }
            }

            const pendingBookings = await trx.booking.findMany({
                where:{dateid:id,status:"pending"},
                include:{transaction:true}
            });
            if(pendingBookings.length>0){
                const pendingBookingsIds = pendingBookings.map(b=>b.id);
                await trx.booking.updateMany({
                    where:{id:{in:pendingBookingsIds}},
                    data:{status:"rejected"}
                });
                await trx.transactions.updateMany({
                    where:{bookingid:{in:pendingBookingsIds}},
                    data:{status:"rejected", adminNotes:"cancelled date"}
                })
            }
            await trx.date.update({
                where:{id},
                data:{cancelled:true, banned:true}
            })
        });

        for (let i=0;i<users.length;i++){
            await sendCancelledDateMessage({trip,date:DATE,email:users[i].email,name:users[i].name})
        }
        return {success :true, message:"cancelled successfully"}
        
    }catch(error){
        return {error:true, message:error.message || "failed to cancel this date (server error), try again"}
    }
}