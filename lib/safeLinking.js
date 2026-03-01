import { Linking } from 'react-native';

function normalizeHttpUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    const protocol = parsed.protocol.toLowerCase();
    // Only allow http(s) to avoid opening unsafe custom schemes.
    if (protocol !== 'http:' && protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function openExternalUrl(url) {
  const normalizedUrl = normalizeHttpUrl(url);
  if (!normalizedUrl) return false;
  const canOpen = await Linking.canOpenURL(normalizedUrl);
  if (!canOpen) return false;
  await Linking.openURL(normalizedUrl);
  return true;
}
