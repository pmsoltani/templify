"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import apiClient from "@/lib/apiClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const statusData = {
  verifying: { title: "Verifying...", className: "text-center text-2xl" },
  success: { title: "Success!", className: "text-center text-2xl text-green-600" },
  error: { title: "Error", className: "text-center text-2xl text-red-600" },
};

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
        await apiClient(`/api/confirm?token=${token}`);
        setStatus("success");
        setMessage("");
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Card className="min-w-sm">
      <CardHeader>
        <CardTitle className={statusData[status].className}>
          {statusData[status].title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-700">{message}</p>
      </CardContent>
      {status === "success" && (
        <CardFooter>
          <Button onClick={() => router.replace("/login")} className="w-full">
            Login
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationStatus />
    </Suspense>
  );
}
