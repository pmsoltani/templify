"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotForm({
  formState,
  setField,
  isLoading,
  error,
  onSubmit,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Card className="min-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot your passowrd?</CardTitle>
        <CardDescription>Enter your email address for a reset link.</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              value={formState.email}
              onChange={setField}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              Send reset link
            </Button>
          </div>
          {error && (
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-red-500">{error}</p>
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <p className="text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
