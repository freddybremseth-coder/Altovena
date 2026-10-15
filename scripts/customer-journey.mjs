import fs from "node:fs";
import path from "node:path";
import { journeys, links } from "./journey-data.mjs";

// Distinct audience/intent-based content on every existing route. This script
// neither invents pages nor claims unapproved products have been released.
const root=path.resolve(import.meta.dirname,"../dist");
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const labels={
 no:{home:"Forsiden",products:"Sammenlign produktene",offer:"Offer Intelligence",visibility:"Visibility",realtyflow:"RealtyFlow",olivia:"Olivia OS",nexus:"Nexus-teknologien",services:"Våre tjenester",company:"Møt Altovena",demo:"Snakk om deres behov",applied:"Praktiske eksempler",trust:"Tillit og kontroll",insights:"Fagguider",seo:"SEO, AEO og GEO forklart",b2b:"Kvalifiser B2B-leads",privacy:"Personvern"},
 en:{home:"Homepage",products:"Compare the products",offer:"Offer Intelligence",visibility:"Visibility",realtyflow:"RealtyFlow",olivia:"Olivia OS",nexus:"Nexus technology",services:"Our services",company:"About Altovena",demo:"Discuss your needs",applied:"Real operating examples",trust:"Trust and control",insights:"Guides and insights",seo:"SEO, AEO and GEO explained",b2b:"B2B lead qualification",privacy:"Privacy"}
};
const details={
 no:{
  offer:[["Hva inngår i en vurdering?","En strukturert vurdering bør vise hvilke firmadata som er dokumentert, hva som mangler, hvorfor et behov kan være relevant, og hvem som må godkjenne neste steg."],["Hvordan gjennomføres arbeidet?","Start med målgruppe og lovlige kilder, skill kvalitet fra kjøpsinteresse og la en person kontrollere grunnlaget før kontakten vurderes."]],
  visibility:[["Hva inngår i en Visibility-gjennomgang?","Gjennomgangen ser på de viktigste eksisterende sidene, om spørsmål besvares tidlig, hvordan kilder dokumenteres, og hvilke tekniske og redaksjonelle feil som bør prioriteres."],["Hvordan blir analysen til forbedringer?","Arbeidet foreslår konkrete endringer, får menneskelig kvalitetssikring og måles fra synlighet til relevante henvendelser der data finnes."]],
  realtyflow:[["Hva skal en kunde kunne følge opp?","En relevant arbeidsflate viser forespørsel, riktig merkevare, tilhørende kontakt og neste oppgave. Det skal være lett å se hvem som må handle og hva som er fullført."],["Hvordan beskytter vi merkevarer og kunder?","Tilganger må gis til verifiserte brukere per merkevare og funksjon. Automatiske svar og publisering skal aldri aktiveres uten definerte regler og godkjenning."]],
  olivia:[["Hvilke opplysninger er viktige på en gård?","Parseller, trær, dokumenter, vær- og feltobservasjoner og godkjente sesongoppgaver bør kunne knyttes til riktig område og tidspunkt."],["Hvordan brukes systemet uten å gi fra seg kontroll?","Forslag til oppgaver må vurderes av ansvarlige personer. Sensorer kan gi data, men kan ikke alene erstatte erfaring, feltbesøk eller nødvendig faglig vurdering."]]
 },
 en:{
  offer:[["What would a qualification assessment contain?","A useful assessment distinguishes documented company facts, missing data, evidence of possible relevance and the person authorised to approve the next step."],["How would the process work?","Define a segment and permitted sources, separate data reliability from intent and have a person review the evidence before possible contact."]],
  visibility:[["What is included in a Visibility review?","A review focuses on the existing pages that matter most, answer clarity, references, technical barriers and a prioritised set of editorial changes."],["How does an audit become a practical improvement?","Proposed changes pass human review and are measured against meaningful discovery and qualified enquiries where the evidence is available."]],
  realtyflow:[["What should a team be able to follow up?","A useful workspace makes the enquiry, correct brand, customer contact and next task visible. Responsibility and completion status should be clear."],["How are customer and brand boundaries protected?","Verified users should get permissions for the particular brand and function they need. Automatic replies and publishing require explicit rules and approval."]],
  olivia:[["What farm records matter most?","Parcels, trees, documents, weather and field observations, and approved seasonal work should be traceable to the correct place and time."],["How can software assist without taking control away?","Responsible people must review proposed tasks. Sensors may inform decisions but cannot replace field visits, professional judgment or required authorisation."]]
 }
};
const deeper={
 no:{
 offer:{why:["Hvorfor vurdere Offer Intelligence fremfor en tilfeldig leadliste?","En dokumentert vurdering viser både hva vi vet, hva vi ikke vet og hva som bare er en hypotese om behov. Det gir et bedre utgangspunkt for menneskelig prioritering enn en liste med udokumenterte salgsantakelser."],faq:[["Er dette automatisk salg?","Nei. Første produktretning er research og kvalitetssikring før et menneske eventuelt godkjenner kontakt."],["Er datakvalitet det samme som kjøpsinteresse?","Nei. Datakvalitet sier hvor pålitelig informasjonen er; kjøpsinteresse må vurderes særskilt."]]},
 visibility:{why:["Hvorfor begynne med eksisterende sider?","Eksisterende innhold kan allerede ha trafikk, lenker og relevant erfaring. Å rette uklar struktur, manglende svar og tekniske feil kan gi et mer nyttig nettsted enn å publisere nesten like artikler."],faq:[["Kan Altovena garantere omtale i ChatGPT eller Google?","Nei. Innhold og kilder kan forbedres, men ingen bestemmer hvilke nettsider en søke- eller svarmotor viser."],["Skal en AI publisere tekst automatisk?","Viktige endringer bør gå gjennom redaksjonell kontroll og menneskelig godkjenning før publisering."]]},
 realtyflow:{why:["Hvorfor samle CRM og innhold i en arbeidsflyt?","Når en forespørsel, ansvarlig medarbeider og neste oppgave finnes i samme arbeidsflate, reduseres risikoen for at kunden ikke blir fulgt opp. Merkevaretilgang gjør det enklere å kontrollere hvem som får se hvilke data."],faq:[["Kan alle se alle merkevarer?","Nei. Rettigheter vurderes per bruker, merkevare og arbeidsoppgave."],["Blir kunden automatisk meldt på nyhetsbrev?","Nei. Et kontaktskjema for en henvendelse er ikke en påmelding til markedsføring."]]},
 olivia:{why:["Hvorfor strukturere feltdata og sesongarbeid?","Historiske notater, parseller og godkjente oppgaver gir en mer pålitelig driftsoversikt enn spredte bilder eller hukommelsen alene. Det blir lettere å planlegge og kontrollere hva som faktisk er gjort."],faq:[["Kan Olivia OS erstatte fagfolk på gården?","Nei. Systemet kan støtte dokumentasjon og beslutninger, ikke overta juridisk eller faglig ansvar."],["Følger sensorer og kameraer med?","Utstyr og integrasjoner må kartlegges og avtales separat."]]}
 },
 en:{
 offer:{why:["Why consider Offer Intelligence instead of a purchased lead list?","A documented assessment distinguishes reliable evidence, missing facts and hypotheses about need. It gives people a better basis for prioritising than an unexplained list of supposed hot prospects."],faq:[["Does it automatically sell to prospects?","No. The initial direction is evidence-led research before a person considers possible contact."],["Is data confidence the same as buying intent?","No. One describes evidence quality; the other requires a separate assessment of potential need."]]},
 visibility:{why:["Why improve existing pages first?","Existing pages may already have useful information, links and relevant visitors. Fixing unclear answers, structure and technical problems can be more useful than publishing near-duplicate articles."],faq:[["Can Altovena guarantee Google rankings or AI citations?","No. Better content and documentation cannot force a search or AI system to display a particular source."],["Will an AI publish edits automatically?","Meaningful changes should pass editorial quality checks and human approval."]]},
 realtyflow:{why:["Why connect CRM and content in one workflow?","Keeping enquiries, responsible staff and next actions visible together reduces the chance that customer follow-up is missed. Brand-level permissions help protect who can access each account."],faq:[["Can everyone access all brands?","No. Rights are specific to a verified person, brand and task."],["Does an enquiry sign the customer up to marketing?","No. Responding to a requested message is not newsletter consent."]]},
 olivia:{why:["Why organise field records and seasonal work?","Traceable parcel records, observations and approved tasks are easier to review than scattered photos or memory. They support practical planning and accountability for work actually completed."],faq:[["Does Olivia OS replace an agronomist?","No. It supports records and decisions; the relevant people retain professional responsibility."],["Are sensors and cameras included?","Hardware and integrations must be assessed and agreed separately."]]}
 }
};
let n=0;
for(const lang of ["no","en"])for(const [key,dest] of Object.entries(links)){
 const url=dest[lang==="no"?0:1],file=path.join(root,url.slice(1),"index.html");
 if(!fs.existsSync(file))throw Error("Missing route for customer journey: "+url);
 let html=fs.readFileSync(file,"utf8"),data=journeys[lang][key];
 if(!data||data.length!==4)throw Error("Missing journey content: "+key+"/"+lang);
 if(html.includes("data-altovena-journey-v12"))throw Error("Duplicate journey section");
 if(!/<main id="main">/.test(html))throw Error("Missing main: "+url);
 // Preserve exactly one canonical H1 in each existing document.
 if((html.match(/<h1(?:\s|>)/gi)||[]).length!==1)throw Error("Existing H1 mismatch: "+url);
 const related=data[3].map(k=>{
   if(!labels[lang][k]||!links[k])throw Error("Unresolved link "+k+" in "+url);
   const next=links[k][lang==="no"?0:1];
   return '<a href="'+next+'">'+esc(labels[lang][k])+' <span aria-hidden="true">↗</span></a>';
 }).join("");
 const sections=[...(details[lang][key]||[]),...(deeper[lang][key]?[deeper[lang][key].why]:[])].map(([h,a])=>
   '<div class="journey-explain"><h2>'+esc(h)+'</h2><p>'+esc(a)+'</p></div>').join("");
 const faq=deeper[lang][key]?
   '<div class="journey-faq"><h2>'+(lang==="no"?"Vanlige spørsmål før dere velger":"Questions before you choose")+'</h2>'+
   deeper[lang][key].faq.map(([q,a])=>'<div><h3>'+esc(q)+'</h3><p>'+esc(a)+'</p></div>').join("")+'</div>':"";
 const trust=(key==="company"||key==="privacy")?
    '<p class="journey-trust-note">'+esc(lang==="no"?
       "Altovena er navnet på det nye planlagte teknologiselskapet. Et formelt registrert selskapsnavn og nummer oppgis først når det er bekreftet.":
       "Altovena is the intended new technology company name. The registered legal entity and number will be shown only after verification.")+'</p>':"";
 const relatedHeading=lang==="no"?"Hva er ditt neste steg?":"What should you do next?";
 let section='<section data-altovena-journey-v12="true" class="section journey-section"><div class="container journey-wrap">'+
   '<h2>'+esc(data[0])+'</h2><p class="journey-answer">'+esc(data[1])+'</p>'+
   sections+'<p class="journey-limits">'+esc(data[2])+'</p>'+faq+trust+
   '<div class="journey-next"><p class="journey-next-heading">'+relatedHeading+'</p><div class="journey-links">'+related+'</div></div></div></section>';
 if(key==="privacy")section=section.replace('journey-section','journey-section journey-privacy');
 // Avoid a duplicate generic full-width CTA on top of the new relevant next
 // step. Keep actual form and other product/user controls untouched.
 html=html.replace(/<section class="cta-band">[\s\S]*?<\/section>/g,"");
 html=html.replace("</main>",section+"</main>");
 html=html.replace("</head>",'<link rel="stylesheet" href="/journey.css"></head>');
 fs.writeFileSync(file,html);
 n++;
}
console.log("Altovena journey: "+n+" existing Norwegian/English pages updated with unique answer-first content and next steps.");
