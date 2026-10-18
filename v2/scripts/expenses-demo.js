(() => {
  'use strict';

  const totalPaise = 284000;
  const names = ['You', 'Ananya', 'Ravi', 'Meera'];
  const wholeRupees = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  const fractionalRupees = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currency = (paise) => (
    paise % 100 === 0 ? wholeRupees : fractionalRupees
  ).format(paise / 100);

  // Divide in integer paise so even thirds always add up to the original bill.
  const sharesFor = (count) => {
    const base = Math.floor(totalPaise / count);
    const remainder = totalPaise % count;
    return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
  };

  let cleanup = null;

  const initialize = () => {
    if (cleanup) return;
    const form = document.getElementById('split-demo');
    if (!form) return;

    const controls = form.querySelector('fieldset');
    const bill = document.getElementById('bill-view');
    const result = document.getElementById('split-view');
    const list = document.getElementById('share-list');
    const summary = document.getElementById('split-summary');
    const status = document.getElementById('demo-status');
    const reset = document.getElementById('reset-split');
    const submit = document.getElementById('split-button');
    const title = document.getElementById('split-title');
    const preview = document.getElementById('per-person-preview');
    const radios = Array.from(form.querySelectorAll('input[name="diners"]'));

    // Leave the static bill intact if the interactive markup is incomplete.
    if (!controls || !bill || !result || !list || !summary || !status
      || !reset || !submit || !title || !preview || radios.length !== 3) return;

    const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const { signal } = controller;
    let tween = null;

    const count = () => {
      const selected = radios.find((radio) => radio.checked);
      const value = selected ? Number(selected.value) : 4;
      return [2, 3, 4].includes(value) ? value : 4;
    };

    const stopReveal = () => {
      if (tween) {
        tween.kill();
        tween = null;
      }
      Array.from(list.children).forEach((row) => {
        row.style.removeProperty('opacity');
        row.style.removeProperty('transform');
      });
    };

    cleanup = () => {
      controller.abort();
      stopReveal();
      controls.disabled = true;
      cleanup = null;
    };

    const updatePreview = () => {
      const shares = sharesFor(count());
      const low = Math.min(...shares);
      const high = Math.max(...shares);
      preview.textContent = low === high
        ? `${currency(low)} each`
        : `${currency(low)}–${currency(high)} each`;
    };

    const revealRows = () => {
      if (systemMotion.matches || document.body.dataset.motion === 'reduced'
        || !window.gsap || typeof window.gsap.fromTo !== 'function') return;

      tween = window.gsap.fromTo(Array.from(list.children), {
        opacity: 0,
        y: 14,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.065,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        onComplete: () => { tween = null; },
      });
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      stopReveal();

      const people = count();
      const shares = sharesFor(people);
      const rows = document.createDocumentFragment();

      shares.forEach((paise, index) => {
        const row = document.createElement('li');
        row.className = 'share-row';

        const number = document.createElement('span');
        number.className = 'share-index';
        number.setAttribute('aria-hidden', 'true');
        number.textContent = String(index + 1).padStart(2, '0');

        const name = document.createElement('span');
        name.className = 'share-name';
        name.textContent = names[index];

        const amount = document.createElement('strong');
        amount.className = 'share-amount';
        amount.textContent = currency(paise);

        row.append(number, name, amount);
        rows.append(row);
      });

      list.replaceChildren(rows);
      const rounding = totalPaise % people !== 0
        ? ' The extra paise go to the first shares so the total stays exact.'
        : '';
      summary.textContent = `${currency(totalPaise)} total. Every paise accounted for.${rounding}`;
      bill.hidden = true;
      result.hidden = false;
      title.focus();
      status.textContent = `Bill split between ${people} people. ${shares.map((paise, index) => `${names[index]}: ${currency(paise)}`).join('; ')}. Total ${currency(totalPaise)}.${rounding}`;
      revealRows();
    }, { signal });

    reset.addEventListener('click', () => {
      stopReveal();
      result.hidden = true;
      bill.hidden = false;
      updatePreview();
      submit.focus();
      status.textContent = `Back to the ${currency(totalPaise)} bill. Choose two, three, or four people to try another split.`;
    }, { signal });

    radios.forEach((radio) => radio.addEventListener('change', updatePreview, { signal }));
    document.addEventListener('prototype:motion', (event) => {
      if (event.detail && event.detail.reduced) stopReveal();
    }, { signal });
    systemMotion.addEventListener('change', (event) => {
      if (event.matches) stopReveal();
    }, { signal });

    updatePreview();
    controls.disabled = false;
  };

  window.addEventListener('pagehide', () => {
    if (cleanup) cleanup();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) initialize();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
