# R2 — partial correction; DO NOT MERGE

The four additional reproductions motivated this revision, but the full requested
session correction is **not complete**: adversarial testing with two real Mac
in-app browser tabs still observed a redundant refresh after lock handoff.
Native Web Locks reported one holder and one waiter; after the first renewal,
the second tab sometimes used its previous storage view and requested renewal.
Delivering that second response was rejected as an account change, rather than
silently replacing the newer session. The precise browser storage-coherence cause
is not established. A task-boundary wait did not eliminate this and was reverted.
Do not infer cross-tab readiness from the single-document tests below.

## Changes actually made

- All session installation paths now use the same coordinated commit: password,
  signup, code claim, email OTP/link and accepted email session. The latter returns
  a promise and its Helper caller awaits it.
- Login intent captures version and storage state. A stale result is rejected;
  the user may need to retry after a concurrent login/logout/renewal changed state.
- Refresh/logout final identity comparisons are synchronous, removing the former
  async comparison-to-write window. Legacy refresh identities are retained.
- Persistent/fallback storage reads include pending revocations from both stores.
  Migration happens under coordination: merge/persist/read-back the queue, copy
  only a non-blocked login when destination has none, remove source login before
  source queue. Failures prevent network action and preserve recoverable source.
- Entry cache versions updated. No Edge, SQL, Auth settings or invitation changes.

These changes close the four scenarios in the controlled shared-storage model;
real cross-document storage coherence remains a release blocker and could affect
other stale-state checks. This is not a claim that every browser interleaving is fixed.

## Verification on Mac

- Existing Node suite: 17 pass, 0 fail.
- New Node suite: 15 pass, 0 fail.
- Same 32 cases: 32 pass, 0 fail in native Mac in-app browser using Web Locks;
  storage and transport in those cases are simulated.
- Two actual tabs with native localStorage/locks: FAIL intermittent duplicate
  renewal, as described above. Previous successful observations were insufficient.
- Closing only the disposable lock-owning tab: PASS, remaining tab acquired lock
  and completed its simulated renewal.
- Reopening client, pending revocation, expired tokens, denied writes/removes,
  unavailable primary storage and malformed queue covered by the 32 cases.
- Remote Auth/RLS, real invitations, push delivery and physical iPhone: NOT RUN.

Run without installing dependencies:

```sh
node homologação/audit-satellite-auth-20261026/session-regression.cjs
node homologação/audit-satellite-auth-20261026/session-r2-regression.cjs
```

`two-tabs-r2.html` is a local-only reproducer. Serve it on localhost and open twice.
Prepare the expired synthetic session in tab A, start query in A and B, deliver
success in A. B must complete without showing its own renewal pending. If it does
show pending, record the failure before delivering B's response. The locks button
reports only non-secret lock identifiers and timing/freshness counters. All fetch
responses are simulated; no external request is issued by this fixture.

## Remaining session work

Determine and enforce a coherent session-state handoff between documents, including
browser persistence visibility and concurrent login/migration. Do not mask this with
arbitrary sleeps, broaden refresh reuse, relax validation or report 32/32 as a
cross-tab pass. Recheck all auth commits, native fallback/persistent transitions,
closure and reopening against the resulting mechanism before merge.

## Invitation proposal only — no implementation/deploy

Affected components would be:

1. `homologação/helper-client-rc393.js` inviteCode and Owner issue caller: stable
   operation identifier reused only for retry of the same request; explicit new
   issue remains a different action.
2. `supabase/functions/bertha-code-access/index.ts`: reconcile issuance state and
   uncertain Auth creation before making another account; recover same operation
   result without logging codes/tokens.
3. `homologação/satellite-code-rc369.sql` (or a separate reviewed migration):
   owner/member-scoped operation record, concurrency control, lifecycle and secure
   result recovery. Decide how an identical code can be returned safely when only
   its hash currently exists; do not add plaintext storage casually.
4. Tests for lost responses at each Auth/DB boundary, concurrent issuance, explicit
   replacement, permissions, expiry, wrong member/kind and orphan reconciliation.

Local preparation can use synthetic Auth/RPC models without accounts. Applying SQL,
Edge deployment, remote mutations and any creation/reconciliation/removal of Auth
accounts require separate explicit authorization and a confirmed test environment.
This PR does none of them. A pre-existing isolated environment plus already prepared
synthetic accounts is the minimum to test remote integration without creating new
credentials. No such environment was verified in this round. Existing family data
and Teste Helper must not be reused or duplicated implicitly.
