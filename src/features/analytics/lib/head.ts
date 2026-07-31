type PrivatePortalMeta = { title: string } | { name: string; content: string };

export function privatePortalMeta(title: string): PrivatePortalMeta[] {
  return [
    { title },
    { name: "robots", content: "noindex, nofollow" },
    { name: "googlebot", content: "noindex, nofollow" },
    { name: "referrer", content: "strict-origin-when-cross-origin" },
  ];
}
