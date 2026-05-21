document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    /* Navbar scroll */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    /* Mobile menu */
    document.getElementById('menuToggle').addEventListener('click', () => {
      navbar.classList.toggle('menu-open');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navbar.classList.remove('menu-open'));
    });

    /* Cursor glow */
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
    if (window.matchMedia('(pointer: coarse)').matches) {
      cursorGlow.style.opacity = '0';
    }

    /* Particles */
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    function initParticles() {
      particles = [];
      const count = Math.min(80, Math.floor(window.innerWidth / 18));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 78, 253, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    resizeCanvas();
    initParticles();
    drawParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* GSAP scroll reveals (exclude hero) */
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    /* Hero entrance timeline */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero-glow-border, .light-sweep', { opacity: 0, scale: 0.96, duration: 1.2 })
      .from('[data-hero-item]', { opacity: 0, y: 36, duration: 0.9, stagger: 0.14 }, '-=0.7')
      .from('#heroLine1', { y: '110%', duration: 0.85, ease: 'power4.out' }, '-=0.5')
      .from('#heroLine2', { y: '110%', duration: 0.85, ease: 'power4.out' }, '-=0.65')
      .from('.hero-ctas .btn', { opacity: 0, y: 20, scale: 0.92, duration: 0.6, stagger: 0.1, ease: 'back.out(1.6)' }, '-=0.35');

    /* Orbit icons â€” staggered pop + continuous float */
    const orbitIcons = gsap.utils.toArray('.orbit-icon');
    gsap.from(orbitIcons, {
      opacity: 0,
      scale: 0,
      rotation: -20,
      duration: 0.7,
      stagger: { each: 0.08, from: 'random' },
      ease: 'back.out(2)',
      delay: 0.45
    });
    if (!prefersReducedMotion) {
      orbitIcons.forEach((icon, i) => {
        gsap.to(icon, {
          y: `+=${12 + (i % 3) * 6}`,
          rotation: i % 2 === 0 ? 4 : -4,
          duration: 2.8 + i * 0.35,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.2
        });
        gsap.to(icon.querySelector('i'), {
          y: -3,
          duration: 1.6 + i * 0.15,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.1
        });
      });
    }

    /* Mouse parallax on orbit icons (X only â€” preserves float on Y) */
    const heroSection = document.getElementById('hero');
    if (!prefersReducedMotion && window.matchMedia('(min-width: 769px)').matches) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        orbitIcons.forEach((icon) => {
          const d = parseFloat(icon.dataset.depth) || 0.05;
          gsap.to(icon, {
            x: px * d * 90,
            duration: 0.9,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });
        gsap.to('.hero-inner', {
          x: px * 12,
          y: py * 8,
          duration: 1.2,
          ease: 'power2.out'
        });
      });
      heroSection.addEventListener('mouseleave', () => {
        gsap.to(orbitIcons, { x: 0, duration: 1, ease: 'power2.out' });
        gsap.to('#heroInner', { x: 0, y: 0, duration: 1, ease: 'power2.out' });
      });
      orbitIcons.forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.14, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, duration: 0.4, ease: 'power2.out' });
        });
      });
    }

    /* Shuttle + engine trail */
    if (!prefersReducedMotion) {
      const shuttleStart = { x: '-18vw', y: '82vh', rotation: -22 };
      gsap.set(['.shuttle', '.shuttle-trail'], { ...shuttleStart, transformOrigin: '50% 50%' });
      const flyTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      flyTl
        .to(['.shuttle', '.shuttle-trail'], { opacity: 0.45, duration: 1, ease: 'power2.out' })
        .to(['.shuttle', '.shuttle-trail'], {
          x: '112vw',
          y: '-12vh',
          rotation: -22,
          duration: 26,
          ease: 'none'
        }, 0)
        .to('.shuttle-trail', {
          x: '+=-40',
          duration: 26,
          ease: 'none'
        }, 0)
        .to(['.shuttle', '.shuttle-trail'], { opacity: 0, duration: 2, ease: 'power2.in' }, '-=2.5')
        .set(['.shuttle', '.shuttle-trail'], shuttleStart);
    } else {
      gsap.set('.shuttle', { opacity: 0.2 });
    }

    /* Hero scroll parallax */
    gsap.to('.orb-1', {
      y: 120,
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 }
    });
    gsap.to('.orb-2', {
      y: -80,
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 }
    });
    gsap.to('#heroInner', {
      y: 50,
      opacity: 0.25,
      scale: 0.98,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
    gsap.to('.hero-icons', {
      y: 80,
      opacity: 0.15,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
    gsap.to('.hero-ring', {
      scale: 1.15,
      opacity: 0,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'center top', scrub: true }
    });

    /* Navbar link underline micro-interaction */
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('mouseenter', () => gsap.fromTo(link, { letterSpacing: '0' }, { letterSpacing: '0.04em', duration: 0.3 }));
      link.addEventListener('mouseleave', () => gsap.to(link, { letterSpacing: '0', duration: 0.3 }));
    });

    /* Card tilt */
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    /* Portfolio filter */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        projectCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          if (match) {
            card.classList.remove('is-filtered-out');
            gsap.fromTo(card, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out', clearProps: 'scale' });
          } else {
            gsap.to(card, {
              opacity: 0,
              scale: 0.92,
              duration: 0.25,
              onComplete: () => {
                card.classList.add('is-filtered-out');
                gsap.set(card, { opacity: 1, scale: 1 });
              }
            });
          }
        });
      });
    });

    /* Custom price calculator */
    const BUSINESS_WHATSAPP = '1234567890'; // Your WhatsApp number (country code, no + or spaces)

    const priceConfig = {
      reels: { perVideo: 149, label: 'Reels' },
      youtube: { perVideo: 249, label: 'YouTube' },
      commercial: { perVideo: 399, label: 'Commercial' }
    };

    const volumeDiscounts = [
      { min: 25, rate: 0.22 },
      { min: 16, rate: 0.18 },
      { min: 8, rate: 0.12 },
      { min: 4, rate: 0.08 }
    ];

    const addonPrices = {
      color: { label: 'Cinematic color grade', price: 75 },
      motion: { label: 'Motion graphics', price: 100 },
      sound: { label: 'Sound design', price: 60 },
      subtitles: { label: 'Subtitles & captions', price: 40 },
      rush: { label: 'Priority turnaround', price: 100 },
      organize: { label: 'Footage organization', price: 35 }
    };

    const revisionPrices = { 2: 0, 5: 50, unlimited: 120 };
    const revisionLabels = { 2: '2 revisions', 5: '5 revisions', unlimited: 'Unlimited revisions' };

    let currentType = 'reels';
    const monthlyVideos = document.getElementById('monthlyVideos');
    const monthlyVideosValue = document.getElementById('monthlyVideosValue');
    const clientName = document.getElementById('clientName');
    const clientWhatsapp = document.getElementById('clientWhatsapp');
    const referenceLink = document.getElementById('referenceLink');
    const revisionSelect = document.getElementById('revisionSelect');
    const estimatePrice = document.getElementById('estimatePrice');
    const estimatePlan = document.getElementById('estimatePlan');
    const estimateBreakdown = document.getElementById('estimateBreakdown');
    const estimateVideos = document.getElementById('estimateVideos');
    const estimateRevisions = document.getElementById('estimateRevisions');
    const estimateCta = document.getElementById('estimateCta');
    const typePills = document.querySelectorAll('.type-pill');
    const addonInputs = document.querySelectorAll('.addon-chip input');

    function getVolumeDiscount(count) {
      const tier = volumeDiscounts.find((t) => count >= t.min);
      return tier ? tier.rate : 0;
    }

    function formatMonthly(count) {
      return count === 1 ? '1 video / month' : `${count} videos / month`;
    }

    function calculatePrice() {
      const cfg = priceConfig[currentType];
      const count = parseInt(monthlyVideos.value, 10);
      const revisionKey = revisionSelect.value;
      const subtotal = cfg.perVideo * count;
      const discountRate = getVolumeDiscount(count);
      const discountAmount = Math.round(subtotal * discountRate);
      let total = subtotal - discountAmount;
      const breakdown = [{
        label: `${count} × ${cfg.label} @ $${cfg.perVideo}`,
        amount: subtotal
      }];

      if (discountAmount > 0) {
        breakdown.push({
          label: `Volume discount (${Math.round(discountRate * 100)}%)`,
          amount: -discountAmount
        });
      }

      const revCost = revisionPrices[revisionKey];
      if (revCost > 0) {
        total += revCost;
        breakdown.push({ label: `${revisionLabels[revisionKey]} / mo`, amount: revCost });
      }

      addonInputs.forEach((input) => {
        if (input.checked) {
          const addon = addonPrices[input.value];
          total += addon.price;
          breakdown.push({ label: `${addon.label} / mo`, amount: addon.price });
        }
      });

      return { total, breakdown, count, revisionKey, discountRate };
    }

    function buildWhatsAppLink() {
      const cfg = priceConfig[currentType];
      const { total, count } = calculatePrice();
      const name = clientName.value.trim() || 'Not provided';
      const whatsapp = clientWhatsapp.value.trim() || 'Not provided';
      const reference = referenceLink.value.trim() || 'Not provided';
      const addons = [...addonInputs].filter((i) => i.checked).map((i) => addonPrices[i.value].label).join(', ') || 'None';

      const message =
        `Hi Abi! I'd like a monthly editing quote.\n\n` +
        `Name: ${name}\n` +
        `WhatsApp: ${whatsapp}\n` +
        `Reference: ${reference}\n\n` +
        `Project: ${cfg.label}\n` +
        `Monthly videos: ${count}\n` +
        `Revisions: ${revisionLabels[revisionSelect.value]}\n` +
        `Add-ons: ${addons}\n` +
        `Estimated budget: $${total}/month\n\n` +
        `Please confirm the final price. Thank you!`;

      return `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(message)}`;
    }

    function renderEstimate(animate = true) {
      const cfg = priceConfig[currentType];
      const { total, breakdown, count, revisionKey } = calculatePrice();

      estimatePlan.textContent = `${count} ${cfg.label} / month`;
      estimateVideos.textContent = formatMonthly(count);
      estimateRevisions.textContent = revisionLabels[revisionKey];

      estimateBreakdown.innerHTML = breakdown
        .map((item) => {
          const amount = item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`;
          return `<li><span>${item.label}</span><strong>${amount}</strong></li>`;
        })
        .join('');

      if (animate && typeof gsap !== 'undefined') {
        gsap.fromTo(estimatePrice, { scale: 0.92, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' });
      }
      estimatePrice.textContent = `$${total.toLocaleString()}`;
      estimateCta.href = buildWhatsAppLink();
    }

    if (monthlyVideos) {
      typePills.forEach((pill) => {
        pill.addEventListener('click', () => {
          typePills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          currentType = pill.dataset.type;
          renderEstimate();
        });
      });

      monthlyVideos.addEventListener('input', () => {
        monthlyVideosValue.textContent = formatMonthly(parseInt(monthlyVideos.value, 10));
        renderEstimate();
      });

      revisionSelect.addEventListener('change', () => renderEstimate());
      addonInputs.forEach((input) => input.addEventListener('change', () => renderEstimate()));
      [clientName, clientWhatsapp, referenceLink].forEach((el) => {
        el.addEventListener('input', () => { estimateCta.href = buildWhatsAppLink(); });
      });

      estimateCta.addEventListener('click', (e) => {
        if (!clientName.value.trim()) {
          e.preventDefault();
          clientName.focus();
          clientName.classList.add('input-error');
          setTimeout(() => clientName.classList.remove('input-error'), 2000);
        }
      });

      monthlyVideosValue.textContent = formatMonthly(parseInt(monthlyVideos.value, 10));
      renderEstimate(false);
    }

    /* Footer social stagger */
    gsap.from('.social-links a', {
      opacity: 0,
      y: 20,
      scale: 0.8,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.footer-bottom',
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });

    /* Smooth anchor offset for fixed nav */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = 100;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
});
