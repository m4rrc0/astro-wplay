document.addEventListener('beforetoggle', (e) => {
  const el = e.target;
  const btn = document.getElementById(el.id + 'Btn');
  el.style.top = btn.offsetTop + btn.offsetHeight + 'px';
  el.style.left = btn.offsetLeft + 'px';
}, { capture: true })
