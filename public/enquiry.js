const form=document.querySelector('[data-enquiry-form]');
if(form){
  form.addEventListener('submit',(event)=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const selected=form.querySelector('select[name="product"] option:checked')?.textContent||'';
    const name=String(data.get('name')||'').trim();
    const company=String(data.get('company')||'').trim();
    const email=String(data.get('email')||'').trim();
    const need=String(data.get('needs')||'').trim();
    const no=form.dataset.lang==='no';
    const body=no
      ? 'Navn: '+name+'\nVirksomhet: '+company+'\nE-post: '+email+'\nTema: '+selected+'\n\nBehov:\n'+need
      : 'Name: '+name+'\nCompany: '+company+'\nEmail: '+email+'\nTopic: '+selected+'\n\nNeed:\n'+need;
    const target='mailto:'+encodeURIComponent(form.dataset.contact)+'?subject='+encodeURIComponent('Altovena – '+selected)+'&body='+encodeURIComponent(body);
    form.querySelector('[data-enquiry-note]').textContent=no
      ? 'E-postprogrammet åpnes. Ingen melding er sendt automatisk.'
      : 'Opening your email program. No message was sent automatically.';
    window.location.href=target;
  });
}