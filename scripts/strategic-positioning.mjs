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

for (const locale of ['no', 'en']) {
  const norwegian = locale === 'no';
  const file = norwegian ? path.join(dist, 'no', 'produkter', 'index.html') : path.join(dist, 'en', 'products', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const statuses = norwegian ? {
    'Offer Intelligence': 'Under utvikling – kommersiell pilot ikke bekreftet',
    'Altovena Visibility': 'Intern prototype – ikke ferdig fullautomatisering',
    'RealtyFlow': 'Internt referansemiljø – ikke generell SaaS',
    'Olivia OS': 'Prototype og utviklingsmiljø'
  } : {
    'Offer Intelligence': 'In development – commercial pilot not confirmed',
    'Altovena Visibility': 'Internal prototype – not fully automated',
    'RealtyFlow': 'Internal operating reference – not general SaaS',
    'Olivia OS': 'Prototype and development environment'
  };
  for (const [product, status] of Object.entries(statuses)) {
    const title = '<h3>' + product + '</h3>';
    if (!html.includes(title)) throw new Error('Product card missing: ' + product);
    html = html.replace(title, title + '<p class="notice">' + escapeHtml(status) + '</p>');
  }
  const command = norwegian ?
    ['Altovena Command', 'Koordinering av mennesker, oppgaver og AI-agenter med ansvar, dokumentasjon og godkjenning før viktige handlinger.', 'Under utvikling – ikke selvstendig salgsprodukt', '/no/teknologi/nexus/', 'Les om teknologien'] :
    ['Altovena Command', 'Coordinating people, tasks and AI agents with accountability, evidence and approval before consequential actions.', 'In development – not a standalone product', '/en/technology/nexus/', 'Explore technology'];
  const card = '<article class="product-card"><span class="pill">' + escapeHtml(command[2]) + '</span><h3>' + escapeHtml(command[0]) + '</h3><p>' + escapeHtml(command[1]) + '</p><a href="' + command[3] + '">' + escapeHtml(command[4]) + ' ↗</a></article>';
  if (!html.includes('</div><div class="facts">')) throw new Error('Portfolio insertion point missing: ' + locale);
  html = html.replace('</div><div class="facts">', card + '</div><div class="facts">');
  fs.writeFileSync(file, html);
}


for (const locale of ['no', 'en']) {
  const norwegian = locale === 'no';
  const base = '/' + (norwegian ? 'no' : 'en') + '/';
  const commandPath = base + (norwegian ? 'produkter/command/' : 'products/command/');
  const pageFile = path.join(dist, commandPath.slice(1), 'index.html');
  const nexusPath = path.join(dist, base.slice(1), norwegian ? 'teknologi/nexus/index.html' : 'technology/nexus/index.html');
  let html = fs.readFileSync(nexusPath, 'utf8');
  const title = norwegian ? 'Altovena Command – planlegging og godkjenning av AI-arbeid' : 'Altovena Command – coordinate and approve AI work';
  const intro = norwegian ? 'Command er en produktretning for å samordne oppgaver, ansvar og AI-agenter. Systemet skal legge frem plan og grunnlag for godkjenning før viktige handlinger. Det er under utvikling og ikke tilgjengelig som eget kommersielt produkt.' : 'Command is a product direction for coordinating tasks, accountability and AI agents. Its intended workflow presents plans and evidence for approval before consequential actions. It remains in development and is not offered as a standalone commercial product.';
  const items = norwegian ? [
    ['Planlegg', 'Beskriv oppdraget, ønsket resultat, aktuelle datakilder og hvem som har ansvar.'],
    ['Godkjenn', 'Vis forslag og konsekvenser slik at en ansvarlig person kan ta stilling før utførelse.'],
    ['Dokumenter', 'Registrer beslutninger, endringer og resultat slik at arbeidet kan etterprøves.']
  ] : [
    ['Plan', 'Define the assignment, intended result, permitted sources and responsible person.'],
    ['Approve', 'Present suggested actions and consequences for human review before execution.'],
    ['Document', 'Record decisions, changes and outcomes so work can be reviewed.']
  ];
  const cards = items.map(([head,copy],i) => '<article class="card"><span class="card-icon">0' + (i + 1) + '</span><h3>' + escapeHtml(head) + '</h3><p>' + escapeHtml(copy) + '</p></article>').join('');
  const body = '<section class="page-hero"><div class="container"><span class="eyebrow">ALTOVENA COMMAND · ' + (norwegian ? 'UNDER UTVIKLING' : 'IN DEVELOPMENT') + '</span><h1>' + escapeHtml(title) + '</h1><p class="lede">' + escapeHtml(intro) + '</p></div></section><section class="section section-white"><div class="container"><div class="card-grid">' + cards + '</div><p class="notice">' + (norwegian ? 'Beskrivelsen gjelder produktplanen. Full integrasjon, ekstern tilgjengelighet og resultatmåling er ikke sluttverifisert.' : 'This describes the product plan. Full integration, external availability and outcome measurement are not yet verified.') + '</p></div></section><section class="cta-band"><div class="container"><h2>' + (norwegian ? 'Diskuter et kontrollert AI-arbeidsløp' : 'Discuss an accountable AI workflow') + '</h2><a class="btn btn-primary" href="' + base + (norwegian ? 'bestill-demo/' : 'book-demo/') + '">' + (norwegian ? 'Ta kontakt' : 'Contact us') + '</a></div></section>';
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, '<main id="main">' + body + '</main>');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(title) + ' | Altovena</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + escapeHtml(intro) + '">');
  html = html.replace('href="/en/technology/nexus/" aria-current="page"', 'href="/en/products/command/" aria-current="page"').replace('href="/no/teknologi/nexus/" aria-current="page"', 'href="/no/produkter/command/" aria-current="page"');
  fs.mkdirSync(path.dirname(pageFile), {recursive:true});
  fs.writeFileSync(pageFile, html);

  const productsFile = path.join(dist, base.slice(1), norwegian ? 'produkter/index.html' : 'products/index.html');
  let productsHtml = fs.readFileSync(productsFile, 'utf8');
  const oldCommandLink = 'href="' + base + (norwegian ? 'teknologi/nexus/' : 'technology/nexus/') + '">' + (norwegian ? 'Les om teknologien' : 'Explore technology');
  const newCommandLink = 'href="' + commandPath + '">' + (norwegian ? 'Se Command' : 'Explore Command');
  if (!productsHtml.includes(oldCommandLink)) throw new Error('Missing Command card link: ' + locale);
  productsHtml = productsHtml.replace(oldCommandLink, newCommandLink);
  productsHtml = productsHtml.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>' + (norwegian ? 'AI-produkter, plattformer og bransjeløsninger' : 'AI products, platforms and industry solutions') + '</h1>');
  fs.writeFileSync(productsFile, productsHtml);

  const intelligenceFile = path.join(dist, base.slice(1), norwegian ? 'produkter/offer-intelligence/index.html' : 'products/offer-intelligence/index.html');
  let intelligenceHtml = fs.readFileSync(intelligenceFile, 'utf8');
  const intelligenceCopy = norwegian ? 'Altovena Intelligence omfatter produktretningen Offer Intelligence: kildebasert B2B-research, vurdering av datakvalitet og beslutningsstøtte. Første kommersielle steg er avgrensede piloter med menneskelig kontroll – ikke automatisk kontakt med potensielle kunder.' : 'Altovena Intelligence includes the Offer Intelligence direction: source-aware B2B research, data-quality assessment and decision support. The first commercial step is carefully scoped pilots with human review – not automated prospect outreach.';
  const intelligenceSection = '<section class="section section-white" data-altovena-intelligence="2026"><div class="container"><div class="section-heading"><span class="eyebrow">ALTOVENA INTELLIGENCE</span><h2>' + (norwegian ? 'Bedre beslutningsgrunnlag for B2B-salg' : 'Better evidence for B2B sales decisions') + '</h2><p class="section-intro">' + escapeHtml(intelligenceCopy) + '</p></div></div></section>';
  intelligenceHtml = intelligenceHtml.replace('</main>', intelligenceSection + '</main>');
  fs.writeFileSync(intelligenceFile, intelligenceHtml);
}

console.log('PASS: Altovena umbrella positioning added in Norwegian and English, with prelaunch controls unchanged.');
