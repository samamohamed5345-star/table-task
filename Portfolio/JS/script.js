const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>{
  a.addEventListener('click', ()=> mainNav.classList.remove('open'));
});

// active link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#mainNav a');
window.addEventListener('scroll', ()=>{
  let current = '';
  sections.forEach(sec=>{
    const top = sec.getBoundingClientRect().top + window.scrollY - 140;
    if(window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(link=>{
    link.classList.toggle('active', link.getAttribute('href') === '#'+current);
  });
});
const toTopBtn = document.getElementById('toTop');
if(toTopBtn){
  toTopBtn.addEventListener('click', ()=>{
    window.scrollTo({top:0, behavior:'smooth'});
  });
}