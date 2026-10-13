# Altovena — website v0.1

A dependency-free, bilingual (English/Norwegian) first website for Altovena, a planned international AI product and technology brand.

## Run and test

```bash
npm run check
npm test
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/en/` or `http://localhost:8000/no/`.

This builds **20 statically rendered pages** covering the home page, product overview, four product pages, Nexus technology, services, team and contact in both languages.

## Release safeguards

- By default **all pages are noindex** and `robots.txt` disallows crawling. This is a prelaunch build.
- Set `SITE_URL=https://your-confirmed-domain.example` **only after domain ownership, legal publishing details, product copy and sitemap are approved**. This enables canonical, hreflang and sitemap output.
- Set `CONTACT_EMAIL=your-verified-inbox` before launch. Until then the existing `post@chatgenius.pro` inbox is shown as a clearly marked *temporary* contact channel. No form submission or CRM integration is claimed.
- Product pages describe product directions; product access, subscription prices, client logos, performance claims and case studies must be verified before launch.
- Workflow visualization is explicitly illustrative, not customer data.
- Team titles and bios require sign-off before public release.
- No trackers, external font downloads or analytics scripts are loaded in this first version.
- ChatGenius.pro remains a separate brand for small apps, simpler SaaS, websites and training.

## Repository structure

- `scripts/build.mjs` — site generator and Norwegian/English content.
- `public/styles.css` — responsive style system.
- `public/site.js` — accessible mobile navigation.
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
