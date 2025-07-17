"use client";

import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import makeToast from "@/utils/makeToast";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import ResetForm from "./components/ResetForm";
import ResetSuccessCard from "./components/ResetSuccessCard";

const initialState = { password: "", passwordConfirm: "" };

function ResetStatus() {
  const searchParams = useSearchParams();
  const [formState, setField] = useFormReducer(initialState);

  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      toast.error("No confirmation token found. check the link.");
      return;
    }

    setToken(token);
  }, [searchParams]);

  const handleResetPassword = async () => {
    setIsLoading(true);

    const { password, passwordConfirm } = formState;

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient("/api/reset", { method: "POST", body: { token, password } });
      setIsSubmitted(true);
    } catch (err) {
      makeToast("Failed to reset password", err);
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
