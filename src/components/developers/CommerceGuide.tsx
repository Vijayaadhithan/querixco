import { ArrowUpRight } from "lucide-react";
import { DeveloperShell } from "./DeveloperDocs";
export function CommerceGuide() {
  return (
    <DeveloperShell active="commerce">
      <article className="max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-widest text-workspace-blue">
          Conversational commerce
        </p>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-workspace-ink sm:text-5xl">
          Build around the conversation.
        </h1>
        <p className="mt-6 text-base leading-8 text-workspace-muted">
          The commerce service maintains shopping tasks, preferences, and displayed products across
          turns. Use your backend to connect the customer experience to authenticated conversation
          endpoints.
        </p>
        <div className="mt-8 rounded-lg border border-workspace-blue-line bg-workspace-tint p-5 text-sm leading-7 text-workspace-blue">
          The hosted demo requires an approved tester account. This guide describes the current
          commerce backend; agree deployment access and catalog boundaries before integrating a
          customer catalog.
        </div>
        <section
          id="conversation-lifecycle"
          className="mt-14 scroll-mt-28 border-t border-workspace-line pt-8"
        >
          <h2 className="font-display text-2xl text-workspace-ink">Conversation lifecycle</h2>
          <ol className="mt-6 space-y-5 text-sm leading-7 text-workspace-muted">
            <li>
              <strong className="text-workspace-ink">1. Create a conversation.</strong> Call{" "}
              <code>POST /conversations</code> with <code>mode: "commerce"</code> and the
              appropriate <code>storefront_id</code>. Use the returned conversation ID for
              subsequent requests.
            </li>
            <li>
              <strong className="text-workspace-ink">2. Send a message.</strong> Submit to{" "}
              <code>POST /conversations/&#123;id&#125;/messages</code>. Validated intent updates the
              relevant shopping task and retrieves products when requested.
            </li>
            <li>
              <strong className="text-workspace-ink">3. Continue with saved context.</strong>{" "}
              Follow-ups such as cheaper, more options, details, and comparisons refer to
              task-specific results. Separate product needs retain separate preferences and budgets.
            </li>
            <li>
              <strong className="text-workspace-ink">4. Restore the conversation.</strong> Read{" "}
              <code>GET /conversations/&#123;id&#125;/messages</code> for paginated history and{" "}
              <code>GET /conversations/&#123;id&#125;/preferences</code> for saved shopping state.
            </li>
          </ol>
        </section>
        <section
          id="streaming-and-retries"
          className="mt-14 scroll-mt-28 border-t border-workspace-line pt-8"
        >
          <h2 className="font-display text-2xl text-workspace-ink">Streaming and retries</h2>
          <p className="mt-5 text-sm leading-7 text-workspace-muted">
            Request <code>Accept: text/event-stream</code> for progress, commerce metadata, and
            reviewed reply deltas. Treat intermediate commerce events as provisional. The terminal{" "}
            <code>done</code> event follows persistence of messages, shopping state, and replay
            data.
          </p>
          <p className="mt-4 text-sm leading-7 text-workspace-muted">
            A disconnect does not establish whether the turn committed. Retry with the same
            idempotency key and reconcile the final result before showing the turn as completed.
          </p>
        </section>
        <section
          id="access-and-catalog-boundaries"
          className="mt-14 scroll-mt-28 border-t border-workspace-line pt-8"
        >
          <h2 className="font-display text-2xl text-workspace-ink">
            Access and catalog boundaries
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-workspace-muted">
            <li>
              Keep permanent service credentials on the server. The hosted frontend uses revocable
              user sessions in secure HttpOnly cookies.
            </li>
            <li>
              The backend enforces conversation ownership and storefront grants. Beauty, clothing,
              footwear, and fashion conversations keep separate state.
            </li>
            <li>
              Storefront and conversation isolation do not currently provide private tenant catalog
              isolation. Catalog, index, and cache tenant scoping require separate work before a
              shared private multi-tenant deployment.
            </li>
            <li>
              The demo uses historical catalog metadata. Current price, stock, and variant
              availability are not verified. Missing attributes must remain unknown in the
              interface.
            </li>
          </ul>
        </section>
        <section
          id="integration-checklist"
          className="mt-14 scroll-mt-28 border-t border-workspace-line pt-8"
        >
          <h2 className="font-display text-2xl text-workspace-ink">Integration checklist</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-workspace-muted">
            <li>
              Agree access provisioning, deployment scope, source fields, and catalog freshness
              requirements.
            </li>
            <li>
              Validate category permissions, foreign conversation IDs, session revocation, and empty
              states.
            </li>
            <li>
              Exercise budget refinements, multiple product tasks, comparisons, and absent catalog
              attributes.
            </li>
            <li>Handle interrupted streams and idempotent retries without duplicating turns.</li>
          </ul>
          <a
            className="mt-8 inline-flex items-center gap-2 rounded-md qx-action bg-workspace-ink px-5 py-3 text-sm font-medium text-workspace-ink"
            href="/request-demo?product=commerce"
          >
            Discuss a commerce integration <ArrowUpRight size={16} />
          </a>
        </section>
      </article>
    </DeveloperShell>
  );
}
