// Only loaded when CONTACT_FORM_ENABLED and privacy gates pass the build.
// No submission is claimed until RealtyFlow confirms both CRM contact and follow-up task.
const form=document.querySelector('[data-live-contact-form]');
if(form){
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const no=form.dataset.lang==='no';
  const note=form.querySelector('[data-enquiry-note]');
  const button=form.querySelector('button[type="submit"]');
  const data=new FormData(form);
  const challengeToken=String(data.get('cf-turnstile-response')||'');
  if(!challengeToken){note.className='privacy-error';note.textContent=no?'Fullfør sikkerhetskontrollen før innsending.':'Complete the security check before sending.';return;}
  // Reuse this ID after an uncertain failure so a retry does not create a second lead.
  const submissionId=form.dataset.pendingSubmissionId ||
    (window.crypto&&typeof window.crypto.randomUUID==='function'?window.crypto.randomUUID():'');
  if(!submissionId){
    note.className='privacy-error';
    note.textContent=no?'Sikker innsending er ikke tilgjengelig i denne nettleseren. Bruk e-postadressen nedenfor.':'Secure submission is unavailable in this browser. Please use the email address below.';
    return;
  }
  form.dataset.pendingSubmissionId=submissionId;
  const payload={name:String(data.get('name')||''),email:String(data.get('email')||''),company:String(data.get('company')||''),product:String(data.get('product')||''),needs:String(data.get('needs')||''),website:String(data.get('website')||''),challengeToken,submissionId,pageUrl:window.location.origin+window.location.pathname};
  button.disabled=true;
  note.className='';note.textContent=no?'Sender forespørselen…':'Sending your enquiry…';
  try{
   const result=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
   if(!result.ok)throw Error('Submission failed');
   const body=await result.json();if(body.ok!==true)throw Error('Submission not confirmed');
   form.reset();delete form.dataset.pendingSubmissionId;note.className='privacy-confirmation';note.textContent=no?'Forespørselen er mottatt for levering. Vi svarer så snart vi kan.':'Your enquiry has been accepted for delivery. We will reply as soon as possible.';
  }catch{
   note.className='privacy-error';note.textContent=no?'Kunne ikke bekrefte innsendingen. Prøv igjen senere eller bruk e-postadressen nedenfor.':'Delivery could not be confirmed. Please try later or use the email address below.';
  }finally{button.disabled=false;if(window.turnstile&&typeof window.turnstile.reset==='function')window.turnstile.reset();}
 });
}