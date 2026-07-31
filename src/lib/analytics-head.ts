export function privatePortalMeta(title: string) {
  return [
    { title },
    { name: "robots", content: "noindex, nofollow" },
    { name: "googlebot", content: "noindex, nofollow" },
    { name: "referrer", content: "strict-origin-when-cross-origin" },
  ];
}
