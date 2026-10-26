# R4 — interrupted commit recovery and explicit reauthentication

R4 closes the logical dead end documented in R3. It does not authorize merge,
deployment, real invitations or the family pilot. No Edge/SQL, Auth configuration,
real accounts/credentials or existing user data were changed.

## Protocol and recovery

Every session/queue mutation now records a write-ahead checkpoint under the same
Web Lock: `{version:2,pending:{before:<SHA256>,after:<SHA256>}}`. It then mutates the
existing storage key and publishes the committed hash. The metadata still contains
no token, session body, user identifier or invitation code.

On reopening, an exact match to `after` completes metadata publication safely.
A stale document waits for that exact state; it does not accept an arbitrary view.
If no exact result can be established, access returns `AUTH_REAUTH_REQUIRED` and
hides the ambiguous session without deleting it. Helper and Kids display their
existing authentication forms, preserving queued revocations and message outboxes.
A fresh, verified, explicitly submitted login may supersede that ambiguous checkpoint,
subject to the normal version/storage-snapshot checks and the same lock. No old
login is restored automatically; no pending revocation is discarded. A stale login
response cannot silently replace a newer committed login.

This also handles valid-but-mismatched R3 hashes and malformed coherence metadata.
It does not bypass backend authentication or fabricate an invitation. Kids/Helper
may need a valid replacement code from Owner through the existing authorized flow;
this review did not issue one.

Migration uses the same checkpoints for destination queue and login writes. Source
login is removed only after verified destination writes; source queue is removed
last. Reopening can therefore finish an exact destination checkpoint and retry the
remaining migration without resurrecting a blocked login.

## Interruption coverage

Thirteen added deterministic cases cover:

- intent persisted, session not written: explicit authentication required;
- session written, final hash absent: exact new session recovered automatically;
- final hash committed but acknowledgment lost: reopening accepts it;
- before/after queue persistence, before/after login removal, after confirmed queue
  removal: no automatic old-login restoration, and existing revocation remains;
- explicit login while an old revocation is pending: queue survives and its later
  completion leaves the new login intact;
- R3 mismatch, malformed metadata and an old client reopening after a new login;
- interrupted migration queue/login checkpoints, preserving source until completion.

A failure before the revocation queue itself is persisted is not reported as a
confirmed logout or guaranteed remote revocation. Once a queue exists, recovery
preserves it. Requests whose remote outcome is unknown remain subject to the real
Auth service's recovery contract; client tests do not prove that contract.

## Results on this revision

- Node: **51 pass / 0 fail** (17 + 15 + 6 + 13).
- Native Mac in-app browser: same **51 pass / 0 fail** using native Web Locks,
  synthetic per-case storage/journal/transport.
- Native localStorage + IndexedDB fixture: injected failure after session write,
  reload, automatic successful access; injected failure before session write,
  reload, `AUTH_REAUTH_REQUIRED`, explicit fresh login, successful access.
- Two real tabs with native storage/locks: **8 repeated handoffs passed**, no refresh
  in the waiting tab. Transport synthetic.
- Closing only the disposable lock-holder tab: remaining tab completed renewal.
- Real-storage offline exit / reload / online resumption: false/1 -> false/1 ->
  false/0 (session present / pending count), without resurrection.
- Real Helper/Kids scripts under a synthetic ambiguous journal: both rendered the
  existing code-login form and interruption explanation; no permission was accepted.

Fault injection is at storage/journal boundaries. Native tests inject exceptions
and reload; they do not kill the OS at every instruction or simulate physical disk
loss. Existing failed evidence and prior reports remain preserved.

## Remaining limits

Persistent mode requires working IndexedDB and storage. If reads/writes are actively
denied, out of quota, or the credential/queue payload itself is unreadable, the app
still fails closed until the storage problem is resolved. Fresh authentication is
not a bypass for unavailable storage. The three-second coherence wait and existing
network/lock deadlines remain bounded. Tab-local fallback remains tab-local.

Automatic recovery only finalizes a proven checkpoint; ambiguous cases intentionally
require the user's fresh authentication. With functioning storage and valid auth,
that path is now tested and does not require deleting data or resetting the app.

Remote Auth token-parent recovery/revocation, effective deployed RLS, issuance
idempotency, push and physical iPhone/PWA remain unvalidated. No family-pilot release
is claimed. CI availability must be reported separately from these local results.

## Separate invitation scope proposed for approval

Prepare a separate draft change covering:
1. `helper-client-rc393.js` plus the Owner issuance caller: stable request ID for
   retry of the same issuance, distinct from an intentional replacement code.
2. `supabase/functions/bertha-code-access/index.ts`: reconcile uncertain Auth
   account creation and return/recover the same issuance result on retry.
3. A reviewed SQL migration alongside `satellite-code-rc369.sql`: Owner/member-
   scoped operation record and concurrency rules, with a security design for code
   recovery (the current database keeps only a hash; do not casually persist plaintext).
4. Synthetic tests for every Auth/DB interruption, parallel issuance, expiry,
   wrong member/type, permissions and orphan-account detection.

Approval for that local implementation/testing and draft PR would NOT authorize
Edge deployment, SQL application, account creation/deletion, credentials or real
invitations. Any remote validation must separately identify the isolated environment
and permitted pre-existing synthetic accounts; provisioning accounts or credentials
requires explicit authorization. This R4 patch does none of those actions.
