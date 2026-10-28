const heroVideo = document.querySelector('#hero-video');
const soundToggle = document.querySelector('#sound-toggle');
const scrollCue = document.querySelector('#scroll-cue');
const orbitRail = document.querySelector('#orbit-rail');
const brandOrbit = document.querySelector('#brand-orbit');
const orbitCaption = document.querySelector('#orbit-caption');
const pageProgress = document.querySelector('#page-progress');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const clientCurve = document.querySelector('#client-curve');
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

if (clientCurve) {
  const curveViewport = clientCurve.querySelector('#curve-viewport');
  const curveCards = [...clientCurve.querySelectorAll('.curve-card')];
  const previousButton = clientCurve.querySelector('#curve-previous');
  const nextButton = clientCurve.querySelector('#curve-next');
  const activeClient = clientCurve.querySelector('#curve-active-client');
  const activeCount = clientCurve.querySelector('#curve-active-count');
  const cardCount = curveCards.length;
  const curveState = {
    current: 0,
    target: 0,
    activeIndex: -1,
    dragOrigin: 0,
    dragTarget: 0,
    dragDistance: 0,
    dragging: false,
    suppressClick: false,
    inView: false,
    paused: false
  };
  let curveFrame = 0;

  const wrapIndex = (value) => ((value % cardCount) + cardCount) % cardCount;
  const nearestDelta = (index, position) => {
    const normalized = wrapIndex(position);
    let delta = index - normalized;
    if (delta > cardCount / 2) delta -= cardCount;
    if (delta < cardCount / -2) delta += cardCount;
    return delta;
  };

  function curveGap() {
    return Math.min(132, Math.max(94, clientCurve.clientWidth * .3));
  }

  function selectCurveCard(index) {
    curveState.target += nearestDelta(index, curveState.target);
    queueCurve();
  }

  function renderCurve() {
    const gap = curveGap();
    const compact = clientCurve.clientWidth < 390;
    curveCards.forEach((card, index) => {
      const distance = nearestDelta(index, curveState.current);
      const absoluteDistance = Math.abs(distance);
      const visible = absoluteDistance < 4.15;
      const x = distance * gap;
      const y = distance * distance * (compact ? 9 : 11);
      const rotation = distance * (compact ? 3.6 : 4.8);
      const scale = Math.max(.7, 1 - absoluteDistance * .075);
      const opacity = visible ? Math.max(.18, 1 - absoluteDistance * .2) : 0;
      card.style.setProperty('--curve-x', `${x}px`);
      card.style.setProperty('--curve-y', `${y}px`);
      card.style.setProperty('--curve-r', `${rotation}deg`);
      card.style.setProperty('--curve-s', String(scale));
      card.style.setProperty('--curve-o', String(opacity));
      card.style.setProperty('--curve-z', String(20 - Math.round(absoluteDistance * 3)));
      card.toggleAttribute('inert', !visible);
      card.tabIndex = absoluteDistance < 2.2 ? 0 : -1;
    });

    const nextActive = wrapIndex(Math.round(curveState.current));
    if (nextActive !== curveState.activeIndex) {
      curveState.activeIndex = nextActive;
      curveCards.forEach((card, index) => {
        const active = index === nextActive;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-current', active ? 'true' : 'false');
      });
      const label = curveCards[nextActive].querySelector('strong')?.textContent || '';
      if (activeClient) activeClient.textContent = label;
      if (activeCount) activeCount.textContent = `${String(nextActive + 1).padStart(2, '0')} / ${String(cardCount).padStart(2, '0')}`;
    }
  }

  function animateCurve() {
    curveFrame = 0;
    if (reduceMotion.matches) {
      curveState.current = curveState.target;
    } else {
      curveState.current += (curveState.target - curveState.current) * .09;
      if (Math.abs(curveState.target - curveState.current) < .001) curveState.current = curveState.target;
    }
    renderCurve();
    if (curveState.dragging || Math.abs(curveState.target - curveState.current) >= .001) queueCurve();
  }

  function queueCurve() {
    if (!curveFrame) curveFrame = window.requestAnimationFrame(animateCurve);
  }

  function finishCurveDrag(event) {
    if (!curveState.dragging) return;
    curveState.dragging = false;
    curveState.suppressClick = curveState.dragDistance > 6;
    curveState.target = Math.round(curveState.target);
    clientCurve.classList.remove('is-dragging');
    if (event.pointerId !== undefined && curveViewport.hasPointerCapture(event.pointerId)) curveViewport.releasePointerCapture(event.pointerId);
    queueCurve();
    window.setTimeout(() => { curveState.suppressClick = false; }, 0);
  }

  curveCards.forEach((card, index) => card.addEventListener('click', () => {
    if (!curveState.suppressClick) selectCurveCard(index);
  }));
  previousButton?.addEventListener('click', () => selectCurveCard(wrapIndex(curveState.activeIndex - 1)));
  nextButton?.addEventListener('click', () => selectCurveCard(wrapIndex(curveState.activeIndex + 1)));

  curveViewport?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    curveState.dragging = true;
    curveState.dragOrigin = event.clientX;
    curveState.dragTarget = curveState.target;
    curveState.dragDistance = 0;
    curveViewport.setPointerCapture(event.pointerId);
    clientCurve.classList.add('is-dragging');
  });
  curveViewport?.addEventListener('pointermove', (event) => {
    if (!curveState.dragging) return;
    curveState.dragDistance = Math.abs(event.clientX - curveState.dragOrigin);
    curveState.target = curveState.dragTarget - (event.clientX - curveState.dragOrigin) / curveGap();
    queueCurve();
  });
  curveViewport?.addEventListener('pointerup', finishCurveDrag);
  curveViewport?.addEventListener('pointercancel', finishCurveDrag);

  clientCurve.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectCurveCard(wrapIndex(curveState.activeIndex - 1));
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectCurveCard(wrapIndex(curveState.activeIndex + 1));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      selectCurveCard(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      selectCurveCard(cardCount - 1);
    }
  });

  clientCurve.addEventListener('pointerenter', () => { curveState.paused = true; });
  clientCurve.addEventListener('pointerleave', () => { curveState.paused = false; });
  clientCurve.addEventListener('focusin', () => { curveState.paused = true; });
  clientCurve.addEventListener('focusout', () => { curveState.paused = false; });

  const clientCurveObserver = new IntersectionObserver(([entry]) => {
    curveState.inView = entry.isIntersecting;
  }, { rootMargin: '18% 0px' });
  clientCurveObserver.observe(clientCurve);

  window.setInterval(() => {
    const shouldAdvance = curveState.inView && !curveState.paused && !curveState.dragging && !reduceMotion.matches && !navigator.connection?.saveData;
    if (!shouldAdvance) return;
    curveState.target += 1;
    queueCurve();
  }, 2200);

  clientCurve.dataset.state = 'ready';
  renderCurve();
  queueCurve();
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
  phone: 'กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้',
  brief: 'กรุณาเล่าโจทย์ที่อยากคุยโดยย่อ'
};

function validateField(field) {
  const helper = document.querySelector(`#${field.id}-help`);
  const empty = !field.value.trim();
  const malformedEmail = field.type === 'email' && !field.validity.valid;
  const malformedPhone = field.type === 'tel' && !field.validity.valid;
  const valid = !empty && !malformedEmail && !malformedPhone;
  field.setAttribute('aria-invalid', String(!valid));
  if (helper) {
    helper.textContent = valid
      ? ''
      : malformedEmail && !empty
        ? 'รูปแบบอีเมลยังไม่ถูกต้อง กรุณาตรวจอีกครั้ง'
        : malformedPhone && !empty
          ? 'รูปแบบเบอร์โทรศัพท์ยังไม่ถูกต้อง กรุณาตรวจอีกครั้ง'
          : messages[field.id];
  }
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
