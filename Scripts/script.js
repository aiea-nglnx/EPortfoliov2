window.onload = function () {
  const wordInputEl = document.getElementById("IAm");

  const iAmWords = ["Marauder", "Leader", "Troubleshooter", "Storyteller", "Designer"];
  
  let iAmIndex = 0;
  let charIndex = 0;

  function typeWords() {
    // Clear text if starting a new word
    if (charIndex == 0) {
      wordInputEl.textContent = "";
    }

    // Type 1 character at a time
    if (charIndex < iAmWords[iAmIndex].length) {
      wordInputEl.textContent += iAmWords[iAmIndex].charAt(charIndex);
    }
    
    charIndex++;

    // If done typing, wait then move to next word
    if (charIndex >= Math.max(iAmWords[iAmIndex].length)) {
      setTimeout(() => {
        iAmIndex = (iAmIndex + 1) % iAmWords.length;
        charIndex = 0;
        typeWords();
      }, 1500); // Pause before next word
    } else {
      setTimeout(typeWords, 100); // Type next character
    }
  }
  typeWords();
};