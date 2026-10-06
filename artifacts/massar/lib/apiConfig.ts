// This utility handles fetching the API URL dynamically to avoid government blocks.
// If the primary domain is blocked, it fetches an alternative domain from a highly-available remote config (e.g. GitHub Gist or Firebase Remote Config).

import Constants from 'expo-constants';

let cachedApiUrl: string | null = null;

// Fallback mechanism in case of deep packet inspection (DPI) blocks
export async function getDynamicApiUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;

  const defaultUrl = Constants.expoConfig?.extra?.apiUrl || 'https://api.massar.com';

  try {
    // Attempt to fetch from a hard-to-block source (like a raw GitHub Gist)
    // const response = await fetch('https://gist.githubusercontent.com/user/gist_id/raw/config.json');
    // const config = await response.json();
    // cachedApiUrl = config.activeApiUrl;
    // return cachedApiUrl;
    
    // For now, return default
    return defaultUrl;
  } catch (error) {
    console.warn('Failed to fetch remote config, falling back to default', error);
    return defaultUrl;
  }
}
