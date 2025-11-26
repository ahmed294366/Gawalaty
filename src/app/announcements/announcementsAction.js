"use server";

import { prisma } from "@/utils/prisma";

export async function getAnnouncementsAction(){
    try{
        const announcements = await prisma.announcements.findMany({
            where:{show:true, expiresAt:{gte:new Date()}},
            include:{trip:true},
            orderBy:{createdAt:"desc"}
        });
        return announcements
    }catch(error){
        return {error:true, message:"Failed to fetch announcements, try again"}
    }
}