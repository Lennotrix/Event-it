import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param redirectTo - Optional: Where the user gets redirected after.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
    type: "error" | "success",
    path: string,
    message: string,
    redirectTo?: string | undefined,
) {
  const params = new URLSearchParams({
    [type]: message,
  });

  if (redirectTo) {
    params.append("redirect", redirectTo);
  }

  return redirect(`${path}?${params.toString()}`);
}

export const baseUrl = process.env.NODE_ENV === "development" ?
    "http://localhost:3000" : process.env.VERCEL_URL!;
