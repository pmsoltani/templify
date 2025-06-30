"use client";

import { useReducer, useState } from "react";
import ResetEmailSentCard from "./components/ResetEmailSentCard";
import ForgotForm from "./components/ForgotForm";

const initialState = { email: "" };

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.payload };
    default:
      return state;
  }
}

export default function ForgotPage() {
  const [formState, dispatch] = useReducer(formReducer, initialState);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRequestResetPassword = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formState.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong!");
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

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formState.email }),
    });
    setIsLoading(false);
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
      dispatch={dispatch}
      isLoading={isLoading}
      error={error}
      onSubmit={handleRequestResetPassword}
    />
  );
}
