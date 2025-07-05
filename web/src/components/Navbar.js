"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  // During server render and initial client render, isMounted is false.
  if (!isMounted) return null; // or return a loading skeleton

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <Link href="/" className="text-xl font-bold">
        Templify
      </Link>
      <div>
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="mr-4 hover:text-blue-600">
              Dashboard
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="mr-4 hover:text-blue-600">
              Login
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
