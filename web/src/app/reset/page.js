"use client";

import { useEffect, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResetSuccessCard from "./components/ResetSuccessCard";
import ResetForm from "./components/ResetForm";

const initialState = { password: "", passwordConfirm: "" };

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.payload };
    default:
      return state;
  }
}

export default function ResetPage() {
  const searchParams = useSearchParams();

  const [formState, dispatch] = useReducer(formReducer, initialState);

  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No confirmation token found. Please check the link.");
      return;
    }

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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

  return isSubmitted ? (
    <ResetSuccessCard />
  ) : (
    <ResetForm
      formState={formState}
      dispatch={dispatch}
      isLoading={isLoading}
      error={error}
      onSubmit={handleResetPassword}
    />
  );
}
