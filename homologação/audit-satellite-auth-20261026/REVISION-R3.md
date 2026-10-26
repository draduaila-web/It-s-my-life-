# R3 — observed two-tab duplicate renewal resolved locally

R3 supersedes R2's observed cross-tab blocker. Keep this PR in draft: it is not
remote integration approval or authorization to deploy/open the family pilot.
No Edge/SQL, accounts, credentials, Auth policy, production files or real data changed.

## Cause established by instrumentation

After the first tab completed its renewal, native Web Locks handed off exclusively
but the second document sometimes read the expired localStorage view before its
storage event arrived. Diagnostic trace: second tab read expired state at 18982.1 ms,
requested refresh at 18982.8 ms, received the fresh storage event at 18983.9 ms.
This is an observed visibility ordering, not attribution to a particular WebKit bug.
Waiting one arbitrary task turn failed and was discarded in R2.

## Correction

Under the existing Web Lock, persistent-storage clients now check a committed-state
SHA-256 fingerprint stored transactionally in IndexedDB (`bertha-auth-coherence-v1`,
`states`). The key is the non-secret backend/session-key scope. Values are only
64-character hashes of the serialized session and pending-revocation values:
no token, account ID, session body or invitation code is stored in that database.
The access/refresh credentials remain only in their existing session/queue storage.

A waiting document must observe the matching state before acting. If its storage
view is stale, storage notifications trigger rechecking; an immediate recheck also
closes the listener-registration window. No auth request is issued on a mismatch.
Each coordinated operation publishes its final fingerprint before releasing the lock,
including recoverable partial storage changes when an operation fails.
This is a state-equality fence, not a sleep-based workaround or weaker Auth policy.

First use initializes metadata from current state under the lock. Migration verifies
persistent state before combining fallback login/queue; denied persistent storage
continues to use the existing tab-local fallback. The latter does not acquire a new
persistent credential copy. Entry versions now end in `auth-recovery-r3`.

## Verification

- Node: 17 existing + 15 R2 + 6 coherence cases = **38 pass / 0 fail**.
- Native Mac in-app browser: same **38 pass / 0 fail**, simulated transport and
  per-case storage/journal models. Native Web Locks used.
- Separate real tabs with native localStorage + IndexedDB + Web Locks: **12 repeated
  handoffs passed**, both queries completed each round. Second-tab event history
  contains no refresh request. Transport remained synthetic.
- Closing the disposable lock holder during its pending request: waiting tab
  acquired the lock and completed renewal.
- Real-storage offline logout: session false / pending 1. Reload retained false/1;
  online resumption produced false/0. No silent login restoration.
- Delayed old 400 response while another tab attempted login: old request rejected,
  stale login intent rejected, explicit new attempt succeeded. No silent overwrite.
- Deterministic added regression delays visibility until the committed fingerprint
  matches and confirms zero refresh requests from the stale reader.
- Journal unavailable, initial write denied, publish failure and permanently
  mismatched state: fail closed, preserve evidence/session/pending records as
  applicable. Journal payload test rejects anything except hashes and fixed scope.

Run the three `session-*-regression.cjs` files with Node 24. `browser-r3.html`
runs all 38 cases locally. `two-tabs-r3.html` runs real-storage manual reproduction;
its setup uses the client commit path so the fixture cannot silently bypass the
new coherence metadata. All data and fetch results are synthetic.

Evidence: r3-node-*.txt, r3-browser.json, r3-two-tabs-rounds.json,
r3-owner-close.txt, r3-reopen-logout.txt, r3-delayed-rejection.txt. Earlier failed
reproductions and R2 reports are retained and explicitly historical.

## Adversarial review and practical limits

All session installs still use the shared lock and snapshot checks from R2; final
refresh/logout comparisons have no async comparison-to-write gap. Queue migration
keeps source until destination verification and removes source login before queue.
A stale login intent can require a deliberate retry after another operation changed
state. Native sessionStorage is per tab; this does not claim shared login across
independent fallback stores.

IndexedDB availability is now required for coordinated persistent-storage access.
Read/open/write waits and visibility waits are bounded at 3 seconds; existing
20-second network and 25-second lock-wait limits are unchanged. Failure is explicit;
no fallback silently bypasses coherence.

A crash or write denial between changing existing storage and publishing metadata
can leave a persistent mismatch. It intentionally blocks further coordinated access
rather than guess which session is authoritative. Automatic repair of that ambiguous
state is NOT implemented, and merely refreshing is not guaranteed to repair it.
Do not clear real storage or discard pending revocations to resolve it without a
separately reviewed recovery path. This limitation is material before family rollout.
The tests cover normal closing-before-response and denied publication separately;
they do not certify arbitrary process-kill-at-every-instruction recovery.

Remote token-parent recovery, actual Auth revocation after ambiguous 401/refresh
rejection, deployed RLS, invitation issuance idempotency, push delivery and physical
iPhone/PWA still need their separate validation. The invitation proposal remains in
REVISION-R2.md; no changes to its Edge/SQL scope were made. Local test success must
not be presented as production or iPhone approval.
