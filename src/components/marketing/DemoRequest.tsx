import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Copy } from "lucide-react";
import { MarketingShell } from "./MarketingShell";

type Intent = "demo" | "integration" | "poc";
const intentLabels: Record<Intent, string> = {
  demo: "Request a demo",
  integration: "Discuss integration",
  poc: "Request a proof of concept",
};

type Product = "search" | "commerce" | "both";
const productLabels: Record<Product, string> = {
  search: "Intelligent search",
  commerce: "Interactive commerce",
  both: "Search and interactive commerce",
};

export function DemoRequest({
  initialProduct,
  initialIntent = "demo",
}: {
  initialProduct: Product;
  initialIntent?: Intent;
}) {
  const [draft, setDraft] = useState<{ text: string; href: string } | null>(null);
  const [status, setStatus] = useState("");
  const draftRef = useRef<HTMLHeadingElement>(null);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const product = String(data.get("product")) as Product;
    const intent = String(data.get("intent")) as Intent;
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    if (!name || !company) {
      setStatus("Please enter your name and company or website.");
      return;
    }
    const text = `Hello Querix team,\n\nRequest: ${intentLabels[intent]}\n\nI'd like to explore ${productLabels[product]}.\n\nName: ${name}\nWork email: ${email}\nCompany / website: ${company}\n\nWhat we'd like to explore:\n${String(data.get("message") ?? "").trim() || "Please help us explore the right fit for our catalog."}\n\nThank you,\n${name}`;
    const subject = `Querix — ${intentLabels[intent]} — ${productLabels[product]}`;
    setDraft({
      text,
      href: `mailto:hello@querix.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    });
    setStatus("");
    requestAnimationFrame(() => draftRef.current?.focus());
  }
  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`To: hello@querix.co\n\n${draft.text}`);
      setStatus("Draft copied. Paste it into an email to hello@querix.co.");
    } catch {
      setStatus("Copy is unavailable. Select the draft below and copy it manually.");
    }
  }
  return (
    <MarketingShell active="/request-demo">
      <div className="qx-container qx-request-layout">
        <div className="qx-request-copy">
          <p className="qx-eyebrow">LET’S TALK ABOUT YOUR CATALOG</p>
          <h1>
            Let’s explore what
            <br />
            Querix can do for you.
          </h1>
          <p>
            Tell us what you’re building and what shoppers need to find. Share your catalog context
            and choose a demo, integration discussion or focused proof of concept.
          </p>
          <ol className="qx-request-steps">
            <li>
              <span>01</span>
              <div>
                <strong>Choose what you want to explore</strong>
                <p>Intelligent search, interactive commerce, or both.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Share a little context</strong>
                <p>Your business and the shopping journeys that matter.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Send your request by email</strong>
                <p>Review the prepared draft, then send it from your email app.</p>
              </div>
            </li>
          </ol>
          <p className="qx-small-note">
            We’ll review the fit together. Scope, costs and success criteria are agreed before a
            proof of concept begins.
          </p>
          <a href="mailto:hello@querix.co" className="qx-text-link">
            hello@querix.co <ArrowUpRight size={16} />
          </a>
          <p className="qx-small-note">
            Already have a tester account?{" "}
            <a href="/commerce/login">
              <u>Sign in to the demo.</u>
            </a>
          </p>
        </div>
        <div className="qx-request-form">
          <h2>Request a tailored demo</h2>
          <p>All fields are required unless marked optional.</p>
          <form
            onSubmit={prepare}
            onChange={() => {
              setDraft(null);
              setStatus("");
            }}
          >
            <div className="qx-form-fields">
              <label>
                Your name
                <input
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Full name"
                />
              </label>
              <label>
                Work email
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>
              <label>
                Company or website
                <input
                  name="company"
                  required
                  maxLength={180}
                  autoComplete="organization"
                  placeholder="Your company or storefront"
                />
              </label>
              <label>
                I’m interested in
                <select name="product" defaultValue={initialProduct}>
                  <option value="both">Search and interactive commerce</option>
                  <option value="search">Intelligent search</option>
                  <option value="commerce">Interactive commerce</option>
                </select>
              </label>
              <label>
                How can we help?
                <select name="intent" defaultValue={initialIntent}>
                  <option value="demo">Request a demo</option>
                  <option value="integration">Discuss integration</option>
                  <option value="poc">Request a proof of concept</option>
                </select>
              </label>
              <label>
                What would you like to explore? (optional)
                <textarea
                  name="message"
                  rows={4}
                  maxLength={700}
                  placeholder="Your catalog, a customer journey, or an integration goal…"
                />
              </label>
              <button className="qx-button" type="submit">
                Prepare email request <ArrowRight size={17} />
              </button>
            </div>
            <p className="qx-form-note">
              Your details stay in this page until you open or copy the draft. This form does not
              submit a request automatically.
            </p>
          </form>
          {draft && (
            <div className="qx-email-draft">
              <h3 ref={draftRef} tabIndex={-1}>
                Your email draft is ready
              </h3>
              <p>
                Open your email app and send the draft to <strong>hello@querix.co</strong>. Nothing
                has been sent yet.
              </p>
              <textarea aria-label="Prepared demo request" readOnly value={draft.text} />
              <div className="qx-actions">
                <a href={draft.href} className="qx-button">
                  Open email draft <ArrowUpRight size={16} />
                </a>
                <button type="button" onClick={() => void copyDraft()} className="qx-text-link">
                  <Copy size={15} /> Copy draft
                </button>
              </div>
            </div>
          )}
          <p role="status" className="qx-form-note">
            {status}
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
