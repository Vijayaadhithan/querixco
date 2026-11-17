import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import { Brand } from "./Brand";
import "./marketing.css";
import "./marketing-theme.css";

const products = [
  {
    title: "Intelligent search",
    body: "Match the intent behind every search.",
    href: "/products/search",
    icon: Search,
  },
  {
    title: "Interactive commerce",
    body: "Discover, refine and compare in conversation.",
    href: "/use-cases/conversational-commerce",
    icon: MessageCircle,
  },
];
const links = [["Developers", "/developers"]];

export function MarketingShell({ children, active }: { children: ReactNode; active?: string }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const productMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !productMenu.current?.contains(event.target) &&
        productMenu.current
      )
        productMenu.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (productMenu.current?.open) {
        productMenu.current.open = false;
        productMenu.current.querySelector("summary")?.focus();
      }
      if (open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="qx-site">
      <a href="#main-content" className="qx-skip">
        Skip to content
      </a>
      <header className="qx-header">
        <div className="qx-container qx-nav">
          <a href="/" aria-label="Querix AI home">
            <Brand light interactive />
          </a>
          <nav className="qx-desktop-nav" aria-label="Main navigation">
            <details ref={productMenu} className="qx-product-menu">
              <summary>
                Products <ChevronDown size={13} />
              </summary>
              <div className="qx-product-links">
                {products.map(({ title, body, href, icon: Icon }) => (
                  <a
                    href={href}
                    key={href}
                    aria-current={active === href ? "page" : undefined}
                    onClick={() => {
                      if (productMenu.current) productMenu.current.open = false;
                    }}
                  >
                    <Icon size={18} />
                    <span>
                      <strong>{title}</strong>
                      <small>{body}</small>
                    </span>
                    <ArrowUpRight size={13} />
                  </a>
                ))}
              </div>
            </details>
            {links.map(([label, href]) => (
              <a key={href} href={href} aria-current={active === href ? "page" : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <a href="/request-demo" className="qx-button qx-button-small qx-nav-cta">
            Request a demo <ArrowUpRight size={15} />
          </a>
          <button
            ref={menuButton}
            className="qx-menu"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="qx-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav id="qx-mobile-nav" className="qx-mobile-nav" aria-label="Mobile navigation">
            <span className="qx-mobile-group">EXPLORE THE PRODUCT</span>
            {products.map(({ title, href, icon: Icon }) => (
              <a
                href={href}
                key={href}
                aria-current={active === href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span>
                  <Icon size={16} />
                  {title}
                </span>
                <ArrowUpRight size={15} />
              </a>
            ))}
            <span className="qx-mobile-group">QUERIXAI</span>
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
                <ArrowUpRight size={15} />
              </a>
            ))}
            <a href="/#faq" onClick={() => setOpen(false)}>
              Common questions <ArrowUpRight size={15} />
            </a>
            <a href="/request-demo">
              Request a demo <ArrowUpRight size={15} />
            </a>
            <a href="/commerce/login">
              Demo sign-in <ArrowUpRight size={15} />
            </a>
          </nav>
        )}
      </header>
      <main id="main-content">{children}</main>
      <footer className="qx-footer">
        <div className="qx-container">
          <div className="qx-footer-top">
            <div>
              <a href="/" aria-label="Querix AI home">
                <Brand light />
              </a>
              <p>
                From intent to discovery.
                <br />
                One search. One conversation.
              </p>
            </div>
            <div>
              <span className="qx-label">PRODUCTS</span>
              <a href="/products/search">Intelligent search</a>
              <a href="/use-cases/conversational-commerce">Interactive commerce</a>
            </div>
            <div>
              <span className="qx-label">RESOURCES</span>
              <a href="/developers">Developer documentation</a>
              <a href="/developers/commerce">Commerce integration</a>
              <a href="/#faq">Common questions</a>
              <a href="/commerce/login">
                Demo sign-in <ArrowUpRight size={13} />
              </a>
            </div>
            <div>
              <span className="qx-label">CONTACT & INFORMATION</span>
              <a href="/request-demo">Contact & demos</a>
              <a href="/privacy">Privacy</a>
              <a href="/legal">Website terms</a>
              <a href="mailto:hello@querix.co">
                hello@querix.co <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
          <div className="qx-footer-bottom">
            <span>© {new Date().getFullYear()} Querix AI</span>
            <span>Search with intent. Shop in conversation.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function DemoCta({ product = "both" }: { product?: "search" | "commerce" | "both" }) {
  return (
    <section className="qx-cta">
      <div className="qx-container qx-cta-inner">
        <div>
          <p className="qx-eyebrow">SEE QUERIX IN ACTION</p>
          <h2>
            Bring your next
            <br />
            shopping journey.
          </h2>
          <p>Tell us what your customers need to find. We’ll walk through a focused example.</p>
        </div>
        <a className="qx-button qx-button-white" href={`/request-demo?product=${product}`}>
          Request a demo <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
