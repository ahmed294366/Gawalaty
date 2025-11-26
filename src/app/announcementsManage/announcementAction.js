"use server"
import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { announceSchema } from "./announceSchema";

export async function createAnnounceAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const {error} = announceSchema(obj);
        if(error){
            return {error:true, message:error.details[0].message}
        }

        const data = {
            description:obj.description,
            expiresAt:new Date(obj.expiresAt), 
            adminId:session.user.id};

        if(obj.trip){data.tripId = obj.trip};
        if(obj.title){data.title = obj.title};



        const announce = await prisma.announcements.create({
            data,include:{trip:data.tripId?true:false}
        });

        return announce
    } catch (error) {
        return { error: true, message: "Failed to create announcement (server error), try again" }
    }
}

export async function getAnnouncementAction(page){
    try{
        const announcements = await prisma.announcements.findMany({
            orderBy:{createdAt:"desc"},include:{trip:true},
            take:6,skip:((page-1)*6)
        });
        return announcements
    }catch(error){
        return {error:true, message:"failed to fetch Announcements (server error), try again"}
    }
}

export async function getAnnouncementsCountAction(){
    try{
        const items = await prisma.announcements.count();
        return items
    }catch(error){
        return {error:true, message:"Failed to fetch announcements (server error), try again"}
    }
}

export async function removeAnnouncementAction(id){
    try{
        const session = await auth();
        if(!session?.user){
            return {error:true, message:"Unauthorized, access denied"}
        }
        if(session.user.role!=="admin"){
            return {error:true, message:"Not allowed, access denied"}
        }else {
            const admin = await prisma.user.findUnique({
                where:{id:session.user.id}
            });
            if(!admin || admin?.role!=="admin" || admin?.banned || admin?.isDeleted){
                return {error:true, message:"Not alllowed, access denied"}
            }
        }
        const announcement = await prisma.announcements.findUnique({
            where:{id}
        });
        if(!announcement){
            return {error:true, message:"Announcement not found"}
        }
        await prisma.announcements.delete({
            where:{id}
        });
        return {success:true, message:"Removed successfully"}
    }catch(error){
        return {error:true, message:"Failed to remove announcement (server error), try again"}
    }
}

export async function toggleAnnouncementAction(id){
    try{
        const session = await auth();
        if(!session?.user){
            return {error:true, message:"Unauthorized, access denied"}
        }
        if(session.user.role!=="admin"){
            return {error:true, message:"Not allowed, access denied"}
        }else{
            const admin = await prisma.user.findUnique({
                where:{id:session.user.id}
            });

            if(!admin || admin?.banned || admin?.isDeleted || admin?.role!=="admin"){
                return {error:true, message:"Not allowed, access denied"}
            }
        }
        const announcement = await prisma.announcements.findUnique({
            where:{id}
        });
        if(!announcement){
            return {error:true, message:"Announcement not found"}
        }
        await prisma.announcements.update({
            where:{id},
            data:{show:!announcement.show}
        });
        return {success:true, show:!announcement.show}
    }catch(error){
        return {error:true, message:"Failed to toggle announcement (server error), access denied"}
    }
}

export async function getTripsAction(categoryid){
    try{
        const trips = await prisma.trip.findMany({
            where:{categoryid, banned:false}
        });
        return trips;
    }catch(error){
        return {error:true, message:"Failed to fetch trips (server action) ,try again"}
    }
}
