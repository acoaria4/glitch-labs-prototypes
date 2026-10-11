/* One motion owner: GSAP. One scroll engine: Lenis. Complete static HTML underneath. */
(() => {
  'use strict';
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.getElementById('motion-control');
  const motionLabel = document.getElementById('motion-label');
  const opening = document.getElementById('opening');
  const chapters = [...document.querySelectorAll('main > section[id]')];
  let manualReduced = false;
  try { manualReduced = sessionStorage.getItem('glitch-prototype-motion') === 'reduced'; } catch (_) { /* Storage is optional. */ }
  let destroyMotion = () => {};
  let chapterObserver;
  let disposed = false;
  let introPlayed = false;

  function buildMotion() {
    if (!window.gsap || !window.ScrollTrigger) return () => {};
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const removers = [];
    const listen = (target, name, callback, options) => {
      target.addEventListener(name, callback, options);
      removers.push(() => target.removeEventListener(name, callback, options));
    };
    let lenis;
    let ticker;
    let intro;
    let media;
    let alive = true;
    let layoutFrame;

    // Lenis handles the wheel only. Native touch, keyboard, and scrollbar stay available.
    if (window.Lenis) {
      lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, anchors: false, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      ticker = time => lenis.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      if (!introPlayed && window.scrollY < 100) {
        introPlayed = true;
        intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.from('.object-motion', { y: 22, rotation: -5, scale: .94, duration: 1.25 }, 0)
          .from('.title-line > span', { yPercent: 105, duration: 1.05, stagger: .08 }, .08)
          .from('.intro-item', { opacity: 0, y: 12, duration: .65, stagger: .12 }, .32)
          .fromTo('.object-glint', { xPercent: -55, opacity: 0 }, { xPercent: 70, opacity: .36, duration: .8, ease: 'power1.inOut' }, .18)
          .to('.object-glint', { opacity: 0, duration: .3 }, .85);
      }

      gsap.to('.opening-light', {
        opacity: .35, ease: 'none',
        scrollTrigger: { trigger: opening, start: 'top top', end: 'bottom top', scrub: .5 }
      });
      gsap.from('.chapter-connection', {
        scaleY: 0, ease: 'none',
        scrollTrigger: { trigger: '.chapter-connection', start: 'top 90%', end: 'bottom 55%', scrub: .35 }
      });
      gsap.from('.expense-title-row', {
        y: 26, opacity: .25, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: '.expense-intro', start: 'top 80%', once: true }
      });

      media = gsap.matchMedia();
      media.add('(min-width: 1000px) and (min-height: 850px)', () => {
        const scene = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: '.story-stage', start: 'center center', end: () => '+=' + Math.round(window.innerHeight * .6),
            pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true
          }
        });
        scene.addLabel('gather')
          .from('.bill-object', { y: 35, x: 15, rotation: 5, duration: 1.2 }, 'gather')
          .from('.receipt-line', { x: i => (i % 2 ? -22 : 28), opacity: .3, stagger: .16, duration: .7 }, 'gather')
          .from('.story-beat[data-beat="1"]', { opacity: .35, y: 8, duration: .65 }, .5)
          .addLabel('clarity', 1.2)
          .from('.bill-total', { y: 7, opacity: .65, duration: .5 }, .55);
      });
      media.add('(max-width: 999px), (max-height: 849px)', () => {
        gsap.from('.bill-object', {
          y: 22, rotation: 1.5, duration: .8, ease: 'power3.out',
          scrollTrigger: { trigger: '.demo-stage', start: 'top 90%', once: true }
        });
      });
      gsap.from('.outro-copy, .outro-action', {
        y: 22, opacity: .3, duration: .8, stagger: .12, ease: 'power3.out',
        scrollTrigger: { trigger: '.expense-outro', start: 'top 90%', once: true }
      });

      // AURA unfolds like an editorial spread. Interaction stays available at every point.
      if (document.getElementById('aura')) {
        gsap.from('.aura-intro', {
          y: 24, opacity: .5, duration: 1.05, ease: 'power2.out',
          scrollTrigger: { trigger: '.aura-intro', start: 'top 90%', once: true }
        });
        gsap.from('.aura-chart', {
          y: 24, scale: .98, duration: 1.15, ease: 'power2.out',
          scrollTrigger: { trigger: '.aura-chart', start: 'top 88%', once: true }
        });
        gsap.from('.aura-editorial', {
          y: 16, opacity: .55, duration: .95, ease: 'power2.out',
          scrollTrigger: { trigger: '.aura-editorial', start: 'top 90%', once: true }
        });
      }

      // Lumen arrives more briskly, then lets the learner set the pace.
      if (document.getElementById('lumen')) {
        gsap.from('.lumen-intro', {
          y: 20, opacity: .5, duration: .7, ease: 'power3.out',
          scrollTrigger: { trigger: '.lumen-intro', start: 'top 90%', once: true }
        });
        gsap.from('.lumen-scene', {
          y: 28, duration: .8, ease: 'power3.out',
          scrollTrigger: { trigger: '.lumen-scene', start: 'top 88%', once: true }
        });
      }
    });

    // Pointer response is bounded and event driven; the still scene costs no render loop.
    let resetPointer = () => {};
    if (fineQuery.matches) {
      const object = document.querySelector('.brand-object');
      const stage = document.querySelector('.emblem-stage');
      let rect;
      const tiltX = gsap.quickTo(object, 'rotationX', { duration: .75, ease: 'power3.out' });
      const tiltY = gsap.quickTo(object, 'rotationY', { duration: .75, ease: 'power3.out' });
      resetPointer = () => { tiltX(0); tiltY(0); };
      listen(stage, 'pointerenter', () => { rect = stage.getBoundingClientRect(); });
      listen(stage, 'pointermove', event => {
        if (!rect || event.pointerType === 'touch') return;
        const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
        const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
        tiltX(-y * 9); tiltY(x * 12);
      });
      listen(stage, 'pointerleave', resetPointer);
      listen(window, 'blur', resetPointer);
      listen(window, 'resize', () => { rect = undefined; resetPointer(); });
      removers.push(() => {
        tiltX.tween.kill(); tiltY.tween.kill();
        gsap.set(object, { clearProps: 'transform' });
      });
    }

    listen(document, 'visibilitychange', () => {
      if (document.hidden) {
        lenis?.stop(); intro?.pause(); resetPointer();
      } else {
        lenis?.start(); intro?.resume(); ScrollTrigger.refresh();
      }
    });
    listen(document, 'click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target || !lenis) return;
      event.preventDefault();
      // Finish the focal sequence before leaving the first chapter.
      intro?.progress(1);
      history.pushState(null, '', link.hash);
      lenis.scrollTo(target, {
        offset: -25, duration: 1.1,
        onComplete: () => { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      });
    });
    if (document.fonts) document.fonts.ready.then(() => { if (alive) { lenis?.resize(); ScrollTrigger.refresh(); } });
    listen(window, 'load', () => { lenis?.resize(); ScrollTrigger.refresh(); }, { once: true });
    listen(document, 'prototype:layout', () => {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(() => {
        if (!alive) return;
        lenis?.resize();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      alive = false;
      cancelAnimationFrame(layoutFrame);
      removers.forEach(remove => remove());
      media?.revert();
      ctx.revert();
      if (ticker) gsap.ticker.remove(ticker);
      // Reset native-scroll velocity before destroy so a queued vendor timer cannot
      // restore Lenis classes after its listeners and animation loop are removed.
      lenis?.stop();
      lenis?.destroy();
    };
  }

  function applyMotion() {
    // Preserve the part of the page being read, including chapters after the pinned bill.
    // Otherwise removing the Expenses pin spacer shifts every later chapter upward.
    const anchors = [...document.querySelectorAll('.opening-copy, .expense-intro, .story-stage, .expense-outro, .aura-intro, .aura-chart, .aura-editorial, .lumen-intro, .lumen-scene, .site-footer')];
    const visible = anchors.map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(item => item.rect.top < innerHeight && item.rect.bottom > 0)
      .sort((a, b) => Math.abs(a.rect.top - innerHeight * .25) - Math.abs(b.rect.top - innerHeight * .25))[0];
    destroyMotion();
    destroyMotion = () => {};
    const reduced = reduceQuery.matches || manualReduced;
    document.body.dataset.motion = reduced ? 'reduced' : 'full';
    motionButton.hidden = !window.gsap || !window.ScrollTrigger;
    motionButton.disabled = reduceQuery.matches;
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.setAttribute('aria-label', reduceQuery.matches ? 'Reduced motion follows your system preference' : reduced ? 'Turn on motion' : 'Turn off motion');
    motionLabel.textContent = reduceQuery.matches ? 'Reduced motion' : reduced ? 'Motion off' : 'Motion on';
    document.dispatchEvent(new CustomEvent('prototype:motion', { detail: { reduced } }));
    if (!reduced) destroyMotion = buildMotion();
    if (visible) {
      const shift = visible.element.getBoundingClientRect().top - visible.rect.top;
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' });
    }
  }

  function onMotionToggle() {
    manualReduced = !manualReduced;
    try { sessionStorage.setItem('glitch-prototype-motion', manualReduced ? 'reduced' : 'full'); } catch (_) { /* Storage is optional. */ }
    applyMotion();
  }
  function initialize() {
    disposed = false;
    motionButton.addEventListener('click', onMotionToggle);
    reduceQuery.addEventListener('change', applyMotion);
    fineQuery.addEventListener('change', applyMotion);
    chapterObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        document.body.dataset.currentChapter = entry.target.id;
        document.querySelectorAll('.chapter-nav a').forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
    chapters.forEach(chapter => chapterObserver.observe(chapter));
    applyMotion();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    destroyMotion();
    destroyMotion = () => {};
    chapterObserver?.disconnect();
    motionButton.removeEventListener('click', onMotionToggle);
    reduceQuery.removeEventListener('change', applyMotion);
    fineQuery.removeEventListener('change', applyMotion);
  }
  window.addEventListener('pagehide', dispose);
  window.addEventListener('pageshow', event => { if (event.persisted && disposed) initialize(); });
  initialize();
})();
