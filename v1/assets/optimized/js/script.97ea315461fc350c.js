const scenes = [...document.querySelectorAll('.scene')];
const sectionLinks = [...document.querySelectorAll('.scene-nav a')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const video = document.querySelector('.hero-video');
const toggle = document.querySelector('.motion-toggle');
let paused = reduceMotion.matches;
let heroVisible = true;
let activeIndex = 0;
let navigationTarget = null;
let settleTimer;
const previousButton = document.getElementById('previous-section');
const nextButton = document.getElementById('next-section');
function updateControls() {
  const index = navigationTarget ?? activeIndex;
  previousButton.disabled = index === 0;
  nextButton.disabled = index === scenes.length - 1;
}
function finishNavigation() {
  navigationTarget = null;
  clearTimeout(settleTimer);
  updateControls();
}
function goToSection(index) {
  index = Math.max(0, Math.min(scenes.length - 1, index));
  navigationTarget = index;
  updateControls();
  scenes[index].scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
  history.replaceState(null, '', '#' + scenes[index].id);
  clearTimeout(settleTimer);
  settleTimer = setTimeout(finishNavigation, 1200);
}
previousButton.addEventListener('click', () => goToSection((navigationTarget ?? activeIndex) - 1));
nextButton.addEventListener('click', () => goToSection((navigationTarget ?? activeIndex) + 1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
  if (event.target.closest('input, textarea, select, [contenteditable], [role="slider"], [role="spinbutton"], [role="listbox"]')) return;
  const moves = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
  if (!(event.key in moves) && event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  if (event.repeat) return;
  const destination = event.key === 'Home' ? 0 : event.key === 'End' ? scenes.length - 1 : (navigationTarget ?? activeIndex) + moves[event.key];
  goToSection(destination);
});
// Native touch and wheel scrolling stay available, including within tall mobile sections.
document.addEventListener('scroll', () => {
  if (navigationTarget === null) return;
  clearTimeout(settleTimer);
  settleTimer = setTimeout(finishNavigation, 180);
}, { passive: true });
document.addEventListener('scrollend', finishNavigation);
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const index = scenes.findIndex(scene => '#' + scene.id === link.hash);
  if (index < 0) return;
  event.preventDefault();
  goToSection(index);
});
function syncMotion() {
  document.body.classList.toggle('motion-paused', paused);
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.setAttribute('aria-label', paused ? 'Play ambient animation' : 'Pause ambient animation');
  toggle.title = toggle.getAttribute('aria-label');
  toggle.textContent = paused ? '▷' : 'Ⅱ';
  if (video.getAttribute('src')) {
    if (paused || !heroVisible || document.hidden) video.pause();
    else video.play().catch(() => {});
  }
}
toggle.addEventListener('click', () => { paused = !paused; syncMotion(); });
reduceMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);
if (video.dataset.src) {
  video.src = video.dataset.src;
  video.addEventListener('playing', () => video.closest('.hero').classList.add('video-ready'));
  video.addEventListener('error', () => video.closest('.hero').classList.remove('video-ready'));
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.target.id === 'home') { heroVisible = entry.isIntersecting; syncMotion(); }
  }
  const active = scenes.reduce((best, scene) => {
    const rect = scene.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    return visible > best.visible ? { scene, visible } : best;
  }, { scene: scenes[0], visible: 0 }).scene;
  activeIndex = scenes.indexOf(active);
  updateControls();
  document.body.dataset.scene = active.id;
  sectionLinks.forEach(link => {
    if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { threshold: [0, .15, .3, .5, .7, 1] });
scenes.forEach(scene => observer.observe(scene));
document.getElementById('year').textContent = new Date().getFullYear();
syncMotion();

updateControls();
