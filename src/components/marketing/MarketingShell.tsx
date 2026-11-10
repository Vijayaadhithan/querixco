import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./Brand";
import "./marketing.css";

export function MarketingShell({ children, active }: { children: ReactNode; active?: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Search", "/products/search"],
    ["Interactive commerce", "/use-cases/conversational-commerce"],
    ["Developers", "/developers"],
  ];
  return (
    <div className="qx-site">
      <a href="#main-content" className="qx-skip">
        Skip to content
      </a>
      <header className="qx-header">
        <div className="qx-container qx-nav">
          <a href="/" aria-label="Querix AI home">
            <Brand />
          </a>
          <nav className="qx-desktop-nav" aria-label="Main navigation">
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
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                aria-current={active === href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
            <a href="/request-demo">
              Request a demo <ArrowUpRight size={16} />
            </a>
            <a href="/commerce/login">
              Demo sign-in <ArrowUpRight size={16} />
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
                Better discovery.
                <br />
                One search. One conversation.
              </p>
            </div>
            <div>
              <span className="qx-label">PRODUCTS</span>
              <a href="/products/search">Intelligent search</a>
              <a href="/use-cases/conversational-commerce">Interactive commerce</a>
              <a href="/request-demo">Request a demo</a>
            </div>
            <div>
              <span className="qx-label">RESOURCES</span>
              <a href="/developers">Developer documentation</a>
              <a href="/developers/commerce">Commerce integration</a>
              <a href="/commerce/login">
                Demo sign-in <ArrowUpRight size={13} />
              </a>
            </div>
            <div>
              <span className="qx-label">LET’S TALK</span>
              <a href="mailto:hello@querix.co">
                hello@querix.co <ArrowUpRight size={13} />
              </a>
              <p>
                Bring your catalog.
                <br />
                Start with your customers.
              </p>
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
          <p className="qx-eyebrow">YOUR CATALOG. YOUR CUSTOMERS.</p>
          <h2>
            Let’s make discovery
            <br />
            work for your business.
          </h2>
          <p>Bring the searches and shopping journeys that matter to you.</p>
        </div>
        <a className="qx-button qx-button-white" href={`/request-demo?product=${product}`}>
          Request a demo <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
