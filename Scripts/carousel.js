const items = Array.from(document.querySelectorAll('.carousel-item'));
const total = items.length;
let current = 0;            // index of front image
const intervalMs = 3000;    // time between moves

const words = [
  "01 Experience",
  "02 Participation",
  "03 Partnership"
];

const pillEl = document.getElementById('focus-pills');

function updateCarousel() {
  items.forEach((item, index) => {
    // distance from current, wrapped in a circle
    let offset = (index - current + total) % total;

    if (offset === 0) {
      // front
      item.style.opacity = '1';
      item.style.filter = 'none';
      item.style.transform = 'translateX(0px) scale(1)';
      item.style.zIndex = 3;
    } else if (offset === 1) {
      // next behind
      item.style.opacity = '0.7';
      item.style.filter = 'brightness(0.9)';
      item.style.transform = 'translateX(25%) scale(0.95)';
      item.style.zIndex = 2;
    } else if (offset === 2) {
      // second next behind
      item.style.opacity = '0.6';
      item.style.filter = 'brightness(0.8)';
      item.style.transform = 'translateX(-25%) scale(0.9)';
      item.style.zIndex = 1;
    } else {
      // everything else hidden
      item.style.opacity = '0';
      item.style.transform = 'translateX(0px) scale(0.8)';
      item.style.zIndex = 0;
    }
  });

  // Update the word
  pillEl.textContent = words[current] || "";
}

function goNext() {
  current = (current + 1) % total;   // circular move
  updateCarousel();
}

// autoplay
updateCarousel();
setInterval(goNext, intervalMs);

