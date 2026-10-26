# Satellite session recovery review

Base: `5ada7251d3a825a79c422e9182627b597ba6f0f1`. Scope: homologação client and Helper/Kids consumers only. No backend, schema, production-root files or existing accounts changed.

## Changes

- Coordinate refresh and revocation using a Web Lock scoped to origin/base/session storage key. A waiting tab re-reads the session before requesting refresh. Lock acquisition has a bounded wait; closing its owning tab releases it.
- Keep a stable, non-secret session lineage across refresh. A late success or rejection cannot overwrite/remove another login. Legacy lineage is a SHA-256 fingerprint; new logins get a random identifier. No credentials appear in lock names or diagnostics.
- Before local logout, persist a pending revocation in the same selected storage as the login, then remove login access. Retain the pending operation on ambiguous network/auth failures. Resume on opening Helper/Kids or the online event.
- Pending revocation stores only its identifier, lineage, user identifier and captured access/refresh credentials. These credentials are necessary to revoke the captured session after reconnect/expiry; they are never installed as a current login. They remain sensitive local data until confirmed revocation removes the record. Existing same-origin storage protections apply; this is not encryption or a guarantee of immediate remote invalidation while offline.
- A pending record blocks reuse if removing the login key fails. A successful retry removes a matching stale login before removing the pending record. Another login remains intact.
- Helper/Kids report pending versus confirmed exit and clear displayed account state on cross-tab storage changes. Script query versions keep updated consumers paired with the updated client.
- Browsers without Web Locks fail closed for coordinated renewal/logout and preserve the login if a pending operation cannot be stored. No unsafe storage lease fallback.

## Reproducible tests

No installation or backend required; run with Node 24:

```sh
node homologação/audit-satellite-auth-20261026/session-regression.cjs
```

`BERTHA_CLIENT=/absolute/path/to/baseline/helper-client-rc393.js` runs the same checks against the original module. Results recorded on Mac: corrected **17 pass / 0 fail**; original **7 pass / 10 fail**. Some baseline failures cover new recovery API expectations, not ten distinct product defects.

The same 17 cases passed in a real Mac in-app browser with native Web Locks and simulated transport/storage. Additional two-tab checks used real same-origin localStorage: a waiting second tab succeeded without another refresh; closing the first tab released the lock and allowed the second to continue. Actual Helper/Kids UI scripts were exercised with synthetic responses: offline logout, pending notice, online/reopen revocation, login remained absent.

Separate UI observations with synthetic responses: Kids completion waited for Owner confirmation with zero points, another child's accepted task was not shown, shared guide opened, message retry retained client_id, and disallowed conversation hid the send form. These are client integration checks, not server authorization proofs. No JSDOM suite was executed in this round.

## Independent review and remaining requirements

Repository SQL/Edge sources were read only, not executed or assumed deployed:

- `satellite-code-rc369.sql`: active membership, kind, expiry/revocation and nonce checks; claim retry permitted for same nonce within five minutes; issuance revokes previous code and generates a new one. The Edge issue request has no operation-id reconciliation. Lost issue response/repeated issuance needs separate validation; no invitation was issued in this review.
- `kids-integration-rc390.sql`: message permission checks plus sender/client_id idempotency; Kids completion stops at `completed`, not `validated`; profile writes restricted to Owner. UI uses the supplied remote profile, so zero points in the simulated UI does not prove real server credit behavior.
- `helper-guides-rc374.sql`: recipient membership/permission predicates and owner-only share; repeated source_ref updates targets/body. Do not treat client filtering as RLS proof.
- Push source restores existing granted subscriptions without requesting a new permission; activation remains explicit. Actual delivery/permission/location consent not exercised. No device permission was granted by the reviewer.

Smallest remaining remote validation requirement: a disposable test namespace/project with confirmed effective Auth settings, deployed Edge/RPC/RLS versions and synthetic Owner + two Helpers + two Kids. Use it to test lost/repeated invite issuance/claim, cross-network/member denial, messages both directions, Owner confirmation repeated without duplicate credit, pause/resume/revoke and push/location consent. Provisioning or using real accounts is not part of this PR. iPhone/PWA and physical-device delivery remain untested.

The Supabase session documentation describes token-parent recovery and a reuse grace interval. Our strict-rejection transport case is conditional; it is not proof that every lost response logs users out on the deployed backend. No Auth security settings were weakened.

## CI and release

No `.github/workflows` entries were present in the complete base tree. This change adds no deployment workflow and targets a separate draft PR branch. Local and browser simulated tests do not certify production. Do not merge or deploy on the strength of this report alone; repository-hosted CI status must be reported separately if a run exists.
