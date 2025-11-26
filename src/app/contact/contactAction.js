"use server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { questionSchema } from "./contactSchema";

export async function questionAction(data) {
    try {
        const session = await auth();

        const { error } = questionSchema(data);

        if (error) {
            return { error: true, message: error.details[0].message }
        }

        if (session?.user) {
            data.email = session.user.email;
        } else {
            data.email = data.email.trim();
        }


        const isBanned = await prisma.setting.findFirst({
            where: { key: data.email, value: false }
        });

        if (isBanned) {
            return { error: true, message: "Can't send messages now" }
        }

        let message = "Your message was sent successfully";
        if (session?.user) {
            data.userId = session.user.id;
            data.name = session.user.name;
            data.source = "logged_in"
            if (session.user.phone) {
                data.phone = session.user.phone;
            }
        } else {
            const trueClientMessages = await prisma.setting.findFirst({
                where: {
                    key: { equals: "client messages", mode: "insensitive" }, value: false
                }
            });

            if (trueClientMessages) {
                return { error: true, message: "You have to log-in to send messages" }
            }

            const user = await prisma.user.findUnique({
                where: { email: data.email }
            });

            if (user) {
                if (!user.allowGuestMessages) {
                    return { error: true, message: "You have to log-in to send messages" }
                }
                data.userId = user.id;
                data.name = user.name;
                data.source = "linked_email"
                if (user.phone) {
                    data.phone = user.phone
                }
            } else {
                data.source = "guest"
                message = "Your message was sent successfully, you have to sign-up to see admin response"
            }
        }

        await prisma.questions.create({
            data
        });

        return { success: true, message }

    } catch (error) {
        return { error: true, message: "failed to send message, try again" }
    }
}

