function DecryptedTextEl(config) {
      const {
        text,
        speed = 50,
        sequential = true,
        revealDirection = 'start',
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
        className = '',
        parentClassName = '',
        encryptedClassName = '',
      } = config;

      let displayText = ''; // start empty
      let revealedIndices = new Set();
      let interval = null;
      let hasAnimated = false;
      let isScrambling = false;

      const wrapper = document.createElement('span');
      wrapper.className = parentClassName;

      const visible = document.createElement('span');
      visible.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(visible);

      const availableChars = characters.split('');

      function shuffleText(originalText, currentRevealed) {
        return originalText.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (currentRevealed.has(i)) return ch;
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        }).join('');
      }

      function getNextIndex(revealedSet) {
        const len = text.length;
        switch (revealDirection) {
          case 'end':
            return len - 1 - revealedSet.size;
          case 'center': {
            const mid = Math.floor(len / 2);
            const offset = Math.floor(revealedSet.size / 2);
            const next = revealedSet.size % 2 === 0 ? mid + offset : mid - offset - 1;
            if (next >= 0 && next < len && !revealedSet.has(next)) return next;
            for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i;
            return 0;
          }
          default:
            return revealedSet.size;
        }
      }

      function render() {
        visible.innerHTML = '';
        displayText.split('').forEach((ch, idx) => {
          const span = document.createElement('span');
          const revealed = revealedIndices.has(idx);
          span.textContent = ch;
          span.className = revealed ? className : encryptedClassName;
          visible.appendChild(span);
        });
      }

      function startDecryption() {
        if (hasAnimated || isScrambling) return;
        isScrambling = true;

        displayText = shuffleText(text, revealedIndices);
        render();

        interval = setInterval(() => {
          const nextIndex = getNextIndex(revealedIndices);
          revealedIndices.add(nextIndex);
          
          displayText = shuffleText(text, revealedIndices);
          render();

          if (revealedIndices.size >= text.length) {
            clearInterval(interval);
            displayText = text;
            render();
            isScrambling = false;
            hasAnimated = true;
          }
        }, speed);
      }

      // Observe when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startDecryption();
            observer.unobserve(wrapper);
          }
        });
      }, { threshold: 0.3 });

      // Initial scrambled preview (optional)
      displayText = shuffleText(text, revealedIndices);
      render();

      observer.observe(wrapper);
      return wrapper;
    }

    // Example usage
    const root = document.getElementById('decrypted-root');
    const decryptedLine1 = DecryptedTextEl({
      text: "Current Waipahu High School Senior",
      speed: 80,
      sequential: true,
      revealDirection: "start", // try "end" or "center" too!
      className: "revealed",
      parentClassName: "all-letters",
      encryptedClassName: "encrypted",
      root: document.getElementById("line1")
    });

    const decryptedLine2 = DecryptedTextEl({
      text: "\nof the Immortal Lions C/O 2026",
      speed: 80,
      sequential: true,
      revealDirection: "start", // try "end" or "center" too!
      className: "revealed",
      parentClassName: "all-letters",
      encryptedClassName: "encrypted",
      root: document.getElementById("line2")
    });

    root.appendChild(decryptedLine1);
    root.appendChild(decryptedLine2);