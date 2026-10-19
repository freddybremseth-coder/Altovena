import fs from 'node:fs';
import path from 'node:path';

// v0.6: Visual identity and factual contact information, layered after the existing site builders.
// All images are approved concept illustrations, not screenshots of running systems.
const DIST=path.resolve(import.meta.dirname,'../dist');
const SRC=path.resolve(import.meta.dirname,'../public/brand');
const DEST=path.join(DIST,'brand');
fs.cpSync(SRC,DEST,{recursive:true,force:true});
const currentYear=new Date().getUTCFullYear();
const translations={
  no:{
    visual:'Konseptillustrasjon, ikke skjermbilde fra et aktivt system.',
    home:'Illustrasjon av sammenkoblede forretningssystemer ved Middelhavet.',
    offer:'Illustrasjon av kildebasert bedriftsanalyse og menneskelig godkjenning.',
    visibility:'Illustrasjon av arbeidsflyt for SEO, AEO og GEO med kvalitetskontroll.',
    realtyflow:'Illustrasjon av eiendomsinformasjon, kundehenvendelser og oppfølging.',
    olivia:'Illustrasjon av olivenlund, feltdokumentasjon og sesongarbeid.',
    locationTitle:'Kontaktadresse i Benidorm',
    locationBody:'Avenida del Presidente Adolfo Suárez 14, Eagle Tower, Benidorm, Alicante, Spania',
    domainLabel:'Nettsted',
    illustrationTitle:'Benidorm som inspirasjon',
    illustrationNote:'Kunstnerisk konseptbilde, ikke et fotografi av våre lokaler eller Eagle Tower.',
    reelTitle:'Altovena på 18 sekunder',
    reelNote:'Merkevarevideo med konseptillustrasjoner og tekst. Ikke en opptaksvideo av produktfunksjoner.'
  },
  en:{
    visual:'Concept illustration, not a screenshot of a live system.',
    home:'Illustration of connected business systems inspired by the Mediterranean.',
    offer:'Illustration of evidence-led company research and human review.',
    visibility:'Illustration of SEO, AEO and GEO workflow with quality controls.',
    realtyflow:'Illustration of property information, buyer enquiries and follow-up.',
    olivia:'Illustration of olive farming, field records and seasonal planning.',
    locationTitle:'Contact address in Benidorm',
    locationBody:'Avenida del Presidente Adolfo Suárez 14, Eagle Tower, Benidorm, Alicante, Spain',
    domainLabel:'Website',
    illustrationTitle:'Inspired by Benidorm',
    illustrationNote:'Artistic concept image, not a photograph of our premises or Eagle Tower.',
    reelTitle:'Altovena in 18 seconds',
    reelNote:'Brand introduction made with conceptual illustrations and captions. Not a recording of a working product.'
  }
};
const productRoutes={
 offer:{en:'products/offer-intelligence',no:'produkter/offer-intelligence'},
 visibility:{en:'products/visibility',no:'produkter/visibility'},
 realtyflow:{en:'products/realtyflow',no:'produkter/realtyflow'},
 olivia:{en:'products/olivia',no:'produkter/olivia'}
};
const e=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function replaceDiv(html,klass,content){
 const start=html.indexOf('<div class="'+klass+'"');
 if(start<0) throw new Error(`Missing ${klass} image placeholder`);
 const begin=html.indexOf('>',start)+1;
 const pattern=/<\/?div\b[^>]*>/g; pattern.lastIndex=start;
 let depth=0,m,end=-1;
 while((m=pattern.exec(html))){
  depth+=m[0].startsWith('</')?-1:1;
  if(depth===0){end=pattern.lastIndex;break;}
 }
 if(end<0||begin<start) throw new Error('Unbalanced div structure');
 return html.slice(0,start)+content+html.slice(end);
}
function imageMarkup(file,alt,caption,hero=false){return `<figure class="altovena-image${hero?' altovena-hero-image':''}"><img src="/brand/${file}" alt="${e(alt)}" ${hero?'loading="eager" fetchpriority="high"':'loading="lazy"'} decoding="async" width="${hero?1600:980}" height="${hero?901:735}"><figcaption>${e(caption)}</figcaption></figure>`;}
function locationSection(lang){const t=translations[lang];return `<section class="altovena-location-section"><div class="container altovena-location-grid"><div><span class="eyebrow">BENIDORM · SPAIN</span><h2>${e(t.locationTitle)}</h2><address>${e(t.locationBody)}</address><p><strong>${e(t.domainLabel)}:</strong> altovena.com</p></div><figure><img src="/brand/benidorm-concept.webp" alt="${e(t.illustrationTitle)}" loading="lazy" decoding="async" width="980" height="735"><figcaption>${e(t.illustrationNote)}</figcaption></figure></div></section>`;}
function videoSection(lang){const t=translations[lang];return `<section class="altovena-film-section"><div class="container altovena-film-layout"><div><span class="eyebrow">ALTOVENA</span><h2>${e(t.reelTitle)}</h2><p>${e(t.reelNote)}</p></div><figure><video controls playsinline preload="none" poster="/brand/video-poster.webp" aria-label="${e(t.reelTitle)}"><source src="/brand/altovena-intro.mp4" type="video/mp4"></video><figcaption>${e(t.reelNote)}</figcaption></figure></div></section>`;}
const assetNames={offer:'offer-intelligence',visibility:'visibility',realtyflow:'realtyflow',olivia:'olivia'};
const productByRoute=(l,rel)=>Object.entries(productRoutes).find(([,value])=>value[l]===rel)?.[0];
for(const lang of ['en','no']){
 const t=translations[lang];
 const folder=path.join(DIST,lang);
 function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const f=path.join(dir,item.name);
  if(item.isDirectory())walk(f);
  else if(item.name==='index.html'){
   const rel=path.relative(folder,path.dirname(f)).replaceAll(path.sep,'/');
   let h=fs.readFileSync(f,'utf8');
   // Replace legacy text monogram and wordmark with the same approved horizontal logo.
   h=h.replace(/(<a\b[^>]*class="wordmark"[^>]*>)[\s\S]*?(<\/a>)/g,(_m,open,close)=>`${open}<img src="/brand/logo-altovena.webp" alt="Altovena" width="560" height="130" decoding="async">${close}`);
   // Avoid duplicate alt text in the anchor accessible name.
   h=h.replace(/<link rel="icon" href="\/favicon.svg" type="image\/svg\+xml">/g,'');
   h=h.replace('</head>',`<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png"><link rel="icon" type="image/x-icon" href="/brand/favicon.ico"><link rel="apple-touch-icon" sizes="192x192" href="/brand/favicon-192.png"><link rel="stylesheet" href="/brand.css"></head>`);
   if(rel===''){
    h=replaceDiv(h,'system-window',imageMarkup('hero-altovena.webp',t.home,t.visual,true));
    h=h.replace('<section class="cta-band">',videoSection(lang)+'<section class="cta-band">');
   }
   const product=productByRoute(lang,rel);
   if(product) h=replaceDiv(h,'system-window',imageMarkup(assetNames[product]+'.webp',t[product],t.visual));
   if(rel===(lang==='en'?'company':'om-oss')||rel===(lang==='en'?'book-demo':'bestill-demo')){
    h=h.replace('</main>',locationSection(lang)+'</main>');
   }
   // Social preview is a brand asset, never an unsupported metric or testimonial.
   h=h.replace('</head>',`<meta name="theme-color" content="#102743"><meta property="og:image" content="${process.env.PUBLIC_LAUNCH==='true'&&process.env.SITE_URL?e(process.env.SITE_URL.replace(/\/$/,'')+'/brand/video-poster.webp'):'/brand/video-poster.webp'}"><meta property="og:image:alt" content="Altovena — AI Products &amp; Intelligent Systems"></head>`);
   fs.writeFileSync(f,h);
  }
 }}
 walk(folder);
}
fs.copyFileSync(path.resolve(import.meta.dirname,'../public/brand.css'),path.join(DIST,'brand.css'));
console.log('Altovena v0.6: approved logo/favicon, seven optimized illustrations, concept-labelled Benidorm address imagery and intro video.');
