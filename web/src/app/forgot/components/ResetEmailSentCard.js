"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetEmailSentCard({ email, onResend, isLoading }) {
  return (
    <Card className="min-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Check your inbox!</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-center font-semibold">{email}</p>
        <p className="mt-4 text-sm text-gray-600">
          Please click the link in the email to continue. You may need to check your
          spam folder.
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
