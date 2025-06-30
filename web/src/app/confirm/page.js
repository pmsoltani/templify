"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ConfirmationStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("verifying"); // one of verifying/success/error
  const [message, setMessage] = useState("Verifying your account, please wait...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No confirmation token found. Please check the link from your email.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/confirm?token=${token}`
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong!");

        setStatus("success");
        setMessage(data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        {status === "verifying" && (
          <CardTitle className="text-center text-2xl">Verifying...</CardTitle>
        )}
        {status === "success" && (
          <CardTitle className="text-center text-2xl text-green-600">
            Success!
          </CardTitle>
        )}
        {status === "error" && (
          <CardTitle className="text-center text-2xl text-red-600">Error</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-700">{message}</p>
      </CardContent>
      {status === "success" && (
        <CardFooter>
          <Button onClick={() => router.push("/login")} className="w-full">
            Login
          </Button>{" "}
        </CardFooter>
      )}
    </Card>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationStatus />
    </Suspense>
  );
}
