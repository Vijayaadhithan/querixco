import { ChevronDown } from "lucide-react";

const questions = [
  {
    question: "What catalog data do we need?",
    answer: (
      <>
        Start with product identifiers, names, descriptions, images, prices and relevant attributes.
        The field mapping and freshness requirements depend on your catalog.{" "}
        <a href="/developers/data-pipeline">Review catalog preparation</a>.
      </>
    ),
  },
  {
    question: "Can we try Interactive Commerce?",
    answer: (
      <>
        The public walkthrough uses sample products. The live demo requires an approved account and
        currently covers clothing, beauty and personal care, footwear, and fashion accessories. Its
        product metadata is historical; current prices, stock and variant availability are not
        verified. <a href="/request-demo?product=commerce">Request demo access</a>.
      </>
    ),
  },
  {
    question: "Does it replace our existing store?",
    answer: (
      <>
        Querix connects through your backend, alongside your storefront. Search and commerce have
        separate integration and access requirements.{" "}
        <a href="/developers/integration">Read the search guide</a> or{" "}
        <a href="/developers/commerce">commerce guide</a>.
      </>
    ),
  },
  {
    question: "What if a product detail is missing?",
    answer: (
      <>
        Answers and comparisons use the information supplied in the catalog. Missing attributes
        remain unknown; the experience should not invent specifications, availability or product
        claims.
      </>
    ),
  },
];

export function BuyerConfidence() {
  return (
    <section id="faq" className="ql-section qx-container ql-faq" aria-labelledby="faq-title">
      <div>
        <p className="qx-eyebrow">COMMON QUESTIONS</p>
        <h2 id="faq-title">A few things to know.</h2>
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
  );
}
