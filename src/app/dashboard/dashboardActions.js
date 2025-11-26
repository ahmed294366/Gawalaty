"use server"

import { prisma } from "@/utils/prisma";
import { RemoveCloudImages } from "@/utils/serverActions";
import { auth } from "@/auth";
import { acceptTransactionMessage, rejectTransactionMessage } from "@/shared/sendEmail";
import { CategorySchema, featureSchema, paymentBankSchema, vodafonePaymentSchema, rejectSchema, approveSchema, withdrawalApproveBankSchema, withdrawalApproveVodafoneSchema, languageSchema, replySchema, settingSchema } from "./dashboardSchema";


export async function DashboardInfoAction() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized ,access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed ,access denied" }
        }
        const select = { people: true, trip: { select: { price: true } } }
        const [
            usersCount,
            guidesCount,
            unResolvedReportsCount,
            pendingBookings,

            confirmedBookingsAll,
            confirmedBookingsMonth,
            confirmedBookingsWeek] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { role: "guide", banned: false, isDeleted: false } }),
                prisma.reports.count({ where: { resolved: false } }),
                prisma.booking.count({ where: { status: "pending" } }),

                prisma.booking.findMany({
                    where: { status: "confirmed" },
                    select
                }),
                prisma.booking.findMany({
                    where: { status: "confirmed", createdAt: { gte: new Date(1000 * 60 * 60 * 24 * 30) } },
                    select
                }),
                prisma.booking.findMany({
                    where: { status: "confirmed", createdAt: { gte: new Date(1000 * 60 * 60 * 24 * 7) } },
                    select
                })
            ]);
        return {
            usersCount,
            guidesCount,
            unResolvedReportsCount,
            pendingBookings,
            confirmedBookingsAll,
            confirmedBookingsMonth,
            confirmedBookingsWeek
        }
    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}


export async function getUsersAction({ role, search, page }) {
    try {
        const session = await auth();
        if (!session) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "No allowed, access denied" }
            }
        }
        let users;
        const select = { name: true, id: true, email: true, phone: true, createdAt: true, role: true, image: true, location: true, banned: true, languages: { include: { language: true } }, deletedUser: true }

        if (role && !search) {
            users = await prisma.user.findMany({
                where: {
                    role, isDeleted: false
                },
                select,
                take: 6,
                skip: ((page - 1) * 6)
            });
        } else if (role && search) {
            users = await prisma.user.findMany({
                where: {
                    role: role, isDeleted: false, name: { contains: search, mode: "insensitive" }
                },
                select,
                take: 6,
                skip: ((page - 1) * 6)
            });
        } else if (!role && search) {
            users = await prisma.user.findMany({
                where: {
                    name: { contains: search, mode: "insensitive" }
                },
                select,
                take: 6,
                skip: ((page - 1) * 6)
            })
        } else {
            users = await prisma.user.findMany({ where: { isDeleted: false }, select, take: 6, skip: ((page - 1) * 6) })
        }
        return users
    } catch (error) {
        return { error: true, message: "failed to fetch users" }
    }
}

export async function BanUserAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin" || session.user.banned) {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.isDeleted || admin?.banned || admin?.role !== "admin") {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const user = await prisma.user.findUnique({ where: { id } });
        if (user.role === "admin") {
            return { error: true, message: "not allowed ,access denied" }
        }
        await prisma.user.update({
            where: {
                id
            },
            data: {
                banned: !user?.banned
            }
        })
        return { success: true, banned: !user?.banned }
    } catch (error) {
        return { error: true, message: "failed to ban user (server error) ,try again" }
    }
}

export async function getUserCount({ role, search }) {
    try {
        let items;
        if (role && search) {
            items = await prisma.user.count({
                where: {
                    name: {
                        contains: searchTerm,
                        mode: "insensitive"
                    },
                    role
                }
            })
        } else if (!role && search) {
            items = await prisma.user.count({ where: { name: { contains: search, mode: "insensitive" } } })

        } else if (role && !search) {
            items = await prisma.user.count({ where: { role } })
        } else {
            items = await prisma.user.count()
        }
        return items
    } catch (error) {
        return { error: true, message: "failed to count users (server error) ,try again" }
    }
}


export async function GetBookingsAction({ date, status, page }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" };
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" };
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" };
            }
        }
        const include = {
            date: true,
            trip: true,
            user: { select: { name: true, email: true, phone: true, id: true, image: true } }
        };

        let bookings;
        if (date === "upcoming") {
            if (status === "all") {
                bookings = await prisma.booking.findMany({
                    where: { date: { date: { gt: new Date() } } },
                    take: 6,
                    skip: ((page - 1) * 6),
                    include
                });
            } else {
                bookings = await prisma.booking.findMany({
                    where: { date: { date: { gt: new Date() } }, status },
                    take: 6,
                    skip: ((page - 1) * 6),
                    include
                });
            }
        } else if (date === "old") {
            if (status === "all") {
                bookings = await prisma.booking.findMany({
                    where: { date: { date: { lt: new Date() } } },
                    take: 6,
                    skip: ((page - 1) * 6),
                    include
                });
            } else {
                bookings = await prisma.booking.findMany({
                    where: { date: { date: { lt: new Date() } }, status },
                    take: 6,
                    skip: ((page - 1) * 6),
                    include
                });
            }
        }
        return bookings
    } catch (error) {
        return { error: true, message: "failed to fetch bookings (server error) ,try again" }
    }
}

export async function GetBookingCountAction({ date, status }) {
    try {
        let items;
        if (date === "upcoming") {
            if (status === "all") {
                items = await prisma.booking.count({
                    where: { date: { date: { gt: new Date() } } }
                })
            } else {
                items = await prisma.booking.count({
                    where: { date: { date: { gt: new Date() } }, status }
                })
            }
        } else if (date === "old") {
            if (status === "all") {
                items = await prisma.booking.count({
                    where: { date: { date: { lt: new Date() } } }
                })
            } else {
                items = await prisma.booking.count({
                    where: { date: { date: { lt: new Date() } }, status }
                })
            }
        }
        return items
    } catch (error) {
        return { error: true, message: "failed to count bookings (server error) ,try again" }
    }
}

export async function RemoveCategory(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized ,access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: 'not allowed ,access denied' }
        }
        const category = await prisma.categories.findUnique({
            where: { id: +id },
            select: { name: true, _count: { select: { trips: true } } }
        });
        if (!category) {
            return { error: true, message: "Category not found" }
        }
        if (category?._count.trips > 0) {
            return { error: true, message: `cant remove, this category have ${category._count.trips} trips connected ` }
        }
        await prisma.categories.delete({
            where: { id }
        });
        return { success: true, message: `Category ${category.name} removed successfully` }
    } catch (error) {
        return { error: true, message: "failed to remove this category (server error) ,try again" }
    }
}

export async function CreateCategory(name) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin" || session?.user.banned || session.user.isDeleted) {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            })
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "not allowed, access denied" }
            }

        }
        const { error } = CategorySchema({ name });
        if (error) {
            return { error: true, message: error.details[0].message }
        }
        const category = await prisma.categories.findFirst({
            where: { name: name.trim() }
        });
        if (category) {
            return { error: true, message: `Category ${name} is already existed` }
        }
        let newCategory;
        newCategory = await prisma.categories.create({
            data: {
                name
            }
        });
        newCategory._count = { trips: 0 }

        return newCategory
    } catch (error) {
        return { error: true, message: "failed to create this category (server error) ,try again" }
    }
}

export async function banrelatedTripsAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin" || session.user.banned) {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin.banned || admin.role !== "admin" || admin.isDeleted) {
                return { erro: true, message: "not allowed, access denied" }
            }
        }
        const category = await prisma.categories.findUnique({
            where: { id }
        })
        if (!category) {
            return { error: true, message: "Category not found" }
        }
        await prisma.$transaction(async (trx) => {
            await trx.trip.updateMany({
                where: { categoryid: id },
                data: {
                    banned: !category.banned
                }
            });
            await trx.categories.update({
                where: { id },
                data: {
                    banned: !category.banned
                }
            })
        })

        return { success: true, message: "Trips banned successfully" }
    } catch (error) {
        return { error: true, message: "failed to ban trips (server error), try again" }
    }
}


export async function getReviewsAction({ status, page }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }

        let reviews;
        if (status === "Active") {
            reviews = await prisma.reviews.findMany({
                where: { banned: false },
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    user: { select: { image: true, name: true, id: true } },
                    images: true,
                    trip: { select: { id: true, title: true } }
                },
                take: 6,
                skip: ((page - 1) * 6)
            });
        } else if (status === "Banned") {
            reviews = await prisma.reviews.findMany({
                where: { banned: true },
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    user: { select: { image: true, name: true, id: true } },
                    images: true,
                    trip: { select: { id: true, title: true } }
                },
                take: 6,
                skip: ((page - 1) * 6)
            });
        }

        return reviews
    } catch (error) {
        return { error: true, message: "failed to fetch reviews (server error) ,try again" }
    }
}
export async function reviewsCountAction({ status }) {
    try {
        let items;
        if (status === "Active") {
            items = await prisma.reviews.count({ where: { banned: false } })
        } else if (status === "Banned") {
            items = await prisma.reviews.count({ where: { banned: true } })
        }
        return items
    } catch (error) {
        return { error: true, message: "failed to count reviews (server error) ,try again" }
    }
}
export async function banReviewAction({ id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "unauthorized ,access denide" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed ,access denide" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const review = await prisma.reviews.findUnique({ where: { id: +id } });
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
        return { error: true, message: "failed while ban this review (server error) ,try again" }
    }
}
export async function deleteReviewAction({ id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "unauthorized ,access denide" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
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
            const result = await RemoveCloudImages(publicids);
            if (result?.error) {
                return { error: true, message: "error while delete images from cloudinary ,try later" }
            }
        }
        await prisma.reviews.delete({
            where: { id }
        });

        return { success: true, message: "review deleted successfully" };
    } catch (error) {
        return { error: true, message: "failed to delete this review (server error) ,try again" }
    }
}


export async function getReportsAction({ status, page }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }
        let reports;
        if (status === "Pending") {
            reports = await prisma.reports.findMany({
                where: { resolved: false },
                include: {
                    review: {
                        include: {
                            user: {
                                select: {
                                    name: true, id: true, image: true
                                }
                            },
                            trip: { select: { title: true, id: true } },
                            images: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                },
                take: 6,
                skip: ((page - 1) * 6)
            });

        } else if (status === "Resolved") {
            reports = await prisma.reports.findMany({
                where: { resolved: true },
                include: {
                    review: {
                        include: {
                            user: {
                                select: {
                                    name: true, id: true, image: true
                                }
                            },
                            trip: { select: { title: true, id: true } },
                            images: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                },
                take: 6,
                skip: ((page - 1) * 6)
            });
        }

        return reports
    } catch (error) {
        return { error: true, message: "failed while fetch reports (server error) ,try again" }
    }
}
export async function resolveReportAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized ,access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed ,access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.banned || admin?.role !== "admin" || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        await prisma.reports.update({
            where: { id: +id },
            data: { resolved: true }
        });
        return { success: true, message: "resolved" }
    } catch (error) {
        return { error: true, message: "failed to resolve (server error) ,try again" }
    }
}
export async function countReportsAction({ status }) {
    try {
        let items;
        if (status === "Pending") {
            items = await prisma.reports.count({ where: { resolved: false } })
        } else if (status === "Resolved") {
            items = await prisma.reports.count({ where: { resolved: true } })
        }
        return items
    } catch (error) {
        return { error: true, message: "failed to count reports (server error) ,try again" }
    }
}


export async function getTripsAction({ categoryid, page }) {
    try {
        let trips;
        if (categoryid) {
            trips = await prisma.trip.findMany({
                where: { categoryid },
                include: {
                    images: true,
                    reviews: true
                }, take: 6,
                skip: ((page - 1) * 6)
            });
        } else {
            trips = await prisma.trip.findMany({
                include: {
                    images: true,
                    reviews: true
                },
                take: 6,
                skip: ((page - 1) * 6)
            });
        }

        return trips
    } catch (error) {
        return { error: true, message: "failed to fetch trips (server error) ,try again" }
    }
}
export async function tripsCountAction({ categoryid }) {
    try {
        let items;
        if (categoryid) {
            items = await prisma.trip.count({ where: { categoryid } })
        } else {
            items = await prisma.trip.count()
        }
        return items;
    } catch (error) {
        return { error: true, message: "failed to count trips (erver error) ,try again" }
    }
}


export async function createFeatureAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }

        const { error } = featureSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }
        const exist = await prisma.feature.findFirst({
            where: { name: obj.name }
        });
        if (exist) {
            return { error: true, message: "this feature is already exists" }
        }
        let data = { name: obj.name };
        if (obj.description) { data.description = obj.description }

        let newFeauture = await prisma.feature.create({
            data
        });

        return newFeauture
    } catch (error) {
        return { error: true, message: "failed to create feature (server error), try again" }
    }
}

export async function removeFeatureAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.isDeleted || admin?.banned || admin?.role !== "admin") {
                return { error: true, message: "not allowed, access denied" }
            }
        }
        const feature = await prisma.feature.findUnique({ where: { id } });
        if (!feature) {
            return { error: true, message: "feature not found" }
        }

        await prisma.feature.delete({ where: { id } });
        return { success: true }
    } catch (error) {
        return { error: true, message: "failed while try delete feature (server error), try again" }
    }
}

export async function addPaymentAction({ method, bankName, accountName, accountNumber, phoneNumber, iban }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        if (!method || (method !== "bank" && method !== "vodafone")) {
            return { error: true, message: "method not defined" }
        }
        let newPayment;
        if (method === "bank") {
            const exist = await prisma.paymentAccount.findFirst({
                where: { accountNumber }
            });
            if (exist) {
                return { error: true, message: "This account number is already exists" }
            }
            const { error } = paymentBankSchema({ accountName, bankName, accountNumber, iban });
            if (error) {
                return { error: true, message: error.details[0].message }
            }
            newPayment = await prisma.paymentAccount.create({
                data: {
                    bankName,
                    accountName,
                    accountNumber,
                    method,
                    iban
                }
            });
        } else if (method === "vodafone") {
            const exist = await prisma.paymentAccount.findFirst({
                where: { phoneNumber }
            });
            if (exist) {
                return { error: true, message: "This phone number is already exists" }
            }
            const { error } = vodafonePaymentSchema({ phoneNumber });
            if (error) {
                return { error: true, message: error.details[0].message }
            }
            newPayment = await prisma.paymentAccount.create({
                data: {
                    phoneNumber,
                    method
                }
            })
        }
        newPayment._count = { transactions: 0 }
        return newPayment
    } catch (error) {
        return { error: true, message: "failed to create payment method (server error), try again" }
    }
}

export async function updatePaymentAction({ id, bankName, accountName, accountNumber, phoneNumber, iban }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.isDeleted || admin?.role !== "admin" || admin?.banned) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const paymentMethod = await prisma.paymentAccount.findUnique({
            where: { id }
        });

        if (!paymentMethod) {
            return { error: true, message: "method not found" }
        }


        if (paymentMethod.method === "bank") {
            const { error } = paymentBankSchema({ accountName, bankName, accountNumber, iban });
            if (error) {
                return { error: true, message: error.details[0].message }
            }
        } else {
            const { error } = vodafonePaymentSchema({ phoneNumber });
            if (error) {
                return { error: true, message: error.details[0].message }
            }
        }

        let newPayment;
        await prisma.$transaction(async (trx) => {

            const transactions = await trx.transactions.count({
                where: { paymentAccountId: id }
            });
            if (transactions > 0) {
                throw new Error(`cant update this method now ,there is an ${transactions} transaction with this method`)
            }
            if (paymentMethod.method === "bank") {
                newPayment = await trx.paymentAccount.update({
                    where: { id },
                    data: {
                        bankName,
                        accountName,
                        accountNumber, iban
                    }
                })
            } else if (paymentMethod.method === "vodafone") {
                newPayment = await trx.paymentAccount.update({
                    where: { id },
                    data: {
                        phoneNumber
                    }
                })
            }
        })
        newPayment._count = { transactions: 0 }
        return newPayment
    } catch (error) {
        return { error: true, message: error?.message || "failed to update payment method (server error), try again" }
    }
}

export async function getPaymentsAction() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { erro: true, message: 'not allwoed, access denied' }
        }
        const payment = await prisma.paymentAccount.findMany({
            include: { _count: { select: { transactions: true } } }
        });
        return payment
    } catch (error) {
        return { error: true, message: "faild to fetch payment methods (server error), try again" }
    }
}

export async function togglePaymentActive({ id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: 'not allowed, access denied' }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const method = await prisma.paymentAccount.findUnique({
            where: { id }
        });
        if (!method) {
            return { error: true, message: 'payment method not found' }
        }
        await prisma.paymentAccount.update({
            where: { id },
            data: {
                isActive: !method.isActive
            }
        });
        return { success: true, isActive: !method.isActive }
    } catch (error) {
        return { error: true, message: "failed while toggle payment active (server error), try again" }
    }
}

export async function removePaymentMethodAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unbauthorized, access deined" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const method = await prisma.paymentAccount.findUnique({
            where: { id }
        });
        if (!method) { return { error: true, message: "payment-method not found" } }
        const transactions = await prisma.walletTransaction.count({
            where: { paymentid: id }
        });
        if (transactions > 0) {
            return { error: true, message: `cant remove this method, there is an ${transactions} transactions with that method` }
        }
        await prisma.paymentAccount.delete({
            where: { id }
        });
        return { success: true, message: "deleted successfully" }
    } catch (error) {
        return { error: true, message: "failed to delete payment method (server error), try again" }
    }
}

export async function transactionInfoAction() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }
        const [all, pending, approved, rejected, allDeposit, allWithdrawal]
            = await Promise.all([
                prisma.transactions.count({ where: { type: { in: ["withdrawal", "deposit"] } } }),
                prisma.transactions.count({ where: { status: "pending", type: { in: ["withdrawal", "deposit"] } } }),
                prisma.transactions.count({ where: { type: { in: ["deposit", "withdrawal"] }, status: "approved" } }),
                prisma.transactions.count({ where: { status: "rejected", type: { in: ["withdrawal", "deposit"] } } }),

                prisma.transactions.aggregate({
                    where: { type: "deposit", status: "approved" },
                    _sum: { amount: true }
                }),
                prisma.transactions.aggregate({ where: { type: "withdrawal", status: "approved" }, _sum: { amount: true } })
            ]);

        return { all, pending, approved, rejected, netFlow: (allDeposit._sum.amount - allWithdrawal._sum.amount).toFixed(2) }

    } catch (error) {
        return { error: true, message: "failed to fetch data" }
    }
}

export async function getTransactionsAction({ status, page, type, search }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session?.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.banned || admin?.isDeleted || admin?.role !== "admin") {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        let obj = { status, type };

        if (type === "withdrawal") {
            obj.createdAt = { lte: new Date(Date.now() - (900000)) }
        }

        let transaction;
        if (search) {
            transaction = await prisma.transactions.findMany({
                where: { ...obj, user: { email: { contains: search, mode: "insensitive" } } },
                take: 6, skip: ((page - 1) * 6),
                include: {
                    user: { select: { name: true, email: true, id: true } }, admin: { select: { name: true, email: true } },
                    paymentAccount: true
                },
                orderBy: { createdAt: "desc" }
            })
        } else {
            transaction = await prisma.transactions.findMany({
                where: obj,
                skip: ((page - 1) * 6), take: 6,
                include: {
                    user: { select: { name: true, email: true, id: true } },
                    admin: { select: { name: true, email: true } },
                    paymentAccount: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        transaction = transaction?.map(t => { return { ...t, amount: Number(t.amount) } })
        return transaction;
    } catch (error) {
        return { error: true, message: "failed to fetch transactions (server error), try again" }
    }
}

export async function getTransactionCount({ status, type, search }) {
    try {
        let obj = { type, status }
        if (type === "withdrawal") {
            obj.createdAt = { lte: new Date(Date.now() - (900000)) }
        }

        let items;
        if (search) {
            items = await prisma.transactions.count({ where: { ...obj, user: { email: { contains: search, mode: "insensitive" } } } })
        } else {
            items = await prisma.transactions.count({ where: obj })
        }
        return items
    } catch (error) {
        return { error: true, message: "failed to count transaction (server error), try again" }
    }
}

export async function rejectTransactionAction({ id, adminNotes }) {
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
        let type;
        let email;
        let amount;
        await prisma.$transaction(async (trx) => {
            const { error } = rejectSchema({ adminNotes });

            if (error) {
                throw new Error(error.details[0].message)
            }

            const transaction = await trx.transactions.findUnique({ where: { id }, include: { user: true } });
            if (!transaction) {
                throw new Error("Transaction not found");
            }

            if (transaction.status !== "pending") {
                throw new Error(`this transaction is ${transaction.status} before.`);
            }

            if (transaction.type !== "withdrawal" && transaction.type !== "deposit") {
                throw new Error("Failed to reject");
            }

            if (transaction.type === "withdrawal") {
                const diffInMinutes = (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60);

                if (diffInMinutes <= 15) {
                    throw new Error("You can’t reject this request before 15 minutes of creation for security reasons.");
                }
            }

            let data = {
                adminNotes,
                status: "rejected",
                adminId: session.user.id
            }
            if (transaction.type === "withdrawal") {
                data.isEdited = true
                type = "withdrawal"
            } else {
                type = "deposit"
            }

            await trx.transactions.update({
                where: { id },
                data
            });
            email = transaction.user.email;
            amount = transaction.amount
        });

        await rejectTransactionMessage({ email, amount, type })

        return { success: true, message: "Rejected successfully" }
    } catch (error) {
        return { error: true, message: error.message || "Failed to reject (server error), try again" }
    }
}

export async function approveTransactionAction({ id, adminNotes, proofUrl, proofId, paymentAccountId, transactionId }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, messag: "Unauthorized, access denied" }
        }
        if (session?.user?.role !== "admin") {
            return { error: true, message: "not allowed, acccess denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.banned || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        let email;
        let amount;
        let type;
        await prisma.$transaction(async (trx) => {
            const transaction = await trx.transactions.findUnique({
                where: { id }, include: { user: true }
            });
            if (!transaction) {
                throw new Error("transaction not found")
            }
            if (transaction.status !== "pending") {
                throw new Error(`this transaction is ${transaction.status} before.`);
            }
            if (transaction.type !== "deposit" && transaction.type !== "withdrawal") {
                throw new Error(`Can't approve type ${transaction.type} transactions`)
            }

            if (transaction.type === "withdrawal") {
                const diffInMinutes = (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60);

                if (diffInMinutes <= 15) {
                    throw new Error("You can’t approve this request before 15 minutes of creation for security reasons.");
                }
            }

            if (transaction.userId === session.user.id) {
                const adminCount = await trx.user.count({
                    where: { role: "admin" }
                });
                if (adminCount > 1) {
                    throw new Error(`Approve your ${transaction.type} request is not allowed`)
                }
            }
            email = transaction.user.email
            amount = transaction.amount
            if (transaction.type === "deposit") {
                let data = { status: "approved", adminId: session.user.id };
                if (adminNotes) {
                    const { error } = approveSchema({ adminNotes });
                    if (error) {
                        throw new Error(error.details[0].message)
                    }
                    data.adminNotes = adminNotes
                }
                await trx.transactions.update({
                    where: { id },
                    data: {
                        status: "approved",
                        adminId: session.user.id
                    }
                })

                await trx.user.update({
                    where: { id: transaction.userId },
                    data: { wallet: { increment: transaction.amount } }
                });
                type = "deposit"
                // ? ? ?  ? ? ? ? ? / ? ? ? ? ?
            } else {

                const user = await prisma.user.findUnique({
                    where: { id: transaction.userId }
                });

                if (!user || user?.isDeleted) {
                    throw new Error("User not found")
                }

                if (user.wallet.lt(transaction.amount)) {
                    throw new Error("User wallet is not enough to process this withdraw");
                }
                const account = await trx.paymentAccount.findUnique({
                    where: { id: paymentAccountId }
                });

                if (!account) {
                    throw new Error("Payment account not found")
                }
                if (transaction.userAccountNumber) {
                    if (account.method !== "bank") {
                        throw new Error("Wrong payment account choice")
                    }
                    const { error } = withdrawalApproveBankSchema({ transactionId, paymentAccountId, proofUrl, proofId, adminNotes });

                    if (error) {
                        throw new Error(error.details[0].message)
                    }

                    await trx.transactions.update({
                        where: { id },
                        data: {
                            status: "approved",
                            transactionId,
                            proofId,
                            proofUrl,
                            paymentAccountId,
                            adminId: session?.user.id
                        }
                    })
                } else {
                    if (account.method !== "vodafone") {
                        throw new Error("Wrong payment account choice")
                    }
                    const { error } = withdrawalApproveVodafoneSchema({ paymentAccountId, proofUrl, proofId });
                    if (error) {
                        throw new Error(error.details[0].message)
                    }

                    await trx.transactions.update({
                        where: { id },
                        data: {
                            status: "approved",
                            proofId,
                            proofUrl,
                            paymentAccountId,
                            adminId: session?.user.id
                        }
                    });
                }
                await trx.user.update({
                    where: { id: transaction.userId, wallet: { gte: transaction.amount } },
                    data: {
                        wallet: { decrement: transaction.amount }
                    }
                });
                type = "withdrawal"
            }
        });

        await acceptTransactionMessage({ email, amount, type })

        return { success: true, admin: { name: session.user.name, email: session.user.email } }
    } catch (error) {
        return { error: true, message: error.message || "Failed to approve (server error), try again" }
    }
}

export async function getPaymentMethods() {
    try {
        const payments = await prisma.paymentAccount.findMany();
        return payments
    } catch (error) {
        return { error: true, message: "internal server error, try again" }
    }
}

export async function getTransactionInfoAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }
        let transaction = await prisma.transactions.findUnique({
            where: { id },
            include: {
                paymentAccount: true,
                user: { select: { name: true, email: true, id } },
                admin: { select: { name: true, email: true } }
            }
        });
        if (!transaction) {
            return { error: true, message: "transaction not found" }
        }
        transaction = { ...transaction, amount: Number(transaction.amount) }
        return transaction

    } catch (error) {
        return { error: true, message: "failed to fetch transaction (server error), try again" }
    }
}

export async function createLanguageAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, accesss denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.role !== "admin" || admin?.isDeleted || admin?.banned) {
                return { error: true, message: "not allowed, access denied" }
            }
        }
        const { error } = languageSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }
        const exist = await prisma.language.findFirst({
            where: { name: obj.name }
        });
        if (exist) {
            return { error: true, message: "this language is already exists" }
        }
        const language = await prisma.language.create({
            data: {
                name: obj.name
            }
        });
        return language

    } catch (error) {
        return { error: true, message: "failed to create language (server error), try again" }
    }
}

export async function removeLanguageAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.isDeleted || admin?.banned || admin.role !== "admin") {
                return { error: true, message: "not allowed, access denied" }
            }
        }
        const language = await prisma.language.findUnique({
            where: { id }
        });
        if (!language) {
            return { error: true, message: "language not found" }
        }
        await prisma.language.delete({
            where: { id }
        });

        return { success: true, message: "language removed successfully" }
    } catch (error) {
        return { error: true, message: "failed to remove this language (server error), try again" }
    }
}


export async function getQuestionsAction({ status, page, search }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }
        let obj = { status };
        if (search) {
            obj.email = { contains: search, mode: "insensitive" }
        }
        const questions = await prisma.questions.findMany({
            where: obj,
            include: { user: { select: { id: true, name: true, email: true, image: true } }, _count: { select: { replies: true } } },
            take: 6,
            skip: ((page - 1) * 6)
        });
        return questions
    } catch (error) {
        return { error: true, message: "failed to fetch questions (server error), try again" }
    }
}

export async function countQuestionsAction({ status, search }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user?.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }

        let obj = { status }
        if (search) {
            obj.email = { contains: search, mode: "insensitive" }
        }
        const items = await prisma.questions.count({
            where: obj
        });
        return items
    } catch (error) {
        return { error: true, message: "failed to count questions (server error), try again" }
    }
}

export async function getRepliesAction(questionId) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        const question = await prisma.questions.findUnique({
            where: { id: questionId }
        });

        if (session.user.id !== question.userId && session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }

        const replies = await prisma.replies.findMany({
            where: { questionId }, include: { sender: { select: { name: true, image: true, id: true, role: true } } }
        });
        return replies
    } catch (error) {
        return { error: true, message: "failed to fetch replies (server error), try again" }
    }
}

export async function replyToQuestionAction({ questionId, text, image }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }
        if (session.user.banned || session.user.isDeleted) {
            return { error: true, message: "Cant reply to this conversation" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (admin?.banned || !admin || admin?.isDeleted || admin?.role !== "admin") {
                return { error: true, message: "Cant reply to this conversation" }
            }
        }
        if (!text && !image) {
            return { error: true, message: "No fields found to create reply" }
        }
        let data = {
            questionId,
            senderId: session.user.id
        }
        if (text) {
            const { error } = replySchema({ text });
            if (error) {
                return { error: true, message: error.details[0].message }
            }
            data.text = text;
        }
        if(image){
            data.url = image.url;
            data.publicId = image.publicid;
        }


        const question = await prisma.questions.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return { error: true, message: "Message not found" }
        }


        let reply;

        await prisma.$transaction(async (trx) => {
            reply = await trx.replies.create({
                data,
                include: { sender: { select: { name: true, email: true, role: true, image: true } } }
            });

            if (session.user.id !== question.userId && !question.adminId) {
                let data = { adminId: session.user.id }
                if (question.status === "pending") {
                    data.status = "waiting_for_user"
                }
                await trx.questions.update({
                    where: { id: questionId },
                    data
                })
            }
        })

        return reply
    } catch (error) {
        return { error: true, message: "failed to reply (server error), try again" }
    }
}

export async function closeMessageAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "noot allowed, access denied" }
        }
        const message = await prisma.questions.findUnique({
            where: { id }
        });
        if (!message) {
            return { error: true, message: "message not found" }
        }

        let data = {};
        if (message.status !== "closed") {
            data.status = "closed"
        } else {
            data.status = "waiting_for_user"
        }
        const newMessage = await prisma.questions.update({
            where: { id },
            data
        });
        return { success: true, status: newMessage.status }
    } catch (error) {
        return { error: true, message: "failed to archive this message" }
    }
}


export async function fetchSettingAction() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "Not allowed, access denied" }
        }
        const settings = await prisma.setting.findMany();
        return settings
    } catch (error) {
        return { error: true, message: "failed to fetch settings (server error), try again" }
    }
}

export async function createSettingAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin" || session.user.banned) {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.banned || admin?.role !== "admin" || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const { error } = settingSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }
        const exist = await prisma.setting.findFirst({
            where: { key: { equals: obj.key, mode: "insensitive" } }
        });
        if (exist) {
            return { error: true, message: "This setting is already exists" }
        };
        const setting = await prisma.setting.create({
            data: obj
        });
        return setting

    } catch (error) {
        return { error: true, message: "failed to create setting (server error), try again" }
    }
}

export async function removeSettingAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin" || session.user.banned) {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.banned || admin?.isDeleted || admin.role !== "admin") {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const setting = await prisma.setting.findUnique({
            where: { id }
        })
        if (!setting) {
            return { error: true, message: "This setting not found" }
        }
        await prisma.setting.delete({
            where: { id }
        });
        return { success: true, message: "deleted successfully" }
    } catch (error) {
        return { error: true, message: "failed to remove this setting (server error), try again" }
    }
}

export async function ToggleSettingAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin" || session.user.banned) {
            return { error: true, message: "Not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!admin || admin?.banned || admin?.role !== "admin" || admin?.isDeleted) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }

        const setting = await prisma.setting.findUnique({
            where: { id }
        });
        if (!setting) {
            return { error: true, message: "Setting item not found" }
        }
        await prisma.setting.update({
            where: { id },
            data: { value: !setting.value }
        })

        return !setting.value

    } catch (error) {
        return { error: true, message: "failed to toggle (server error), try again" }
    }
}