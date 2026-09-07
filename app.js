const heroVideo = document.querySelector('#hero-video');
const soundToggle = document.querySelector('#sound-toggle');
const scrollCue = document.querySelector('#scroll-cue');
const orbitRail = document.querySelector('#orbit-rail');
const brandOrbit = document.querySelector('#brand-orbit');
const orbitCaption = document.querySelector('#orbit-caption');
const pageProgress = document.querySelector('#page-progress');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const clientOrbit = document.querySelector('.client-orbit-stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (navigator.connection?.saveData && heroVideo) {
  heroVideo.removeAttribute('autoplay');
  heroVideo.pause();
}

soundToggle?.addEventListener('click', () => {
  const willPlaySound = heroVideo.muted;
  heroVideo.muted = !willPlaySound;
  soundToggle.setAttribute('aria-pressed', String(willPlaySound));
  soundToggle.setAttribute('aria-label', willPlaySound ? 'ปิดเสียงวิดีโอ' : 'เปิดเสียงวิดีโอ');
  if (heroVideo.paused) heroVideo.play().catch(() => {});
});

scrollCue?.addEventListener('click', () => {
  document.querySelector('#who-we-are')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
});

const sceneMeta = {
  hero: ['Marketing & Production', 1 / 7],
  studio: ['Integrated Studio', 2 / 7],
  clients: ['Client / Partners', 3 / 7],
  wakuflow: ['Know · Flow · Grow', 4 / 7],
  integrated: ['One Connected Team', 5 / 7],
  proof: ['Credential & Commerce', 6 / 7],
  contact: ['Start the Conversation', 1]
};

function setScene(scene) {
  if (!sceneMeta[scene]) return;
  document.body.dataset.scene = scene;
  brandOrbit?.setAttribute('data-phase', scene);
  if (orbitCaption) orbitCaption.textContent = sceneMeta[scene][0];
  pageProgress?.style.setProperty('transform', `scaleY(${sceneMeta[scene][1]})`);
}

const sceneObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setScene(visible.target.dataset.sceneKey);
}, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .2, .5] });

document.querySelectorAll('[data-scene-key]').forEach((section) => sceneObserver.observe(section));

if (clientOrbit && !reduceMotion.matches && !navigator.connection?.saveData) {
  const clientMotionObserver = new IntersectionObserver(([entry]) => {
    clientOrbit.classList.toggle('is-motion-active', entry.isIntersecting);
  }, { rootMargin: '18% 0px' });
  clientMotionObserver.observe(clientOrbit);
}

let orbitCurrent = { x: 0, y: 0 };
let orbitTarget = { x: 0, y: 0 };
let orbitFrame = 0;

function drawOrbit() {
  orbitCurrent.x += (orbitTarget.x - orbitCurrent.x) * .12;
  orbitCurrent.y += (orbitTarget.y - orbitCurrent.y) * .12;
  brandOrbit?.style.setProperty('--orbit-x', `${orbitCurrent.x}px`);
  brandOrbit?.style.setProperty('--orbit-y', `${orbitCurrent.y}px`);
  const distance = Math.abs(orbitTarget.x - orbitCurrent.x) + Math.abs(orbitTarget.y - orbitCurrent.y);
  orbitFrame = distance > .08 ? window.requestAnimationFrame(drawOrbit) : 0;
}

function queueOrbit() {
  if (!orbitFrame && !reduceMotion.matches) orbitFrame = window.requestAnimationFrame(drawOrbit);
}

orbitRail?.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  const rect = orbitRail.getBoundingClientRect();
  orbitTarget.x = ((event.clientX - rect.left) / rect.width - .5) * 22;
  orbitTarget.y = ((event.clientY - rect.top) / rect.height - .5) * 18;
  queueOrbit();
});

orbitRail?.addEventListener('pointerleave', () => {
  orbitTarget = { x: 0, y: 0 };
  queueOrbit();
});

const messages = {
  name: 'กรุณาระบุชื่อผู้ติดต่อ',
  company: 'กรุณาระบุบริษัทหรือแบรนด์',
  email: 'กรุณาระบุอีเมลที่ติดต่อได้',
  brief: 'กรุณาเล่าโจทย์ที่อยากคุยโดยย่อ'
};

function validateField(field) {
  const helper = document.querySelector(`#${field.id}-help`);
  const empty = !field.value.trim();
  const malformedEmail = field.type === 'email' && !field.validity.valid;
  const valid = !empty && !malformedEmail;
  field.setAttribute('aria-invalid', String(!valid));
  if (helper) helper.textContent = valid ? '' : malformedEmail && !empty ? 'รูปแบบอีเมลยังไม่ถูกต้อง กรุณาตรวจอีกครั้ง' : messages[field.id];
  return valid;
}

contactForm?.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...contactForm.querySelectorAll('input, textarea')];
  const valid = fields.map(validateField).every(Boolean);
  formStatus.className = `form-status ${valid ? 'is-success' : 'is-error'}`;
  formStatus.textContent = valid
    ? 'Preview only — รูปแบบพร้อมแล้ว แต่ยังไม่ได้เชื่อมระบบส่งข้อมูล'
    : 'กรอกข้อมูลยังไม่ครบ กรุณาตรวจช่องที่ทำเครื่องหมายไว้';
  if (!valid) fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
});
