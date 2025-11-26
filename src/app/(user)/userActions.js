"use server"
import { prisma } from "@/utils/prisma"
import { RemoveCloudImage, RemoveCloudImages } from "@/utils/serverActions";
import { ChangePasswordSchema, LoginSchema, UserImageValidation, RegisterSchema, uploadedImageSchema, bankDepositSchema, vodaphoneDepositSchema, withdrawVodafoneSchema, withdrawBankSchema, withdrawUpdateSchema, ProfileEditSchema, emailSchema, passwordSchema, questionSchema, replySchema } from "./userSchema";
import { auth } from "@/auth";
import crypto from "crypto"
import { sendTokens } from "@/shared/sendEmail";
import bcrypt from "bcryptjs"

export async function LoginAction(obj) {
    try {
        const { error } = LoginSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }

        const user = await prisma.user.findUnique({ where: { email: obj.email } });
        if (!user) {
            return { error: true, message: "Invalid email or password" }
        }

        const account = await prisma.account.findFirst({ where: { userId: user.id } });
        if (account || !user.password) {
            return { error: true, message: "You signed up using Google or another provider. Please use that method to sign in." }
        }

        const truePass = await bcrypt.compare(obj.password, user.password);
        if (!truePass) {
            return { error: true, message: "Invalid email or password" }
        }

        if (!user.emailVerified) {
            await prisma.tokens.deleteMany({ where: { email: user.email } });
            const token = crypto.randomBytes(32).toString("hex");
            await prisma.tokens.create({
                data: {
                    email: user.email,
                    token,
                    expires: ((Date.now() + (1000 * 60 * 60))).toString()
                }
            });
            await sendTokens({ email: user.email, token, type: "verify" });
            return { error: true, message: "Link sent To This Email To Verify" }
        }

        return { success: true }

    } catch (error) {
        return { error: true, message: "failed to log-in, try again" }
    }
}

export async function RegisterAction(obj) {
    try {

        const { error } = RegisterSchema(obj);
        if (error) { return { error: true, message: error.details[0].message } }

        const isExists = await prisma.user.findUnique({ where: { email: obj.email } });
        if (isExists) {
            return { error: true, message: "This email is already exists" }
        }

        const salt = await bcrypt.genSalt(10);
        obj.password = await bcrypt.hash(obj.password, salt);

        const token = crypto.randomBytes(32).toString("hex")
        let data = { name: obj.name, email: obj.email, password: obj.password }
        if (obj.dateOfBirth) { data.dateOfBirth = obj.dateOfBirth }
        if (obj.phone) { data.phone = obj.phone }
        await prisma.$transaction(async (trx) => {
            await trx.user.create({
                data
            });
            await trx.tokens.create({
                data: {
                    email: obj.email,
                    token,
                    expires: (Date.now() + (1000 * 60 * 60)).toString()
                }
            });
        });
        await sendTokens({ email: obj.email, token, type: "verify" });
        return { success: true, message: "Link sent To This Email To Verify" }

    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}

export async function VerifyEmailAction({ email, token }) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { message: "Invalid Link", verified: false }
        }
        const verification = await prisma.tokens.findFirst({
            where: { email, token }
        });

        if (!verification) {
            return { message: "Invalid Link", verified: false }
        }

        if (Date.now() > +verification.expires) {
            await prisma.tokens.delete({ where: { id: verification.id } });
            const token = crypto.randomBytes(32).toString("hex");
            await prisma.tokens.create({
                data: {
                    email,
                    token,
                    expires: (Date.now() + (1000 * 60 * 60)).toString()
                }
            });
            await sendTokens({ email, token, type: "verify" })
            return { error: true, message: "Invalid Link (expired), new Link set to your email", verified: false }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date()
            }
        });

        await prisma.tokens.delete({ where: { id: verification.id } });
        return { verified: true, message: "Verified Successfully" }

    } catch (error) {
        return { verified: false, messsage: "Failed to verify email, try again" }
    }
}

export async function forgetPasswordAction(email) {
    try {
        const { error } = emailSchema({ email });
        if (error) {
            return { error: true, message: error.details[0].message }
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { error: true, message: "user not found" }
        }

        const account = await prisma.account.findFirst({
            where: { userId: user.id }
        });

        if (!user.password || account) {
            return { error: true, message: "most propably you register using providers as (google , facebook)" }
        }

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.tokens.create({
            data: {
                email,
                token,
                expires: ((Date.now() + (3600000)).toString())
            }
        });

        await sendTokens({ email, token, type: "reset" });
        return { success: true, message: "We sent link to this email to reset password" }
    } catch (error) {
        return { error: true, message: "something went wrong, try again" }
    }
}

export async function resetPasswordAction({ password, token, email }) {
    try {
        const { error } = passwordSchema({ password });
        if (error) { return { error: true, message: error.details[0].message } }

        const resetToken = await prisma.tokens.findFirst({
            where: { email, token }
        });
        if (!resetToken) {
            return { error: true, message: "Invalid Link" }
        }

        if (Date.now() > +resetToken.expires) {
            await prisma.tokens.delete({
                where: { id: resetToken.id }
            });
            return { error: true, message: "Expired Token, try again" }
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { error: true, message: "user not found" }
        }

        if (!user.password) {
            return {
                error: true, message: "you may propably register using providers (google ,facebook) accounts"
            }
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password
            }
        });

        return { success: true }
    } catch (error) {
        return { error: true, message: "something went wrong, try again" }
    }
}

export async function GetProfileAction(id) {
    try {
        const session = await auth();
        const isAdminOrOwner = session?.user?.id === id || session?.user?.role === "admin"
        const isOwner = session?.user?.id === id;

        const select = {
            id: true, name: true,
            location: !!isAdminOrOwner,
            image: true, guideReviewsAsGuide: true, email: true,
            dateOfBirth: !!isAdminOrOwner, phone: true,
            wishlist: isAdminOrOwner ? { include: { trip: { include: { images: true } } } } : false, role: true,
            wallet: !!isOwner,
            allowGuestMessages: !!isOwner,
            languages: true,
            booking: isAdminOrOwner ? {
                include: {
                    trip: true,
                    date: true
                },
                orderBy: { createdAt: "desc" }
            } : false,
            Trip: {
                include: {
                    reviews: true,
                    images: true,
                    _count: {
                        select: {
                            wishlist: true
                        }
                    }
                },
            },
            bio: true, banned: true, isDeleted: true, password: !!isOwner
        }
        let profile = await prisma.user.findUnique({
            where: { id },
            select
        });

        if (!isAdminOrOwner && profile?.role !== "guide") {
            return { hidden: true, message: "Private Account" }
        }

        if (isOwner) {
            if (profile.isDeleted) {
                return { hidden: true, message: "Profile Not Found" }
            }
            if (profile.password) {
                profile.password = true
            } else {
                profile.password = false
            }
            profile = { ...profile, wallet: Number(profile.wallet) }
        }

        if (!isAdminOrOwner) {

            if (profile.banned || profile.isDeleted) {
                return { hidden: true, message: "This Profile is Not Available Now" }
            }

            if (session?.user) {
                const isBookingWithThisGuide = await prisma.booking.findFirst({
                    where: {
                        userid: session.user.id, trip: { guideid: profile.id },
                        date: { date: { gte: new Date() } },
                        status: "confirmed"
                    },
                    include: { trip: true, date: true }
                });
                if (!isBookingWithThisGuide) {
                    profile.phone = null;
                    profile.email = null;
                }
            } else {
                profile.phone = null;
                profile.email = null;
            }
        }

        if (profile.role !== "guide") {
            profile.Trip = null
            profile.bio = null
            profile.guideReviewsAsGuide = null
        }
        return profile

    } catch (error) {
        return { error: true, message: "fialed to fetch profile (server error), try again" }
    }
}

export async function setLanguageAction({ addIds, id, deleteIds }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        } else {
            const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (!admin || admin?.role !== "admin" || admin?.isDeleted || admin?.banned) {
                return { error: tru, message: "not allowed, access denied" }
            }
        }
        const guide = await prisma.user.findUnique({
            where: { id }
        });
        if (!guide || guide?.banned || guide.role !== "guide") {
            return { error: true, message: "guide not found" }
        }
        if (addIds.length > 0) {
            await prisma.userLanguage.createMany({
                data: addIds.map(ID => {
                    return (
                        {
                            languageId: ID,
                            userId: id
                        }
                    )
                })
            })
        }
        if (deleteIds.length > 0) {
            await prisma.userLanguage.deleteMany({
                where: { userId: id, languageId: { in: deleteIds } }
            })
        }
        const guideLanguage = await prisma.userLanguage.findMany({
            where: { userId: id }
        })
        return guideLanguage
    } catch (error) {
        return { error: true, message: "failed to add languages (server error), try again" }
    }
}

export async function ChangePasswordAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized ,access denied" }
        }
        const { error } = ChangePasswordSchema(obj);

        if (error) {
            return { error: true, message: error.details[0].message }
        }

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user.password) {
            const useraccount = await prisma.account.findFirst({
                where: { userId: user.id }
            });
            return { error: true, provider: useraccount.provider }
        };
        const truePassword = await bcrypt.compare(obj.currentPassword, user.password);
        if (!truePassword) {
            return { error: true, message: "current password is wrong" }
        }

        const salt = await bcrypt.genSalt(10);

        obj.newPassword = await bcrypt.hash(obj.newPassword, salt);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: obj.newPassword
            }
        })
        return { success: true, message: "new password reset successfully" }

    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}

export async function toggleGuestMessageAction(id) {
    try {
        const session = await auth();
        if (!session.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }

        if (session.user.id !== id) {
            return { error: true, message: "Not allowed, access denied" }
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });
        if (!user || user?.isDeleted) {
            return { error: true, message: "Profile not found" }
        }

        await prisma.user.update({
            where: { id },
            data: { allowGuestMessages: !user.allowGuestMessages }
        });

        return { success: true }
    } catch (error) {
        return { error: true, message: "Failed to toggle, try again" }
    }
}

export async function RemoveFromWishList(tripid) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized ,access denied" }
        }
        await prisma.wishlist.deleteMany({
            where: { tripid: +tripid, userid: session?.user?.id }
        });
        return { success: true, message: "Done .. " }
    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}

export async function EditUserAction({ obj, id }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        const sessionUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });
        if (!sessionUser || sessionUser?.isDeleted || (sessionUser?.id !== id && (sessionUser.role !== "admin" || sessionUser?.banned))) {
            return { error: true, message: "Not allowed, access denied" }
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return { error: true, message: "user not found" }
        }
        const isOwer = id === session?.user.id;
        const isAdmin = sessionUser.role === "admin";

        if (!isOwer && !isAdmin) {
            return { error: true, message: "not allowed, access denied" }
        }
        //
        if (isAdmin && !isOwer && user.role !== "guide") {
            return { error: true, message: "not allowed, access denied" }
        }
        const select = {
            name: true, dateOfBirth: true, bio: true, location: true, phone: true
        }

        const { error } = ProfileEditSchema(obj);
        if (error) {
            return { error: true, message: error.details[0].message }
        }
        let newUser;
        if (isOwer) {
            if (user.role === "guide") {
                newUser = await prisma.user.update({
                    where: { id },
                    data: {
                        location: obj.location,
                        bio: obj.bio,
                        dateOfBirth: obj.dateOfBirth
                    }, select
                })
            } else if (user.role === "user" || user.role === "admin") {
                newUser = await prisma.user.update({
                    where: { id },
                    data: {
                        name: obj.name,
                        location: obj.location,
                        phone: obj.phone,
                        dateOfBirth: obj.dateOfBirth
                    }, select
                })
            }
        } else if (isAdmin) {
            newUser = await prisma.user.update({
                where: { id },
                data: {
                    phone: obj.phone,
                    name: obj.name
                }, select
            })
        }
        return { success: true, message: "profile updated successfully", newUser }
    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}

export async function BanUserAction(id) {
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

            if (!admin || admin?.banned || admin?.isDeleted || admin?.role !== "admin") {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return { error: true, message: "User not found" }
        }

        if (user.role === "admin" && user.id !== session.user.id) {
            return { error: true, message: "not allowed, access denied" }
        }
        await prisma.user.update({
            where: {
                id
            },
            data: {
                banned: !user.banned
            }
        });

        return { success: true, banned: !user?.banned }
    } catch (error) {
        return { error: true, message: "failed to ban (server error), try again" }
    }
}

export async function ChangeUserImageAction({ ImageUploaded }) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            await RemoveCloudImage(ImageUploaded.publicid)
            return { error: true, message: "user not found ..." }
        }

        const { error } = UserImageValidation(ImageUploaded);
        if (error) {
            await RemoveCloudImage(ImageUploaded.publicid);
            return { error: true, message: error.details[0].message }
        }

        const userDB = await prisma.user.findUnique({ where: { id: user.id }, select: { image: true, publicid: true } });
        if (userDB?.publicid) {
            await RemoveCloudImage(userDB.publicid)
        }

        await prisma.user.update({
            where: { id: user?.id },
            data: {
                image: ImageUploaded.url,
                publicid: ImageUploaded.publicid
            }
        });
        return { success: true }
    } catch (error) {
        return { error: true, message: "internal server error" }
    }
}

export async function CancelBookAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }

        let message;
        await prisma.$transaction(async (trx) => {
            const user = await trx.user.findUnique({
                where: { id: session.user.id }
            });
            if (!user || user?.isDeleted) {
                throw new Error("account not found")
            }
            const booking = await trx.booking.findUnique({
                where: { id }, include: { date: true }
            });
            if (!booking) {
                throw new Error("booking not found")
            }
            if (booking.userid !== user.id) {
                throw new Error("Not allowed, access denied")
            }

            if (booking.date.cancelled) {
                throw new Error("This Booking is already cancelled from admin")
            }

            const bookingStatus = booking.status;

            if (bookingStatus !== "pending" && bookingStatus !== "confirmed") {
                throw new Error(`Cannot cancel this booking because it is already ${bookingStatus}.`)
            }
            if (bookingStatus === "confirmed") {
                const now = new Date();
                const hoursSinceCreated = (now.getTime() - new Date(booking.createdAt).getTime()) / 36e5;
                const hoursUntilTrip = (new Date(booking.date.date).getTime() - now.getTime()) / 36e5;

                if (hoursSinceCreated > 24) {
                    throw new Error("can not cancelled, more than 24 hours passed since booking");
                }

                if (hoursUntilTrip < 48) {
                    throw new Error("can not cancelled, less than 48 hours remaining before the trip");
                }
            }

            await trx.booking.update({
                where: { id: booking.id },
                data: {
                    status: "cancelled"
                }
            });

            await trx.date.update({
                where: { id: booking.date.id },
                data: { maxpeople: { increment: booking.people } }
            });

            const transaction = await trx.transactions.findFirst({
                where: { bookingid: booking.id, userId: session.user.id }
            });

            if (bookingStatus === "pending") {
                await trx.transactions.update({
                    where: { id: transaction.id },
                    data: { status: "rejected", adminId: session.user.id, userNotes: `${user.id} cancelled booking ${booking.id}` }
                });

                message = "Your booking has been cancelled successfully."
            } else if (bookingStatus === "confirmed") {
                await trx.transactions.create({
                    data: {
                        userId: user.id,
                        amount: transaction.amount,
                        type: "booking_refund",
                        bookingid: transaction.bookingid,
                        userNotes: `${user.id} cancelled booking ${booking.id}`
                    }
                });
                const updateUser = await trx.user.update({
                    where: { id: session.user.id },
                    data: { wallet: { increment: transaction.amount } }
                });
                if (!updateUser) {
                    throw new Error("failed to cancelled, try again")
                }
                message = "Your booking has been cancelled and the refund has been added to your wallet."
            }
        })

        return { success: true, status: "cancelled", message };

    } catch (error) {
        return { error: true, message: error.message || "Unexpected server error, please try again later" }
    }
}

export async function depositAction({ userNotes, method, image, userPhoneNumber, amount, transactionId, paymentAccountId }) {
    try {
        const session = await auth();
        if (!session?.user || session?.user?.isDeleted) {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: "Unauthorized, access denied" }
        } else {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            });
            if (!user || user?.isDeleted) {
                if (image?.url) await RemoveCloudImage(image.url);
                return { error: true, message: "Unauthorized, access denied" }
            }
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: "Invalid deposit amount." }
        }

        let data = { amount };
        if (userNotes) { data.userNotes = userNotes };

        if (!method || (method !== "vodafone" && method !== "bank")) {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: "Payment method is not defined or invalid." }
        };

        if (method === "vodafone") {
            data.userPhoneNumber = userPhoneNumber
            const { error } = vodaphoneDepositSchema(data)
            if (error) {
                if (image?.url) await RemoveCloudImage(image.url);
                return { error: true, message: error.details[0].message }
            }
        } else {
            data.transactionId = transactionId
            const { error } = bankDepositSchema(data)
            if (error) {
                if (image?.url) await RemoveCloudImage(image.url);
                return { error: true, message: error.details[0].message }
            }
        }

        if (typeof paymentAccountId !== "number") {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: "Invalid payment account ID." }
        }
        const account = await prisma.paymentAccount.findUnique({
            where: { id: paymentAccountId }
        })
        if (!account) {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: "Selected payment account not found." }
        }
        if (account.method !== method) {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: "Method does not match the selected account method." }
        }

        const { error } = uploadedImageSchema(image);

        if (error) {
            if (image?.url) await RemoveCloudImage(image.url);
            return { error: true, message: error.details[0].message }
        }

        let transaction;
        await prisma.$transaction(async (trx) => {
            const pendingDeposit = await trx.transactions.findFirst({
                where: { type: "deposit", status: "pending" }
            });
            if (pendingDeposit) {
                throw new Error("You have another deposit request still pending, try again after the transaction aproved")
            }
            transaction = await trx.transactions.create({
                data: {
                    ...data,
                    proofUrl: image.url,
                    proofId: image.publicid,
                    type: "deposit",
                    paymentAccountId,
                    userId: session.user.id
                }
            });
        });
        transaction = { ...transaction, amount: Number(transaction.amount) };
        return transaction;
    } catch (error) {
        if (image?.url) await RemoveCloudImage(image.url);
        return { error: true, message: error.message || "Internal server error. Try creating deposit again." };
    }
}

export async function withdrawAction(obj) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        } if (session.isDeleted) {
            return { error: true, message: "Unauthorzed, access denied" }
        }

        if (obj.method === "bank") {
            const { error } = withdrawBankSchema(obj);
            if (error) {
                return { error: true, message: error.details[0].message }
            }
        } else {
            const { error } = withdrawVodafoneSchema(obj);
            if (error) {
                return { error: true, message: error.details[0].message }
            }
        }

        let transaction;
        await prisma.$transaction(async (trx) => {
            const user = await trx.user.findUnique({ where: { id: session?.user?.id } });
            if (!user) {
                throw new Error("An error occurred while processing this withdraw. Please try again.")
            }
            const pendingWithdraw = await trx.transactions.findFirst({
                where: { userId: user.id, status: "pending", type: { in: ["booking_deduct", "withdrawal"] } }
            });
            if (pendingWithdraw) {
                throw new Error(`You have another ${pendingWithdraw.type} request still pending`)
            }
            if (user.wallet.lt(obj.amount)) {
                throw new Error(`Amount in your wallet is not enough`);
            }
            const isWithdrawExist = await trx.transactions.findFirst({
                where: { userId: user.id, type: "withdrawal", status: "pending" }
            });
            if (isWithdrawExist) {
                throw new Error(`You have withdrawal request still processed`);
            }

            if (obj.method === "bank") {
                transaction = await trx.transactions.create({
                    data: {
                        userId: session?.user.id,
                        userAccountName: obj.userAccountName,
                        userBankName: obj.userBankName,
                        userAccountNumber: obj.userAccountNumber,
                        amount: obj.amount,
                        userNotes: user.userNotes,
                        type: "withdrawal"
                    }
                })
            } else if (obj.method === "vodafone") {
                transaction = await trx.transactions.create({
                    data: {
                        userId: session?.user.id,
                        userPhoneNumber: obj.userPhoneNumber,
                        type: "withdrawal",
                        userNotes: obj.userNotes,
                        amount: obj.amount
                    }
                })
            }
        })

        transaction = { ...transaction, amount: obj.amount }
        return transaction

    } catch (error) {
        return { error: true, message: error?.message || "failed to send this withdraw request (server error), try again" }
    }
}

export async function getTransactionsAction({ id, status, page }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.id !== id) {
            return { error: true, message: "not allowed, access denied" }
        }

        const transactions = await prisma.transactions.findMany({
            where: { userId: session.user.id, status, type: { in: ["deposit", "withdrawal"] } },
            orderBy: {
                createdAt: "desc"
            },
            skip: ((page - 1) * 6),
            take: 6
        });

        const Transactions = transactions.map(t => {
            t.amount = Number(t.amount);
            return t
        })
        return Transactions
    } catch (error) {
        return { error: true, message: 'failed to fetch transactions (server error), try again' }
    }
}

export async function getTransactionsCount({ status, id }) {
    try {
        const count = await prisma.transactions.count({
            where: { userId: id, status }
        })
        return count
    } catch (error) {
        return { error: true, message: "failed to fetch transaction count (server error), try again" }
    }
}

export async function getActiveBankAndVcash() {
    try {
        const bank = await prisma.paymentAccount.findFirst({
            where: { isActive: true, method: "bank" }
        });
        const vodafone = await prisma.paymentAccount.findFirst({
            where: { method: "vodafone", isActive: true }
        })
        return { bank, vodafone }
    } catch (error) {
        return { error: true, message: "failed to fetch active bank (server error), try again" }
    }
}

export async function getActiveVcash() {
    try {
        const availableVcash = await prisma.paymentAccount.findFirst({
            where: { isActive: true, method: "vodafone" }
        });
        return availableVcash
    } catch (error) {
        return { error: true, message: "failed to fetch active bank (server error), try again" }
    }
}

export async function getTransferDetails(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized access denied" }
        }
        let transaction = await prisma.transactions.findUnique({
            where: { id },
            include: { paymentAccount: true }
        });
        if (!transaction) {
            return { error: true, message: "transaction not found" }
        }
        if (transaction.userId !== session.user.id) {
            return { error: true, message: "Not allowed, access denied" }
        }

        transaction = { ...transaction, amount: Number(transaction.amount) }
        return transaction
    } catch (error) {
        return { error: true, message: "failed to fetch data (server error), try again" }
    }
}

export async function updateDepositAction({ id, amount, userPhoneNumber, userNotes, uploadedImg, transactionId }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }

        if (uploadedImg) {
            const { error } = uploadedImageSchema(uploadedImg);
            if (error) {
                return { error: true, message: "invalid image uploaded" }
            }
            const trans = await prisma.transactions.findUnique({
                where: { id }
            })
            await RemoveCloudImage(trans.proofId)
        }

        let newTransaction;
        let isNew = false;

        await prisma.$transaction(async (trx) => {
            const transaction = await trx.transactions.findUnique({ where: { id }, include: { paymentAccount: true } });
            if (!transaction) {
                throw new Error("An error occurred while processing this update. Please try again")
            }
            if (transaction.userId !== session.user.id) {
                throw new Error("An error occurred while processing this update. Please try again");
            }
            if (transaction.type !== "deposit") {
                throw new Error("An error occurred while processing your transfer. Please try again")
            }
            if (transaction.status === "approved") {
                throw new Error(`can't update, this transaction is already approved`)
            }
            let data = { amount }
            if (userNotes) { data.userNotes = userNotes }
            if (transaction?.paymentAccount?.method === "bank") {
                data.transactionId = transactionId
                const { error } = bankDepositSchema(data);
                if (error) {
                    throw new Error(error.details[0].message);
                }
            } else {
                data.userPhoneNumber = userPhoneNumber
                const { error } = vodaphoneDepositSchema(data);
                if (error) {
                    throw new Error(error.details[0].message)
                }
            }

            const proofId = uploadedImg?.publicid || transaction.proofId;
            const proofUrl = uploadedImg?.url || transaction.proofUrl;

            data.proofUrl = proofUrl;
            data.proofId = proofId;

            if (transaction.status === "pending") {
                newTransaction = await trx.transactions.update({
                    where: { id },
                    data
                })
            } else if (transaction.status === "rejected") {
                if (transaction.isEdited) {
                    throw new Error("This transaction is edited before")
                }
                data.parentTransactionId = id;
                data.type = "deposit";
                data.userId = session.user.id;
                data.paymentAccountId = transaction.paymentAccountId;
                await trx.transactions.update({
                    where: { id },
                    data: { isEdited: true }
                })
                newTransaction = await trx.transactions.create({
                    data
                })
                isNew = true
            }
        })
        newTransaction = { ...newTransaction, amount }
        return { success: true, message: "updated successfully", newTransaction, isNew }
    } catch (error) {
        return { error: true, message: error.message || "failed to update this transaction (server error), try again" }
    }
}

export async function updateWithdrawalAction({ obj, id }) {
    try {

        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }

        let isNew = false;
        let newTransaction;
        await prisma.$transaction(async (trx) => {
            const user = await trx.user.findUnique({
                where: { id: session.user.id }
            });
            if (!user || user.isDeleted) {
                throw new Error("Unauthorized, access denied");
            }

            const withdraw = await trx.transactions.findUnique({
                where: { id }, include: { paymentAccount: true }
            });

            if (!withdraw || withdraw?.userId !== user.id || withdraw?.type !== "withdrawal") {
                throw new Error("An error occurred while processing this withdraw. Please try again");
            }
            if (withdraw?.status === "approved") {
                throw new Error("cant update, admin already approved this withdraw");
            }
            const diffInMinutes = (Date.now() - new Date(withdraw.createdAt).getTime()) / (1000 * 60);

            if (diffInMinutes > 15) {
                throw new Error("You can’t modify this request after 10 minutes of creation for security reasons.");
            }

            const { error } = withdrawUpdateSchema(obj);
            if (error) {
                throw new Error(error.details[0].message);
            }

            let data = { amount: obj.amount };
            if (obj.userNotes) {
                data.userNotes = obj.userNotes
            }

            if (withdraw.userAccountName) { data.userAccountName = obj.userAccountName }
            if (withdraw.userAccountNumber) { data.userAccountNumber = obj.userAccountNumber }
            if (withdraw.userBankName) { data.userBankName = obj.userBankName }
            if (withdraw.userPhoneNumber) { data.userPhoneNumber = obj.userPhoneNumber };

            if (withdraw.status === "aproved") {
                throw new Error("This withdraw request is already approved by the admin");
            }
            if (withdraw.status === "rejected") {
                throw new Error("This withdraw is rejected you can create another request");
            }

            if (withdraw.status === "pending") {
                newTransaction = await trx.transactions.update({
                    where: { id },
                    data
                })
            }
        });
        newTransaction = { ...newTransaction, amount: obj.amount }
        return { success: true, newTransaction, isNew }
    } catch (error) {
        return { error: true, message: error?.message || "failed to update this withdraw, try again" }
    }
}

export async function RateGuideAction({ id, rating }) {
    try {

        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (typeof rating !== "number") {
            return { error: true, message: "rate must be of type number" }
        }
        if (rating < 0 || rating > 5) {
            return { error: true, message: "rate must be between 0 and 5" }
        }
        const ratedBefore = await prisma.guideReviews.findFirst({
            where: { guideId: id, userId: session.user.id }
        })
        if (ratedBefore) {
            return { error: true, message: "You have rated this guide before" }
        }
        const newRate = await prisma.guideReviews.create({
            data: {
                rate: rating,
                userId: session.user.id,
                guideId: id
            }
        });
        return { success: true, newRate, message: "Rated successfully" }
    } catch (error) {
        return { error: true, message: "failed to rate this guide (server error), try again" }
    }
}

export async function changeUserRoleAction({ id, role }) {
    try {

        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin") {
            return { error: true, message: "not allowed, access denied" }
        }

        const roles = ["admin", "user", "guide"];
        if (!roles.includes(role)) {
            return { error: true, message: `role ${role} not allowed` }
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });
        if (!user || user?.isDeleted) {
            return { error: true, message: "user not found" }
        }
        if (user?.role === "admin") {
            if (user.id === session.user.id) {
                if (role !== "admin") {
                    const users = await prisma.user.count({ where: { role: "admin" } });
                    if (users <= 1) {
                        return { error: true, message: "you are the only admin found, cant change your role now" }
                    }
                } else {
                    return { success: true }
                }

            } else {
                return { error: true, message: "admin can not change role of other admin" }
            }
        }
        await prisma.user.update({
            where: { id },
            data: { role: role }
        });
        return { success: true }

    } catch (error) {
        return { error: true, message: "failed to change role (server error), try again" }
    }
}

export async function getMessagesAction({ email, page }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (session.user.role !== "admin" && session.user.email !== email) {
            {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { error: true, message: "user not found" }
        }

        const messages = await prisma.questions.findMany({
            where: { email: user.email },
            include: {
                user: {
                    select: { name: true, id: true, image: true },
                },
                _count: { select: { replies: true } }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 6,
            skip: ((page - 1) * 6)
        });
        return messages

    } catch (error) {
        return { error: true, message: "failed to fetch messages, try again" }
    }
}

export async function countMessagesAction(email) {
    try {
        const items = await prisma.questions.count({
            where: { email }
        });
        return items
    } catch (error) {
        return { error: true, message: "failed to fetch messages, try again" }
    }
}

export async function getRepliesAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        const question = await prisma.questions.findUnique({
            where: { id }
        });
        if (!question) {
            return { error: true, message: "message not found" }
        }
        if (question.email !== session.user.email) {
            if (session.user.role !== "admin" || session.user.banned) {
                return { error: true, message: "Not allowed, access denied" }
            }
        }
        const replies = await prisma.replies.findMany({
            where: { questionId: id }, include: { sender: { select: { id: true, image: true, name: true } } },
            orderBy: {
                createdAt: "asc"
            }
        });
        return replies

    } catch (error) {
        return { error: true, message: "failed to fetch replies access denied" }
    }
}

export async function createMessageAction({ question, category, image }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (!image && !question) {
            return { error: true, message: "No faileds found to create message" }
        }

        const isbanned = await prisma.setting.findFirst({
            where: { key: session.user.email, value: false }
        });

        if (isbanned) {
            return { error: true, message: "You cant send messages now" }
        }

        const { error } = questionSchema({ category, question });
        if (error) {
            return { error: true, message: error.details[0].message }
        }

        let data = { category, name: session.user.name, email: session.user.email, userId: session.user.id, source: "logged_in" }
        if (question) { data.question = question };
        if (image) {
            data.url = image.url;
            data.publicId = image.publicid;
        }

        if (session.user.phone) {
            data.phone = session.user.phone
        }

        let message = await prisma.questions.create({
            data,
            include: {
                user: {
                    select: { name: true, id: true, image: true }
                }
            }
        });

        message._count = { replies: 0 }
        return message
    } catch (error) {
        return { error: true, message: "failed to create message, access denied" }
    }
}

export async function createReplyAction({ id, text, image }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.isDeleted) {
            return { error: true, message: "Unauthorized, access denied" }
        }
        if (!text && !image) {
            return { error: true, message: "No faileds found to create reply" }
        }

        let data = { senderId: session.user.id, questionId: id };
        if (text) {
            const { error } = replySchema({ text });
            if (error) {
                if (image) await RemoveCloudImage(image.publicid);
                return { error: true, message: error.details[0].message }
            }
            data.text = text
        }
        if (image) {
            data.url = image.url;
            data.publicId = image.publicid;
        }

        let reply;
        let message;
        await prisma.$transaction(async (trx) => {
            const isBanned = await trx.setting.findFirst({
                where: { key: session.user.email, value: false }
            });

            if (isBanned) {
                throw new Error("You can't relpy now")
            }

            const question = await trx.questions.findUnique({
                where: { id }
            });

            if (!question) {
                throw new Error("Message not found");
            }

            if (question.status === "closed") {
                throw new Error("This conversation is closed by the admin")
            }

            if (session.user.email !== question.email) {
                if (session.user.role !== "admin" || session.user.banned) {
                    throw new Error("Not allowed, access denied");
                }
                if (question.adminId) {
                    if (session.user.id !== question.adminId) {
                        throw new Error("another admin reply to this message");
                    }
                } else {
                    await trx.questions.update({
                        where: { id },
                        data: { adminId: session.user.id }
                    })
                }
                message = await trx.questions.update({
                    where: { id },
                    data: { status: "waiting_for_user" }
                })
            } else {
                message = await trx.questions.update({
                    where: { id },
                    data: {
                        status: "waiting_for_admin"
                    }
                })
            }
            reply = await trx.replies.create({
                data,
                include: {
                    sender: { select: { id: true, image: true, name: true } }
                }
            });

        });

        return { reply, status: message.status };
    } catch (error) {
        if (image) await RemoveCloudImage(image.publicid);
        return { error: true, message: error.message || "faild to reply, try again" }
    }
}

export async function removeMessageAction(id) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: true, message: "Unauthorized, access denied" }
        }

        let publicIds = [];
        let replies = [];
        await prisma.$transaction(async (trx) => {
            const message = await trx.questions.findUnique({
                where: { id }, include: { replies: true }
            });
            if (!message) {
                throw new Error("Message not found")
            }
            if (message.email !== session.user.email) {
                throw new Error("Not allowed, access denied")
            }

            if (message.publicId) {
                publicIds.push(message.publicId)
            }
            replies = message.replies;

            await trx.questions.delete({
                where: { id }
            });
        });

        if (replies.length > 0) {
            for (let i = 0; i < replies.length; i++) {
                if (replies[i].publicId) {
                    publicIds.push(replies[i].publicId)
                }
            }
        };

        if (publicIds.length > 0) {
            await RemoveCloudImages(publicIds);
        }

        return { success: true, message: "Removed successfully" };

    } catch (error) {
        return { error: true, message: error.message || "failed to remove message, try again" }
    }
}