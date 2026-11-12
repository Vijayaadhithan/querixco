import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Website privacy — QuerixAI" },
      {
        name: "description",
        content:
          "How the QuerixAI website handles demo enquiries, interactive previews and sign-in sessions.",
      },
    ],
  }),
  component: PrivacyPage,
});
function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="qx-container qx-legal">
        <p className="qx-eyebrow">WEBSITE INFORMATION</p>
        <h1>Privacy on this website.</h1>
        <p>
          This notice describes the public QuerixAI website and its demo sign-in. Data handling for
          a customer deployment should be agreed as part of that deployment.
        </p>
        <h2>Interactive previews</h2>
        <p>
          The public shopping walkthrough and commerce intelligence preview use illustrative data.
          Their controls run in your browser and do not query private customer analytics or submit
          shopping prompts to a live AI service.
        </p>
        <h2>Demo enquiries</h2>
        <p>
          The enquiry form prepares an email draft in your browser. The form does not automatically
          send your details. If you open and send that draft through your email app, your chosen
          email provider processes the message and the QuerixAI team receives the details you
          include to respond to your enquiry.
        </p>
        <h2>Sign-in and sessions</h2>
        <p>
          Private commerce and analytics workflows require authentication. They use session cookies
          to maintain access. When you use those services, your requests are processed by the
          relevant backend; signed-in commerce conversations can be saved to your account. Do not
          include sensitive personal information in demonstration conversations.
        </p>
        <h2>Website delivery</h2>
        <p>
          The website is delivered through Cloudflare and loads fonts from Google Fonts. Requests to
          those services include the network information needed to deliver their content. Hosting
          and backend services may process operational logs to support service delivery and
          diagnostics.
        </p>
        <h2>Contact</h2>
        <p>
          For questions about website privacy or information you have shared with us, email{" "}
          <a href="mailto:hello@querix.co">hello@querix.co</a>.
        </p>
      </article>
    </MarketingShell>
  );
}
