import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const content = {
  no: {
    title: 'Intelligent teknologi. Virkelig forretningsverdi.',
    intro: 'Altovena utvikler AI-produkter, SaaS-plattformer og intelligente løsninger for virksomheter. Vi kombinerer spesialisert programvare med rådgivning, integrasjon og praktisk gjennomføring – med sikkerhet, dokumentasjon og menneskelig kontroll.',
    eyebrow: 'Én teknologivirksomhet – flere måter å skape verdi på',
    section: 'Fra idé til teknologi som brukes',
    sectionIntro: 'Vi bygger langsiktig teknologi og hjelper virksomheter med konkrete problemer allerede i dag. Produkter under utvikling merkes tydelig, og leveranser avklares individuelt.',
    cards: [
      ['AI-produkter og SaaS', 'Intelligence og Visibility utvikles for repeterbare, målbare arbeidsoppgaver.', '/no/produkter/', 'Utforsk produktene'],
      ['Plattformer og intelligente systemer', 'Command, Nexus og Shared Core er retningen for kontrollert samspill mellom mennesker, data og AI.', '/no/teknologi/nexus/', 'Se teknologien'],
      ['Bransjeløsninger', 'RealtyFlow og Olivia OS bygger på faktiske erfaringer fra eiendom og landbruk. Ekstern tilgjengelighet må bekreftes.', '/no/praktisk-bruk/', 'Se praktisk bruk'],
      ['Rådgivning og spesialutvikling', 'Vi vurderer AI-arbeidsflyt, nettsider, automatisering, SEO/AEO/GEO og skreddersydde apper – også i samarbeid med ChatGenius.', '/no/tjenester/', 'Se tjenestene']
    ],
    servicesTitle: 'Teknologi, rådgivning og gjennomføring',
    servicesText: 'Noen kunder trenger et ferdig produkt. Andre trenger hjelp til å avklare et problem, bygge en app, modernisere en nettside eller innføre AI i en arbeidsprosess. Vi starter med behovet og avtaler leveransen før arbeidet begynner.',
    chat: 'ChatGenius.pro er en mulig kommersiell inngang for mindre apper, nettsider, opplæring og løpende digitale tjenester. Merkevaremodellen vurderes videre sammen med teamet.'
  },
  en: {
    title: 'Intelligent technology. Real business value.',
    intro: 'Altovena develops AI products, SaaS platforms and intelligent business solutions. We combine specialist software with consulting, integration and practical implementation – grounded in security, evidence and human oversight.',
    eyebrow: 'One technology business – multiple paths to value',
    section: 'From ambition to technology people use',
    sectionIntro: 'We build reusable technology for the long term while helping businesses solve concrete problems today. Products in development are clearly labelled and service scopes are agreed individually.',
    cards: [
      ['AI products and SaaS', 'Intelligence and Visibility are being developed for repeatable, measurable business workflows.', '/en/products/', 'Explore products'],
      ['Platforms and intelligent systems', 'Command, Nexus and Shared Core describe our direction for controlled collaboration between people, data and AI.', '/en/technology/nexus/', 'Explore technology'],
      ['Industry solutions', 'RealtyFlow and Olivia OS are informed by real work in property and agriculture. External availability remains subject to confirmation.', '/en/applied-work/', 'See applied work'],
      ['Consulting and custom development', 'We explore AI workflows, websites, automation, SEO/AEO/GEO and tailored apps – including possible delivery through ChatGenius.', '/en/services/', 'Explore services']
    ],
    servicesTitle: 'Technology, advice and implementation',
    servicesText: 'Some clients need a focused product. Others need help defining a problem, building an app, improving a website or introducing AI into a workflow. We start with the need and agree the scope before delivery.',
    chat: 'ChatGenius.pro may serve as a commercial entry point for smaller apps, websites, training and ongoing digital services. The final brand structure remains under review with the team.'
  }
};
const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for (const locale of ['no','en']) {
  const x = content[locale];
  const homePath = path.join(dist, locale, 'index.html');
  let html = fs.readFileSync(homePath, 'utf8');
  if (!/<section class="hero">/.test(html)) throw new Error('Missing home hero: ' + locale);
  html = html.replace(/(<section class="hero">[\s\S]*?<h1>)[\s\S]*?(<\/h1>)/, '$1' + escapeHtml(x.title) + '$2');
  html = html.replace(/(<section class="hero">[\s\S]*?<p class="lede">)[\s\S]*?(<\/p>)/, '$1' + escapeHtml(x.intro) + '$2');
  const cards = x.cards.map(([name,description,href,cta]) => '<article class="card"><h3>' + escapeHtml(name) + '</h3><p>' + escapeHtml(description) + '</p><a class="card-link" href="' + href + '">' + escapeHtml(cta) + ' ↗</a></article>').join('');
  const section = '<section class="section section-white" data-altovena-strategy="2026"><div class="container"><div class="section-heading"><span class="eyebrow">' + escapeHtml(x.eyebrow) + '</span><h2>' + escapeHtml(x.section) + '</h2><p class="section-intro">' + escapeHtml(x.sectionIntro) + '</p></div><div class="product-grid">' + cards + '</div></div></section>';
  html = html.replace(/(<section class="hero">[\s\S]*?<\/section>)/, '$1' + section);
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(x.title) + ' | Altovena</title>');
  fs.writeFileSync(homePath, html);

  const servicePath = path.join(dist, locale, 'services', 'index.html');
  const translatedServicePath = locale === 'no' ? path.join(dist, 'no', 'tjenester', 'index.html') : servicePath;
  const servicesFile = fs.existsSync(translatedServicePath) ? translatedServicePath : servicePath;
  let serviceHtml = fs.readFileSync(servicesFile, 'utf8');
  const serviceSection = '<section class="section section-tint" data-altovena-services="2026"><div class="container"><div class="section-heading"><h2>' + escapeHtml(x.servicesTitle) + '</h2><p class="section-intro">' + escapeHtml(x.servicesText) + '</p></div><p>' + escapeHtml(x.chat) + ' <a href="https://www.chatgenius.pro/" rel="noopener noreferrer">ChatGenius.pro ↗</a></p></div></section>';
  serviceHtml = serviceHtml.replace('</main>', serviceSection + '</main>');
  fs.writeFileSync(servicesFile, serviceHtml);
}
console.log('PASS: Altovena umbrella positioning added in Norwegian and English, with prelaunch controls unchanged.');
