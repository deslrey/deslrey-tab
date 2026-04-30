export const normalizeUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
};

export const buildFaviconUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(normalizeUrl(rawUrl));
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return "";
  }
};

export const buildGoogleFaviconUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(normalizeUrl(rawUrl));
    return `https://www.google.com/s2/favicons?sz=256&domain_url=${encodeURIComponent(parsed.origin)}`;
  } catch {
    return "";
  }
};

export const extractHostAndInitial = (rawUrl: string) => {
  try {
    const parsed = new URL(normalizeUrl(rawUrl));
    const host = parsed.hostname.replace("www.", "");
    const first = host[0]?.toUpperCase() ?? "A";
    return { host, first, origin: parsed.origin };
  } catch {
    return null;
  }
};
