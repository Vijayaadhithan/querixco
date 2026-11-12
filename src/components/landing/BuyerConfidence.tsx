import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const questions = [
  {
    question: "What does QuerixAI add to my storefront?",
    answer: (
      <>
        QuerixAI provides intent-aware search and conversational product discovery. Shoppers can
        describe a need, refine requirements and compare supplied product details. Search and
        commerce have separate integration and access contracts.{" "}
        <a href="/products/search">Explore search</a> or{" "}
        <a href="/use-cases/conversational-commerce">interactive commerce</a>.
      </>
    ),
  },
  {
    question: "What catalogue data do we need?",
    answer: (
      <>
        Start with product identifiers, names, descriptions, images, prices and relevant attributes.
        The exact field mapping and freshness requirements depend on your catalogue and the journeys
        you want to support. <a href="/developers/data-pipeline">Review catalogue preparation</a>.
      </>
    ),
  },
  {
    question: "Do we need to replace our existing platform?",
    answer: (
      <>
        The integration is designed to connect through your backend, alongside your existing
        storefront. Your team and QuerixAI should agree the API contract, catalogue mapping and
        deployment scope before implementation.{" "}
        <a href="/developers/integration">See the integration guide</a>.
      </>
    ),
  },
  {
    question: "Can we try it before planning an integration?",
    answer: (
      <>
        Yes. The public walkthrough lets you explore sample shopping journeys without signing in.
        The live commerce demo requires an approved account and uses historical catalogue metadata;
        current prices and stock are not verified.{" "}
        <a href="/request-demo?product=commerce&intent=demo">Request a tailored demo</a>.
      </>
    ),
  },
  {
    question: "Are the dashboard figures real customer results?",
    answer: (
      <>
        The public dashboard uses clearly labelled synthetic data to explain the experience. Company
        analytics lives in a separate authenticated workspace. The preview figures are not measured
        improvements in conversion, revenue or engagement.
      </>
    ),
  },
  {
    question: "How are credentials and access handled?",
    answer: (
      <>
        Permanent API credentials stay on your server. Private portals require authentication.
        Search is tenant-scoped; commerce deployment and catalogue-isolation requirements need to be
        agreed separately for your project.{" "}
        <a href="/developers/commerce#access-and-catalog-boundaries">
          Read the current commerce boundaries
        </a>
        .
      </>
    ),
  },
  {
    question: "What would a proof of concept involve?",
    answer: (
      <>
        We can discuss a focused catalogue and a set of representative customer journeys, then agree
        the scope and evaluation criteria together. Include your use case when you{" "}
        <a href="/request-demo?intent=poc">request a proof of concept</a>.
      </>
    ),
  },
  {
    question: "What happens when I request a demo?",
    answer: (
      <>
        Share your company, product interest and the journey you want to explore. Review and send
        the prepared request from your email app; the team can then discuss a suitable session with
        you. A meeting is not booked automatically.
      </>
    ),
  },
];

export function BuyerConfidence() {
  return (
    <>
      <section
        id="company"
        className="ql-section qx-container ql-company"
        aria-labelledby="company-title"
      >
        <div className="ql-company-story">
          <p className="qx-eyebrow">ABOUT QUERIXAI</p>
          <h2 id="company-title">
            Better discovery.
            <br />
            <em>A clear place to start.</em>
          </h2>
          <p>
            QuerixAI builds search and conversational discovery for catalogue-driven businesses. We
            bring the shopper’s intent, your product information and the engineering integration
            into one conversation.
          </p>
          <p>
            Explore the experience, review how it works and bring us the customer journey you want
            to improve.
          </p>
          <a className="qx-text-link" href="/request-demo?intent=integration">
            Talk through your use case <ArrowRight size={15} />
          </a>
          <a className="ql-company-email" href="mailto:hello@querix.co">
            hello@querix.co <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="ql-proof-links">
          {[
            {
              icon: MessageCircle,
              title: "Explore it yourself",
              text: "Discover, refine and compare in a guided shopping preview.",
              href: "#commerce-preview",
              label: "Try the interactive preview",
            },
            {
              icon: BookOpen,
              title: "Review the implementation",
              text: "Read the request contracts, catalogue lifecycle and integration examples.",
              href: "/developers",
              label: "Read the developer guides",
            },
            {
              icon: ShieldCheck,
              title: "Understand the boundaries",
              text: "Review access, credentials and the current commerce catalogue scope.",
              href: "/developers/commerce#access-and-catalog-boundaries",
              label: "Explore data and access",
            },
          ].map(({ icon: Icon, title, text, href, label }) => (
            <a key={title} href={href}>
              <Icon size={21} />
              <span>
                <strong>{title}</strong>
                <span>{text}</span>
                <small>
                  {label} <ArrowUpRight size={12} />
                </small>
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="ql-evaluation">
        <div className="qx-container">
          <div>
            <p className="qx-eyebrow">A PRACTICAL EVALUATION</p>
            <h2>
              Start with your use case.
              <br />
              <em>Define the next step together.</em>
            </h2>
          </div>
          <ol>
            {[
              [
                "Share the journey",
                "Tell us what shoppers need to find and where discovery falls short.",
              ],
              [
                "Review the fit",
                "Discuss your catalogue, existing platform and integration requirements.",
              ],
              ["Agree the scope", "Define a tailored demonstration or focused proof of concept."],
            ].map(([title, body], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <p className="ql-evaluation-note">
            <Check size={13} />
            Scope, costs and success criteria are agreed for your project.
          </p>
        </div>
      </section>
      <section id="faq" className="ql-section qx-container ql-faq" aria-labelledby="faq-title">
        <div>
          <p className="qx-eyebrow">A FEW USEFUL ANSWERS</p>
          <h2 id="faq-title">
            Before we
            <br />
            <em>start talking.</em>
          </h2>
          <p>Practical questions about the product, integration and what to expect.</p>
          <a className="qx-text-link" href="/request-demo?intent=integration">
            Discuss your requirements <ArrowRight size={15} />
          </a>
        </div>
        <div className="ql-faq-list">
          {questions.map(({ question, answer }) => (
            <details key={question} name="querix-faq">
              <summary>
                {question}
                <ChevronDown size={17} />
              </summary>
              <div>{answer}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
