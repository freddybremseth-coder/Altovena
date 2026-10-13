# Altovena — website v0.5

A dependency-free, bilingual (English/Norwegian) first website for Altovena, a planned international AI product and technology brand.

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
