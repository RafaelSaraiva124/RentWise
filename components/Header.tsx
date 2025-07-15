"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "next-auth";

const Header = ({ session }: { session: Session }) => {
  const pathname = usePathname();

  return (
    <header className="my-10 flex justify-between items-center gap-5">
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="logo"
          width={100}
          height={100}
          className="object-contain"
        ></Image>
      </Link>
      <ul className="flex flex-row items-center gap-8">
        <li className="flex flex-row items-center gap-8">
          <Link
            href="/dashboard"
            className={cn(
              "text-base cursor-pointer capitalize",
              pathname === "/dashboard" ? "text-light-200" : "text-light-100",
            )}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/my-profile">
            <Avatar>
              <AvatarFallback className="text-gray-800 bg-primary">
                {getInitials(session?.user?.name || "IN")}
              </AvatarFallback>
            </Avatar>
          </Link>
        </li>
      </ul>
    </header>
  );
};
export default Header;
