"use client";

import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import { useState } from "react";
import ForgotForm from "./components/ForgotForm";
import ResetEmailSentCard from "./components/ResetEmailSentCard";

const initialState = { email: "" };

export default function ForgotPage() {
  const [formState, setField] = useFormReducer(initialState);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRequestResetPassword = async () => {
    setError(null);
    setIsLoading(true);
    const { email } = formState;

    try {
      await apiClient("/api/forgot", { method: "POST", body: { email } });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    const { email } = formState;

    try {
      await apiClient("/api/forgot", { method: "POST", body: { email } });
    } catch (err) {
      setError(err.message);
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
      error={error}
      onSubmit={handleRequestResetPassword}
    />
  );
}
