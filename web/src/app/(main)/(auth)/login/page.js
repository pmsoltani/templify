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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import { setAuthToken } from "@/lib/auth";
import makeToast from "@/utils/makeToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialState = { email: "", password: "" };

export default function LoginPage() {
  const [formState, setField] = useFormReducer(initialState);

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const { email, password } = formState;
    try {
      const data = await apiClient("/api/login", {
        method: "POST",
        body: { email, password },
      });
      setAuthToken(data.data.accessToken);
      router.replace("/app");
    } catch (err) {
      makeToast("Failed to login.", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="min-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Login to your Templify account</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
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
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={setField}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              Login
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
