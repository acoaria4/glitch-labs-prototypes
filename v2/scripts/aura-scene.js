(() => {
  'use strict';

  const placements = {
    ascendant: {
      sign: 'taurus', label: '01 / Ascendant · Lagna', title: 'Taurus',
      copy: 'The Ascendant marks the starting point for the houses. In this example it sits in Taurus; the signs around it stay in their fixed positions.',
      announcement: 'Sample Ascendant selected. Taurus is highlighted in the chart.',
    },
    sun: {
      sign: 'leo', label: '02 / Sun', title: 'Leo',
      copy: 'The Sun is marked in Leo in this example. Follow its label to find the placement without changing the chart’s fixed frame.',
      announcement: 'Sample Sun selected. Leo is highlighted in the chart.',
    },
    moon: {
      sign: 'capricorn', label: '03 / Moon', title: 'Capricorn',
      copy: 'The Moon is marked in Capricorn in this example. Move between placements while keeping the whole chart in view.',
      announcement: 'Sample Moon selected. Capricorn is highlighted in the chart.',
    },
  };

  let cleanup = null;

  const initialize = () => {
    if (cleanup) return;
    const section = document.getElementById('aura');
    if (!section) return;
    const controls = section.querySelector('#aura-controls');
    const radios = Array.from(section.querySelectorAll('input[name="aura-placement"]'));
    const signs = Array.from(section.querySelectorAll('[data-sign]'));
    const inner = section.querySelector('.aura-detail-inner');
    const label = section.querySelector('#aura-detail-label');
    const title = section.querySelector('#aura-detail-title');
    const copy = section.querySelector('#aura-detail-copy');
    const status = section.querySelector('#aura-status');
    if (!controls || radios.length !== 3 || signs.length !== 12
      || !inner || !label || !title || !copy || !status) return;

    const controller = new AbortController();
    const { signal } = controller;
    const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tween = null;

    const stopReveal = () => {
      if (tween) tween.kill();
      tween = null;
      inner.style.removeProperty('opacity');
      inner.style.removeProperty('transform');
    };

    const select = (key, announce = true) => {
      const placement = placements[key];
      if (!placement) return;
      stopReveal();
      signs.forEach((cell) => {
        const selected = cell.dataset.sign === placement.sign;
        cell.classList.toggle('is-selected', selected);
        if (selected) cell.setAttribute('aria-current', 'true');
        else cell.removeAttribute('aria-current');
      });
      label.textContent = placement.label;
      title.textContent = placement.title;
      copy.textContent = placement.copy;
      if (announce) {
        status.textContent = placement.announcement;
        document.dispatchEvent(new CustomEvent('prototype:layout'));
      }
      if (!announce || systemMotion.matches || document.body.dataset.motion === 'reduced'
        || !window.gsap || typeof window.gsap.fromTo !== 'function') return;
      tween = window.gsap.fromTo(inner, { opacity: 0.5, y: 8 }, {
        opacity: 1, y: 0, duration: 0.36, ease: 'power2.out',
        clearProps: 'opacity,transform', onComplete: () => { tween = null; },
      });
    };

    radios.forEach((radio) => radio.addEventListener('change', () => {
      if (radio.checked) select(radio.value);
    }, { signal }));
    document.addEventListener('prototype:motion', (event) => {
      if (event.detail && event.detail.reduced) stopReveal();
    }, { signal });
    systemMotion.addEventListener('change', (event) => {
      if (event.matches) stopReveal();
    }, { signal });

    cleanup = () => {
      controller.abort();
      stopReveal();
      controls.disabled = true;
      cleanup = null;
    };
    select(radios.find((radio) => radio.checked)?.value || 'ascendant', false);
    controls.disabled = false;
  };

  window.addEventListener('pagehide', () => { if (cleanup) cleanup(); });
  window.addEventListener('pageshow', (event) => { if (event.persisted) initialize(); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
