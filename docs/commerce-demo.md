# Interactive commerce demo

## Pages and local preview

- `/use-cases/conversational-commerce`: public product story and demo entry point.
- `/demo/commerce`: responsive shopping workspace, excluded from indexing.
- The homepage navigation and demo buttons link to these pages.

Run `npm run dev`, then open `/demo/commerce` on the printed local URL.
The local demo automatically selects Live catalog when configured. Sample mode
remains an explicit option and is remembered for the tab. Refreshing live mode
restores the conversation, cards, preferences, and pending request recovery.

From the backend checkout, configure the frontend once:

```sh
.venv/bin/python scripts/setup_local_frontend.py
```

This preserves existing bindings and creates a dedicated non-admin identity. Its
credential files and the frontend's `.dev.vars` are ignored and mode 0600.
Start these in separate terminals:

```sh
# conversational_commerce checkout
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# querixco checkout
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/demo/commerce`. Use the same hostname consistently,
since localhost and 127.0.0.1 have different cookies. The catalog coverage panel
reads the active generation from `/catalog/summary`; there is no frontend subset
or 11-product limit in live mode. Archived imports are versioned snapshots, not
additional products to merge into the current catalog. No reimport, re-embedding,
or model-provider change is needed.

No credentials or backend services are needed for the sample walkthrough.

## Sample content

The optional sample mode has 11 fictional products: five moisturizers, three shampoos,
and three shirts. Original local SVG illustrations, brands, prices, attributes,
and responses are clearly identified as sample content. There are no fabricated
customer testimonials, production metrics, stock claims, or checkout flows.

Try these journeys:

1. “A moisturizer for dry skin under $30” → “Under $20 instead” → Compare first two.
2. “Shampoo under $15 and moisturizer under $25” → “Moisturizer under $20 instead”.
3. “A cotton shirt for adult men under $40” → View listing details.
4. “Moisturizer under $2” to see the empty-result state.

Sample responses are deterministic, not model inference. They support a bounded
set of examples: named categories, USD upper budgets, fragrance-free, more,
cheaper, details, and comparisons. Unsupported requests get guidance. Shared or
ambiguous multi-task constraints ask for scope. Real conversational intent
handling belongs to the commerce backend.

The sample snapshot is saved locally for 24 hours after an interaction. New
conversation deletes it after confirmation. No sample messages go to the backend.
Missing live product facts are never filled with these fictional attributes.

## Optional live connection

Live mode stays disabled unless all three server-side settings are present.
Place local settings in ignored `.dev.vars` (not in browser `VITE_*` variables):

```dotenv
COMMERCE_API_URL=http://127.0.0.1:8000
COMMERCE_API_TOKEN=<dedicated non-admin commerce API token>
COMMERCE_SESSION_SECRET=<random secret of at least 32 characters>
```

Use the backend's existing user-provisioning CLI to create a dedicated demo
identity. Do not reuse an analytics credential or administrator token. Obtain
these secrets through the local deployment process; never commit them. No model
provider credentials are needed by this frontend. Restart Vite after configuring
Worker bindings. For hosted deployment, configure Worker secrets and a protected
HTTPS commerce origin instead of localhost.

The `src/server.ts` entry handles `/api/commerce/*` before delegating to TanStack
Start. The browser never receives the service token or signing secret. Gateway
message routes use the signed cookie's conversation. Explicit saved-chat open and
delete actions verify the signed-in user's ownership and category access before
selecting or deleting a supplied conversation ID. The HttpOnly, SameSite=Strict cookie expires after
24 hours and is Secure on HTTPS. Mutations require a matching Origin header.
Session creation and message submission preserve durable backend retry keys.
Connecting and refreshing restore a browser session without creating a saved chat.
`session/start` persists a conversation only when the user submits the first valid
message; creation keeps the same durable retry key if its response is lost. The
browser tracks `session_id` for recovery and `conversation_id` for saved-chat
selection separately. Repeated New chat clicks on an empty draft are local.
Legacy default-title entries are checked for messages before the UI groups them
under collapsed Empty chats. A failed check leaves the entry in the main list.
Each saved row has a confirmed delete action; deleting an older chat preserves the
current conversation, and deleting the active chat returns to an unsaved draft.
Pending live requests survive tab refresh through sessionStorage. Live mode reconnects automatically after refresh. Pending operations are bound
to the session that created them, so an expired session does not replay a stale
message into a new conversation.

The gateway uses one dedicated backend service owner, with browser isolation
implemented at the gateway. Backend user-based rate limits are therefore shared
by demo visitors. This is suitable for a controlled demo, not a completed public
guest-identity system. Before anonymous launch, add per-visitor abuse limits,
retention cleanup, a global usage budget and deployment capacity validation.
Do not expose arbitrary backend routes through this credential. Restrict access
to the backend independently; the server-side token must remain private.

No raw upstream error text or private model configuration is returned. Responses
are uncached. Live catalog prices retain their historical USD context. Images
use HTTPS URLs with no referrer; absent/broken images get a neutral fallback.
No external purchase links are invented. Comparison tables use returned listing
attributes and label unknown fields; current inventory remains unverified.

## Validation and boundaries

`npm run check` covers types, formatting/lint, tests, unused-code detection, and
production build. Commerce tests cover independent task budgets, strict upper
bounds, unsupported currencies, empty results, original product references,
visitor isolation, forged cookies, CSRF, durable retry forwarding, byte limits,
and safe upstream failures.

The repeatable local integration check is `scripts/check_frontend_live.py` in
the backend repository. It exercises the browser-facing gateway against real
models and the active catalog, using only its own disposable conversations. The UI is a single conversation feed with inline product cards and comparisons,
a fixed composer, and a compact preferences drawer. Earlier result sets stay
in the transcript; follow-up actions are enabled only on the latest response.
Live requests negotiate server-sent events via `Accept: text/event-stream`.
The backend streams real queue/planning/search progress, then the committed
reply text, product metadata, and final response. This is validated response
streaming, not raw model-token streaming: the structured intent and unvalidated
products are never displayed. Stop waiting closes the browser stream; backend
work finishes safely and the same request key recovers the committed result.
JSON clients and older backends retain their existing response contract.
Proxy requests have a 480-second ceiling to accommodate local model inference; a timeout leaves the same request key
available for recovery. Keep the backend's supported single-worker deployment.
The authenticated catalog summary endpoint is read-only. Catalog contents, model
configuration, and production deployment remain unchanged.

## Isolated shopping sections

The same chat interface is available at `/clothing`, `/beauty`, `/footwear`, and
`/fashion` (fashion accessories). All 14 families in the real 50,000-product
catalog are mapped exactly once. Restart the backend after updating; the section
gateway refuses older backends that do not confirm the requested scope.

Each section uses a separate signed cookie and conversation. Navigation restores
that section's history and preferences, including across tabs. Pending retries
are keyed by section. A new-chat reset affects only that section. The legacy
mixed chat and fictional sample walkthrough remain at `/demo/commerce`; new
section routes use live data and never silently substitute those sample products.

Cross-section requests display handoff links inside the assistant turn. Each
link carries only the literal new request through short-lived browser session
storage, prefills the destination composer, and asks the visitor to review and
send. Existing preferences from the source section are not copied. Multi-section
requests get separate links; ambiguous shared constraints need clarification.

Local URLs (with `npm run dev -- --host 127.0.0.1 --port 5173`):

- `http://127.0.0.1:5173/clothing`
- `http://127.0.0.1:5173/beauty`
- `http://127.0.0.1:5173/footwear`
- `http://127.0.0.1:5173/fashion`

See the backend `docs/conversations.md` for the taxonomy, read-only catalog audit,
252-case live evaluation command, and manual cross-section test sequence.
