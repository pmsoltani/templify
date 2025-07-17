"use client";

import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import makeToast from "@/utils/makeToast";
import { useState } from "react";
import ForgotForm from "./components/ForgotForm";
import ResetEmailSentCard from "./components/ResetEmailSentCard";

const initialState = { email: "" };

export default function ForgotPage() {
  const [formState, setField] = useFormReducer(initialState);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRequestResetPassword = async () => {
    setIsLoading(true);
    const { email } = formState;

    try {
      await apiClient("/api/forgot", { method: "POST", body: { email } });
      setIsSubmitted(true);
    } catch (err) {
      makeToast("Failed to request password reset.", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const { email } = formState;

    try {
      await apiClient("/api/forgot", { method: "POST", body: { email } });
    } catch (err) {
      makeToast("Failed to resend reset email.", err);
    } finally {
      setIsLoading(false);
    }
  };

  return isSubmitted ? (
    <ResetEmailSentCard
      email={formState.email}
      onResend={handleResend}
      isLoading={isLoading}
    />
  ) : (
    <ForgotForm
      formState={formState}
      setField={setField}
      isLoading={isLoading}
      onSubmit={handleRequestResetPassword}
    />
  );
}
