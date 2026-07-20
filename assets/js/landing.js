(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const activation = document.getElementById('activation');
  const activationSticky = activation?.querySelector('.activation-sticky');
  const canvas = document.getElementById('neural-canvas');
  const context = canvas?.getContext('2d');
  const phaseCopies = [...document.querySelectorAll('.phase-copy')];
  const sequenceStep = document.getElementById('sequence-step');
  const headerStatus = document.getElementById('header-status-text');
  const railValue = document.getElementById('rail-value');
  const sequenceLabel = document.getElementById('sequence-progress-label');
  const uploadValue = document.getElementById('upload-value');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!activation || !activationSticky || !canvas || !context) return;

  const metrics = {
    energy: {
      value: document.getElementById('energy-value'),
      bar: document.getElementById('energy-bar')
    },
    focus: {
      value: document.getElementById('focus-value'),
      bar: document.getElementById('focus-bar')
    },
    coherence: {
      value: document.getElementById('coherence-value'),
      bar: document.getElementById('coherence-bar')
    }
  };

  const statusMessages = [
    'Signal detected',
    'Focus increasing',
    'Knowledge uploading',
    'Deep concentration',
    'System nearly ready'
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / (edge1 - edge0));
    return t * t * (3 - (2 * t));
  };

  let viewportWidth = 0;
  let viewportHeight = 0;
  let pixelRatio = 1;
  let scrollProgress = 0;
  let currentPhase = -1;
  let frameRequested = false;
  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let pointerClientX = window.innerWidth * .5;
  let pointerClientY = window.innerHeight * .5;
  let pointerPresent = false;
  let lastSparkAt = 0;
  let lastScrollPosition = window.scrollY;
  let scrollVelocity = 0;
  let nodes = [];
  let links = [];

  const seededRandom = (() => {
    let seed = 918273;
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  })();

  const insideBrain = (x, y) => {
    const leftLobe = (((x + .28) / .58) ** 2) + (((y + .06) / .76) ** 2) < 1;
    const rightLobe = (((x - .28) / .58) ** 2) + (((y + .06) / .76) ** 2) < 1;
    const crown = ((x / .78) ** 2) + (((y + .34) / .56) ** 2) < 1;
    const lower = ((x / .64) ** 2) + (((y - .38) / .48) ** 2) < 1;
    const outerShape = leftLobe || rightLobe || crown || lower;
    const centerNotch = y < -.62 && Math.abs(x) < .055 + ((-.62 - y) * .22);
    const lowerCut = y > .72 && Math.abs(x) > .28 - ((y - .72) * .35);
    return outerShape && !centerNotch && !lowerCut;
  };

  const buildBrain = () => {
    const mobile = viewportWidth < 700;
    const targetCount = mobile ? 112 : 168;
    const newNodes = [];
    let attempts = 0;

    while (newNodes.length < targetCount && attempts < targetCount * 50) {
      attempts += 1;
      const x = (seededRandom() * 2) - 1;
      const y = (seededRandom() * 1.9) - .95;
      if (!insideBrain(x, y)) continue;

      const minimumDistance = mobile ? .095 : .078;
      if (newNodes.some((node) => Math.hypot(node.x - x, node.y - y) < minimumDistance)) continue;

      const fromBase = clamp((.86 - y) / 1.72);
      newNodes.push({
        x,
        y,
        radius: 1.1 + (seededRandom() * 1.8),
        activation: clamp((fromBase * .78) + (seededRandom() * .18)),
        speed: .55 + (seededRandom() * 1.2),
        offset: seededRandom() * Math.PI * 2
      });
    }

    nodes = newNodes;
    links = [];
    nodes.forEach((node, index) => {
      const candidates = nodes
        .map((other, otherIndex) => ({ otherIndex, distance: Math.hypot(node.x - other.x, node.y - other.y) }))
        .filter((item) => item.otherIndex !== index && item.distance < .28)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      candidates.forEach(({ otherIndex, distance }) => {
        if (otherIndex > index) {
          links.push({
            from: index,
            to: otherIndex,
            distance,
            activation: Math.max(node.activation, nodes[otherIndex].activation),
            phase: seededRandom()
          });
        }
      });
    });
  };

  const resize = () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewportWidth * pixelRatio);
    canvas.height = Math.floor(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    buildBrain();
    requestDraw();
  };

  const brainTransform = () => {
    const mobile = viewportWidth < 900;
    const size = Math.min(viewportWidth * (mobile ? .74 : .39), viewportHeight * (mobile ? .48 : .69), 640);
    const velocityStretch = 1 + (Math.abs(scrollVelocity) * .75);
    return {
      centerX: viewportWidth * .5,
      centerY: viewportHeight * (mobile ? .55 : .52),
      scaleX: size * .5 * velocityStretch,
      scaleY: size * .5 / velocityStretch,
      rotation: (pointerX * .034) + ((scrollProgress - .5) * .055) + (scrollVelocity * .18)
    };
  };

  const mapPoint = (node, transform) => {
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);
    const x = node.x * transform.scaleX;
    const y = node.y * transform.scaleY;
    const depth = 1 + (pointerY * node.x * .018);
    let mappedX = transform.centerX + ((x * cos) - (y * sin)) * depth;
    let mappedY = transform.centerY + ((x * sin) + (y * cos)) * depth;
    const pointerDistance = Math.hypot(pointerClientX - mappedX, pointerClientY - mappedY);

    if (pointerPresent && pointerDistance < 190 && pointerDistance > 0) {
      const magnetism = (1 - (pointerDistance / 190)) * (3 + (scrollProgress * 12));
      mappedX += ((pointerClientX - mappedX) / pointerDistance) * magnetism;
      mappedY += ((pointerClientY - mappedY) / pointerDistance) * magnetism;
    }

    return { x: mappedX, y: mappedY };
  };

  const draw = (time = performance.now()) => {
    frameRequested = false;
    context.clearRect(0, 0, viewportWidth, viewportHeight);
    pointerX += (targetPointerX - pointerX) * .07;
    pointerY += (targetPointerY - pointerY) * .07;
    scrollVelocity *= .9;

    const transform = brainTransform();
    const mapped = nodes.map((node) => mapPoint(node, transform));
    const powered = smoothstep(0, .96, scrollProgress);
    const revealMargin = .12;

    context.save();
    context.globalCompositeOperation = 'lighter';

    for (let ring = 0; ring < 3; ring += 1) {
      const ringProgress = (time * (.000045 + (ring * .000012))) + (ring * 1.7) + (scrollProgress * 2.4);
      const radiusX = transform.scaleX * (.72 + (ring * .13));
      const radiusY = transform.scaleY * (.7 + (ring * .13));
      context.strokeStyle = `rgba(${ring === 1 ? '142,125,255' : '183,255,65'},${.035 + (powered * .075)})`;
      context.lineWidth = 1;
      context.setLineDash([4 + (ring * 2), 17 - (ring * 3)]);
      context.beginPath();
      context.ellipse(transform.centerX, transform.centerY, radiusX, radiusY, transform.rotation, ringProgress, ringProgress + (Math.PI * (1.08 + (ring * .18))));
      context.stroke();
    }
    context.setLineDash([]);

    links.forEach((link) => {
      const source = mapped[link.from];
      const destination = mapped[link.to];
      const localPower = smoothstep(link.activation - revealMargin, link.activation + .08, powered);
      const baseAlpha = .045 + (localPower * .28);
      if (baseAlpha <= .046 && powered < .08) return;

      const gradient = context.createLinearGradient(source.x, source.y, destination.x, destination.y);
      gradient.addColorStop(0, `rgba(142,125,255,${baseAlpha})`);
      gradient.addColorStop(1, `rgba(183,255,65,${baseAlpha * .85})`);
      context.strokeStyle = gradient;
      context.lineWidth = .55 + (localPower * .75);
      context.beginPath();
      context.moveTo(source.x, source.y);
      context.lineTo(destination.x, destination.y);
      context.stroke();

      if (localPower > .58 && ((link.from + link.to) % 4 === 0)) {
        const travel = (time * .00034 + link.phase) % 1;
        const pulseX = source.x + ((destination.x - source.x) * travel);
        const pulseY = source.y + ((destination.y - source.y) * travel);
        context.fillStyle = `rgba(205,255,126,${(localPower - .7) * 2.7})`;
        context.beginPath();
        context.arc(pulseX, pulseY, 1.5, 0, Math.PI * 2);
        context.fill();
      }
    });

    if (pointerPresent && body.dataset.active === 'true' && powered > .08) {
      const nearbyNodes = mapped
        .map((point, index) => ({ point, index, distance: Math.hypot(pointerClientX - point.x, pointerClientY - point.y) }))
        .filter(({ index, distance }) => distance < 240 && smoothstep(nodes[index].activation - .12, nodes[index].activation + .06, powered) > .16)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);

      nearbyNodes.forEach(({ point, distance }, index) => {
        const alpha = (1 - (distance / 240)) * (.26 - (index * .035));
        const gradient = context.createLinearGradient(point.x, point.y, pointerClientX, pointerClientY);
        gradient.addColorStop(0, `rgba(183,255,65,${alpha})`);
        gradient.addColorStop(1, 'rgba(183,255,65,0)');
        context.strokeStyle = gradient;
        context.lineWidth = .7;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.quadraticCurveTo(
          (point.x + pointerClientX) * .5 + (pointerY * 12),
          (point.y + pointerClientY) * .5 - (pointerX * 12),
          pointerClientX,
          pointerClientY
        );
        context.stroke();
      });
    }

    nodes.forEach((node, index) => {
      const point = mapped[index];
      const localPower = smoothstep(node.activation - revealMargin, node.activation + .06, powered);
      const breathing = reducedMotion ? 1 : 1 + (Math.sin((time * .001 * node.speed) + node.offset) * .13);
      const radius = node.radius * breathing * (.78 + (localPower * .62));
      const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * (3 + (localPower * 2)));
      glow.addColorStop(0, `rgba(220,255,162,${.16 + (localPower * .84)})`);
      glow.addColorStop(.25, `rgba(183,255,65,${localPower * .32})`);
      glow.addColorStop(1, 'rgba(142,125,255,0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(point.x, point.y, radius * (3 + (localPower * 2)), 0, Math.PI * 2);
      context.fill();

      context.fillStyle = localPower > .45
        ? `rgba(221,255,165,${.45 + (localPower * .55)})`
        : `rgba(142,125,255,${.16 + (powered * .22)})`;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    });

    const outlineAlpha = .08 + (powered * .22);
    context.strokeStyle = `rgba(183,255,65,${outlineAlpha})`;
    context.lineWidth = 1;
    context.setLineDash([2, 9]);
    context.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += .045) {
      const x = Math.cos(angle) * transform.scaleX * .87;
      const y = Math.sin(angle) * transform.scaleY * .84;
      const px = transform.centerX + x;
      const py = transform.centerY + y;
      if (angle === 0) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.stroke();
    context.restore();

    if (!reducedMotion && scrollProgress > .015 && scrollProgress < .995) {
      animationFrame = requestAnimationFrame(draw);
      frameRequested = true;
    }
  };

  const requestDraw = () => {
    if (!frameRequested) {
      frameRequested = true;
      animationFrame = requestAnimationFrame(draw);
    }
  };

  const setMetric = (metric, amount) => {
    const value = Math.round(clamp(amount) * 100);
    metric.value.textContent = String(value).padStart(2, '0');
    metric.bar.style.transform = `scaleX(${value / 100})`;
  };

  const updatePage = () => {
    const rect = activation.getBoundingClientRect();
    const distance = Math.max(1, activation.offsetHeight - viewportHeight);
    scrollProgress = clamp(-rect.top / distance);
    const pageDistance = Math.max(1, document.documentElement.scrollHeight - viewportHeight);
    const pageProgress = clamp(window.scrollY / pageDistance);
    const phase = Math.min(4, Math.floor(scrollProgress * 5));
    const uploadProgress = smoothstep(.4, .6, scrollProgress);

    root.style.setProperty('--progress', scrollProgress.toFixed(4));
    root.style.setProperty('--reticle-rotation', `${(scrollProgress * 220) + (scrollVelocity * 80)}deg`);
    root.style.setProperty('--brain-scale', (.82 + (scrollProgress * .22) + (Math.abs(scrollVelocity) * .4)).toFixed(3));
    railValue.textContent = String(Math.round(pageProgress * 100)).padStart(2, '0');
    sequenceLabel.textContent = scrollProgress.toFixed(2);
    uploadValue.textContent = `${String(Math.round(uploadProgress * 100)).padStart(2, '0')}%`;
    body.dataset.active = String(rect.top <= viewportHeight * .35 && rect.bottom >= viewportHeight * .65);

    setMetric(metrics.energy, smoothstep(0, .72, scrollProgress));
    setMetric(metrics.focus, smoothstep(.13, .88, scrollProgress) * .98);
    setMetric(metrics.coherence, smoothstep(.3, .98, scrollProgress));

    if (phase !== currentPhase) {
      currentPhase = phase;
      activationSticky.dataset.phase = String(phase);
      phaseCopies.forEach((copy, index) => {
        const active = index === phase;
        copy.classList.toggle('is-active', active);
        copy.setAttribute('aria-hidden', String(!active));
      });
      sequenceStep.textContent = `${String(phase + 1).padStart(2, '0')} / 05`;
    }

    headerStatus.textContent = rect.top > viewportHeight * .35
      ? 'Heat signature rising'
      : (rect.bottom < viewportHeight * .35 ? 'Signal acquired' : statusMessages[phase]);

    requestDraw();
  };

  const requestUpdate = () => {
    if (requestUpdate.pending) return;
    requestUpdate.pending = true;
    requestAnimationFrame(() => {
      requestUpdate.pending = false;
      const scrollDelta = window.scrollY - lastScrollPosition;
      scrollVelocity = clamp(scrollDelta / Math.max(1, viewportHeight), -.18, .18);
      lastScrollPosition = window.scrollY;
      updatePage();
    });
  };
  requestUpdate.pending = false;

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => {
    resize();
    updatePage();
  }, { passive: true });
  window.addEventListener('pointermove', (event) => {
    targetPointerX = ((event.clientX / Math.max(1, viewportWidth)) - .5) * 2;
    targetPointerY = ((event.clientY / Math.max(1, viewportHeight)) - .5) * 2;
    pointerClientX = event.clientX;
    pointerClientY = event.clientY;
    pointerPresent = true;
    body.classList.add('has-pointer');
    root.style.setProperty('--pointer-x', `${event.clientX}px`);
    root.style.setProperty('--pointer-y', `${event.clientY}px`);
    root.style.setProperty('--cursor-x', `${event.clientX}px`);
    root.style.setProperty('--cursor-y', `${event.clientY}px`);
    root.style.setProperty('--pointer-nx', targetPointerX.toFixed(3));
    root.style.setProperty('--pointer-ny', targetPointerY.toFixed(3));
    root.style.setProperty('--reactor-rotate-x', `${(targetPointerY * -7).toFixed(2)}deg`);
    root.style.setProperty('--reactor-rotate-y', `${(targetPointerX * 9).toFixed(2)}deg`);
    root.style.setProperty('--copy-shift-x', `${(targetPointerX * 10).toFixed(2)}px`);
    root.style.setProperty('--copy-shift-y', `${(targetPointerY * 7).toFixed(2)}px`);

    if (!reducedMotion && event.pointerType !== 'touch' && event.timeStamp - lastSparkAt > 34) {
      lastSparkAt = event.timeStamp;
      const spark = document.createElement('span');
      spark.className = 'cursor-spark';
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      spark.style.setProperty('--spark-x', `${(-10 - (Math.random() * 22)).toFixed(1)}px`);
      spark.style.setProperty('--spark-y', `${(-4 + (Math.random() * 18)).toFixed(1)}px`);
      body.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
    }
    requestDraw();
  }, { passive: true });
  window.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    body.classList.add('cursor-down');
    if (reducedMotion) return;
    const ripple = document.createElement('span');
    ripple.className = 'signal-ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, { passive: true });
  window.addEventListener('pointerup', () => body.classList.remove('cursor-down'), { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    pointerPresent = false;
    body.classList.remove('has-pointer', 'cursor-down');
  });
  document.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('pointerenter', () => body.classList.add('cursor-over'));
    element.addEventListener('pointerleave', () => body.classList.remove('cursor-over'));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      frameRequested = false;
    } else {
      requestDraw();
    }
  });

  resize();
  updatePage();
})();
