"use client";

import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ResetForm from "./components/ResetForm";
import ResetSuccessCard from "./components/ResetSuccessCard";

const initialState = { password: "", passwordConfirm: "" };

function ResetStatus() {
  const searchParams = useSearchParams();
  const [formState, setField] = useFormReducer(initialState);

  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return setError("No confirmation token found. Please check the link.");

    setToken(token);
  }, [searchParams]);

  const handleResetPassword = async () => {
    setError(null);
    setIsLoading(true);

    const { password, passwordConfirm } = formState;

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient("/api/reset", { method: "POST", body: { token, password } });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return isSubmitted ? (
    <ResetSuccessCard />
  ) : (
    <ResetForm
      formState={formState}
      setField={setField}
      isLoading={isLoading}
      error={error}
      onSubmit={handleResetPassword}
    />
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetStatus />
    </Suspense>
  );
}
