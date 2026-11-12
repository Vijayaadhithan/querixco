import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Website terms — QuerixAI" },
      {
        name: "description",
        content:
          "Information about QuerixAI website demonstrations, catalogue examples and service enquiries.",
      },
    ],
  }),
  component: LegalPage,
});
function LegalPage() {
  return (
    <MarketingShell>
      <article className="qx-container qx-legal">
        <p className="qx-eyebrow">WEBSITE INFORMATION</p>
        <h1>Website terms.</h1>
        <p>
          This website introduces QuerixAI search, interactive commerce and commerce intelligence.
          Contact <a href="mailto:hello@querix.co">hello@querix.co</a> to discuss service
          availability and your intended use.
        </p>
        <h2>Demonstrations and examples</h2>
        <p>
          Public product examples, prices, industry scenarios and dashboard figures are
          illustrative. They are not an offer to sell the displayed products, verified stock
          information or evidence of measured customer results. Industry previews describe possible
          shopping journeys; supported catalogue scope and integrations must be confirmed for your
          project.
        </p>
        <h2>Private demo access</h2>
        <p>
          The live commerce demo requires an approved account. Use only the access assigned to you.
          Its historical catalogue metadata does not verify current prices, stock, fitment or
          variant availability.
        </p>
        <h2>Commercial services</h2>
        <p>
          Sending an enquiry or preparing an email draft does not create a service agreement.
          Deployment scope, costs, support, data handling and commercial terms are agreed
          separately. Documentation and public previews should be evaluated against your
          requirements before integration.
        </p>
        <h2>Questions</h2>
        <p>
          For integration, proof-of-concept or website questions, contact{" "}
          <a href="mailto:hello@querix.co">hello@querix.co</a>. For information about this website’s
          handling of data, see the <a href="/privacy">privacy notice</a>.
        </p>
      </article>
    </MarketingShell>
  );
}
