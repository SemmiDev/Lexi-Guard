import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase, UserModel } from "@/lib/mongodb";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectToDatabase();

        // Update or create user in database
        await UserModel.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              name: user.name,
              image: user.image,
              lastLogin: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            }
          },
          { upsert: true, new: true }
        );

        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          await connectToDatabase();
          const dbUser = await UserModel.findOne({ email: session.user.email });
          if (dbUser) {
            session.user = {
              ...session.user,
              id: dbUser._id.toString(),
            };
          }
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
