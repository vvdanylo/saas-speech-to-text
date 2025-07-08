import { Button } from '@/components/ui/button';
import { auth, clerkClient } from '@clerk/nextjs/server';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { UserButton } from '@clerk/nextjs';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (email) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingEmailUser) {
          await prisma.user.create({
            data: {
              clerkId: userId,
              email,
            },
          });
        } else {
          await prisma.user.update({
            where: { id: existingEmailUser.id },
            data: { clerkId: userId },
          });
        }
      }
    }
  }

  return (
    <div className={"flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center"}>
      <h1 className={"text-4xl md:text-5xl font-bold mb-4 text-gray-900"}>
        Welcome to Voice-to-Text SaaS
      </h1>
      <p className={"text-lg text-gray-600 max-w-xl mb-8"}>
        Convert your voice to text with ease! Get started for free.
      </p>

      {userId ? (
        <div className={"flex gap-4"}>
          <Button asChild>
            <Link href={"/dashboard"}>Go to Dashboard</Link>
          </Button>
          <UserButton afterSignOutUrl={"/"} />
        </div>
      ) : (
        <div className={"flex gap-4"}>
          <Button asChild>
            <Link href={"/sign-in"}>Sign In</Link>
          </Button>
          <Button asChild variant={"outline"}>
            <Link href={"/sign-up"}>Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
