document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.nav-links');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰';});}
  const params=new URLSearchParams(location.search);
  const service=document.getElementById('serviceSelect');
  const plan=document.getElementById('planSelect');
  if(service&&params.get('service')) service.value=params.get('service');
  if(plan&&params.get('plan')) plan.value=params.get('plan');
  const orderForm=document.getElementById('orderForm');
  if(orderForm) orderForm.addEventListener('submit',e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(orderForm).entries());
    const recipient='YOUR-SUPPORT-EMAIL@example.com'; // Replace before publishing
    const subject=encodeURIComponent('HOSTNEIL Order Request - '+(d.service||'Service'));
    const body=encodeURIComponent(`HOSTNEIL ORDER REQUEST\n\nName: ${d.name}\nEmail: ${d.email}\nService: ${d.service}\nPlan: ${d.plan||'Not specified'}\nDomain: ${d.domain||'Not provided'}\nRequirements: ${d.requirements||'Not provided'}\n\nPlease confirm availability, final price, and payment instructions.`);
    const status=document.getElementById('formStatus');
    if(recipient==='YOUR-SUPPORT-EMAIL@example.com'){status.textContent='Setup required: open assets/script.js and replace YOUR-SUPPORT-EMAIL@example.com with your real support email. Then submit again.';return;}
    status.textContent='Opening your email app with the order details…';
    location.href=`mailto:${recipient}?subject=${subject}&body=${body}`;
  });
  const contactForm=document.getElementById('contactForm');
  if(contactForm) contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(contactForm).entries());
    const recipient='YOUR-SUPPORT-EMAIL@example.com'; // Replace before publishing
    const status=document.getElementById('contactStatus');
    if(recipient==='YOUR-SUPPORT-EMAIL@example.com'){status.textContent='Setup required: replace the placeholder support email in assets/script.js before publishing.';return;}
    const subject=encodeURIComponent('HOSTNEIL Contact: '+d.subject);
    const body=encodeURIComponent(`Name: ${d.name}\nEmail: ${d.email}\n\n${d.message}`);
    status.textContent='Opening your email app…';
    location.href=`mailto:${recipient}?subject=${subject}&body=${body}`;
  });
});