"use server"
import { prisma } from "@/utils/prisma";
import { RemoveCloudImages } from "@/utils/serverActions";
import { ReportSchema, UpdateTripSchema, CreateDateSchema, CreateBookingSchema, RateSchema } from "./tripSchema"
import { auth } from "@/auth";
import { RemoveImages } from "@/shared/ServerAction";

//alerts
export async function BannedReviewAction({ id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }
        const review = await prisma.reviews.findUnique({ where: { id } });
        if (!review) {
            return { error: true, message: "review not found" }
        }
        await prisma.reviews.update({
            where: { id },
            data: {
                banned: !review.banned
            }
        });
        return { success: true, message: review?.banned ? "un-banned succcessfully" : "banned successfully" }
    } catch (error) {
        return { error: true, message: "failed to ban this review (server error), try again" }
    }
}

export async function DeleteReviewAction({ id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }
        const review = await prisma.reviews.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, image: true }
                },
                images: true
            }
        });

        if (!review) {
            return { error: true, message: "review not found" }
        }

        const publicids = review.images.map(rev => rev.publicid);
        if (publicids.length > 0) {
            await RemoveCloudImages(publicids);
        }
        await prisma.reviews.delete({
            where: { id }
        });

        return { success: true, message: "Deleted successfully" };
    } catch (error) {
        return { error: true, message: "failed to delete review (server error), try again" }
    }
}

export async function ResetReviewAction({ id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, mesaage: "Unauthorized, access denied" }
        }
        if (user.banned) {
            return { error: true, message: "your account had been banned from the admin" }
        } else {
            const DBuser = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!DBuser || DBuser.banned || DBuser.isDeleted) {
                return { error: true, message: "you cant reset you reviews now" }
            }
        }
        const review = await prisma.reviews.findUnique({
            where: { id },
            include: {
                images: true,
                user: {
                    select: {
                        id: true, name: true, image: true
                    }
                }
            }
        });
        if (review.userid !== session.user.id) {
            return { error: true, message: "not allowed, access denied" }
        }
        if (review.banned) {
            return { error: true, message: "this review had been banned from admin" }
        }

        const imagesid = review.images.map(img => img.publicid);
        await RemoveCloudImages(imagesid);
        await prisma.reviewImage.deleteMany({
            where: { reviewid: review.id }
        });
        const newreview = await prisma.reviews.update({
            where: { id },
            data: {
                comment: ""
            }
        });
        newreview.images = [];
        newreview.user = review.user
        return newreview
    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}

export async function ReportAction(obj) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (user.banned || user.isDeleted) {
            return { error: true, message: "you cant report reviews now" }
        } else {
            const DBuser = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (DBuser.banned) {
                return { error: true, message: "you cant report reviews now" }
            }
        }
        const { error } = ReportSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }

        const report = await prisma.reports.findFirst({
            where: { userid: user.id, reviewid: obj.reviewid }
        });
        if (report) {
            await prisma.reports.update({
                where: { id: report.id },
                data: {
                    text: obj.text
                }
            })
            return { message: "report updated successfully" }
        } else {
            await prisma.reports.create({
                data: {
                    userid: user.id,
                    reviewid: obj.reviewid,
                    text: obj.text
                }
            });
            return { message: "report created successfully, admin will read your report" }
        }
    } catch (error) {
        return { error: true, message: "failed while create report (server error), try again" }
    }
}

//controllers
export async function banTripAction({ id, banned }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }

        const updated = await prisma.trip.update({
            where: { id },
            data: { banned: !banned }
        });
        return { success: true, message: `trip ${updated.banned ? "banned" : "unbanned"} successfully`, banned: updated.banned }
    } catch (error) {
        return { error: true, message: "internal server error, try again" }
    }
}

//edit-components
export async function UpdateReviewAction({ obj, imagespublicIds, uploadedImages, currentEditingReview }) {
    try {
        const session = await auth();

        if (!session?.user) {
            await RemoveImages(uploadedImages)
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (!obj?.comment && imagespublicIds.length === 0 && !uploadedImages) {
            return currentEditingReview
        }
        if (obj?.comment) {
            if (typeof obj.comment !== "string") {
                await RemoveImages(uploadedImages)
                return { error: true, message: "comment must be string" }
            }
        }

        const review = await prisma.reviews.findUnique({ where: { id: obj.id } });
        if (!review) {
            await RemoveImages(uploadedImages);
            return { error: true, message: "review not found" }
        }
        if (review.userid !== session.user.id) {
            await RemoveImages(uploadedImages)
            return { error: true, message: "not allowed, access denied" }
        }
        if (review.banned) {
            await RemoveImages(uploadedImages)
            return { error: true, message: "admin had been ban this review, you cant update it now" }
        }
        if (session.user.banned) {
            await RemoveImages(uploadedImages)
            return { error: true, message: "you cant update this review now" }

        } else {
            const DBuser = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (!DBuser || DBuser.banned) {
                await RemoveImages(uploadedImages);
                return { error: true, message: "you cant update this review now" }
            }
        }
        if (imagespublicIds?.length > 0) {
            await prisma.reviewImage.deleteMany({
                where: {
                    publicid: { in: imagespublicIds }
                }
            })
            await RemoveCloudImages(imagespublicIds)
        }
        if (uploadedImages) {
            await prisma.reviewImage.createMany({
                data: uploadedImages.map(img => {
                    return {
                        publicid: img.publicid,
                        url: img.url,
                        reviewid: review.id,
                        tripid: review.tripid
                    }
                })
            })
        }
        if (obj?.comment) {
            await prisma.reviews.update({
                where: { id: obj.id },
                data: {
                    comment: obj.comment
                }
            })
        }
        const UpdatedReview = await prisma.reviews.findUnique({
            where: { id: obj.id },
            include: {
                images: true,
                user: {
                    select: {
                        id: true, name: true, image: true
                    }
                },
            }
        });
        return UpdatedReview
    } catch (error) {
        RemoveImages(uploadedImages)
        return { error: true, message: "internal server error" }
    }
}

export async function UpdateTripAction({ id, obj, imagespublicIds, newImages, featureToAdd, featureToDelete}) {
    try {
        const session = await auth();
        if (!session?.user) {
            await RemoveImages(newImages)
            return { error: true, message: "unauthorized ,access denide" }
        }
        if (session.user.role !== "admin" || session.user.banned) {
            await RemoveImages(newImages)
            return { error: true, message: "not allowed, access denide" }
        }

        const { error } = UpdateTripSchema(obj);
        if (error) {
            await RemoveImages(newImages)
            return { error: true, message: error.details[0].message }
        }

        if (Object.keys(obj).length <= 0 && newImages.length <= 0 && imagespublicIds.length <= 0 && featureToAdd.length===0 && featureToDelete.length===0) {
            return { error: true, message: "no fields found to update" }
        }

        let object;
        if (obj.category) {
            const { category, ...rest } = obj
            object = { ...rest, categoryid: obj.category }
        } else {
            object = obj
        }

        await prisma.$transaction(async (trx) => {
            const trip = await trx.trip.findUnique({
                where: { id }
            })
            if (!trip) throw new Error("trip not found");
            const userDB = await trx.user.findUnique({
                where: { id: session.user.id }
            });
            if (!userDB || userDB?.isDeleted || userDB?.banned || userDB?.role !== "admin") {
                throw new Error("not allowed, access denied")
            }
            if (newImages?.length > 0) {
                await trx.timages.createMany({
                    data: newImages.map(img => {
                        return {
                            tripid: id,
                            publicid: img.publicid,
                            url: img.url
                        }
                    })
                });
            }
            await prisma.trip.update({
                where: { id },
                data: object
            });

            if(featureToDelete.length>0){
                await prisma.tripFeatures.deleteMany({
                    where:{
                        tripId:id,
                        featureId:{in:featureToDelete}
                    }
                })
            }

            if (featureToAdd.length > 0) {
                await prisma.tripFeatures.createMany({
                    data: featureToAdd.map(fId => {
                        return ({
                            tripId: id,
                            featureId: fId
                        })
                    })
                })
            }
            

        })

        if (imagespublicIds?.length > 0) {
            await RemoveCloudImages(imagespublicIds);
            await prisma.timages.deleteMany({
                where: { publicid: { in: imagespublicIds } }
            })
        }

        let tripObj = {
            where: { id },
            select: {
                id: true, category: object?.categoryid ? true : false,
                images: (imagespublicIds?.length > 0 || newImages?.length > 0) ? true : false, title: true, description: true, price: true
                , duration: true, location: true, guide: object.guide ? true : false
                , meetingPlace: true,features:(featureToAdd?.length>0 ||featureToDelete.length>0)?true:false
            }
        }

        const UpdatedTrip = await prisma.trip.findUnique(tripObj);
        return UpdatedTrip;
    } catch (error) {
        await RemoveImages(newImages)
        return { error: true, message: error.message || "failed to update this trip (server error), try again" }
    }
}
//page
export async function getTripAction(id) {
    try {
        const session = await auth();
        const user = session?.user
        const date = { gte: user?.role === "admin" ? new Date() : new Date(Date.now() + (1000 * 60 * 60 * 48)) }
        const trip = await prisma.trip.findUnique({
            where: { id },
            include: {
                guide: {
                    select: {
                        name: true,
                        id: true,
                        image: true,
                        languages: { include: { language: true } },
                        guideReviewsAsGuide: true
                    }
                },
                dates: {
                    where: { banned: false, date }
                },
                reviews: {
                    where: { banned: false },
                    include: {
                        user: {
                            select: { name: true, id: true, image: true },

                        }
                        , images: true
                    }, orderBy: {
                        createdAt: "desc"
                    }
                },
                features: true,
                images: true,
                category: true
            }
        });
        if (trip.banned && session?.user?.role !== "admin") {
            return { hidden: true, message: "This Trip Is Not Available Now" }
        }
        return trip
    } catch (error) {
        return { error: true, message: "failed to fetch this trip (server error), try again" }
    }
}

export async function getGuidesAction() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized ,access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed ,access denied" }
        }
        const guides = await prisma.user.findMany({
            where: { role: "guide" },
            select: { name: true, id: true, }
        });
        return guides
    } catch (error) {
        return { error: true, message: "failed to fetch guides (server error), try again" }
    }
}
//trip-details
export async function CreateDateAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role!=="guide" || session.user.banned || session.user.isDeleted) {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (!user || user?.banned || user.isDeleted || user.role!=="guide") {
                return { error: true, message: "you are now banned, call the admin" }
            }
        }
        const trip = await prisma.trip.findUnique({ where: { id: obj.tripid } });
        if (!trip || trip?.guideid !== session.user.id) {
            return { error: true, message: "Not allowed ,access denide" }
        }
        if (trip.banned) {
            return { error: true, message: "trip is now banned" }
        }
        const { error } = CreateDateSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }

        const tripDate = new Date(obj.date);
        const dateNow = new Date(Date.now());
        if (tripDate - dateNow < (1000 * 60 * 60 * 48)) {
            return { error: true, message: "Created Date is Less Than 48 Hours" }
        }
        const newDate = await prisma.date.create({
            data: {
                date: tripDate,
                maxpeople: +obj.maxPeople,
                tripid: obj.tripid,
                originalDate:tripDate
            }
        });
        return newDate
    } catch (error) {
        return { error: true, message: "failed to create this date, (server error) ,try again" }
    }
}

export async function CreateBookAction(obj) {
    try {
        const session = await auth();
        const user = session?.user
        if (!user) {
            return { error: true, message: "Unauthorized, access denied" }
        }

        const { error } = CreateBookingSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }

        await prisma.$transaction(async (trx) => {
            const user = await trx.user.findUnique({
                where: { id: session.user.id },
            });
            if (!user) throw new Error("user not found");
            if (user.isDeleted) { throw new Error("this account is deleted before") }
            if (user.banned) { throw new Error("cant create booking, admin have been banned this account") }


            const trip = await trx.trip.findUnique({
                where: { id: obj.tripid }
            });
            if (!trip) throw new Error("Trip not found")
            if (trip.banned) throw new Error("This trip is not available now")

            const date = await trx.date.findUnique({ where: { id: obj.dateid } });
            if (!date) throw new Error("Date not found");
            if (date.banned || date.isDeleted || date.cancelled) throw new Error("This date is not available now");

            if (new Date(date.date) <= new Date()) {
                throw new Error("Not available, cant book this date")
            }

            const diffHours = (new Date(date.date) - new Date()) / (1000 * 60 * 60);
            if (diffHours < 48 && user.role !== "admin") {
                throw new Error("Not available, cant book this date")
            }
            
            if(date.maxpeople < obj.people){
                throw new Error(`Maximum number of places available for booking id ${date.maxpeople}`)
            }

            if (user.wallet.lt((obj.people * trip.price))) {
                throw new Error("Your wallet is not enough to create this booking")
            }

            const isBooking = await trx.booking.findFirst({
                where: { userid: user.id, dateid: date.id, status: { in: ["pending", "confirmed"] } }
            })
            if (isBooking && user.role!=="admin") {
                throw new Error("This date booked before, cant book again")
            }

            

            const booking = await trx.booking.create({
                data: {
                    people: obj.people,
                    dateid: obj.dateid,
                    userid: session.user.id,
                    tripid: trip.id
                }
            });
            await trx.date.update({
                where:{id:obj.dateid},
                data:{
                    maxpeople:{decrement:obj.people}
                }

            });
            await trx.transactions.create({
                data: {
                    userId: session.user.id,
                    bookingid: booking.id,
                    type: "booking_deduct",
                    amount: (booking.people * trip.price)
                }
            });
        })

        return { success: true, message: "Your booking request is on way to approve by admin" }
    } catch (error) {
        return { error: true, message: error.message || "Failed to create booking ,try again" }
    }
}

export async function WashListAction(tripid) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "unauthorized ,aaccess denide" }
        }
        const isWished = await prisma.wishlist.findFirst({
            where: { userid: session.user.id, tripid }
        });
        if (!isWished) {
            await prisma.wishlist.create({
                data: {
                    tripid,
                    userid: session.user.id
                }
            });
            return { success: true, message: "add to wishlist successfully", wish: true }
        } else {
            await prisma.wishlist.delete({
                where: { id: isWished.id }
            });
            return { success: true, message: "removed from wishlist", wish: false }
        }
    } catch (error) {
        return { error: true, message: "failed to add this trip to wishlist (server error), try agin" }
    }
}

export async function CreateReviewAction({ obj, images }) {
    try {

        const session = await auth();
        if (!session?.user) {
            await RemoveImages(images)
            return { error: true, message: "unauthorized ,access denide" }
        }
        const { error } = RateSchema(obj);
        if (error) {
            await RemoveImages(images)
            return { error: true, message: error.details[0].message }
        }
        const ifReview = await prisma.reviews.findFirst({ where: { userid: session.user.id, tripid: obj.tripid } });

        if (ifReview) {
            await RemoveImages(images)
            return { error: true, message: "You can only review trip once" }
        }
        if (session.user.banned) {
            await RemoveImages(images);
            return { error: true, message: "you cant now rate trips ,call the admin" }
        } else {
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (user?.banned) {
                await RemoveImages(images)
                return { error: true, message: "you cant now rate trips ,call the admin" }
            }
        }

        const review = await prisma.reviews.create({
            data: {
                comment: obj.comment,
                rate: obj.rate,
                userid: session.user.id,
                tripid: obj.tripid
            }
        })
        if (images) {
            await prisma.reviewImage.createMany({
                data: images.map(img => {
                    return {
                        reviewid: review.id,
                        publicid: img.publicid,
                        url: img.url,
                        tripid: obj.tripid
                    }
                })
            })
        }
        const Review = await prisma.reviews.findUnique({
            where: { id: review.id },
            include: {
                images: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
            }
        })
        return Review
    } catch (error) {
        return { error: true, message: "failed to create review (server error), try again" }
    }
}