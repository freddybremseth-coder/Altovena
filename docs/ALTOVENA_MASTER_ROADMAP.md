# Altovena – Master Roadmap & Product Architecture
**Version:** 0.1 · **Updated:** 2026-10-16 · **Status:** Proposed, not production activated

## Purpose
This document is the coordinating index for Altovena products derived from RealtyFlow and the Nexus shared engine. It is a roadmap, **not** evidence that features are deployed, or that all integration boundaries are implemented. Product owners should confirm live GitHub PR, CI, database, and deployment states before changing code.

## Product and repository register
| Product / component | Canonical repository | Role | Integration principle |
| --- | --- | --- | --- |
| Altovena brand / website | [Altovena](https://github.com/freddybremseth-coder/Altovena) | Marketing, product discovery, lead intake | Stable public site; product status must be truthful |
| RealtyFlow Pro | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) | Internal operating platform and initial Nexus runtime | Preserve production; no customer-facing activation by default |
| Nexus Core / Execution | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) | Agent capabilities, tasks, authorization, audit | Define versioned server-side contracts before extraction |
| Altovena Command | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) | Governed mission planning and agent coordination | Proposals are not execution; explicit approvals required |
| Altovena Intelligence | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) (current development context; confirm module paths) | Commercial analysis and offer intelligence | Human approval; separate data-quality and buying-interest scores |
| Altovena Visibility | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) (current development context; confirm module paths) | SEO/AEO/GEO visibility assessment and controlled changes | Show problem → proposed action → approval → verified result |
| Olivia OS | [olivia](https://github.com/freddybremseth-coder/olivia) | Independent farm operations SaaS product candidate | Maintain standalone codebase; use Nexus through authenticated APIs |
| Doña Anna | Olivia pilot and RealtyFlow integrations | First reference farm; not a generic customer default | Separate farm operations from Doña Anna B2B sales |

## Known development work (snapshot, 16 October 2026)
- [RealtyFlow PR #1423](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1423): Nexus Execution Engine, draft; staged claim/revalidation, no live executor. Requires staging, authentication/tenant boundary security review and full integration validation before merge/activation.
- [RealtyFlow PR #1427](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1427): Altovena Command Nexus planning, open; agent suggestions stored without starting execution.
- Both PRs target RealtyFlow `main`; they must be retested together on a fresh integration branch. Do not assume separately green CI proves end-to-end readiness.
- Multiple Altovena site and RealtyFlow product branches exist. Audit open PRs and deployment references before updating the release register.

## Integration track update — 16 October 2026
- [RealtyFlow PR #1428](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1428) is the **draft integration branch** combining Nexus PR #1423 and Command PR #1427 for validation, with no production activation. It includes read-only Command → Nexus handoff readiness, fail-closed contract checks, and a combined CI run.
- The integration **does not yet create or execute Nexus tasks** from Command missions. Verified `altovena` tenant → `core` brand mapping, reviewed evidence and independent action approval are still required.
- Treat the original PRs and integration PR as dependent work; avoid merging all three independently. Verify latest-head combined CI and staging security gates first.
- Master roadmap remains a review-only draft until PR #6 is approved and merged.

## Command analysis preparation (17 October 2026)
- Draft [RealtyFlow PR #1428](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1428) now includes a **preparation-only** step after saving a routing proposal.
- Owner-only Command API stores and retrieves an immutable analysis preparation record under `altovena`, tied to verified actor, mission ID, original routing digest and validated mission goal digest.
- Explicit hard limits at this stage: **zero model calls, zero cost, zero external actions**, no agent execution, no Nexus task creation. UI must never call this a completed analysis.
- Added cross-schema PostgreSQL fixture and contract tests for unauthorized access, proposal spoofing, idempotency and audit; final-head CI and staging review determine readiness. No runtime activation or live migration.
- Next gated work: verified tenant→brand mapping; safe analysis-only worker and evidence records; independent human review before any write or external action.

## Evidence gate for future analysis agents (17 October 2026)
- [RealtyFlow PR #1429](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1429) is a **stacked draft** targeting integration PR #1428, not production `main`.
- Adds source/tenant-bound validation of analysis candidates: trusted captured evidence snapshots, SHA-256 excerpt digests, actual cited quotes, no unreviewed action permissions.
- Adds a separate GitHub CI-only mock-model harness to exercise one analysis callback and reported usage ceilings. **No real AI provider, no released worker, no source-retrieval authorization or production spending enforcement yet.**
- Only reports `awaiting_human_review`; content accuracy needs independent human and semantic review.
- Do not merge #1429 independently of #1428. Latest-head CI and dedicated staging remain blocking.

## Guarded real-model adapter (17 October 2026)
- [RealtyFlow PR #1430](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1430) is a **stacked draft** based on analysis evidence PR #1429, itself based on integration PR #1428.
- Adds a new, disabled-by-default OpenAI Responses API adapter, constrained to a single no-tools/no-fallback read-only candidate analysis request.
- Requires a distinct analysis permit and a trusted **atomic quota/cost reservation repository** before sending; model responses are checked against server-authorized evidence. Tests inject mocks: no live model invocation has occurred.
- **Blocker:** the production reservation repository, issuance/revocation workflow, provider precharge & reconciliation, actual source-access authorization, reviewer workflow and staging are not implemented. Current persisted Command preparations still enforce **0 model calls / 0 spend**.
- PR order: merge only after resolving CI/build checks, security review and dependency branches. Keep production flags off until the full admission and billing lifecycle is proven.

## Tenant budget ledger (17 October 2026)
- [RealtyFlow PR #1431](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1431) is a **draft**, stacked on #1430 → #1429 → #1428.
- Private `altovena` SQL tables: tenant-month spending envelopes, separately reviewed per-mission permits, one-use durable reservations and append-only audit events. No public APIs or Data API grants; RLS enabled.
- Atomic PostgreSQL tenant-month row lock prevents multiple simultaneous reservations from exceeding the configured ceiling. Zero configured budget means deny. Completed/uncertain calls conservatively retain the full reservation amount.
- Permits bind the exact original prepared mission/agent, current tenant membership, independent reviewer, approved model, goal/routing/source digest, token ceilings and reservation limit. SQL checks all submitted values against the persisted permit.
- CI uses an isolated PostgreSQL instance, including a race between two separately permitted analyses for a single remaining budget slot. No real model call or production schema migration.
- A typed private PostgreSQL `AnalysisAdmissionRepository` adapter now maps verified permit parameters and settlement to these SQL functions; it is not connected to a worker, HTTP endpoint or production DB connection.
- **Blocked before live use:** authenticated reviewer issuance and revocation UI, actual tenant source authorization, worker credential design, provider account spend enforcement/reconciliation, crash-safe review packet persistence, staging and full final-head CI.
- All four RealtyFlow PRs are dependent and must be integrated in order. Provider activation remains OFF.

## Independent analysis approval boundary (17 October 2026)
- [RealtyFlow PR #1432](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1432) is a stacked **draft** targeting PR #1431; CI/staging and security review are mandatory.
- Added private request and independent reviewer decision functions for **read-only** analysis permits. The requester and reviewer must differ; approval rechecks tenant membership, active product entitlement, unchanged mission and routing digests, cost availability and a matching verified evidence attestation.
- Review decisions have append-only audit events; a second insertion fence prevents reservations when an evidence attestation has expired or been revoked.
- **Not live:** no production migration, authorized source-attestation ingestion, authenticated review UI, narrowly privileged worker role, real AI call or public route. The provider flag remains OFF.
- Dependency chain: #1428 → #1429 → #1430 → #1431 → #1432, with each PR needing fresh latest-head tests and explicit staging approval.

## Authorized source evidence snapshots (17 October 2026)
- [RealtyFlow PR #1435](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1435) is a **stacked draft** after #1432, with separate, private tenant- and mission-scoped source capture and immutable PostgreSQL snapshots.
- New source-ID-only connector interface rejects arbitrary URLs, mismatched tenants/actors, expired captures and source-content tampering. **No real customer/Drive/CRM connector has been installed**; CI uses synthetic sources.
- SHA-256 hashes of individual captured excerpts combine into a canonical manifest digest, independently recalculated in PostgreSQL. The read-only model adapter's budget admission now uses this same digest rather than a transient JSON representation.
- Only a separate authorized reviewer can attest a stored, matching source bundle for a pending permit. No stored bundle means no legitimate evidence attestation; invalidated attestations block future reservation.
- **Blocked before release:** verified source connector credentials and access controls, narrowly scoped worker and reviewer identities, user-facing evidence review, privacy/retention controls, end-to-end staging and production spend reconciliation. Provider remains OFF, no Nexus tasks or external actions.

## Owner-visible Command analysis readiness (17 October 2026)
- [RealtyFlow PR #1437](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1437) is a stacked **draft** on top of source snapshot PR #1435.
- Adds `Se analysestatus` on the owner-only Command mission page: real read-only DB status for preparation, source snapshots, independent evidence attestation, analysis permit and reviewer decision. No fake completion states or approval button.
- Narrow GET-only server API requires signed platform `owner-session`; backend validates confirmed actor and mission ownership before returning metadata. No raw documents, model keys, approval changes or Nexus execution calls.
- **Production blocker:** status UI depends on not-yet-deployed stacked migrations and source connectors; actual reviewer authentication and action workflow remain unimplemented. Full latest-head CI and staging are mandatory; no production activation.

## Ett koordinert program – to utviklingsløp (17 October 2026)

**Ja, arbeidet hører til ett Altovena-program, men har to ulike leveranseløp:**

1. **Altovena-produktlaget** i [`freddybremseth-coder/Altovena`](https://github.com/freddybremseth-coder/Altovena): merkevare, nettsted, produktpresentasjon, kundeinnsikt/konvertering, felles SaaS-kontrakter og portabel Command-demo. PR #2 (nettside og kundereise), #4 (Command-produktprototype), #5 (kontaktskjema/RealtyFlow-intake) og #6 (denne hoved-roadmapen) må videreføres som egne review-gated spor.
2. **RealtyFlow/Nexus-produktmotoren** i [`freddybremseth-coder/realtyflow-pro`](https://github.com/freddybremseth-coder/realtyflow-pro): faktisk innlogget intern arbeidsflate, private `altovena`-tabeller i RealtyflowPRO, agentregister, Command/Nexus-integrasjon, Intelligence, Visibility, styrt analyse og interne API. Kommersielle Altovena-produkter skal etter hvert kobles via versjonerte grensesnitt – ikke ved å kopiere datatabeller eller løs kobling mellom Git-grener.

Altovena er **ikke én monolittisk Git-gren**. Produktene har egne kode-/dataeierskap, mens Nexus er felles motor og RealtyFlow er innledende intern vert. Før SaaS-installasjoner må vi bevise at hver kunde kan bruke en separat database og sikker identitets-/rettighetsmodell. Overfør først kontrakter og migreringer, ikke ukritisk hele RealtyFlow-koden.

### Produktkoordinering og faktisk fullføring

| Produkt | Utvikles primært i | Felles integrasjon | Foreløpig leveransestatus |
| --- | --- | --- | --- |
| Command | RealtyFlow/Nexus og Altovena-prototype | `altovena` oppdrag, Nexus-agentregister og kontrollert plan | Intern utkastside; analyse- og arbeidsmotor i stablet, ikke-aktivert PR-rekke |
| Visibility | RealtyFlow Sam/SEO-moduler; Altovena-nettside viser produktet | Synlighet → foreslått tiltak → eksplisitt godkjenning → verifisert publisering | Egen utviklingslinje; ikke del av Command-analyse-PR-ene |
| Intelligence / Offer Intelligence | RealtyFlow signaler/salgsdatamodell; Altovena produktflate | Separate vurderinger av datakvalitet og kjøpsinteresse; menneskelig godkjenning | Må verifiseres i egne kode-/releasekontroller; ikke erklær SaaS-klar uten dette |
| Olivia OS | Olivia-repoet | Revisjon av farmdata/roller mot felles Nexus via begrenset API | Selvstendig SaaS-kandidat, adskilt fra Doña Anna B2B |
| Altovena kommersielt nettsted | Altovena-repoet | Ingen parallell CRM; leads går til kontrollert RealtyFlow-mottak | Website, SEO/AEO/GEO og kontaktskjema på egne PR-spor |

### Samlet leveransekjede i RealtyFlow – hva som må kobles

| Kundereise / funksjon | Altovena repo | RealtyFlow repo | Releaseavhengighet |
| --- | --- | --- | --- |
| Produktsider, SEO/AEO/GEO, tillit, kontakt | [Altovena PR #2](https://github.com/freddybremseth-coder/Altovena/pull/2) + [#5](https://github.com/freddybremseth-coder/Altovena/pull/5) | [RealtyFlow PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400), Altovena CRM/markedsføringsarbeidsområde | Kontakt må gi ett rettighetsstyrt lead med bekreftet kvittering; brand permission, personvern og alarmer testes før offentlig aktivering |
| Command produktpresentasjon/demo | [Altovena PR #4](https://github.com/freddybremseth-coder/Altovena/pull/4) | [RealtyFlow Command/Nexus PR #1428](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1428) + stablet analysesikkerhet | Ingen påstand om faktisk agentutførelse før godkjente permits, kilder, budsjett, brukerroller og kontrollert runtime |
| Visibility produktpresentasjon | Altovena-sider i nettsteds-PR | Egen Visibility-produktkonsoll, Sam/SEO-oppgavekø og godkjenning (se egne Visibility-PR-er) | Faktisk funn → godkjent tiltak → verifisert resultat. Visibility-køen er ikke Command-køen |
| Intelligence / Offer Intelligence | Produktløfte, demo og prising må samsvare med motor | Corporate lead/signalprodukt og beslutningsgrunnlag | Human approval og atskilt data quality/interesse-score før kommersielt salg |
| Olivia OS | Produktpresentasjon, integrasjonskontrakt | Kundetilgang/kobling bare gjennom versjonert, avgrenset API | Egen farm-SaaS og egen dataisolasjon; ikke overta Doña Anna B2B-roller |

**Ingen automatisk synkronisering av utviklingsgrener betyr at alt er ferdig.** Det felles programmet sikres ved å koble *kontrakter, PR-avhengigheter, miljøverifisering og lanseringskontroller*, ikke ved at ChatGPT fortsetter usett mellom samtalene.

### Intern produktoversikt i RealtyFlow (17. oktober 2026)

- [RealtyFlow PR #1439](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1439) bygde et **samlet internt Altovena-panel** på `/altovena`, med owner-only innlogging og lenker til Command, Visibility og Corporate/Intelligence; Olivia OS ble vist som separat løp. **PR-en ble lukket uten merge 17. oktober 2026**, så denne nye siden er **IKKE tilgjengelig i produksjon**. Funksjonen må vurderes mot nyere RealtyFlow-endringer før eventuell ny, kontrollert integrasjon.
- Panelkatalogen eies inntil videre av RealtyFlow som **internt navigasjons- og fase-register**, ikke som produksjonsstatus, live driftsovervåking, betalte SaaS-rettigheter eller eksternt API. Den utfører ingen handlinger og endrer ingen databasetabeller.
- Katalogen må senere flyttes til et **versjonert, felles SaaS-produktmanifest** når salgs-/rettighetsmodellen er verifisert på tvers av Altovena-nettsiden og RealtyFlow. Ikke kopier kode blindt mellom repoene.
- Status for visning/kundelansering kan først heves etter kombinerte tester med Altovena Website PR #2/#5 og RealtyFlow Altovena Workspace PR #1400, samt riktig rolle-/kundeskille og personvern.
- Produktpanelet er en **avgrenset intern UI-funksjon** og må ikke blandes inn i Command/Nexus-analyse-PR-stakken (#1428–#1437). Den lukkede PR #1439 er utviklingsreferanse, ikke godkjent release.

### Altovena → RealtyFlow kundehenvendelser – kollisjonssikker innsending (17. oktober 2026)

- Den kanoniske nettside–CRM-linjen er [Altovena PR #5](https://github.com/freddybremseth-coder/Altovena/pull/5) sammen med [RealtyFlow PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400). Fortsett der, ikke opprett en parallell CRM/lead-database.
- Nye endringer i RealtyFlow PR #1400 knytter hver mottakskvittering (`submission_id`) til en SHA-256-digest av aksepterte skjemafelter. Bare en **identisk** innsending kan returnere samme kvittering; endret innhold med gammel UUID avvises. Testet i isolert PostgreSQL-CI, med produksjon fortsatt sperret.
- Offentlig kontaktflyt er ennå ikke aktivert. Lovgrunnlag/personvern, innloggede brand-grants, delt serverhemmelighet, Turnstile, varsling, reell Ende-til-ende-test og grønn samlet CI er release-gates. En ferdig API-/migrerings-PR er ikke det samme som publisert kontaktskjema.

### RealtyFlow CRM-gren synkronisert med main (17. oktober 2026)

- [RealtyFlow PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400) er samordnet med siste kjente `main` gjennom en ordinær **to-foreldre merge-commit** `3b5406e58416135caf589f9ba7f7e335cf0a39e8`. Sammenligningen ved samordning var **0 commits bak**. Dette bevarer nye Visibility, Command, Workspace og eksisterende CRM-endringer fra `main`, samt Altovena-merkevare, CRM API og SQL fra arbeidsgrenen. `package.json` og `src/lib/constants.ts` var de eneste overlappende filene og ble eksplisitt kombinert.
- GitHub-testene **Main Freshness Guard, Altovena intake validation, Customer Email Admission, Re-Master schema contract, Carousel contract, Re-Master migration integration** var grønne på den eksakte merge-commiten. Full Build Check/Build validation og Vercel preview må bekreftes uavhengig før review/merge.
- En separat Vercel-forhåndsvisning ble startet for eksakt samme merge-commit; den har **ingen** produksjons- eller kundekontaktaktivering. Nettsidens klient/adapter-gate er fortsatt OFF.
- Når RealtyFlow `main` flyttes senere må ferskhet og integrasjon kontrolleres på nytt. En tidligere grønn test er ikke permanent godkjenning.
- Endringskontrakt: Identisk UUID + identisk innhold = samme kvittering; UUID + endret innhold = hard avvisning. Kvitteringen krever ekte format på både CRM-kontakt- og oppfølgingsoppgave-ID.

### Syntetisk HTTP→SQL-kontrakt bekreftet (17. oktober 2026)

- [RealtyFlow PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400) inkluderer nå en *faktisk HTTP-handler → Supabase-klient → PostgreSQL-funksjon → CRM-kontakt + oppfølgingsoppgave*-test i en egen, lokal PostgreSQL 17-database. Alt går i en rollback-transaksjon med syntetiske identiteter og uten reelle API-kall til produksjon.
- GitHub Actions [kjøring #39025572023](https://github.com/freddybremseth-coder/realtyflow-pro/actions/runs/39025572023), SQL-jobb, **SUCCESS**. Både ny HTTP→SQL-test og eksisterende migrerings-/databasetest logget PASS.
- Kontrollerte forventninger: Avvis feil nøkkel/merkevare, opprett én lead + én manuell oppfølging, gjenbruk identisk kvittering, avvis endret innhold med gammel UUID, avvis falske kvitterings-ID-er, behold fremmede merkevarer adskilt og AI-autooppfølging av.
- Dette er ikke en *reell nettverkstest* fra Altovena-nettstedet til RealtyFlow. Faktisk RealtyflowPRO-migrering, delte hemmeligheter, Andrea-tilgang, kontrollert varsling og personvern/Turnstile skal fortsatt bekreftes før eier kan godkjenne offentlig skjema.
- RealtyflowPRO-produksjon var kontrollert uten `altovena_receive_lead`, `altovena_intake_health` og mottakskvitteringstabell. Vercel RealtyFlow manglet bevisst Altovena-aktivering, nøkkel og operatør-ID. Disse fraværene er korrekte **lanseringssperrer**, ikke signal om at mottak allerede er aktivt.

### Freddy/Andrea oppfølging – testet, ikke live (17. oktober 2026)

- RealtyFlow CRM PR #1400 har nå **seks faktiske** `lead-tasks`-rute-tester med grønt resultat i [GitHub Actions #39034195919](https://github.com/freddybremseth-coder/realtyflow-pro/actions/runs/39034195919). Eier, verifisert syntetisk medarbeider, tilbakekalt tilgang, `crm.read`/`crm.write`, avvisning av andre merkevarer og skrivebeskyttet medarbeider-forhåndsvisning er kontrollert.
- En tidligere testdiscovery-feil med `[brandKey]` ble rettet ved å flytte testen til `tests/altovena/lead-tasks-authorization.test.ts`. GitHub-loggen bekrefter **6 kjørte / 6 beståtte tester**, ikke bare grønn workflow-status.
- Realtid: Altovena-arbeidsflaten har kun poll-basert *intern* oppfølgingsoversikt, ingen e-post- eller pushvarsel. Den skal ikke omtales som testet varsling til Freddy og Andrea uten en faktisk signert brukerøkt og kontrollert driftstest.
- Før drift kreves aktivering av verifisert Altovena-medlemskap for Andrea, separat eier- og medarbeidertest i et autorisert miljø, etterprøvbar levering av henvendelse og synlig oppgave for begge. Ingen faktiske konto-/tilgangsendringer ble gjort i denne runden.
- Offentlig nettsideintegrasjon og produksjonsmigrering forblir sperret inntil egne godkjente release-gates.

### RealtyFlow CRM QA synkronisert med Visibility (17. oktober 2026)

- Etter å ha avdekket at RealtyFlow `main` var blitt oppdatert med 11 Visibility-kø/ledger-filer, sammenlignet vi den felles basen med CRM-grenen og fant **ingen overlappende filer**. Gjennomført 2-foreldre samordning `40d744039cb88543c13128a848f63970ddd996f2` med alle 11 nyere Visibility-filer bevart. Verifisert `behind_by=0` rett etter samordning.
- CRM-grenens nye kontraktstest gir faktisk **6/6 beståtte** eier/medarbeider/tilbakekalling/brand-gjennomgangstester. Den komplette syntetiske HTTP→ekte lokal PostgreSQL-flyten er fortsatt grønn i GitHub Actions. Verken reell Andrea-konto eller produksjonsrettigheter ble benyttet.
- På siste samordningscommit var Altovena intake validation, Main Freshness Guard, Command gateway, Customer Email Admission, Carousel og statiske skjemakontroller **grønne**; full Build Check og Build validation kjørte fortsatt ved dokumentering.
- Kontaktskjemaet og produksjonsmigreringen forblir avskrudd, og in-app polling må **ikke** omtales som dokumentert e-post- eller pushvarsel.
- Fortsett med autorisert, begrenset nettverkstest og kontroll av reelle arbeidsrettigheter **før** eiergodkjent publisering. Ikke slå sammen øvrige Altovena Command/Visibility-produktgrener kun for å «samle» programmet.

### CRM-oppgave → riktig Altovena-kundekort (17. oktober 2026)

- Fortsettelse av [RealtyFlow PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400). Fra en Altovena-webhenvendelse kan medarbeideren nå velge **«Åpne kundekort»** på oppgaven og åpne kontaktens eksisterende CRM-kort, ikke bare gå til en generell CRM-oversikt. Oppgaven lagrer ikke en separat kundekopi.
- Ny serverrute `/api/workspaces/altovena/lead-contact?contactId=<uuid>` krever aktiv Altovena-`crm.read` og verifisert rolle/identitet på hver forespørsel, filtrerer på `brand_id='altovena'`, `brand='altovena'` og eksakt `id`. Bare navn, e-post, telefon, status og ordinær CRM-metadata returneres; aldri notater, aktiviteter eller økonomi.
- Valgt kundekort nullstilles ved merkevarebytte, og ventende forespørsler fra en tidligere merkevare ignoreres. Ugyldige/sperrede kunde-ID-er åpner ikke andre merkevarers CRM.
- Sikkerhetstester for direkteoppslag (5) og oppgave→kundekort-navigasjon (3) er lagt til eksisterende medarbeider-/eiertester (6) i Altovena-intake-CI. [GitHub-kjøring #39036287556](https://github.com/freddybremseth-coder/realtyflow-pro/actions/runs/39036287556) kjørte begge nye testgruppene grønt; siste samordnede `main`-versjon `b9cccb0d4e39c218bba914a8b67f7552ca51603b` fikk ny samlet CI og en separat Vercel-forhåndsvisning.
- Ingen produksjonsmigrering eller reell kundekontakt er aktivert. Dette er en intern navigasjonsforbedring og er fortsatt **ikke** en godkjent offentlig Altovena-kundereise.
- Fortsatt lanseringssperre: godkjent kontroller-/personverngrunnlag, Vercel-nøkler, reell test mellom Altovena-nettsiden og isolert RealtyFlow-mottak, bekreftet faktisk Andrea-medlemskap og varsling/oppfølging under menneskelig kontroll.

### Åpen byggsperre: annen RealtyFlow-modul (17. oktober 2026)

- Nyeste samordnede RealtyFlow PR #1400-commit `b9cccb0d4e39c218bba914a8b67f7552ca51603b` har **8 av 9 GitHub-kontroller bestått**, inkludert den fulle `Build Check`, Altovena-intake, Command-gateway og Main Freshness Guard (`behind_by=0` ved kontroll).
- Det ene røde kravet er `Build validation`: `src/lib/publishing/epub-export.test.ts` feilet på «canonical EPUB is deterministic» fordi de to genererte EPUB-buffernes tids-/ZIP-bytes ikke var identiske. Dette er **bokdistribusjon**, ikke Altovena kundekort eller CRM-integrasjon. Rett/avklar i separat ansvarsspor; ikke omgå en påkrevd sjekk eller endre EPUB-kode inne i Altovena-CRM-PR-en.
- Vercel-forhåndsvisning av samme commit (`dpl_EopCaG8rve27jCdEXYh2nkZbieiQ`) ble opprettet; den var fortsatt i byggefasen ved dokumentering. Ingen produksjonsdeploy.
- Ikke merge PR #1400 eller skru på offentlig Altovena-skjema før denne build-sperren og de tidligere personvern-, tilgangs-, varslings- og eksterne end-to-end-sperrene er avklart.

### Faktisk kode fra begge repo testet i én isolert E2E (17. oktober 2026)

- [RealtyFlow PR #1446](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1446) er et **stablet testspor på eksisterende CRM PR #1400**, og **tester faktisk Altovena.com-kode (PR #5, pinned commit `ded27cde`) sammen med faktisk RealtyFlow API og faktisk lokal PostgreSQL-rutine**. Ikke en ekstra CRM eller alternativ innsendingsmotor.
- Testen sjekker `api/contact.js` → `POST /api/public/altovena-leads` → `altovena_receive_lead` → en kontakt og en manuell oppfølgingsoppgave. Turnstile/HTTPS/Supabase HTTP transport erstattes av strengt tillatte in-memory simulerte svar og lokal SQL. **Ingen nettverkskall til produksjon.**
- Verifisert [GitHub Actions #39036712085](https://github.com/freddybremseth-coder/realtyflow-pro/actions/runs/39036712085): **SUCCESS** med eksplisitte `PASS cross-repo`, `PASS synthetic HTTP` og `PASS real Altovena SQL`-logger.
- Kontroller inkluderer form-sperre, feil Origin, avvist CAPTCHA, feil servernøkkel, identisk retry med nytt CAPTCHA-token, redigert skjematekst med gammel UUID, separat merkevare og deaktivert automatisk kundeoppfølging.
- Den offentlige nettsiden har fortsatt ikke godkjent formaktivering, og produksjons-RealtyFlow mangler fortsatt de bevisst blokkerte mottaksfunksjonene. Ekte staging nettverkstest, verifisert Andrea-grant, varsling til begge operatører og eiergodkjent lov/retention review gjenstår.
- Når nettsidens kontaktkode endres må **den fastlåste testversjonen oppdateres** og hele testkjeden kjøres på nytt før release. Vær presis: Denne offline testen er ikke en live nettverks- eller ende-til-ende-test av produksjonsmiljøet.

### Cross-repo CRM- og nettstedstest er oppdatert med siste oppfølging (17. oktober 2026)

- [RealtyFlow PR #1446](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1446) er nå teknisk samordnet med nyeste kjent [CRM PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400) i merge-commit `05efe9f4f8d8f512c4f58ddf497c13fc420dd38f`. Sammenligning: **0 commits bak overordnet CRM-gren**, og bare tre egne test-/dokumentasjonsfiler i test-PR.
- CRM-grenen inneholder nye interne visuelle indikatorer for henvendelser som ankommer mens et arbeidsområde er åpent, varsling etter minst 24 timer uten startet oppfølging, og en grenseindikator når 40 oppgaver kan skjule flere oppgaver. Dette er kun *in-app*, ikke e-post-/pushvarsler.
- De fem egne indikator-/24t-testene er **5 av 5 bestått**, og den omfattende `Altovena intake validation` på den samordnede PR #1446-commiten er **SUCCESS**, inkludert reell nettsidehandler → RealtyFlow-handler → faktisk syntetisk lokal PostgreSQL-funksjon.
- Vercel-forhåndsvisningen for samme commit ble startet separat uten produksjonsmål. Fullbygg og Vercel-status må kontrolleres før man hevder at UI kan testes i forhåndsvisning. Ikke aktiver skjemaet eller SQL-migreringene med en grønn forhåndsvisning som eneste grunnlag.
- Ingen faktisk CRM-kontakt/operatørtilgang er opprettet. Det er fortsatt sperre for ekte nettverkstest, rettigheter til Andrea og Freddy, personvern, Turnstile, varslingskanaler og kontrollert offentlig aktivering.

### Automatisk kontroll mot forskjellig nettsideversjon (17. oktober 2026)

- [RealtyFlow PR #1446](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1446) tester nå både *pinned* Altovena-nettsidecommit og **gjeldende kandidatgren** `feature/v1-3-contact-gate-hardening`. GitHub Actions sammenligner `api/contact.js` og `public/contact-form.js` byte-for-byte og stopper dersom de er forskjellige.
- Begge filene hadde identiske GitHub-blob-hasher ved kontroll 17.10.2026. Dermed er nettsidens gjeldende innsending og versjonen i den isolerte CRM-testen sammenfallende på disse feltene.
- Ny testversjon i RealtyFlow `afd37170fce392175736fe9f600519fa19fd5abc` har **grønn Altovena intake validation og Customer Email Admission**. Oppdatert Vercel-preview fra foregående, kodeidentiske commit `05efe9f4` var `READY` og ikke-innlogget visning ble sendt til innlogging. Full GitHub Build validation på siste commit var fortsatt under kjøring ved denne oppdateringen.
- Dette er en **samordningskontroll ved GitHub-kjøring**, ikke automatisk bakgrunnsarbeid. Dersom nettsiden endres må testpinnen oppdateres og hele kjeden testes på nytt. PR #1400 må også være oppdatert mot `main` før godkjent release.
- Verken offentlig skjema, produksjonsmigrering eller nye brukergrants er aktivert. Nettverkstest med gyldige staginghemmeligheter og autentiserte operatører er fortsatt et eget release-krav.

### Varsel utenfor 40-visningsgrensen og produksjonsstatus (17. oktober 2026)

- [RealtyFlow PR #1454](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1454) er en **ny draft stablet på #1446 → CRM #1400**. Den reparerer et operasjonelt varselhull: 24-timers «ikke startet»-indikator ble beregnet fra de 40 nyeste oppgavene, og kunne overse eldre åpne henvendelser.
- Nye `GET /api/workspaces/altovena/lead-tasks` returnerer nå serverberegnet, eksakt `totalOpen` for alle åpne Altovena-weboppgaver og `overdueNotStarted` for alle `TO_DO`/`REVIEW` som har ligget i minst 24 timer, også utenfor visningslisten. Ved feil eller manglende count returnerer API 503 fremfor falsk null.
- Både eierøkt og bekreftet ansatt-grant har egne isolerte API-tester for samme oppgavetelling og grenseisolasjon. React-oversikten viser full antallsinformasjon, men kun siste oppgaver. **Dette er kun et internt panel**, ingen e-post, push eller bakgrunnsvarslingsgaranti. Oppgaver som allerede er under arbeid og ikke avsluttes trenger en egen SLA-/eskaleringspolicy.
- Første CI-kjøring traff en eldre statisk kontrakttest for klientberegnet 24t; den er korrigert i #1454. På siste commit `43cc6d4` er Altovena intake validation, Command gateway og Customer Email Admission **SUCCESS**; Build validation var ennå ikke avsluttet ved registrering. Sluttstatus må kontrolleres før merge.
- Under **skrivebeskyttet** kontroll av tilkoblet Supabase-prosjekt **RealtyflowPRO**, 17. oktober, ble 0 `altovena`-merkevarer, ingen `altovena_intake_receipts`-tabell og ingen `altovena_receive_lead`/`altovena_mark_lead_task`-RPC funnet. Vanlig workspace-grant-RPC-signatur finnes. Dermed er offentlig Altovena-intake **ikke produksjonsinstallert**. Ingen kundedata ble lest eller endret i kontrollen.
- Ferdigstilling krever én godkjent produksjons-/staging-migreringsplan, kontrollert opprettelse av merkevare, to faktiske signerte brukerøkter (Freddy/Andrea), verifiserte aktive og tilbaketrukne grants, fullstendig henvendelse→kundekort→oppgave-test med syntetiske data og særskilt varslingskanal- og personverngodkjenning. Ingen aktivering uten uttrykkelig eiergodkjenning.

### Serverbasert varslingskø – eget avhengig utkast (17. oktober 2026)

- [RealtyFlow PR #1456](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1456) er stablet som **draft** på #1454 → #1446 → CRM #1400, og introduserer en separat, intern Altovena-varsellogg uten kundetekster eller mottakerinformasjon.
- Ny additiv SQL-migrasjon definerer `public.altovena_lead_alerts` med service-role-only RPC `altovena_reconcile_lead_alerts()`: `NOT_STARTED_15M`, `NOT_STARTED_24H` og `IN_PROGRESS_48H`. Unik (oppgave, type), transaksjonslås, merkevaremessig filtrering, automatisk oppløsning når oppgavestatus endres og `ON DELETE CASCADE` ved lovlig sletting. Ingen kundefunksjoner oppdateres av skanneren.
- Separat GitHub CI-skript tester faktisk migrasjon i engangs-PostgreSQL 17, samt rolle-ACL, idempotens, 15m/24t/48t, feil merkevare, stans og sletting. En cron-rute er definert og lagt til Vercels `*/15`-plan, men **starter ikke** databasearbeid uten `ALTOVENA_LEAD_ALERT_SCAN_ENABLED=true` og korrekt `Bearer CRON_SECRET`. En intern, PII-fri siste-kjøringslogg (`altovena_alert_scan_state`) og brand-autorisert leserute `/api/workspaces/altovena/lead-alert-status` gjør nå at operatørpanelet viser `disabled`, `no_scan`, `recent` eller `stale` i stedet for å anta at konfigurert cron er frisk. Nødstopper/Nexus kan blokkere.
- Ved første kontroll var `Altovena intake validation` **SUCCESS**, inkludert database-test og cron-autentisering; flere generelle CI-kontroller var grønne, men siste komplette build og migrering kjørte fremdeles. Kontroller final-head før merge.
- Dette gjør det mulig å **lage varige interne varsler selv om ingen har RealtyFlow åpent**, men det er **ikke e-post, SMS, push eller annen faktisk levering til ansatte**. Dette må implementeres og valideres separat, med verifiserte mottakere, tillatelser, leveringskvitteringer, rate limiting og avmeldings- og feilhåndtering.
- Altovena-migrasjon, offentlig kontaktflyt, ny reell medarbeidertilgang, faktiske cron-jobber og provider-utsendelser er fortsatt **ikke aktivert i produksjon**. Ingen eiergodkjent lansering er registrert.

### Personlige Altovena-varsler (18. oktober 2026)

- [RealtyFlow PR #1457](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1457) er ny **draft stablet på #1456 → #1454 → #1446 → #1400**; den legger et internt personligt varslingssenter i Altovena-arbeidsområdet (ikke et parallelt CRM).
- Felles pending-varsler beholdes i `altovena_lead_alerts`, og lesekvitteringer er **per identitet** i `altovena_alert_reads` (hvert varsel og hver operatør unikt). Freddy kan markere ett varsel som lest uten at det markeres lest for Andrea, og uten at oppgave/kundestatus endres.
- Backend krever uavhengig verifisert eier-/medarbeiderøkt, brand-`crm.read`, fersk aktiv medarbeidergrant og verifisert Auth-ID; owner-preview/proxy avvises. Serveren oppretter HMAC-pseudonym fra verifisert identitet med separat hemmelighet `ALTOVENA_ALERT_RECEIPT_HMAC_KEY`. Nettleseren kan ikke velge mottakeridentitet. SQL-RPC-ene er service-role-only, og samme-origin POST får bare UUID som oppgave.
- Varselvisningen prioriterer **ulest foran lest**, deretter 24t og 48t-escalering foran 15-minuttersvarsel; maks 20 elementer per lesing, med full telling. Dermed vil eldre uleste varsler komme frem når operatøren kvitterer.
- Beskyttelse: `ALTOVENA_ALERT_INBOX_ENABLED` er **av som standard**, atskilt fra scheduler-flagget. Lesekvittering er IKKE en provider-delivery receipt: fortsatt ingen e-post, push, SMS, WhatsApp eller automatisk kundesvar. Gjenstående: ekte tobruker-test i isolert staging, personvern-/UI-godkjenning, eksterne varslingskanaler og dokumentert produksjonsgodkjenning.
- Isolerte HTTP-/PostgreSQL-tester dekker grant, revokering, preview, ugyldig origin, dobbeltkvittering, merkevareisolasjon, prioritert leserekkefølge og sletting. Teststatus skal kontrolleres på **siste head** før merge.

### Sikker forberedelse til e-postvarsling – ingen faktisk utsending (18. oktober 2026)

- [RealtyFlow PR #1458](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1458) er en **ny draft stablet på #1457 → #1456 → #1454 → #1446 → #1400**. Nå finnes en egen, service-role-only `altovena_delivery_candidates`-kø i kode. Den har bare `PREPARED` eller `CANCELLED` og ingen `SENT`/SMTP/provider-funksjon: **ingen e-post sendes eller påstås sendt**.
- Kun Altovena-`website_lead`-hendelser `NOT_STARTED_24H` og `IN_PROGRESS_48H` kan gi framtidige e-postkandidater; 15-minuttersvarsel er kun i appen. Kandidatene begrenses per operatør, er idempotente og kanselleres dersom oppgaven ikke lenger trenger varsling.
- Mottakervalidering skjer server-side mot **to** eksplisitte interne e-postadresser: en aktivt konfigurert eier/administrator, samt en medarbeider med uavhengig verifisert Supabase Auth-ID, aktivt Altovena-`crm.read`-grant og identisk e-post. Feil hos én blokkerer hele kjøringen; andre merkevarer er sperret. I varselkøen lagres bare en HMAC-avledet identitetsnøkkel, ikke person- eller kontaktdata.
- Planlagt Vercel-cron er definert, men bakgrunnskjøringen trenger **to separate opt-in-miljøvariabler**, korrekt `Bearer CRON_SECRET` og en **eksplisitt aktivert Nexus runtime-kontroll** (manglende kontroll blokkerer). Den kan kun opprette kandidater, aldri sende SMS, e-post, WhatsApp eller push.
- CI inkluderer isolert PostgreSQL-test for tilgangsbegrensning, unike kandidater, feil merkevare, sperret 15-minuttskanal, kansellering og sletting, i tillegg til mottaker-/autentiseringstester. Siste SHA må bestå samlet CI før en eventuell merge.
- Produksjon er uendret: Altovena som merkevare er ennå ikke provisjonert, de nye SQL-tabellene er ikke installert, ingen faktisk Freddy/Andrea-Supabase-Auth-test er gjennomført. Neste utviklingssteg: velge separat intern meldingsleverandør, dokumentere aksept/ukjent resultat uten blind retry, tilgangskontroll umiddelbart før send, og teste ekstern kanal i staging før eksplisitt eiergodkjenning.

### SMTP-mottak og uavklarte forsøk – isolert forhåndsvisning (18. oktober 2026)

- [RealtyFlow PR #1461](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1461) er ny draft stablet på #1458 → #1457 → #1456 → #1454 → #1446 → #1400.
- Tilleggstabellen `altovena_delivery_attempts` gir én irreversibel claim per forberedt varselkandidat. Statusene er `ATTEMPTING`, `SMTP_ACCEPTED` (bare SMTP-serverens aksept) og `OUTCOME_UNKNOWN`; det finnes ingen `DELIVERED`-tilstand. Ved krasj, nettverksfeil eller uavklart provider-resultat skal det **aldri sendes automatisk på nytt** for samme kandidat. Forsøk er individuelle per verifiserte operatør, isolerte til Altovena-website-leads og slettes med den tilhørende oppgaven.
- Egen `/api/cron/altovena-smtp-staging` bygger på eksisterende brand-email SMTP, men har **hard `VERCEL_ENV=preview`-sperre**, i tillegg til separat `ALTOVENA_EMAIL_STAGING_SEND_ENABLED=true`, begge eldre opt-in-flagg, korrekt `Bearer CRON_SECRET`, eksplisitt aktivert Nexus-kontroll, korrekt HTTPS-portal og oppdatert Auth/brand-grant for eier og medarbeider. **Ingen Vercel Cron-kjøring er registrert for denne senderen**; staging-test krever bevisst manuel aktivering.
- Sikkerhetskritisk siste kontroll rett før SMTP: om en operatør har mistet aktiv tilgang etter den irreversible claim-en, blir det ikke sendt e-post, utfallet registreres som ukjent og videre kjøring stoppes.
- E-postinnhold er bevisst generisk uten kundeopplysninger. SMTP Message-ID er dokumentasjon på *SMTP-aksept*, ikke innbokslevering. Operatørpanelet har nå særskilt status for startet forsøk, SMTP-aksept og ukjent utfall, og kan ikke vise «levert» basert på ren SMTP-aksept.
- Isolert PostgreSQL 17-test for reelle ACL/RPC-er og no-retry/krasj, pluss session-/flaggrutetester og test-dobbel for SMTP, ligger i RealtyFlow CI. Ingen reelle e-poster er sendt under utvikling eller test.
- Krever fortsatt samlet full grønn CI på siste SHA, real staging-brukertest for Freddy/Andrea, kontrollert test SMTP-konto/mottaker, personvern, provider-leveringshendelser/returmeldinger og egen eksplisitt produksjonsgodkjenning før en separat PR kan åpne for faktiske produksjonsutsendelser.

### Altovena samlet med RealtyFlow main — isolert kodeintegrasjon (19. oktober 2026)

- **Ny integrasjons-PR:** [RealtyFlow #1464](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1464), fortsatt **draft**. Den er ikke sammenslått med produksjonsgrenen og påvirker ikke opprinnelige PR-er #1400, #1446, #1454, #1456, #1457, #1458 og #1461.
- En særskilt integrasjonsgren `integration/altovena-reconcile-main-20261019` ble opprettet fra toppen av Altovena-stakken `78a1e756`, og de fem nye `main`-commitene ble bevart i en **toforelders merge-commit `543ee6b`**. Sammenlignet med felles forfader endret Altovena 64 filer og main 22 forskjellige filer; **null overlappende filnavn**. Filer fra main ble lagt inn med eksakte Git blob-SHA-er. GitHub bekrefter **0 commits bak main**.
- **CI:** Alle 13 kontroller på `543ee6b` er `SUCCESS`, inkludert omfattende Build validation, Altovena intake med isolert PostgreSQL, Nexus, Marketing, Revenue, publisering og Re-Master-integrasjon.
- **Vercel forhåndsvisning:** `https://realtyflow-20jos6ynw-freddy-bremseths-projects.vercel.app`, deployment `dpl_G9tTh2XzNQXFvaA62Lmr5i2zMHrJ`; Git SHA `543ee6b`, status **READY**, preview uten produksjonsalias, Vercel SSO-beskyttelse er aktiv. Ingen promotering eller produksjonsutrulling er utført.
- **VIKTIG STAGING-SPERRE:** Vercel-konfigurasjonen har samme Supabase-env-oppføringer målrettet mot `preview` og `production`, blant annet `NEXT_PUBLIC_SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY`. **Det er ikke bekreftet at preview har separat database.** I tillegg har Supabase RealtyflowPRO ingen utviklingsgren. Reelle tobrukertester, syntetisk web-intake i cloud og eventuelle SMTP-forsøk må derfor **ikke** kjøres mot denne URL-en før database og miljøhemmeligheter er isolert og verifisert.
- **Neste sperrer:** separat økonomisk godkjent Supabase-staging, eksplisitt preview-only konfigurasjon, opprettelse av to verifiserte testbrukere/grants, full arbeidsflyt- og revoke-test, godkjent mail-test med testmottakere, personvern-/sikkerhetskontroll og eksplisitt eierbeslutning. Ingen av Altovena sine produksjonsflagg, kundeskjemaer, nye SQL-migrasjoner eller e-postutsendelser er slått på.


### Samordning og versjonsvakt, 19. oktober 2026

- RealtyFlow [Altovena CRM PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400) er synkronisert med hovedgrenen i to-foreldre merge `6995e1c`; nye Visibility/annonser-koder er bevart etter filkontroll.
- Den avhengige [cross-repo E2E PR #1446](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1446) er synkronisert med CRM-grenen i merge `15a1b58`, og GitHub bekreftet **0 commits bak parent**.
- Ny CI-sperre i `#1446`: Aktivt Altovena-nettsted (PR #5) må ha **samme commit-SHA** som fastlåst nettsidekode i E2E-testen (`ded27cde`). Eldre kontroll av `api/contact.js` og `public/contact-form.js` beholdes. Dette hindrer at tester fortsetter grønt etter parallell videreutvikling av nettstedet uten kontrollert synkronisering.
- Verifisert isolert PostgreSQL-test etter denne endringen: `PASS` for nettside-SHA, skjemafiler, virkelig handler→virkelig RealtyFlow handler→lokal database og CRM-kontakt/oppfølgingsoppgave.
- RealtyflowPRO-produksjonsmiljø er kontrollert på nytt: `altovena_receive_lead`, `altovena_intake_health` og mottakstabell finnes **ikke** ennå. Nødvendige Vercel-nøkler for kontaktmottak og spesifikk Andrea-bruker er fortsatt ikke konfigurert. Dette er bevisste lanseringssperrer.
- Fortsatt **ikke godkjent**: Reell nettverkstest mellom miljøene, faktisk Freddy-/Andrea-brukerrettighet, innsendingsvarsling, bekreftet personvern/retensjon, Turnstile og produksjonspublisering. Ikke påstå at en grønn offline CI erstatter disse kontrollene.

### Sikker databaseseparasjon før Altovena-test (19. oktober 2026)

- [RealtyFlow PR #1465](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1465), en **draft** stablet på den samlede integrasjonen #1464, implementerer en egen **fail-closed Altovena staging-sperre**. Produksjon og øvrige brands er uendret.
- På Vercel Preview/utviklingsmiljø er Altovena CRM-lesing, kundemottak, varslingsscan, leveringsforberedelse og SMTP-testkall blokkert før Supabase-kall med mindre `ALTOVENA_STAGING_ISOLATION_ENABLED=true` og en separat `ALTOVENA_STAGING_SUPABASE_PROJECT_REF` er konfigurert. `NEXT_PUBLIC_SUPABASE_URL` må peke nøyaktig til den verifiserte, separate `https://<ref>.supabase.co`-hosten. Den bekreftede RealtyflowPRO-produksjonsrefen `ereapsfcsqtdmzosgnnn` er alltid forbudt som testdatabase.
- Eierens Altovena-aktiveringsside viser blokkert staging-status **uten å slå opp levende CRM- eller Auth-data**. Regressiontester simulerer at alle tidligere automasjonsflagg er aktivert samtidig som databasen fremdeles er produksjonsdatabasen, og krever at alle rutene avviser forespørslene.
- Sperren verifiserer konfigurasjon/URL, **ikke** at en nøkkel er korrekt eller at Auth og migrasjoner faktisk er isolert. Ekte test av Freddy og Andrea krever separat Supabase staging-prosjekt/branch (kan koste penger), sikre gren-spesifikke Vercel-variabler og syntetiske brukere. Ingen slik ressurs eller reelle utsendelser er opprettet.
- GitHub test- og byggstatus for siste #1465-head skal verifiseres før arbeidet vurderes for merge; alle eksisterende Altovena-produksjonsflagg forblir av.

### Altovena egen staging-tilkobling uten felles RealtyFlow-endringer (19. oktober 2026)

- **Ny PR:** [RealtyFlow #1466](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1466), utkast stablet på #1465 → samordnet #1464.
- Forrige #1465 innførte en aktiv blokkering av Altovena på ikke-isolert preview. #1466 løser et viktig arkitekturproblem før aktivering: **andre merkevarer skal ikke måtte få endret felles `NEXT_PUBLIC_SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` for at Altovena skal kunne testes.**
- En egen servermodul `getAltovenaSupabase()` bruker ved **Altovena Preview** bare `ALTOVENA_STAGING_SUPABASE_URL` og `ALTOVENA_STAGING_SUPABASE_SERVICE_ROLE_KEY` sammen med eksplisitt staging-opt-in og en prosjekt-ID som ikke er RealtyflowPRO sin produksjons-ID. Ingen fallback til produksjonsnøkkel eller felles klient.
- Hele Altovena-løpet styres til denne klienten: verifisert brand-CRM/medarbeidertilgang, sikkert kundemottak, eierens aktiveringskontroll, intern varslingsskanner, leveringsforberedelse og manuell preview-SMTP. Produksjonsklient og andre brands er uendret.
- Testene inkluderer syntetisk faktisk RPC-kall der **felles RealtyFlow-variabler fortsatt peker mot produksjonslignende adresse**, men Altovena må bruke bare staging-URL og nøkkel. Manglende staging-hemmelighet må ikke falle tilbake til felles klient. Isolerte PostgreSQL-tester benytter fortsatt tilbakerullet syntetisk database.
- Ingen staging Supabase-ressurs, Vercel-nøkler, data eller ekte brukere er opprettet. Reell verifikasjon krever en kostnadsgodkjent separat Supabase-instans/branch, branch-spesifikke Vercel-secrets og ekte Auth-/grant-test uten produksjonsdata. CI-status på siste PR #1466-commit må bekreftes før sammenslåing.
- Både #1465 og #1466 er **draft**. Ingen automatisk produksjonsaktivering eller reelle e-poster er tillatt.

### Intern aktiveringskontroll med konkrete neste handlinger (19. oktober 2026)

- [RealtyFlow PR #1400](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1400) har videreutviklet den eierbeskyttede, skrivebeskyttede Altovena-kontrollen `/altovena-launch`. Den viser nå de **tre første uavklarte kontrollpunktene**, ansvarlig rolle, hva som konkret må gjøres og om punktet kontrolleres teknisk eller manuelt.
- Tekniske kontroller omfatter merkevare, database/RPC-sikkerhet, verifisert eierøkt, operatoridentitet, merkevarespesifikke rettigheter og serverkonfigurasjon. **Personvern, Turnstile/nettside, faktisk staging-innsending og domene må fortsatt verifiseres manuelt**, uansett resultat av tekniske CI-tester.
- API-en er fortsatt eierbegrenset, utleverer ingen hemmeligheter eller personopplysninger og returnerer **alltid `readyForPublicForm: false`**. Ingen aktiveringsknapp, databasemigrering, sending eller automatisk godkjenning ble innført.
- Testpakken verifiserer at riktig neste handling tilbys når noe mangler, og at de fire manuelle kontrollene gjenstår selv når tekniske tilstander simuleres som grønne.
- [PR #1446](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1446), med fastlåst nettstedskode → RealtyFlow API → lokal PostgreSQL-test, er **synkronisert med PR #1400** igjen (merge `086a8c8d`, `behind_by=0`). Endringer fra Command/Visibility kopieres ikke inn i separate konkurrerende løsninger.
- Offentlig innsending er fortsatt deaktivert, og ingen reelle kundehenvendelser eller operatørrettigheter er endret. Før lansering må de faktiske nettsidene og to legitime brukerøkter testes i et autorisert testmiljø, med særskilt godkjenning av sikkerhet/personvern.

### Altovena staging: arbeidsområde og medarbeidermeny isolert (19. oktober 2026)

- I [RealtyFlow PR #1466](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1466) er ytterligere to faktiske tilkoblingshull lukket: `/api/workspaces/altovena/capabilities` (første oppslag fra arbeidsområdet) og `/api/workspaces/available` (medarbeiderens liste over merkevarer).
- Første API-oppslag krever nå riktig staging-prosjekt **før** den forsøker å lese Altovena-brandgrant eller Auth. Kun `getAltovenaSupabase()` er tillatt i Altovena-preview; de øvrige brandene bruker fremdeles plattformdatabasen.
- I preview blir eventuelle **Altovena-tilganger i produksjonslisten filtrert ut**. Bare en aktiv, uavhengig verifisert Altovena-grant med samsvarende staging Auth-konto får legge inn «Altovena · testmiljø» i listen. Tilbakekalt grant og manglende staging-konfigurasjon gir ingen Altovena-visning – aldri fallback til produksjonsgrants.
- Nye syntetiske tester dokumenterer begge rutene, verifisert eier/medarbeider, avvisning ved tilbakekall og at Pinoso EcoLife fortsetter uendret. Den isolerte PostgreSQL-testen er fortsatt en del av CI. Samlet Build validation på den nyeste #1466-commit må bestås før videre utrulling.
- Merk begrensningen: felles innlogging og øvrige RealtyFlow-moduler bruker fortsatt eksisterende plattformautentisering. Vi har isolert **Altovenas merkevaredata**, ikke opprettet et frittstående Altovena SaaS-innloggingssystem. Ekte tobruker-test forutsetter fortsatt separat Supabase-testdatabase og eksplisitt bruker-/kostnadsgodkjenning.

### Altovena aktiveringskontroll – konkret neste handling (19. oktober 2026)

- [RealtyFlow PR #1469](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1469) ligger som **draft** oppå #1466, #1465 og #1464. Eierens `/altovena-launch` forklarer nå eksakt hvorfor staging er blokkert og gir **én konkret neste handling**, istedenfor bare generelle feil.
- Den skrivebeskyttede sjekklisten skiller separat Supabase-prosjekt-ID, eksplisitt staging-valg, egen serveradresse, hemmelig servernøkkel, reelle testidentiteter og syntetisk ende-til-ende-test. Den viser aldri faktiske nøkler, prosjektreferanser, e-poster eller kundedata.
- **Merk:** En riktig konfigurert URL er *ikke* bevis på separat database med korrekt servernøkkel og aktive brukere; `stagingReadyForHumanTest` er fortsatt `false`, og offentlig kundeskjema står på `readyForPublicForm:false`.
- Viktig identifisert restoppgave: RealtyFlows **felles innlogging** verifiserer fortsatt medarbeider mot plattformens Supabase Auth og brukerkatalog. Et individ som bare ligger i separat Altovena-testdatabase, kan derfor ikke gjennomføre selvstendig testinnlogging uten en egen, revidert staging-Auth-/session-flyt. Vi skal **ikke kopiere produksjonsbrukere, senke innloggingssikkerheten eller kalle staging fullt isolert** før dette er løst.
- Ingen staging database/branch eller Vercel secrets er opprettet, og ingen produksjonsflagg eller utsendelser er aktivert. Neste steg er grønn CI på #1469, separat design for trygg testinnlogging og konkret kostnadsavklaring med godkjenning før opprettelse av Supabase-staging.

### Altovena isolert staging-sesjon (19. oktober 2026)

- [RealtyFlow PR #1470](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1470) er ny **draft** på #1469 → #1466 → #1465 → integrasjon #1464. Den introduserer en særskilt staging-only HMAC-signert identitetsbevis-token med `altovena:staging-only:v1`-audience, eksakt Altovena-brand og staging-prosjektref, staging-Auth UUID, verifisert e-post og **15 minutters levetid**.
- Nøkkelen `ALTOVENA_STAGING_SESSION_SECRET` må være separat fra RealtyFlows plattformcookie-nøkkel og Supabase service keys. Sesjonen avvises uten korrekt isolert Vercel Preview-kontekst og kan aldri gjenbrukes som `realtyflow_admin`-cookie, owner-tilgang eller produksjonsøkt.
- **Viktig:** Dette er *kun en testbar sesjonsgrense*, ikke ferdig pålogging. Tokenet er ikke koblet til globalt `getRequestAccessContext`, plattformmiddleware eller API-tilgang. Ingen ekte staging-identitet får nye rettigheter via #1470.
- Neste nødvendige arbeid: separat staging Auth-innlogging mot egen **publishable/anon-key**, uavhengig bekreftet medarbeideridentitet og aktivt Altovena-grant før sesjon, HttpOnly/Secure/CSRF, per-request revokeringskontroll, logout og isolerte syntetiske E2E-tester. Krever også kostnadsgodkjent separat Supabase staging-prosjekt, som fortsatt ikke er opprettet.
- Unit-tester dekker separat signatur, tampering, utløp, feil prosjekt, produksjonssperre og uforenlighet med RealtyFlows eksisterende cookie. Siste GitHub CI-head må bestås før videre utviklingsmerge.

### Altovena avgrenset testinnlogging – PR #1474 (20. oktober 2026)

- [RealtyFlow PR #1474](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1474) er ny **draft** på #1470 og den øvrige Altovena-kjeden. Utviklet separat staging-only `POST/DELETE /api/altovena/staging-auth` med streng Vercel Preview-sperre og `ALTOVENA_STAGING_LOGIN_ENABLED` som er AV som standard.
- Innloggingen benytter bare Supabase Auth for den separate staging-databasen og krever uavhengig verifisering av staging UUID/e-post samt aktivt Altovena-grant med `crm.read`. Ugyldige innloggingsforsøk gir generell feilmelding.
- Sikrer HTTPS origin/samsvarende host og `x-forwarded-host` for å motvirke CSRF/host-spoofing, JSON-only input, og utsteder *kun* `altovena_staging_session`-cookie med Secure, HttpOnly, SameSite Strict, maksimalt 15 min og begrenset path. Den gir **ikke** tilgang til RealtyFlows globale sesjon eller ordinære arbeidsområder. Logout sletter bare staging-cookie.
- Ruten er **ikke aktivert**, ingen reell staging-instans/testbruker er opprettet og ingen produksjonskonfigurasjon eller SMTP er endret. Før aktivering trengs distribusjonssikker hastighetsbegrensning mot passordgjetting, virkelig CSRF/reverse-proxy-verifisering, separate staging-kontoer og live grant-kontroll for hver beskyttede staging-rute. Full CI på siste commit må fortsatt bekreftes.

### Staging-passordforsøk og tilbakekalling – PR #1475 (20. oktober 2026)

- [RealtyFlow PR #1475](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1475) er draft på #1474 og resten av Altovena-kjeden. Ny distribusjonssikker PostgreSQL-grense for staging-login med atomisk oppdatering av 15-minutters budsjett (globalt 300 og per konto 5 forsøk). Oppbevarer bare HMAC-identifikatorer, aldri klartekst-e-post eller IP. Manglende nøkkel, RPC, migrasjon eller database innebærer at passordautentisering blir **avvist før Auth-kall**.
- Ny `GET /api/altovena/staging-auth` krever gyldig staging-only-cookie og sjekker aktuell staging Auth UUID/e-post og aktiv Altovena `crm.read`-grant på nytt **hver gang**. Tilbaketrukket tilgang skal avvises, aldri løftes til ordinære RealtyFlow-rettigheter.
- Ingen staging-database, produksjonsmigrasjon eller Vercel-nøkkel er konfigurert. Login er AV som standard og Preview-only. CI må bestå på siste commit før videre merge.
- Gjenstående lanseringssperrer: isolert PostgreSQL-test av konkurrerende forsøk og ACL, reell test av auth-/revokeringsflyt i kostnadsgodkjent staging, MFA/abuse-håndtering, og egne beskyttede staging-arbeidsruter. Ingen produksjonsinnlogging eller kundekommunikasjon er aktivert.

### Kollisjonskontroll: kildeinnhenting

- [RealtyFlow #1435](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1435) er **kanonisk arbeid** for kildeinnhenting, private dokumentasjonskopier og kildeattestering. Stablet på #1432.
- [RealtyFlow #1436](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1436) er et **lite tillegg til #1435** med obligatorisk rettighetssjekk etter innhenting og før lagring. Den tester tilbakekalt tilgang og feilet autorisasjon.
- [RealtyFlow #1434](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1434) var et parallelt kildekontraktspor som nå er **stengt som duplikat, ikke merget**. Kravet om ny rettighetskontroll før lagring er overført til #1436. Fremtidig arbeid må i tillegg binde *kilderevisjon og kortvarig autorisasjonsgrant* til varig dokumentasjon, og kontrollere gjeldende kildetilgang igjen ved modellopptak. Dette er ennå ikke implementert i kanonisk stack.
- Ingen av disse PR-ene inneholder en godkjent tilkobling til virkelige CRM/Drive-kilder eller aktivert AI-kjøring. `#1433` er et separat Visibility-spor.

### Protokoll ved «fortsett» – også på tvers av chatter

1. Finn fersk `main`, åpne PR-er, seneste commit/tester og Supabase/Vercel-tilstand for **begge** repoene før arbeid.
2. Velg produkt og eksisterende kanonisk PR-stakk. Legg ny funksjon på toppen av riktig avhengighet; opprett ikke en parallellduplikat.
3. Dokumenter konkret hva som er implementert, testet og *ikke* aktivert, og oppdater denne roadmapen bare etter kontroll av GitHub.
4. Ikke slå sammen separate produktgrener eller publiser til produksjon på grunnlag av en muntlig status eller grønn enkelt-PR. Kombinert CI, staging, data-/rolleisolasjon og publiseringsgodkjenning gjelder.
5. ChatGPT fortsetter **ikke av seg selv mellom chatter**. En ny beskjed starter neste arbeidsrunde; GitHub/PR-er sørger for kontinuiteten, ikke en automatisk chat-jobb.

## Technical boundaries
1. **One source of truth per domain:** no copied Nexus agent authorization or execution policy inside each product.
2. **Versioned interfaces:** define mission, proposal, capability, approval, action request, dispatch receipt, and audit event contracts. Validate authorization at the API and database layers.
3. **Execution safety:** planning, analysis, approval, reservation, dispatch and verification are separate states. Recheck authorization after a reservation, immediately before dispatch; make external actions idempotent with immutable audit trails.
4. **Tenant security:** per-customer and per-brand isolation is mandatory, including data, storage, AI context, logs and offline queues. Never treat CORS or UI hiding as authorization.
5. **Deployment isolation:** shared SaaS and dedicated customer installations may share a versioned codebase; no per-customer fork by default. RealtyFlowPRO is not a staging environment.
6. **Release practice:** feature branch → PR → CI → integrated tests → preview/staging → reviewed merge → guarded production activation. No automatic merging or publishing merely because checks are green.
7. **Data ownership:** preserve existing RealtyFlow, Olivia, and Doña Anna production records; prepare migration and rollback plans prior to schema changes.

## Olivia OS – SaaS Foundation 1.0
The 2026-10-16 SaaS review identifies these *reported* concerns, which require validation against current code and data before production changes:
- P0: server-authenticated AI calls, rate limits, consumption accounting, tenant and farm isolation (including RLS), real mobile/workflow integration tests.
- P1: remove hard-coded Doña Anna/Biar defaults, self-service onboarding, configurable farm memberships/roles, safe offline sync.
- P2: subscriptions, farm-tier quotas and billing; external pilot on verified tenant isolation.
- Separate **Olivia OS** (farm operations) from **Doña Anna B2B** (sales), while integrating through scoped APIs.
- Maintain Doña Anna as a reference tenant; add a fictional test farm and enforce zero cross-farm access.

## Integration order
1. Review the two Command/Nexus PRs, test combined migrations, TypeScript contracts and authorization in isolated staging. Keep actual external agent execution OFF.
2. Establish shared Nexus contract package/API specifications without prematurely relocating all RealtyFlow code.
3. Document existing Intelligence and Visibility modules, their PRs, dependencies and customer-ready boundaries.
4. Create Olivia isolation and AI-cost security tests before multi-tenant activation.
5. Introduce Altovena-wide product catalog, entitlement configuration, monitoring, release dashboards and deployment checklist.
6. Only after stable contracts: consider extracting Nexus Core to a versioned reusable package/service.

## Coordination protocol for future development chats and agents
- This file is the cross-repository **coordination index**, not a replacement for code, issues, releases, or CI.
- Before every development task: inspect current `main`, relevant open PRs, migration history and production state.
- Record product, repo, issue/PR, dependency, affected schema, approval boundaries, tests and deployment status in each PR.
- If the same behavior appears in multiple products, modify its owning shared contract, not multiple forks.
- Work never continues autonomously between chat sessions unless an explicitly scheduled automation is configured. A new "fortsett" instruction starts a fresh, state-verified development pass.

## Definition of done for cross-product changes
- No regression of existing customer data or roles.
- Contract compatibility and tenant-isolation tests pass.
- Migration and rollback reviewed.
- Product preview validated on desktop and mobile when UI changes.
- Explicit authorization for writes/sends/publication.
- CI and deployment verified on the final combined commit; production release recorded separately.
