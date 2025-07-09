"use client";

import { getAuthToken } from "@/lib/auth";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AccountMenuDropdown from "./app/AccountMenuDropdown";
import Logo from "./Logo";
import { Button } from "./ui/button";

export default function Navbar({ breadcrumb }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { templateId } = useParams();

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, []);

  return (
    <header className="flex items-center justify-between w-full gap-4 h-10 px-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-right gap-4">
        <Link href={isLoggedIn ? "/app" : "/"} className="flex items-center space-x-2">
          <Logo />
          <span className="font-semibold text-lg hidden sm:block">Templify</span>
        </Link>

        {isLoggedIn && templateId && <span className="text-gray-400">|</span>}
        <nav className="flex items-center">{breadcrumb}</nav>
      </div>

      {isLoggedIn ? (
        <AccountMenuDropdown />
      ) : (
        <div className="flex items-center">
          <Link href="/login" className="mr-4 hover:text-blue-600">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
