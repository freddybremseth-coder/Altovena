// Local-only illustrative scenarios. No fetching, storage or user tracking.
for(const widget of document.querySelectorAll('[data-scenario-widget]')){
  const buttons=[...widget.querySelectorAll('[data-scenario-button]')];
  const panels=[...widget.querySelectorAll('[data-scenario-panel]')];
  buttons.forEach((btn,i)=>btn.addEventListener('click',()=>{
    buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
    panels.forEach((p,j)=>{p.hidden=i!==j;});
  }));
}
const params=new URLSearchParams(window.location.search);
const product=params.get('product');
if(['offer','visibility','realtyflow','olivia'].includes(product)){
  const input=document.querySelector('[data-enquiry-form] select[name="product"]');
  if(input && [...input.options].some(o=>o.value===product))input.value=product;
}