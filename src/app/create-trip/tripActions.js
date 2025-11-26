"use server"

import { prisma } from "@/utils/prisma"
import { CreateTripSchema, CreatedImageSchema } from "./tripSchema";
import { auth } from "@/auth";
import { RemoveImages } from "@/shared/ServerAction";
export async function CreateTripAction({ obj, UploadedImages }) {
    try {
        const session = await auth();
        if (!session?.user) {
            await RemoveImages(UploadedImages)
            return { error: true, message: "Unauthorized, access denied" }
        }
        const { error } = CreateTripSchema(obj);
        if (error) {
            await RemoveImages(UploadedImages);
            return { error: true, message: error.details[0].message }
        }
        
        if (session.user.role !== "guide" || session.user.banned || session.user.isDeleted) {
            await RemoveImages(UploadedImages)
            return { error: true, message: "not allowed, access denied" }
        } else {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!user || user?.banned || user.isDeleted || user?.role !== "guide") {
                await RemoveImages(UploadedImages);
                return { error: true, message: "not allowed, access denied" }
            }
        }


        const err = CreatedImageSchema(UploadedImages);
        if (err?.error) {
            await RemoveImages(UploadedImages);
            return { error: true, message: err.error.details[0].message }
        }

        let trip;
        await prisma.$transaction(async (trx) => {
            trip = await trx.trip.create({
                data: {
                    title: obj.title,
                    description: obj.description,
                    duration: obj.duration,
                    location: obj.location,
                    meetingPlace: obj.meetingPlace,
                    guideid: session.user.id,
                    categoryid: obj.category,
                    price: obj.price
                }
            });
            await trx.timages.createMany({
                data: UploadedImages.map(img => (
                    {
                        tripid: trip.id,
                        publicid: img.publicid,
                        url: img.url
                    }
                ))
            });
        })

        return { id: trip.id }

    } catch (error) {
        await RemoveImages(UploadedImages);
        return { error: true, message: "Failed to create this trip (server error), try again" }
    }
}