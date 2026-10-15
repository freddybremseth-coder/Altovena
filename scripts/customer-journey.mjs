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
 const sections=(details[lang][key]||[]).map(([h,a])=>
   '<div class="journey-explain"><h2>'+esc(h)+'</h2><p>'+esc(a)+'</p></div>').join("");
 const trust=(key==="company"||key==="privacy")?
    '<p class="journey-trust-note">'+esc(lang==="no"?
       "Altovena er navnet på det nye planlagte teknologiselskapet. Et formelt registrert selskapsnavn og nummer oppgis først når det er bekreftet.":
       "Altovena is the intended new technology company name. The registered legal entity and number will be shown only after verification.")+'</p>':"";
 const relatedHeading=lang==="no"?"Hva er ditt neste steg?":"What should you do next?";
 let section='<section data-altovena-journey-v12="true" class="section journey-section"><div class="container journey-wrap">'+
   '<h2>'+esc(data[0])+'</h2><p class="journey-answer">'+esc(data[1])+'</p>'+
   sections+'<p class="journey-limits">'+esc(data[2])+'</p>'+trust+
   '<div class="journey-next"><h3>'+relatedHeading+'</h3><div class="journey-links">'+related+'</div></div></div></section>';
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
