document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.4 });

  // Find ALL sections and observe them
  document.querySelectorAll('.definition-section, .role-section').forEach(section => {
    observer.observe(section);
  });
});