// Backend login for multi-role JWT auth
export const loginWithBackend = async (
  email: string,
  password: string
): Promise<
  | { success: true; user: any; token: string }
  | { success: false; error: string }
> => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return { success: true, user: data.user, token: data.token };
  } catch (error: any) {
    return { success: false, error: error.message || "Login failed" };
  }
};

// Example: use this for all secure API calls
export const fetchWithAuth = async (
  url: string,
  token: string,
  options: any = {}
) => {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};
