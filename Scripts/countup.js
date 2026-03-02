(function () {
    // Minimal, robust CountUp port — no libraries required.
    function getDecimalPlaces(num) {
      const s = String(num);
      if (s.includes('.')) {
        const dec = s.split('.')[1];
        if (parseInt(dec, 10) !== 0) return dec.length;
      }
      return 0;
    }

    function formatWithSeparator(value, maxDecimals, separator) {
      const hasDecimals = maxDecimals > 0;
      const options = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0
      };
      const formatted = new Intl.NumberFormat('en-US', options).format(value);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    }

    function initCountUp(el, opts = {}) {
      if (!el) throw new Error('initCountUp: target element is required');

      const {
        from = 0,
        to,
        direction = 'up',
        delay = 0,
        duration = 2,
        separator = '',
        startWhen = true,
        onStart,
        onEnd
      } = opts;

      if (typeof to === 'undefined') throw new Error('initCountUp: "to" option is required');

      // Accessibility
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('role', 'status');

      const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));
      const format = (v) => formatWithSeparator(v, maxDecimals, separator);

      // initial display
      el.textContent = format(direction === 'down' ? to : from);

      // spring-ish parameters (close to original)
      const damping = 20 + 40 * (1 / Math.max(0.0001, duration));
      const stiffness = 100 * (1 / Math.max(0.0001, duration));

      // spring state
      let x = direction === 'down' ? to : from;
      let v = 0;
      let target = direction === 'down' ? from : to;

      let rafId = null;
      let lastTs = null;

      function write(value) {
        el.textContent = format(value);
      }

      function step(ts) {
        if (lastTs === null) lastTs = ts;
        const dt = Math.min(0.032, (ts - lastTs) / 1000);
        lastTs = ts;

        const a = -stiffness * (x - target) - damping * v;
        v += a * dt;
        x += v * dt;

        write(x);

        const settled = Math.abs(x - target) < Math.pow(10, -Math.max(0, maxDecimals)) && Math.abs(v) < 0.005;
        if (!settled) {
          rafId = requestAnimationFrame(step);
        } else {
          write(target);
          cancelAnimationFrame(rafId);
          rafId = null;
          lastTs = null;
        }
      }

      // Start logic with IntersectionObserver (startWhen true) or immediately
      let io = null;
      let inView = !startWhen;
      if (startWhen && 'IntersectionObserver' in window) {
        io = new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              inView = true;
              try { io.disconnect(); } catch (e) {}
              scheduleStart();
              break;
            }
          }
        }, { threshold: 0 });
        io.observe(el);
      } else if (startWhen) {
        // fallback: treat as visible
        inView = true;
      }

      let startTimeout = null;
      let endTimeout = null;
      let started = false;

      function scheduleStart() {
        if (!inView || started) return;
        started = true;
        if (typeof onStart === 'function') { try { onStart(); } catch (e) {} }
        startTimeout = setTimeout(() => {
          target = direction === 'down' ? from : to;
          lastTs = null;
          rafId = requestAnimationFrame(step);
        }, Math.max(0, delay) * 1000);

        if (typeof onEnd === 'function') {
          endTimeout = setTimeout(() => { try { onEnd(); } catch (e) {} }, (Math.max(0, delay) + Math.max(0, duration)) * 1000);
        }
      }

      if (!startWhen) scheduleStart();

      function destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        if (io) try { io.disconnect(); } catch (e) {}
        if (startTimeout) clearTimeout(startTimeout);
        if (endTimeout) clearTimeout(endTimeout);
        try { el.removeAttribute('aria-live'); el.removeAttribute('role'); } catch (e) {}
      }

      return { destroy, trigger: scheduleStart, setValueNow: (val) => { x = val; v = 0; write(x); } };
    }

    // Auto-init any element with data-countup
    document.addEventListener('DOMContentLoaded', () => {
      const nodes = document.querySelectorAll('[data-countup]');
      nodes.forEach((el) => {
        const data = el.dataset;
        const to = data.to !== undefined ? Number(data.to) : undefined;
        if (typeof to === 'undefined' || Number.isNaN(to)) {
          console.warn('countup: skip element without valid data-to', el);
          return;
        }
        const from = data.from !== undefined ? Number(data.from) : 0;
        const direction = data.direction || (to < from ? 'down' : 'up');
        const duration = data.duration !== undefined ? Number(data.duration) : 2;
        const delay = data.delay !== undefined ? Number(data.delay) : 0;
        const separator = data.separator !== undefined ? data.separator : '';
        const startWhen = data.startwhen !== undefined ? (data.startwhen === 'true') : true;

        try {
          // store controller if needed (el.__countupController)
          el.__countupController = initCountUp(el, {
            from,
            to,
            direction,
            delay,
            duration,
            separator,
            startWhen,
            onEnd: () => {
              const label = document.getElementById("service-text");
              if (label) label.style.opacity = 1;
            }
          });
        } catch (e) {
          console.error('countup: init failed', e);
        }
      });
    });

    // expose for manual usage
    window.initCountUp = initCountUp;
    console.info('countup standalone loaded');
  })();