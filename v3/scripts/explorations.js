(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = $('.motion-toggle');
  let motionWanted = true;
  try { motionWanted = localStorage.getItem('glitch-v3-motion') !== 'off'; } catch {}
  let disposeMotion = () => {};

  // The three directions share the same real sample interactions for a fair comparison.
  document.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = false; });
  const expenseDemo = $('.expense-demo');
  expenseDemo?.addEventListener('change', event => {
    if (event.target.name !== 'people') return;
    const count = Number(event.target.value);
    const each = Math.floor(284000 / count);
    const remainder = 284000 % count;
    const money = paise => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(paise / 100);
    $('[data-share]').textContent = money(each + (remainder ? 1 : 0));
    $('[data-allocation]').textContent = remainder ? 'Two pay ₹946.67; one pays ₹946.66.' : `each · split ${count === 2 ? 'two' : 'four'} ways`;
  });

  const placements = {
    sun: 'Sun in Leo · A sample placement, explored.',
    moon: 'Moon in Capricorn · Another part of the picture.',
    ascendant: 'Ascendant in Taurus · A starting point for the houses.'
  };
  const placementButtons = [...document.querySelectorAll('[data-placement]')];
  placementButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      placementButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $('.aura-reading').textContent = placements[button.dataset.placement];
      $('.aura-demo').dataset.selected = button.dataset.placement;
    });
  });

  let answered = false;
  $('.check-answer')?.addEventListener('click', () => {
    const feedback = $('.answer-feedback');
    const check = $('.check-answer');
    if (answered) {
      document.querySelectorAll('[name="answer"]').forEach(input => { input.checked = false; });
      feedback.textContent = 'No timer. Just room to think.';
      check.innerHTML = 'Check answer <span aria-hidden="true">↗</span>';
      answered = false;
      document.querySelector('[name="answer"]').focus({ preventScroll: true });
      return;
    }
    const selected = document.querySelector('[name="answer"]:checked');
    if (!selected) { feedback.textContent = 'Choose an answer first.'; return; }
    if (selected.value === '144') {
      feedback.textContent = 'Exactly. 12² means 12 × 12 = 144.';
      check.innerHTML = 'Try again <span aria-hidden="true">↻</span>';
      answered = true;
    } else {
      feedback.textContent = 'Have another go. Squaring 12 means multiplying 12 by itself.';
    }
  });

  function configureMotion() {
    disposeMotion();
    disposeMotion = () => {};
    const active = motionWanted && !reduced.matches && window.gsap && window.ScrollTrigger && window.Lenis;
    motionButton.hidden = !(window.gsap && window.ScrollTrigger && window.Lenis);
    motionButton.disabled = reduced.matches;
    motionButton.textContent = reduced.matches ? 'Motion reduced' : active ? 'Motion on' : 'Motion off';
    motionButton.setAttribute('aria-pressed', String(!active));
    document.body.classList.toggle('has-motion', Boolean(active));
    if (!active) return;

    const { gsap, ScrollTrigger, Lenis } = window;
    gsap.registerPlugin(ScrollTrigger);
    const controller = new AbortController();
    const lenis = new Lenis({ lerp: 0.095, smoothWheel: true, syncTouch: false, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = seconds => { if (!document.hidden) lenis.raf(seconds * 1000); };
    gsap.ticker.add(tick);
    const context = gsap.context(() => {
      gsap.from('[data-enter]', { y: 26, opacity: 0, duration: 0.9, stagger: 0.11, ease: 'power3.out', clearProps: 'opacity,transform' });
      gsap.utils.toArray('[data-reveal]').forEach(element => {
        gsap.from(element, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
      });
      gsap.utils.toArray('[data-project]').forEach(element => {
        gsap.from(element.querySelector('.project-copy'), { y: 22, opacity: 0, duration: 0.7, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
      });
      const media = gsap.matchMedia();
      media.add('(min-width: 1050px)', () => {
        if (document.body.classList.contains('direction-color')) {
          const projects = gsap.utils.toArray('[data-project]');
          projects.slice(0, -1).forEach((project, index) => {
            gsap.to(project, { scale: 0.96, ease: 'none', scrollTrigger: { trigger: projects[index + 1], start: 'top 88%', end: 'top 90px', scrub: 0.7 } });
          });
        } else {
          gsap.to('.hero-art img', { yPercent: 6, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
        }
      });
      contextMediaCleanup = () => media.revert();
    });
    // Pointer depth moves the art layer only; touch keeps its native interaction.
    let pointerTweens = [];
    if (matchMedia('(pointer: fine)').matches) {
      const art = $('.hero-art');
      const x = gsap.quickTo(art, 'x', { duration: 0.7, ease: 'power3.out' });
      const y = gsap.quickTo(art, 'y', { duration: 0.7, ease: 'power3.out' });
      pointerTweens = [x.tween, y.tween];
      $('.hero').addEventListener('pointermove', event => {
        const rect = $('.hero').getBoundingClientRect();
        x((event.clientX - rect.left - rect.width / 2) * 0.015);
        y((event.clientY - rect.top - rect.height / 2) * 0.015);
      }, { signal: controller.signal });
      $('.hero').addEventListener('pointerleave', () => { x(0); y(0); }, { signal: controller.signal });
      window.addEventListener('blur', () => { x(0); y(0); }, { signal: controller.signal });
    }
    document.addEventListener('visibilitychange', () => { document.hidden ? lenis.stop() : lenis.start(); }, { signal: controller.signal });
    document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => ScrollTrigger.refresh(), { signal: controller.signal }));
    ScrollTrigger.refresh();
    disposeMotion = () => {
      controller.abort();
      pointerTweens.forEach(tween => tween.kill());
      gsap.set('.hero-art', { clearProps: 'x,y' });
      contextMediaCleanup();
      context.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.body.classList.remove('has-motion');
    };
  }
  let contextMediaCleanup = () => {};
  motionButton.addEventListener('click', () => {
    motionWanted = !motionWanted;
    try { localStorage.setItem('glitch-v3-motion', motionWanted ? 'on' : 'off'); } catch {}
    configureMotion();
  });
  reduced.addEventListener('change', configureMotion);
  configureMotion();
  document.fonts?.ready.then(() => window.ScrollTrigger?.refresh());
  window.addEventListener('load', () => window.ScrollTrigger?.refresh(), { once: true });
  window.addEventListener('pagehide', () => disposeMotion());
  window.addEventListener('pageshow', event => { if (event.persisted) configureMotion(); });

  // Keyboard shortcuts continue to work when focus is inside a concept's iframe.
  document.addEventListener('keydown', event => {
    if (window.parent === window || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable || event.metaKey || event.ctrlKey || event.altKey) return;
    if (/^[1-3]$/.test(event.key) || ['ArrowLeft', 'ArrowRight', 'r', 'R'].includes(event.key)) {
      event.preventDefault();
      window.parent.postMessage({ type: 'prototype-key', key: event.key }, location.origin);
    }
  });
})();
