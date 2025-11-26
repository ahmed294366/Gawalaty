import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    pages: { error: "/auth/error" },
    
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.includes("/auth/error")) {
                return url; 
            }
            return `${baseUrl}`;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.banned = user.banned;
                token.role = user.role;
                token.name = user.name;
                token.image = user.image;
                if (user.phone) token.phone = user.phone;
            }
            return token;
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.banned = token.banned;
                session.user.image = token.image;
                if (token.phone) session.user.phone = token.phone;
            }
            return session;
        },

        async signIn({ account, user }) {
            if (!user?.email) {
                return "/auth/error?message=Email not provided by provider.";
            }

            const email = user.email.trim();

            const userDB = await prisma.user.findUnique({
                where: { email },
                include: { accounts: true },
            });


            if (account.provider !== "credentials") {
                if (!userDB) {
                    return true;
                }

                if (userDB.password) {
                    return "/auth/error?message=This email is already registered using credentials. Please use your password.";
                }

                if (!userDB.accounts?.some(a => a.provider === account.provider)) {
                    return "/auth/error?message=You registered using another provider. Please use the same one.";
                }

                return true;
            }

            if (!userDB) {
                return "/auth/error?message=You need to register first.";
            }

            if (!userDB.emailVerified) {
                return "/auth/error?message=Your email is not verified yet.";
            }

            if (!userDB.password) {
                return "/auth/error?message=You registered using Google or Facebook.";
            }

            return true;
        },
    },

    events: {
        async linkAccount({ user }) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
            });
        },
    },

    providers: [

        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password || !user.emailVerified || user.isDeleted) return null;

                const isValid = bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return user;
            },
        })
    ]
});