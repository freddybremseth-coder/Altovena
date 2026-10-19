# Altovena → RealtyFlow: en merkevare, ett kundesystem

**Beslutning:** 14. oktober 2026. Altovena er den offentlige nettsiden. **RealtyFlow** er eneste autoritative plattform for innkommende forespørsler, brand-tilordning, CRM/kontakter, pipelines, oppgaver, nyhetsbrev, e-post, Content Hub og SoMe. Ingen parallelle Altovena-lister, Resend-inboks eller skygge-CRM.

## Status

- Nettsiden presenterer produkt, guider og CTA-er. To-språklig personvern og kontaktflyt finnes i beskyttet preview.
- Inntil sikker RealtyFlow-intake er verifisert brukes kontaktens eksisterende `mailto:`-flyt. Nettsiden sier ikke at et skjema er mottatt før RealtyFlow har bekreftet faktisk lagring.
- `api/contact.js` er en **fail-closed bro** som krever miljøvariabler, lovlig behandlingsansvarlig, publisert og godkjent personvern, servervalidering og botkontroll. Den skriver aldri en egen databasetabell eller sender via Resend.
- RealtyFlow har allerede `/api/public/leads`, men den ruter ukjente merker til **ZenEcoHomes (`zeneco`)**. **Dette API-et må IKKE brukes for Altovena.**
- `/api/public/altovena-leads` er kontraktsmålet. Det er **ikke dokumentert som implementert** i RealtyFlow. Aktivér ikke kontaktbroen før endepunkt, brand-register og ACL er klare og testet.
- Ulike merkevarer må holdes logisk og tilgangsmessig atskilt også når felles kontaktidentiteter gjenbrukes.

## Intakets kontrakt, før aktivering

**Altovena-API (BFF):** `POST /api/contact` på altovena.com. Kun origin altovena.com og Turnstile-validert, ingen hemmeligheter i klienten. Valider navn, e-post, virksomhet, tema og meldingslengde. Ingen nyhetsbrev- eller SoMe-samtykke arves fra kontaktskjemaet.

**RealtyFlow API:** `POST /api/public/altovena-leads` på den autoriserte RealtyFlow-domenenavnet. Private `x-altovena-ingest-key`, eksplisitt `brandKey='altovena'` og `source='altovena.com/contact'`, verifisert behandlingsformål. Returner `{ok:true,accepted:true,leadId:<kanonisk CRM-UUID>}` **bare etter** bekreftet lagring og innskriving av tilhørende hendelse/varsel. Ingen fallback til zeneco eller andre merkevarer. Idempotens mot dobbeltklikk; audit og sikker feilrapportering.

**Visning i RealtyFlow:** Ny henvendelse må gi synlig lead, status `NEW`, kilde, produktinteresse, aktivitet og varsel. Freddys og Andreas views filtreres på Altovena men tillater oversikt over de merkevarene de ellers er autorisert for.

## Tilgang for Freddy og Andrea

Bruk eksisterende server-verifiserte `core.brand_workspace_memberships`, ikke rolleflag i en browser. **Freddy og Andrea skal begge ha full operativ Altovena-tilgang**: CRM-les/skriv; leadpipeline og oppgaver; email-les/utkast/send; nyhetsbrev; marketing-les/utkast/publiser; Content Hub; Reels; YouTube; ads; Visibility, Nexus og relevante kampanjer. Behold eksplisitte godkjenninger for risikofylte handlinger og interne eierskapskontroller.

Freddys OWNER-status er ikke en grunn til å gjøre Andrea til plattformadministrator på tvers av selskaper. Gi henne et revidert brand-spesifikt partner-/operatørtilgangssett med fulle Altovena-rettigheter. Aktivér først etter kontroll av hennes verifiserte RealtyFlow-identitet og riktig brand-register. Nye rettigheter skal ha auditlogg og kunne trekkes tilbake.

**Viktig:** Migrasjon `brand_workspace_access_plans` har draftrettigheter, ikke automatisk aktive medlemskap. Ikke presenter ønsket tilgang som allerede innvilget.

## Nyhetsbrev / SoMe

- Egne Altovena-segmenter og senderidentitet inne i RealtyFlow, ingen kundedata kopiert til andre merkers lister.
- Separat, dokumentert aktiv opt-in for nyhetsbrev; «send forespørsel» er ikke påmelding.
- Eventuelle publikasjoner, nyhetsbrev og eksterne svar skal gå gjennom RealtyFlows brand-/godkjenningspolicy, ikke en Altovena cron eller lokalt API.
- Spor målepunkter `impressions → besøk → skjema → lead → kvalifisering → kundesamtale`, uten oppdiktede AI-/SEO-resultater.

## Personvern og lanseringskontroll

Bekreft faktisk juridisk behandlingsansvarlig (Altovena er foreløpig merkevare), oppbevaring/sletting, RealtyFlow/Supabase/leverandører, roller, behandlingsgrunnlag, internasjonale overføringer og databehandleravtaler før endelig publikasjon. Bruk to-lags opplysning ved skjemaet + full norsk/engelsk personvernerklæring.

Oppdatér personvernteksten når RealtyFlow-oppsettet faktisk er aktivt. Retention og forbrukerrettigheter må fungere i systemet, ikke bare være en statisk erklæring.

## Akseptansetest før live formular

1. En verifisert Altovena-testhenvendelse oppretter **én** Altovena-lead og én synlig melding/oppgave i RealtyFlow.
2. Freddy og Andrea kan begge se, følge opp og endre Altovena-leaden med egne påloggede kontoer. Andre merkevarers kontaktdata skjermes.
3. Dobbel innsending blir ikke to leads. Ugyldig eller bot-innsending gir ingen kundepost.
4. RealtyFlow-feil, 401, 403 og nettverksfeil vises som feil – aldri falsk «sendt».
5. Samtykke til nyhetsbrev er separat og fraværende som standard; avmelding og sperrelister håndheves.
6. Kildespor, brand `altovena`, varsling og status verifiseres i RealtyFlow.
7. QA kontrollerer mobil, WCAG, 200-status, beskrivende lenker og preview `noindex`.
8. Ingen produksjonsmerge før eier godkjenner systemflyten og juridisk informasjon.

**Ingen egen Altovena CRM-tabell, Resend send API eller separate kundeautomatiseringer skal opprettes i nettstedet.**
