"use server"
import { auth } from "@/auth"
import { prisma } from "@/utils/prisma";
import { RemoveCloudImages } from "@/utils/serverActions";
import { approveBookingMessage } from "./sendEmail";

export async function GetTripsCountServerAction({ category }) {
  try {
    let count;

    const categoryNumber = parseInt(category);
    const isValidCategory = !isNaN(categoryNumber);

    if (isValidCategory) {
      count = await prisma.trip.count({
        where: { categoryid: categoryNumber, banned: false },
      });
    } else {
      count = await prisma.trip.count({
        where: { banned: false },
      });
    }

    return count;

  } catch (error) {
    return { error: true, message: "internal server error" };
  }
}

export async function GetTripsServerAction({ category, sort, page }) {
  try {
    const pageSize = 6;
    const skip = (page - 1) * pageSize || 0;
    let trips;

    if (isNaN(parseInt(category))) {
      category = false;
    } else {
      category = +category;
    }

    if (sort && category) {
      if (sort === "highest-rated") {
        trips = await prisma.$queryRaw`
          SELECT t.*,
                 COALESCE(AVG(r.rate), 0) AS "avgRate",
                 JSON_BUILD_OBJECT('id', c.id, 'name', c.name) AS category,
                 COALESCE(
                   JSON_AGG(
                     JSON_BUILD_OBJECT(
                       'id', r.id,
                       'rate', r.rate,
                       'comment', r.comment,
                       'userid', r.userid,
                       'createdAt', r."createdAt"
                     )
                   ) FILTER (WHERE r.id IS NOT NULL), '[]'
                 ) AS reviews,
                 COALESCE(
                   JSON_AGG(
                     JSON_BUILD_OBJECT(
                       'id', i.id,
                       'url', i.url,
                       'publicid', i.publicid
                     )
                   ) FILTER (WHERE i.id IS NOT NULL), '[]'
                 ) AS images
          FROM "Trip" t
          LEFT JOIN "Categories" c ON t.categoryid = c.id
          LEFT JOIN "Reviews" r ON r.tripid = t.id
          LEFT JOIN "Timages" i ON i.tripid = t.id
          WHERE t.categoryid = ${category} AND t.banned = false
          GROUP BY t.id, c.id
          ORDER BY "avgRate" DESC
          LIMIT ${pageSize} OFFSET ${skip};
        `;
      } else {
        trips = await prisma.trip.findMany({
          where: { categoryid: category, banned: false },
          include: { reviews: true, images: true, category: true, wishlist: true },
          orderBy:
            sort === "price-low-high"
              ? { price: "asc" }
              : sort === "price-high-low"
              ? { price: "desc" }
              : sort === "most-popular"
              ? { wishlist: { _count: "desc" } }
              : { createdAt: "desc" },
          take: pageSize,
          skip,
        });
      }

    } else if (sort && !category) {

      if (sort === "highest-rated") {
        trips = await prisma.$queryRaw`
          SELECT t.*,
                 COALESCE(AVG(r.rate), 0) AS "avgRate",
                 JSON_BUILD_OBJECT('id', c.id, 'name', c.name) AS category,
                 COALESCE(
                   JSON_AGG(
                     JSON_BUILD_OBJECT(
                       'id', r.id,
                       'rate', r.rate,
                       'comment', r.comment,
                       'userid', r.userid,
                       'createdAt', r."createdAt"
                     )
                   ) FILTER (WHERE r.id IS NOT NULL), '[]'
                 ) AS reviews,
                 COALESCE(
                   JSON_AGG(
                     JSON_BUILD_OBJECT(
                       'id', i.id,
                       'url', i.url,
                       'publicid', i.publicid
                     )
                   ) FILTER (WHERE i.id IS NOT NULL), '[]'
                 ) AS images
          FROM "Trip" t
          LEFT JOIN "Categories" c ON t.categoryid = c.id
          LEFT JOIN "Reviews" r ON r.tripid = t.id
          LEFT JOIN "Timages" i ON i.tripid = t.id
          WHERE t.banned = false
          GROUP BY t.id, c.id
          ORDER BY "avgRate" DESC
          LIMIT ${pageSize} OFFSET ${skip};
        `;
      } else {
        trips = await prisma.trip.findMany({
          where: { banned: false },
          include: { reviews: true, images: true, category: true, wishlist: true },
          orderBy:
            sort === "price-low-high"
              ? { price: "asc" }
              : sort === "price-high-low"
              ? { price: "desc" }
              : sort === "most-popular"
              ? { wishlist: { _count: "desc" } }
              : { createdAt: "desc" },
          take: pageSize,
          skip,
        });
      }

    } else if (!sort && category) {
      trips = await prisma.trip.findMany({
        where: { categoryid: category, banned: false },
        include: { reviews: true, images: true, category: true, wishlist: true },
        take: pageSize,
        skip,
        orderBy: { createdAt: "desc" },
      });

    } else {
      trips = await prisma.trip.findMany({
        where: { banned: false },
        include: { reviews: true, images: true, category: true, wishlist: true },
        take: pageSize,
        skip,
        orderBy: { createdAt: "desc" },
      });
    }

    return trips;

  } catch (error) {
    return { error: true, message: "internal server error" };
  }
}

export async function ConfirmBookingAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" };
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" };
        }

        let email; 
        let trip;
        let date;
        let total;
        await prisma.$transaction(async (trx) => {
            const admin = await trx.user.findUnique({
                where: { id: session.user.id },
            });
            if (!admin || admin?.isDeleted || admin?.banned || admin?.role !== "admin") {
                throw new Error("Not allowed, access denied");
            }

            const booking = await trx.booking.findUnique({
                where: { id },
                include: { user: true, date: true, trip: true },
            });

            if (!booking) throw new Error("booking not found");

            if (booking.trip.banned) throw new Error("trip is now banned");
            if (booking.status !== "pending")
                throw new Error(`this booking is ${booking.status} before`);
            if (booking.user.banned) throw new Error("this user is now banned");

            if (booking.user.isDeleted)
                throw new Error("this user account is deleted before");

            if (booking.date.banned) throw new Error("date is now banned");

            if (booking.date.cancelled)
                throw new Error("this date is not available");

            const transaction = await trx.transactions.findFirst({
                where: { bookingid: booking.id },
            });

            if (!transaction) throw new Error("Transaction not found");

            if (transaction.amount.gt(booking.user.wallet) ) {
                throw new Error("user wallet is not enough to confirm this booking");
            }

            await trx.user.update({
                where: { id: booking.user.id },
                data: { wallet: { decrement: booking.trip.price * booking.people } },
            });

            await trx.booking.update({
                where: { id },
                data: { status: "confirmed" },
            });

            await trx.transactions.update({
                where: { id:transaction.id},
                data: { status: "approved" },
            });

            total = transaction.amount
            email = booking.user.email;
            trip = booking.trip.title;
            date = new Date(booking.date.date).toLocaleDateString()

        });
        await approveBookingMessage({email, trip, date, total})

        return { success: true, message: "confirmed successfully" };
    } catch (error) {
        return {
            error: true,
            message:
                error.message ||
                "failed to confirm this booking (server error), try again"
        };
    }
}

export async function rejectBookingAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role != "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }
        await prisma.$transaction(async (trx) => {

            const admin = await trx.user.findUnique({
                where: { id: session.user.id }
            });

            if (!admin || admin?.isDeleted || admin?.banned || admin?.role !== "admin") {
                throw new Error("Not allowed, access denied")
            }

            const booking = await trx.booking.findUnique({
                where: { id }
            });

            if (!booking) {
                throw new Error("Booking not found")
            }

            if (booking.status !== "pending") {
                throw new Error(`This booking is ${booking.status} before`)
            }

            await trx.booking.update({
                where: { id },
                data: {
                    status: "rejected"
                }
            });
            
            await trx.transactions.updateMany({
                where: { bookingid: booking.id },
                data: {
                    status: "rejected"
                }
            });

            await trx.date.update({
              where:{id:booking.dateid},
              data:{
                maxpeople:{increment:booking.people}
              }
            });

        })
        return { success: true, message: "Rejected successfully" }
    } catch (error) {
        return { error: true, message: error.message || "Failed to reject this booking (server error), try again" }
    }
}

export async function DeleteUserAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" };
        }

        const user = await prisma.user.findUnique({
          where:{id:session.user.id}
        });

        if(!user || user.isDeleted){
          return {error:true, message:"Account not found"}
        }

        if (user.id !== id && ( user.role !== "admin" || user.banned)) {
            return { error: true, message: "not allowed, access denied" }
        }

        await prisma.$transaction(async (trx) => {
            const deletedUser = await trx.user.findUnique({
                where: { id }
            });

            if (!deletedUser || deletedUser?.isDeleted) {
                throw new Error("user not found")
            }

            if (deletedUser.id === session.user.id) {
                if (deletedUser.banned) {
                    throw new Error("admin have been banned this account, cant delete it now")
                }
                if (deletedUser.role === "guide") {
                    throw new Error("cant delete your account, contact admin")
                }else if (deletedUser.role === "admin") {
                    const admins = await trx.user.count({ where: { role: "admin" } });
                    if (admins === 1) {
                        throw new Error("you are the only admin found, cant delete this account now")
                    }
                }
            }

            const confirmedBooking = await trx.booking.count({
                where: { userid: id, status: "confirmed", date: { date: { gte: new Date() } } }
            });
            
            if (confirmedBooking > 0) {
                throw new Error(`${confirmedBooking} confirmed booking(s) found, cant delete this account`)
            }

            const pendingTransaction = await trx.transactions.count({
                where: { userId: deletedUser.id, status: "pending", type: { in: ["withdrawal", "deposit"] } }
            });

            if (pendingTransaction > 0) {
                throw new Error(`${pendingTransaction} pending transaction found, cant delete this account now`)
            }

            if (deletedUser.wallet.gt(0)) {
                if (deletedUser.wallet.gt(10)) {
                    throw new Error(`this account wallet have more than 10 LE, cant delete it now`)
                } else {
                    await trx.transactions.create({
                        data: {
                            userId: id,
                            adminId: session.user.id,
                            amount: deletedUser.wallet,
                            type: "account_closure",
                            status: "approved"
                        }
                    });
                }
            }
            await trx.user.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedUser: `name:${deletedUser.name} | email:${deletedUser.email} | id:${id} | deletedAt:${new Date()}`,
                    name: "Deleted User",
                    email: `Deleted-User-${deletedUser.id}-${Date.now()}@gawalaty.com`,
                    wallet: 0,
                    password:null
                }
            })
            const account = await trx.account.findFirst({
              where:{userId:id}
            })
            if (account) {
                await trx.account.delete({
                    where: { id: account.id }
                })
            }
            await trx.reviews.updateMany({
                where: { userid: id },
                data: { banned: true }
            })
        });

        const reviews = await prisma.reviews.findMany({
            where: { userid: id }, include: { images: true }
        });
        const reviewImages = reviews.flatMap((r) => r.images.map((img) => img.publicid));

        if (reviewImages?.length > 0) {
            await RemoveCloudImages(reviewImages);
        }
        return { success: true, message: "Account deleted successsfully" }
    } catch (error) {
        return { error: true, message: error.message || "Server error while deleting the account. Try again later" };
    }
}

export async function getCategories(CategoriesTab) {
    try {
        let categories;
        if (CategoriesTab) {
            categories = await prisma.categories.findMany({
                select: { name: true, id: true,banned:true, _count: { select: { trips: true } } },
            });
        } else {
            categories = await prisma.categories.findMany();
        }
        return categories
    } catch (error) {
        return { error: true, message: "failed to fetch categories (server error) ,try again" }
    }
}

export async function RemoveImages(images) {
    if (images && images?.length > 0) {
        const publicids = images.map(img => img.publicid);
        await RemoveCloudImages(publicids)
    }
}

export async function getFeauturesAction() {
    try {
        const features = await prisma.feature.findMany();
        return features
    } catch (error) {
        return { error: true, message: "failed to fetch features (server error), try again" }
    }
}

export async function getLanguageAction() {
    try {
        const languages = await prisma.language.findMany();
        return languages
    } catch (error) {
        return { error: true, message: "failed to fetch languages (server error), try again" }
    }
}