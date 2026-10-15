// Static decision tree. No API calls, cookies, storage or telemetry.
for (const root of document.querySelectorAll('[data-solution-adviser]')) {
  const lang=root.dataset.lang==='no'?'no':'en';
  const options=ADVISER_DATA[lang];
  const buttons=[...root.querySelectorAll('[data-adviser-choice]')];
  const placeholder=root.querySelector('[data-adviser-placeholder]');
  const output=root.querySelector('[data-adviser-output]');
  for(const button of buttons){
    button.addEventListener('click',()=>{
      const key=button.dataset.adviserChoice;
      const record=options[key];
      if(!record)return;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      root.querySelector('[data-adviser-title]').textContent=record.name;
      root.querySelector('[data-adviser-summary]').textContent=record.desc;
      root.querySelector('[data-adviser-product]').href=record.product;
      root.querySelector('[data-adviser-contact]').href=record.contact;
      placeholder.hidden=true;
      output.hidden=false;
    });
  }
}