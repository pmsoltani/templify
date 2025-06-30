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

export default function RegisterForm({
  formState,
  dispatch,
  isLoading,
  error,
  onSubmit,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmit();
  };

  const handleFieldChange = (e) => {
    dispatch({ type: "SET_FIELD", field: e.target.name, payload: e.target.value });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Sign up to use Templify</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              value={formState.email}
              onChange={handleFieldChange}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={handleFieldChange}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="passwordConfirm">Confirm password</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              value={formState.passwordConfirm}
              onChange={handleFieldChange}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
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
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
