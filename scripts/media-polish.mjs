import fs from 'node:fs';
import path from 'node:path';

// v0.7: consistent, honestly labelled product images and accessible video transcripts.
// No customer data, third-party API calls, or external tracking.
const root=path.resolve(import.meta.dirname,'../dist');
const entries={
  'Offer Intelligence':['offer-intelligence.webp','Kildebasert bedriftsresearch og menneskelig kontroll','Evidence-led company research and human review'],
  'Visibility':['visibility.webp','SEO, AEO og GEO med kvalitetskontroll','SEO, AEO and GEO with quality controls'],
  'RealtyFlow':['realtyflow.webp','Eiendomsinformasjon, matching og rådgiveroppfølging','Property information, matching and adviser follow-up'],
  'Olivia OS':['olivia.webp','Feltdokumentasjon og sesongplanlegging i olivenlund','Field records and seasonal work in an olive grove']
};
const transcript={
  no:['Les innholdet i videoen','Altovena — AI-produkter og intelligente systemer','Offer Intelligence: kildebasert research, med menneskelig kontroll','Visibility: SEO, AEO og GEO med kvalitetskontroll','RealtyFlow: sammenhengende eiendoms- og kundereiser','Olivia OS: feltdokumentasjon og sesongplanlegging','Altovena.com — AI foreslår, mennesker bestemmer'],
  en:['Read the video transcript','Altovena — AI products and intelligent systems','Offer Intelligence: evidence-led research with human oversight','Visibility: SEO, AEO and GEO with quality checks','RealtyFlow: connected property and customer journeys','Olivia OS: field records and seasonal planning','Altovena.com — AI suggests, people decide']
};
function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function edit(file,fn){let before=fs.readFileSync(file,'utf8'),after=fn(before);if(!after.includes('</html>'))throw Error('Invalid document: '+file);fs.writeFileSync(file,after);}
let count=0;
for(const lang of ['en','no']){
  const caption=lang==='no'?'Konseptillustrasjon – ikke skjermbilde fra et aktivt system.':'Concept illustration — not a screenshot from a live system.';
  for(const rel of ['',lang==='en'?'products':'produkter']){
    const file=path.join(root,lang,rel,'index.html');
    edit(file,html=>{
      let n=0;
      html=html.replace(/<article class="product-card">[\s\S]*?<\/article>/g,card=>{
        const title=card.match(/<h3>([^<]+)<\/h3>/)?.[1],item=entries[title];
        if(!item)throw Error('Unrecognized product card '+title);
        if(!fs.existsSync(path.join(root,'brand',item[0])))throw Error('Missing image '+item[0]);
        const visual='<figure class="altovena-card-media"><img src="/brand/'+item[0]+'" alt="'+escapeHtml(item[lang==='no'?1:2])+'" loading="lazy" decoding="async" width="980" height="735"><figcaption>'+escapeHtml(caption)+'</figcaption></figure>';
        n++;count++;return card.replace('<span class="pill">',visual+'<span class="pill">');
      });
      if(n!==4)throw Error('Expected four cards '+file);
      return html;
    });
  }
  const home=path.join(root,lang,'index.html');
  edit(home,html=>{
    const i=html.indexOf('<section class="altovena-film-section">');
    const j=html.indexOf('</section>',i);
    if(i<0||j<0)throw Error('Brand video missing '+lang);
    const lines=transcript[lang];
    const details='<details class="altovena-video-transcript"><summary>'+escapeHtml(lines[0])+'</summary><ol>'+lines.slice(1).map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ol></details>';
    const area=html.slice(i,j+10);
    if(!area.includes('</figure>'))throw Error('Video figure missing '+lang);
    return html.slice(0,i)+area.replace('</figure>','</figure>'+details)+html.slice(j+10);
  });
}
if(count!==16)throw Error('Only '+count+' product cards processed');
const origin=(process.env.SITE_URL||'').replace(/\/$/,'');
if(process.env.PUBLIC_LAUNCH==='true'){
 if(!/^https:\/\//.test(origin))throw Error('Public OpenGraph image must have HTTPS origin');
 for(const lang of ['en','no']){
  function visit(folder){for(const node of fs.readdirSync(folder,{withFileTypes:true})){
    const file=path.join(folder,node.name);if(node.isDirectory())visit(file);
    else if(node.name==='index.html')edit(file,h=>h.replace('content="/brand/video-poster.webp"','content="'+escapeHtml(origin)+'/brand/video-poster.webp"'));
  }}visit(path.join(root,lang));
 }
}
fs.copyFileSync(path.resolve(import.meta.dirname,'../public/media-polish.css'),path.join(root,'media-polish.css'));
for(const lang of ['en','no']){
 function visit(folder){for(const node of fs.readdirSync(folder,{withFileTypes:true})){
  const file=path.join(folder,node.name);if(node.isDirectory())visit(file);
  else if(node.name==='index.html')edit(file,h=>h.replace('</head>','<link rel="stylesheet" href="/media-polish.css"></head>'));
 }}visit(path.join(root,lang));
}
console.log('Altovena v0.7: 16 portfolio images, clear captions, accessible English/Norwegian video transcripts.');