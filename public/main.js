// Game clips play silently while on screen, twice through, then rest on their
// last frame; hovering or focusing the card plays them again. With reduced
// motion turned on (or no JavaScript), each card just shows its poster frame.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const PLAYS = 2;

if ('IntersectionObserver' in window) {
  const clips = [...document.querySelectorAll('.clip video')];
  const plays = new Map(clips.map((v) => [v, 0]));
  const start = (v) => {
    if (reduce.matches || plays.get(v) >= PLAYS) return;
    v.play().catch(() => {});
  };

  clips.forEach((v) => {
    v.loop = false;
    v.addEventListener('ended', () => {
      plays.set(v, plays.get(v) + 1);
      if (plays.get(v) < PLAYS) {
        v.currentTime = 0;
        start(v);
      }
    });
    const card = v.closest('.game');
    const replay = () => {
      if (reduce.matches || !v.paused) return;
      plays.set(v, PLAYS - 1);
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    card.addEventListener('mouseenter', replay);
    card.addEventListener('focusin', replay);
  });

  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) start(e.target);
        else e.target.pause();
      }
    },
    { threshold: 0.25 },
  );
  clips.forEach((v) => seen.observe(v));

  reduce.addEventListener('change', () => {
    if (reduce.matches) clips.forEach((v) => v.pause());
  });
}

// Ideas and mods: one form with a "what are you sending?" choice. It sends
// through Formspree without leaving the page; without JavaScript it posts
// normally and Formspree shows its own thank-you page.
const form = document.getElementById('idea-form');
if (form && window.fetch) {
  const status = document.getElementById('idea-status');
  const button = form.querySelector('button[type="submit"]');
  const modFields = form.querySelector('.mod-fields');
  const modLink = document.getElementById('mod-link');
  const text = document.getElementById('idea');
  const textLabel = document.getElementById('idea-label');
  const subject = form.querySelector('input[name="_subject"]');
  const say = (html, error = false) => {
    status.innerHTML = html;
    status.classList.toggle('error', error);
  };

  const MODES = {
    'Game idea': {
      label: 'Your idea',
      placeholder: 'A game you loved, a twist on one, or something new',
      button: 'Send idea',
      subject: 'Game idea from the Driftwood Games site',
      thanks: 'Thanks! Your idea is on its way.',
    },
    'Community mod': {
      label: 'What did you change?',
      placeholder: 'A new map, different rules, a tougher AI…',
      button: 'Send mod',
      subject: 'Community mod from the Driftwood Games site',
      thanks: 'Thanks! I’ll give it a play.',
    },
  };
  const mode = () => MODES[form.elements.kind.value] ?? MODES['Game idea'];
  const isMod = () => form.elements.kind.value === 'Community mod';

  const sync = () => {
    const m = mode();
    modFields.hidden = !isMod();
    // Disabled fields aren't submitted, so ideas arrive without empty mod fields.
    modFields.querySelectorAll('input, select').forEach((el) => (el.disabled = !isMod()));
    modLink.required = isMod();
    textLabel.textContent = m.label;
    text.placeholder = m.placeholder;
    button.textContent = m.button;
    subject.value = m.subject;
  };
  form.addEventListener('change', (e) => {
    if (e.target.name === 'kind') sync();
  });

  // /#send-mod (linked from the community page) opens the form on "A mod I made".
  const openFromHash = () => {
    if (location.hash !== '#send-mod') return;
    form.querySelector('input[value="Community mod"]').checked = true;
    sync();
    document.getElementById('send').scrollIntoView();
    modLink.focus({ preventScroll: true });
  };
  window.addEventListener('hashchange', openFromHash);
  sync();
  openFromHash();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    button.disabled = true;
    say('Sending…');
    const thanks = mode().thanks;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      sync();
      say(thanks);
    } catch {
      say(
        'Sorry, that didn’t send. Please try again, or email it to ' +
          '<a href="mailto:driftwoodgames@proton.me">driftwoodgames@proton.me</a>.',
        true,
      );
    } finally {
      button.disabled = false;
    }
  });
}
