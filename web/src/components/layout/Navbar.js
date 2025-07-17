"use client";

import { getAuthToken, removeAuthToken } from "@/lib/auth";
import { LayoutIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "../common/Logo";
import { Button } from "../ui/button";

export default function Navbar({ breadcrumb, dropdown }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between w-full gap-4 h-10 px-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-right gap-4">
        <Link href={isLoggedIn ? "/app" : "/"} className="flex items-center space-x-2">
          <Logo />
        </Link>

        <nav className="flex items-center">{breadcrumb}</nav>
      </div>

      {isLoggedIn ? (
        <>
          {dropdown ? (
            dropdown
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/app" className="hover:text-blue-600">
                <Button size="sm" variant="">
                  <LayoutIcon />
                  App
                </Button>
              </Link>
              <Button size="sm" variant="outline" title="Logout" onClick={handleLogout}>
                <LogOutIcon />
              </Button>
            </div>
          )}
        </>
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
