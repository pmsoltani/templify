"use client";

import { getAuthToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import AccountMenuDropdown from "./app/AccountMenuDropdown";
import Logo from "./common/Logo";
import { Button } from "./ui/button";

export default function Navbar({ breadcrumb }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, []);

  return (
    <header className="flex items-center justify-between w-full gap-4 h-10 px-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-right gap-4">
        <Link href={isLoggedIn ? "/app" : "/"} className="flex items-center space-x-2">
          <Logo />
        </Link>

        <nav className="flex items-center">{breadcrumb}</nav>
      </div>

      {isLoggedIn ? (
        <AccountMenuDropdown />
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-blue-600">
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
