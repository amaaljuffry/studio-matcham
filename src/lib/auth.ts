// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
// import whatever providers you are using, e.g.,
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GitHubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  // providers: [
  //   CredentialsProvider({
  //     name: 'Credentials',
  //     credentials: {
  //       email: { label: 'Email', type: 'text' },
  //       password: { label: 'Password', type: 'password' }
  //     },
  //     async authorize(credentials) {
  //       // Add your own logic here to retrieve a user from your database
  //       // and check if credentials are valid.
  //       // Example:
  //       if (credentials?.email === process.env.ADMIN_EMAIL &&
  //           credentials?.password === process.env.ADMIN_PASSWORD) {
  //         return {
  //           id: 'admin-user', // A unique ID for the user
  //           email: process.env.ADMIN_EMAIL,
  //           role: 'admin', // Important for your role-based access control
  //         };
  //       }
  //       return null; // Return null if user cannot be found/authenticated
  //     }
  //   }),
  //   // ... add other providers like Google, GitHub etc.
  // ],
  // pages: {
  //   signIn: '/admin/login', // Specify your custom login page
  // },
  // callbacks: {
  //   async jwt({ token, user }) {
  //     if (user) {
  //       token.role = (user as any).role; // Add role to JWT
  //     }
  //     return token;
  //   },
  //   async session({ session, token }) {
  //     if (token) {
  //       (session.user as any).role = token.role; // Add role to session
  //     }
  //     return session;
  //   }
  // },
  // secret: process.env.NEXTAUTH_SECRET,
};