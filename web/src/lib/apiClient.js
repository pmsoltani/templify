import AppError from "@/lib/AppError";

const apiClient = async (endpoint, options = {}) => {
  try {
    const headers = { ...options.headers };
    const token = localStorage.getItem("authToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    let body;
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (options.body) {
      body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers,
      body,
    });

    if (response.status === 204) return null; // No content response

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new AppError(
          errorData.message || "An API error occurred.",
          response.status,
          errorData.details
        );
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("An API error occurred.", response.status);
      }
    }

    const responseType = options.responseType || "json";
    switch (responseType) {
      case "blob":
        return response.blob();
      case "text":
        return response.text();
      case "json":
      default:
        return response.json();
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(err.message || "A network error occurred.", 500);
  }
};

export default apiClient;
