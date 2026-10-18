(() => {
  'use strict';

  // These questions are authored for this preview, not fetched from an app bank.
  // State lives only in this page; no answers or results are stored or transmitted.
  const questions = [
    {
      subject: 'Physics', grade: 'Grade 9', topic: 'Motion',
      question: 'A moving bus brakes suddenly. Why do standing passengers tend to lean forward?',
      answers: [
        'Their bodies tend to keep moving forward.',
        'Gravity suddenly pulls them forward.',
        'The brakes push their upper bodies forward.',
        'Their mass increases when the bus slows down.',
      ],
      correct: 0,
      title: 'That’s inertia.',
      explanation: 'When the bus slows, the passengers’ feet slow with the floor. Their upper bodies tend to keep moving forward. This resistance to a change in motion is called inertia.',
      takeaway: 'Inertia is the tendency of an object to resist a change in its state of rest or motion.',
    },
    {
      subject: 'Biology', grade: 'Grade 10', topic: 'Life processes',
      question: 'Which gas do green plants take in from the air to make food during photosynthesis?',
      answers: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      correct: 2,
      title: 'Light into living energy.',
      explanation: 'Green plants use light energy to make carbohydrates from carbon dioxide and water. Carbon dioxide enters leaves through tiny openings called stomata. Oxygen is released during photosynthesis.',
      takeaway: 'Carbon dioxide goes into photosynthesis; oxygen is released.',
    },
    {
      subject: 'Mathematics', grade: 'Grade 10', topic: 'Quadratic equations',
      question: 'Which pair gives the roots of x² − 5x + 6 = 0?',
      answers: ['−2 and −3', '2 and 3', '1 and 6', '−1 and −6'],
      correct: 1,
      title: 'A pattern in the factors.',
      explanation: 'Two numbers that multiply to 6 and add to −5 are −2 and −3. So x² − 5x + 6 factors into (x − 2)(x − 3). The product is zero when x = 2 or x = 3.',
      takeaway: 'Set each factor equal to zero to find the roots: 2 and 3.',
    },
  ];

  // Retain the current view across a back/forward-cache restore.
  let current = 0;
  let selected = null;
  let reviewed = false;
  let completed = false;
  let cleanup = null;

  const initialize = () => {
    if (cleanup) return;
    const section = document.getElementById('lumen');
    if (!section) return;
    const find = (id) => section.querySelector(`#${id}`);
    const form = find('lumen-practice');
    const fieldset = form && form.querySelector('fieldset');
    const questionView = find('lumen-question-view');
    const questionTitle = find('lumen-question');
    const subject = find('lumen-subject');
    const position = find('lumen-position');
    const check = find('lumen-check');
    const explanation = find('lumen-explanation');
    const explanationInner = section.querySelector('.lumen-explanation-inner');
    const explanationTitle = find('lumen-explanation-title');
    const explanationCopy = find('lumen-explanation-copy');
    const outcome = find('lumen-outcome');
    const takeaway = find('lumen-takeaway');
    const next = find('lumen-next');
    const completion = find('lumen-complete');
    const completionTitle = find('lumen-complete-title');
    const restart = find('lumen-restart');
    const status = find('lumen-status');
    const radios = Array.from(section.querySelectorAll('input[name="lumen-answer"]'));
    const rows = Array.from(section.querySelectorAll('.lumen-answer'));
    const progress = Array.from(section.querySelectorAll('.lumen-progress > span'));

    if ([form, fieldset, questionView, questionTitle, subject, position, check,
      explanation, explanationInner, explanationTitle, explanationCopy, outcome,
      takeaway, next, completion, completionTitle, restart, status].some((node) => !node)
      || radios.length !== 4 || rows.length !== 4 || progress.length !== 3) return;

    const controller = new AbortController();
    const { signal } = controller;
    const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let tween = null;

    const stopMotion = () => {
      if (tween) tween.kill();
      tween = null;
      [...rows, explanationInner].forEach((node) => {
        node.style.removeProperty('transform');
        node.style.removeProperty('opacity');
      });
    };

    const reveal = (targets) => {
      stopMotion();
      if (systemMotion.matches || document.body.dataset.motion === 'reduced'
        || !window.gsap || typeof window.gsap.fromTo !== 'function') return;
      tween = window.gsap.fromTo(targets, { opacity: 0.4, y: 8 }, {
        opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out',
        clearProps: 'transform,opacity', onComplete: () => { tween = null; },
      });
    };

    const render = () => {
      const item = questions[current];
      questionView.hidden = completed;
      completion.hidden = !completed;
      fieldset.disabled = reviewed || completed;
      check.hidden = reviewed;
      check.parentElement.hidden = reviewed;
      next.disabled = !reviewed || completed;
      restart.disabled = !completed;
      explanation.hidden = !reviewed || completed;
      position.replaceChildren(document.createTextNode(String(current + 1).padStart(2, '0') + ' '));
      const positionTotal = document.createElement('span');
      positionTotal.textContent = '/ 03';
      position.append(positionTotal);
      position.setAttribute('aria-label', completed ? '3 of 3 sample questions practiced' : `Question ${current + 1} of 3`);
      progress.forEach((part, index) => {
        part.dataset.state = completed || index < current || (index === current && reviewed)
          ? 'complete' : index === current ? 'current' : 'upcoming';
      });
      if (completed) {
        document.dispatchEvent(new CustomEvent('prototype:layout'));
        return;
      }

      subject.textContent = `${item.subject} · ${item.grade} · ${item.topic}`;
      questionTitle.textContent = item.question;
      rows.forEach((row, index) => {
        row.querySelector('.lumen-answer-copy').textContent = item.answers[index];
        radios[index].checked = selected === index;
        const label = row.querySelector('.lumen-answer-review');
        label.hidden = true;
        label.textContent = '';
        delete row.dataset.review;
        if (reviewed && index === item.correct) {
          row.dataset.review = 'correct';
          label.textContent = index === selected ? 'Your answer · Correct' : 'Correct answer';
          label.hidden = false;
        } else if (reviewed && index === selected) {
          row.dataset.review = 'selected';
          label.textContent = 'Your answer';
          label.hidden = false;
        }
      });
      if (reviewed) {
        explanationTitle.textContent = item.title;
        outcome.textContent = selected === item.correct
          ? 'You’ve got it. Here’s why.'
          : `A useful one to explore. The correct answer is ${String.fromCharCode(65 + item.correct)}: ${item.answers[item.correct]}`;
        explanationCopy.textContent = item.explanation;
        takeaway.textContent = item.takeaway;
        next.replaceChildren(document.createTextNode(current === questions.length - 1 ? 'Finish practice ' : 'Next question '));
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';
        next.append(arrow);
      }
      document.dispatchEvent(new CustomEvent('prototype:layout'));
    };

    form.addEventListener('change', () => {
      if (!reviewed && !completed) selected = radios.findIndex((radio) => radio.checked);
    }, { signal });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (reviewed || completed) return;
      const chosen = radios.findIndex((radio) => radio.checked);
      if (chosen < 0 || chosen >= questions[current].answers.length) {
        status.textContent = 'Choose an answer to explore the explanation.';
        radios[0].focus();
        return;
      }
      selected = chosen;
      reviewed = true;
      render();
      explanationTitle.focus({ preventScroll: false });
      status.textContent = 'Answer checked. The explanation is ready.';
      reveal(explanationInner);
    }, { signal });

    next.addEventListener('click', () => {
      if (!reviewed || completed) return;
      stopMotion();
      if (current === questions.length - 1) {
        completed = true;
        render();
        completionTitle.focus();
        status.textContent = 'Practice complete. Three sample questions practiced: inertia, photosynthesis, and quadratic roots.';
        return;
      }
      current += 1;
      selected = null;
      reviewed = false;
      render();
      questionTitle.focus();
      status.textContent = `Question ${current + 1} of 3. ${questions[current].subject}.`;
      reveal(rows);
    }, { signal });

    restart.addEventListener('click', () => {
      if (!completed) return;
      stopMotion();
      current = 0;
      selected = null;
      reviewed = false;
      completed = false;
      render();
      questionTitle.focus();
      status.textContent = 'Practice restarted. Question 1 of 3. Physics.';
      reveal(rows);
    }, { signal });

    document.addEventListener('prototype:motion', (event) => {
      if (event.detail && event.detail.reduced) stopMotion();
    }, { signal });
    systemMotion.addEventListener('change', (event) => {
      if (event.matches) stopMotion();
    }, { signal });

    cleanup = () => {
      controller.abort();
      stopMotion();
      fieldset.disabled = true;
      next.disabled = true;
      restart.disabled = true;
      cleanup = null;
    };
    render();
  };

  window.addEventListener('pagehide', () => { if (cleanup) cleanup(); });
  window.addEventListener('pageshow', (event) => { if (event.persisted) initialize(); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
