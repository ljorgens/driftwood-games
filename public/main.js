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
