// BOUNCE CARDS

(() => {
  const images = [
    "Public/pictures/DSCF1554.jpg", // NTHS
    'Public/pictures/leocover.jpg', // LEO Club
    'Public/pictures/ietcover.jpg', // IET Ambassador
    'Public/pictures/skillsusa.jpg', // SkillsUSA
    'Public/pictures/IMG_2268.jpeg'  // 
  ];

  // Titles/captions
  const titles = [
    'NTHS',
    'LEO Club',
    'IET Ambassador',
    'SkillsUSA',
    'Miscellaneous'
  ];

  const links = [
    'nths.html',
    'leo.html',
    'iet.html',
    'skills.html',
    'misc.html'
  ];

  const containerWidth = 500; // px
  const containerHeight = 250; // px

  const animationDelay = 1; // seconds
  const animationStagger = 0.08; // seconds
  const easeType = 'elastic.out(1, 0.5)'; // GSAP ease string
  const transformStyles = [
    'rotate(5deg) translate(-150px)',
    'rotate(0deg) translate(-70px)',
    'rotate(-5deg)',
    'rotate(5deg) translate(70px)',
    'rotate(-5deg) translate(150px)'
  ];
  const enableHover = true;
  // -----------------------------------------------------------------------

  // DOM container where cards will be
  const root = document.getElementById('bounceCardsContainer');
  if (!root) {
    console.warn('bounceCardsContainer not found in DOM');
    return;
  }

  // Optionally set container size
  if (containerWidth) root.style.width = `${containerWidth}px`;
  if (containerHeight) root.style.height = `${containerHeight}px`;

  // Remove existing children (safe rerun)
  root.innerHTML = '';

  // Create and append cards
  images.forEach((src, idx) => {
    const el = document.createElement('div');
    el.className = `card card-${idx}`;
    el.dataset.index = String(idx);
    // set initial transform identical to React inline style approach
    const baseTransform = transformStyles[idx] ?? 'none';
    el.style.transform = baseTransform === 'none' ? '' : baseTransform;

    // image element matching .image class
    const img = document.createElement('img');
    img.className = 'image';
    img.src = src;
    img.alt = `card-${idx}`;

    // caption element
    const caption = document.createElement('div');
    caption.className = 'card-caption';
    caption.textContent = titles[idx] || '';

    el.appendChild(img);
    el.appendChild(caption);
    root.appendChild(el);
  });

  // small helpers copied from the React code
  const getNoRotationTransform = (transformStr) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none' || !transformStr) {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    // match translate
    const translateRegex = /translate\(\s*([-0-9.]+)px\s*\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      // if no translate exists, append translate
      if (!baseTransform || baseTransform === 'none') {
        return `translate(${offsetX}px)`;
      } else {
        return `${baseTransform} translate(${offsetX}px)`;
      }
    }
  };

  // animation functions
  function pushSiblings(hoveredIdx) {
    if (!enableHover) return;

    images.forEach((_, i) => {
      // kill existing tweens on this node selector
      gsap.killTweensOf(`.card-${i}`);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotationTransform = getNoRotationTransform(baseTransform);
        gsap.to(`.card-${i}`, {
          transform: noRotationTransform,
          scale: 1.1,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });

        // show caption for hovered
        const cap = document.querySelector(`.card-${i} .card-caption`);
        if (cap) {
          gsap.killTweensOf(cap);
          gsap.to(cap, { duration: 0.22, autoAlpha: 1, y: 0, ease: 'power2.out', overwrite: 'auto' });
          cap.setAttribute('aria-hidden', 'false');
        }
      } else {
        const offsetX = i < hoveredIdx ? -350 : 350;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);

        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(`.card-${i}`, {
          transform: pushedTransform,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        });

        // hide non-hover captions
        const cap = document.querySelector(`.card-${i} .card-caption`);
        if (cap) {
          gsap.killTweensOf(cap);
          gsap.to(cap, { duration: 0.18, autoAlpha: 0, y: 6, ease: 'power2.in', overwrite: 'auto' });
          cap.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  function resetSiblings() {
    if (!enableHover) return;
    images.forEach((_, i) => {
      gsap.killTweensOf(`.card-${i}`);
      const baseTransform = transformStyles[i] || 'none';
      gsap.to(`.card-${i}`, {
        transform: baseTransform,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });

      const cap = document.querySelector(`.card-${i} .card-caption`);
      if (cap) {
        gsap.killTweensOf(cap);
        gsap.to(cap, { duration: 0.18, autoAlpha: 0, y: 6, ease: 'power2.in', overwrite: 'auto' });
        cap.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // initial mount animation (scale in with stagger)
  gsap.fromTo(
    root.querySelectorAll('.card'),
    { scale: 0 },
    {
      scale: 1,
      stagger: animationStagger,
      ease: easeType,
      delay: animationDelay
    }
  );

  // set initial caption state: hidden and slightly down
  const captionEls = Array.from(root.querySelectorAll('.card-caption'));
  gsap.set(captionEls, { autoAlpha: 0, y: 6 });
  captionEls.forEach(c => c.setAttribute('aria-hidden', 'true'));

  // attach events to each card
  const cardEls = Array.from(root.querySelectorAll('.card'));
  cardEls.forEach((cardEl, idx) => {
    cardEl.addEventListener('mouseenter', () => pushSiblings(idx));
    cardEl.addEventListener('mouseleave', resetSiblings);
    cardEl.addEventListener('focus', () => pushSiblings(idx), true);
    cardEl.addEventListener('blur', resetSiblings, true);
    // touch: activate on touchstart (mobile)
    cardEl.addEventListener('touchstart', (ev) => {
      pushSiblings(idx);
    }, { passive: true });

    // NEW: click to navigate
    cardEl.addEventListener('click', () => {
      window.location.href = links[idx];
    })
  });

  // reset if the pointer leaves the container area
  root.addEventListener('mouseleave', resetSiblings);

  // If touch starts outside the container, reset
  document.addEventListener('touchstart', (e) => {
    if (!root.contains(e.target)) resetSiblings();
  }, { passive: true });

  // keyboard: Escape will reset
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetSiblings();
  });
})();