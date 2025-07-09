function setAuthToken(token) {
  // Set in localStorage for client-side access
  localStorage.setItem("authToken", token);

  // Set in cookies for middleware access
  document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
}

function removeAuthToken() {
  localStorage.removeItem("authToken");
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

function getAuthToken() {
  return localStorage.getItem("authToken");
}

export { getAuthToken, removeAuthToken, setAuthToken };
