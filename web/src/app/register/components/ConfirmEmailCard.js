"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ConfirmEmailCard({ email, onResend, isLoading }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Confirmation email sent</CardTitle>
        <CardDescription>Check your inbox.</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-center font-semibold">{email}</p>
        <p className="mt-4 text-sm text-gray-600">
          Please click the link in the email to activate your account. You may need to
          check your spam folder.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Didn&apos;t receive an email?</p>
        <Button
          onClick={onResend}
          className="w-full"
          disabled={isLoading}
          variant="secondary"
        >
          {isLoading ? "Sending..." : "Resend"}
        </Button>
      </CardFooter>
    </Card>
  );
}
