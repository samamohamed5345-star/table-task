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

// theme dot is decorative toggle
const themeDot = document.querySelector('.theme-dot');
if(themeDot){
  themeDot.addEventListener('click', ()=>{
    themeDot.textContent = themeDot.textContent === '🌙' ? '☀️' : '🌙';
  });
}