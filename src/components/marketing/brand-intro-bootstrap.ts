// Run before the body paints to avoid flashing the page behind the first-visit intro.
// Without JavaScript this attribute is absent and the page remains accessible.
export const brandIntroBootstrap = String.raw`(() => {
  if (!/^\/(?:$|products(?:\/|$)|use-cases(?:\/|$)|developers(?:\/|$)|request-demo\/?$)/.test(location.pathname)) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('querix-brand-intro-v1')) return;
    sessionStorage.setItem('querix-brand-intro-v1', 'seen');
  } catch { /* The short intro still works when browser storage is unavailable. */ }
  document.documentElement.setAttribute('data-qx-intro', 'active');
  window.setTimeout(() => document.documentElement.removeAttribute('data-qx-intro'), 3400);
})();`;
