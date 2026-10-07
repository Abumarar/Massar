import { Redirect } from 'expo-router';

/**
 * Fallback route handler for any legacy or deep links pointing to /(auth)/login.
 * Smoothly redirects to the main auth entrance at /(auth).
 */
export default function LoginRouteRedirect() {
  return <Redirect href="/(auth)" />;
}
