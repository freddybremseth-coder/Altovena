# Altovena — website v1.2

A dependency-free, bilingual (English/Norwegian) first website for Altovena, a planned international AI product and technology brand.

## New in v1.2 – sitewide customer journey and answer quality

All 32 existing Norwegian/English pages now receive an individual, answer-first customer-decision section based on the 13 October 2026 Andrea/Erlend SEO, AEO, GEO and customer-journey manual. The four product pages additionally explain why to choose their approach, scope and limitations, with two specific FAQs per product. The portfolio page includes an accessible three-column comparison that becomes labelled cards on mobile. Customer-searchable H1s and unique metadata replace vague slogans where appropriate. Internal next-step links connect hubs, guides, products, real operating contexts and contact without creating overlapping thin URLs.

Build: `scripts/journey-data.mjs` → `scripts/customer-journey.mjs` → `public/journey.css`. Test: `scripts/qa-customer-journey.mjs` checks all 32 pages, semantic headings, metadata, internal links, product FAQs, mobile comparison and preview noindex. See `docs/sitewide-seo-aeo-geo-customer-journey-audit.md` for the complete bilingual route matrix.

**Legal and release limit:** Altovena is the intended new technology company name, not yet a verified registered controller. The privacy notice and direct RealtyFlow intake remain prelaunch. The approved SEO/AEO/GEO article does not authorize publishing the entire draft website. No claims of released products, contractual prices, guarantees or fabricated metrics are made.

## Run and test

```bash
npm run check
npm test
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/en/` or `http://localhost:8000/no/`.

This builds **24 statically rendered pages** covering the home page, product overview, four product pages, Nexus technology, services, team and contact in both languages. Version 0.2 adds four product-specific, three-step illustrative walkthroughs (eight localized tours) and a client-side email-draft contact form in both languages.

## What's new in v0.3

- **Applied work / Praktisk bruk:** a new English/Norwegian operating-context page featuring ZenEcoHomes and Doña Anna. These are clearly described as real work contexts — not fictional testimonials or quantified performance claims.
- **Interactive example dossiers:** client-side example evidence, data confidence and suggested human-reviewed next actions on Offer Intelligence and Visibility. No live research or AI API calls.
- **Product-aware contact links:** product CTAs carry a `?product=` parameter that selects the relevant topic in the existing email-draft form.
- **22 localized pages**, each linking to the new applied-work page; sitemap inclusion remains gated to approved public releases.

## What's new in v0.4

- **Solution adviser / Produktveiviser:** a product-matching section on each localized home page. Visitors select one of four business challenges and immediately see an honest recommendation for Offer Intelligence, Visibility, RealtyFlow or Olivia OS.
- **Product-aware next step:** every recommendation links to the correct product page and preselects the corresponding topic on the existing email-draft contact page.
- **Private by construction:** no AI call, cookies, browser storage, tracking or submissions. This is clearly marked as a static decision guide, not a live AI or company analysis.
- **New QA:** automated validation for both languages, all four routes, correct links and preview indexing protection.
- **Product screenshot acceptance checklist:** `docs/demo-asset-approval.md` specifies verification, redaction and sign-off required before replacing illustrative panels with real app screenshots.

## Release safeguards

- By default **all pages are noindex** and `robots.txt` disallows crawling. This is a prelaunch build.
- For public release, set both `SITE_URL=https://your-confirmed-domain.example` and `PUBLIC_LAUNCH=true` **only after domain ownership, legal publishing details, product copy and sitemap are approved**. Preview remains noindex even if a site URL was configured accidentally. Public release builds fail if a dedicated contact inbox has not been configured.
- Set `CONTACT_EMAIL=your-verified-inbox` before launch. Until then the existing `post@chatgenius.pro` inbox is shown as a clearly marked *temporary* contact channel. The interactive contact fields only generate a draft using the visitor’s own email app: **no data is uploaded, no message is sent automatically, and no CRM integration is claimed**.
- Product pages describe product directions; product access, subscription prices, client logos, performance claims and case studies must be verified before launch.
- Workflow visualization is explicitly illustrative, not customer data.
- Team titles and bios require sign-off before public release.
- No trackers, external font downloads or analytics scripts are loaded in this first version.
- ChatGenius.pro remains a separate brand for small apps, simpler SaaS, websites and training.

## Repository structure

- `scripts/build.mjs` — base site generator and Norwegian/English content.
- `scripts/enhance.mjs` — product walkthroughs, contact-draft pages and deliberate public-release gate.\n- `scripts/extend.mjs` — bilingual applied-work page, example scenarios, product-aware enquiry links.\n- `scripts/qa-extend.mjs` — 22-page, scenario and contextual-link QA.
- `scripts/qa-enhancements.mjs` — tests for product walkthroughs, contact forms and prelaunch safety.
- `public/styles.css` and `public/enhance.css` — responsive design system and interactive page styles.
- `public/enquiry.js` — opens a mailto draft without a network submission.
- `public/site.js` — accessible mobile navigation.\n- `public/scenario.css` and `public/scenario.js` — accessible static example scenarios and product preselection.
- `scripts/match.mjs` — build-time bilingual homepage product adviser.
- `scripts/qa-adviser.mjs` — test the adviser, links, privacy and prelaunch checks.
- `public/adviser.css` and `public/adviser.js` — accessible product guidance (static decision tree).
- `docs/demo-asset-approval.md` — approved real-screenshot requirements.
- `scripts/check.mjs` — tests route counts, on-page structure and internal links.
- `vercel.json` — build output configuration.
- `dist/` — generated website, excluded from Git.
- `.github/workflows/validate.yml` — Node 24 CI checks.

## Further development

1. Verify and approve company name, domains, legal pages and person descriptions.
2. Decide which products have demo, private pilot or publicly sellable status; label each accurately.
3. Replace illustrated system flow with approved real product screenshots.
4. Establish Altovena-branded demo/lead workflow with consent and data handling requirements.
5. Add approved privacy policy and company details.
6. Set up production domain, analytics/Search Console and launch indexing only after QA.
7. Connect product pages and source material to the SEO/AEO/GEO editorial standards in the working manual.

## What's new in v0.5

- New bilingual **Trust & control / Tillit og kontroll** page describing planned AI review, quality processes, financial oversight and data access boundaries. These statements describe design goals, **not** existing certifications or enterprise contractual commitments.
- Team responsibilities: Freddy Bremseth (product and technology), Anna Bremseth (finance, accounting, quality assurance and internal controls), Andrea Thorsnes Karlsen (marketing and customer experience), Erlend Thorsnes Karlsen (SEO/AEO/GEO).
- Product pages now include a transparent scope/availability clarification and a contextual trust link. The company page and all footers link to the new page.
- 24 bilingual pages; new page appears in sitemap only on an explicitly approved public release.
- New automated QA checks for page count, staff names, navigation and index prevention.

### Human checks still required

- Anna: financial and quality-control language, correct invoicing/legal company details, cost commitments.
- Freddy: actual product status, demo accuracy, integrations and service scope.
- Andrea: public biography approval, customer language, accessible user experience.
- Erlend: SEO/AEO/GEO content accuracy and metadata.
- Legal/privacy: actual operator identity, approved privacy information and contractual terms. These are not fabricated by the marketing pages.

## What's new in v0.6

- Altovena brand logo and favicon variants are installed throughout the English/Norwegian site.
- Real, optimized brand artwork is used for homepage and four products. Each AI-rendered image is expressly labeled as a **concept illustration**, not a real system screenshot.
- The company and contact pages display the founder-supplied contact address at Avenida del Presidente Adolfo Suárez 14, Eagle Tower, Benidorm, Spain, and the intended domain Altovena.com. This does not claim a legally registered address or completed company registration.
- The home page includes an original **18-second captioned, silent** brand-introduction video with poster and user-controlled playback. This is concept footage, not live product footage.
- See `docs/brand-media-policy.md` for screenshot and media acceptance rules. Screenshots of actual functioning systems will only be added once reviewed and redacted.
- Build and QA expanded to verify all brand media and 24 localized pages; prelaunch indexing safeguards remain unchanged.

## What's new in v0.7

- Product cards on the home and product-index pages now show the matching optimized illustrations: 16 visual cards across English and Norwegian.
- Each conceptual image has a visible disclaimer that it is **not** a screenshot of a live product, plus meaningful alt text.
- The existing brand introduction has an accessible, language-specific transcript, which does not claim to show real product interactions.
- Build script and QA cover both languages, all four product images, disclosure copy, and the video transcript.
- A separately generated Norwegian 18-second MP4 is ready for review; the website retains its current embedded English concept film until the Norwegian asset is added to this repository. Do not claim it is deployed yet.
- OpenGraph preview images are converted to an absolute URL when `PUBLIC_LAUNCH=true` and a verified `SITE_URL` is set.
- No actual private application screenshots have been added, since approved redacted captures are not available yet. Review `docs/demo-asset-approval.md` before posting any real dashboard screenshot.

## What's new in v0.8 — editorial workflow

- New Norwegian/English Insights hubs: `/no/innsikt/`, `/en/insights/`.
- One substantive bilingual cornerstone guide on the difference between SEO, AEO and GEO, based on Andrea and Erlend's **SEO/AEO/GEO & customer journey manual v1.2 (14 Oct 2026)**. The copy uses direct H2 answers, evidence and primary-source references, a mobile-friendly three-column comparison, genuine FAQ, contextual links and a relevant next step to Visibility.
- Guide slugs: `/no/innsikt/seo-aeo-geo-forskjeller/` and `/en/insights/seo-aeo-geo-explained/`.
- One site-wide Insights navigation/footer entry, and a contextual guide link from the Visibility commercial page; no duplicate articles aimed at the same intent.
- 28 localized static pages, all still `noindex` in preview. When a verified release is authorized, canonical/hreflang and an updated sitemap are generated. Public editorial release requires **`EDITORIAL_APPROVED=true`** as well as the existing public launch prerequisites.
- `scripts/qa-editorial.mjs` checks language equivalents, links, sources, answer-first sections, readable comparison cells and release safeguards.
- `docs/editorial-and-customer-journey-standard.md` documents the six mandatory editorial quality checks, customer-journey stages and human reviewer roles.

### Editorial sign-off still required

Andrea Thorsnes Karlsen: customer journey, wording, usability and CTA. Erlend Thorsnes Karlsen: SEO, AEO and GEO substance, search intent and source accuracy. Freddy Bremseth: commercial/product truth. Anna Bremseth: relevant financial quality and controls. Green CI is not editorial sign-off and does not authorize public publishing.

## v0.9 — approved SEO cornerstone, Offer guide in draft

- SEO/AEO/GEO cornerstone guide is approved for publication as of 14 October 2026; the user-authorized approval is now reflected in Norwegian and English copy without falsely claiming individual team approval.
- One distinct B2B qualification guide is drafted in both languages, under Insights. It separates **quality of company evidence** from **genuine buying interest**, includes privacy-aware guidance with EU primary sources, practical human-approval steps, three-column comparison and FAQ. It is **not approved for production yet**.
- Builds now include 30 localized pages, with additional QA covering the new guides, language links, sources and preview noindex.
- Production blocker: Vercel project domain `altovena.com` was added and verified for the project, but DNS is still misconfigured. Vercel registrar lookup found it currently available for registration. Do not claim the public domain is live, or merge draft-only material to production to publish the approved article. Domain purchase requires a separate explicit user authorization.
- Keep `feature/website-v0-1` / PR #2 in preview while an approved-content-only production release and domain verification are prepared.

## v1.1 – RealtyFlow ownership of forms, CRM and marketing

- **RealtyFlow is the system of record** for Altovena forms, brand leads, CRM, newsletter, Content Hub, social media and campaigns. The website has no independent CRM or email-delivery list.
- Privacy policies explicitly describe future RealtyFlow processing, not standalone Resend delivery.
- The server-side `/api/contact` code is a **disabled-by-default, RealtyFlow-only brand-scoped gateway**. It never writes customer data locally and never submits to an unrelated brand.
- **Do not activate** until the dedicated RealtyFlow `/api/public/altovena-leads` endpoint is implemented, tested for durable record creation, brand routing, duplicate prevention, notification and role-based access. RealtyFlow's existing generic public-lead endpoint defaults unknown brands to Zen Eco Homes and is unsuitable here.
- Until that test passes, the site keeps the honest mail-draft fallback with prominent links to the privacy pages, and does not claim submissions are saved in CRM.
- Freddy and Andrea require full **operational** Altovena permissions, scoped in RealtyFlow to the Altovena brand. This is an approved architecture requirement, **not confirmation that membership/permissions are active**.
- See `docs/realtyflow-brand-integration.md` for the contract, handoff and acceptance tests.
