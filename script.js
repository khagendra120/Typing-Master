 // Keyboard layout and mappings
    const nepaliKeyboardLayout = [
      ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
      ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
      ['प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व'],
      ['श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ', '।', '्', 'र्']
    ];
    const romanMap = {
      k: 'क', kh: 'ख', g: 'ग', gh: 'घ', ng: 'ङ',
      c: 'च', ch: 'छ', j: 'ज', jh: 'झ', ny: 'ञ',
      t: 'ट', th: 'ठ', d: 'ड', dh: 'ढ', n: 'ण',
      tt: 'त', tth: 'थ', dd: 'द', ddh: 'ध', nn: 'न',
      p: 'प', ph: 'फ', b: 'ब', bh: 'भ', m: 'म',
      y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व',
      sh: 'श', ssh: 'ष', s: 'स', h: 'ह',
      ksh: 'क्ष', tr: 'त्र', gy: 'ज्ञ', '.': '।', ' ': ' '
    };

    const englishQuotes = [
      "The quick brown fox jumps over the lazy dog.",
      "Programming is the art of telling a computer what to do.",
      "Practice makes perfect, especially in typing.",
      "Speed and accuracy are the keys to mastery.",
      "Keep your eyes on the screen and your fingers on the keys.",
      "Typing is a skill that opens many digital doors.",
      "Consistency beats intensity when learning to type fast.",
      "Every expert was once a beginner.",
      "Focus on form, speed will follow.",
      "Learn to touch type and unlock your productivity."
    ];

    const nepaliWords = [
      "कर्जा", "बचत", "ऋण", "सदस्य", "जमानत", "व्याज", "लेखा", "शाखा",
      "निवेश", "पुँजी", "सभा", "साझेदारी", "समिति", "वित्त", "लाभांश",
      "निर्णय", "सुरक्षा", "पढाइ", "सजिलो", "समय", "अनुशासन", "कार्य",
      "कम्प्युटर", "तालिका", "संचालन", "पुस्तक", "शिक्षा", "परिश्रम",
      "नेपाल", "काठमाडौं", "हिमाल", "नदी", "जंगल", "गाउँ", "सहर", "बिद्यालय",
      "अध्ययन", "परीक्षा", "सफा", "राम्रो", "नराम्रो", "सिप", "कला", "संगीत",
      "स्वतन्त्रता", "प्रजातन्त्र", "राजनीति", "अर्थतन्त्र", "समाज", "संस्कृति",
      "परम्परा", "आधुनिकता", "प्रविधि", "विज्ञान", "गणित", "भाषा"
    ];

    const keyboardLayout = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    // State Variables
    let currentMode = 'english';
    let selectedTime = 60;
    let timeLeft = selectedTime;
    let timerId = null;
    let started = false;

    let quote = "";
    let typed = "";
    let errors = 0;
    let currentIndex = 0;

    let nepaliCurrentWordIndex = 0;
    let nepaliCorrectWords = 0;
    let nepaliTotalTyped = 0;
    let nepaliUsedWords = [];
    let nepaliTestWords = [];

    const quoteText = document.getElementById("quote-text");
    const wordDisplay = document.getElementById("wordDisplay");
    const nepaliInput = document.getElementById("nepali-input");
    const wpmDisplay = document.getElementById("wpm");
    const accDisplay = document.getElementById("accuracy");
    const timeDisplay = document.getElementById("time");
    const timerDisplay = document.getElementById("timerDisplay");
    const progressBar = document.getElementById("progress-bar");
    const testArea = document.getElementById("test-area");
    const results = document.getElementById("results");
    const cursor = document.querySelector(".cursor");

    // Initialize English keyboard UI
    function initKeyboard() {
      keyboardLayout.forEach((row, i) => {
        const rowEl = document.getElementById(`row-${i}`);
        if (rowEl) {
          rowEl.innerHTML = '';
          row.forEach(key => {
            const keyEl = document.createElement('div');
            keyEl.classList.add('key');
            keyEl.textContent = key;
            keyEl.id = `key-${key}`;
            rowEl.appendChild(keyEl);
          });
        }
      });
    }

    // Initialize Nepali keyboard UI
    function initNepaliKeyboard() {
      nepaliKeyboardLayout.forEach((row, idx) => {
        const rowEl = document.getElementById(`nk-${idx}`);
        if (!rowEl) return;
        rowEl.innerHTML = '';
        row.forEach(ch => {
          const k = document.createElement('div');
          k.className = 'nk-key';
          k.textContent = ch;
          k.dataset.char = ch;
          rowEl.appendChild(k);
        });
        if (idx === 3) {
          const sp = document.createElement('div');
          sp.className = 'nk-key space';
          sp.textContent = 'Space';
          rowEl.appendChild(sp);
        }
      });
    }

    // Set focus to hidden Nepali input to keep capturing keys
    function focusHiddenInput() {
      const hi = document.getElementById('nepali-hidden-input');
      if (!hi) return;
      hi.focus();
      hi.addEventListener('blur', () => setTimeout(() => hi.focus(), 10));
    }

    // Convert romanized input to Devanagari script
    function romanToDev(s) {
      let out = '', buf = '';
      for (let i = 0; i < s.length; i++) {
        buf += s[i];
        if (romanMap[buf]) {
          out += romanMap[buf];
          buf = '';
        }
      }
      if (buf && romanMap[buf[0]]) out += romanMap[buf[0]];
      return out;
    }

    // Generate English quotes based on selected time duration
    function generateEnglishQuote() {
      let numQuotes = 1;
      if (selectedTime > 60) numQuotes = 5;
      else if (selectedTime > 30) numQuotes = 3;
      else if (selectedTime > 15) numQuotes = 2;

      quote = "";
      for (let i = 0; i < numQuotes; i++) {
        const randomQuote = englishQuotes[Math.floor(Math.random() * englishQuotes.length)];
        quote += randomQuote + " ";
      }
      quote = quote.trim();
      renderEnglishQuote();
    }

    // Render English quote spans
    function renderEnglishQuote() {
      quoteText.innerHTML = '';
      for (const char of quote) {
        const span = document.createElement('span');
        span.textContent = char;
        span.classList.add('char', 'untyped');
        quoteText.appendChild(span);
      }
      quoteText.appendChild(cursor);
    }

    // Generate Nepali words for test
    function generateNepaliWords() {
      nepaliTestWords = [];
      nepaliUsedWords = [];
      wordDisplay.innerHTML = "";

      while (nepaliTestWords.length < 50 && nepaliUsedWords.length < nepaliWords.length) {
        let randomWord;
        do {
          randomWord = nepaliWords[Math.floor(Math.random() * nepaliWords.length)];
        } while (nepaliUsedWords.includes(randomWord) && nepaliUsedWords.length < nepaliWords.length);

        if (!nepaliUsedWords.includes(randomWord)) {
          nepaliUsedWords.push(randomWord);
          nepaliTestWords.push(randomWord);

          const span = document.createElement("span");
          span.textContent = randomWord;
          span.classList.add("word");
          if (nepaliTestWords.length === 1) span.classList.add("current");
          wordDisplay.appendChild(span);
        }
      }
    }

    // Reset test variables and UI
    function resetTest() {
      if (timerId) clearInterval(timerId);
      timerId = null;
      started = false;
      timeLeft = selectedTime;

      typed = "";
      errors = 0;
      currentIndex = 0;

      nepaliCurrentWordIndex = 0;
      nepaliCorrectWords = 0;
      nepaliTotalTyped = 0;

      timeDisplay.textContent = timeLeft;
      timerDisplay.textContent = `⏳ Time left: ${timeLeft}s`;
      timerDisplay.style.display = currentMode === 'nepali' ? 'block' : 'none';

      wpmDisplay.textContent = "0";
      accDisplay.textContent = "100%";
      progressBar.style.width = "0%";
      results.textContent = "";

      nepaliInput.value = "";
      nepaliInput.disabled = false;

      if (cursor) cursor.style.display = 'inline-block';

      if (currentMode === 'english') {
        generateEnglishQuote();
      } else {
        generateNepaliWords();
        nepaliInput.style.display = 'block';
        focusHiddenInput();
      }
    }

    // Start countdown timer
    function startTimer() {
      if (timerId) clearInterval(timerId);
      timeLeft = selectedTime;

      timerId = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        timerDisplay.textContent = `⏳ Time left: ${timeLeft}s`;
        updateStats();
        if (timeLeft <= 0) {
          endTest();
        }
      }, 1000);
    }

    // Update stats for WPM and accuracy
    function updateStats() {
      const elapsed = selectedTime - timeLeft;
      if (elapsed === 0) return;

      let wpm = 0;
      let accuracy = 100;

      if (currentMode === 'english') {
        const wordsTyped = typed.trim().split(' ').filter(w => w.length > 0).length;
        wpm = Math.round((wordsTyped / elapsed) * 60);
        accuracy = typed.length > 0 ? Math.round(((typed.length - errors) / typed.length) * 100) : 100;
      } else {
        wpm = Math.round((nepaliCorrectWords / elapsed) * 60);
        accuracy = nepaliTotalTyped > 0 ? Math.round((nepaliCorrectWords / nepaliTotalTyped) * 100) : 100;
      }

      wpmDisplay.textContent = wpm;
      accDisplay.textContent = `${accuracy}%`;
    }

    // Update progress bar UI
    function updateProgressBar() {
      let progress = 0;
      if (currentMode === 'english') {
        progress = (currentIndex / quote.length) * 100;
      } else {
        progress = (nepaliCurrentWordIndex / nepaliTestWords.length) * 100;
      }
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    // Handle English typing input (keydown)
    function handleKeyDown(event) {
      if (currentMode !== 'english') return;

      if (event.ctrlKey || event.altKey || event.metaKey) return;

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        if (started && currentIndex > 0) handleBackspace();
        return;
      }

      if (event.key.length !== 1) return;

      if (!started) {
        started = true;
        startTimer();
      }
      if (currentIndex < quote.length) {
        event.preventDefault();
        typeChar(event.key);
      }
    }

    // Process typed character in English mode
    function typeChar(key) {
      const chars = quoteText.querySelectorAll('.char');
      const expectedChar = quote[currentIndex];

      highlightKey(expectedChar);
      setTimeout(() => unhighlightKey(expectedChar), 150);

      if (key === expectedChar) {
        chars[currentIndex].classList.remove('untyped');
        chars[currentIndex].classList.add('correct');
        typed += key;
      } else {
        chars[currentIndex].classList.remove('untyped');
        chars[currentIndex].classList.add('incorrect');
        errors++;
        const keyEl = document.getElementById(`key-${expectedChar.toLowerCase()}`);
        if(keyEl) keyEl.classList.add('incorrect');
      }
      currentIndex++;
      updateStats();
      updateProgressBar();

      if (currentIndex >= quote.length) {
        endTest();
      }
    }

    // Handle backspace in English mode
    function handleBackspace() {
      if (currentIndex === 0) return;
      currentIndex--;
      const chars = quoteText.querySelectorAll('.char');
      const expectedChar = quote[currentIndex];

      chars[currentIndex].classList.remove('correct', 'incorrect');
      chars[currentIndex].classList.add('untyped');

      const lastTypedChar = typed[typed.length - 1];
      if(lastTypedChar !== expectedChar) {
        errors--;
      }
      typed = typed.slice(0, -1);

      updateStats();
      updateProgressBar();
    }

    // Handle Nepali input on hidden input box (for romanized typing)
    function handleNepaliInput(event) {
      if (currentMode !== 'nepali') return;

      if (!started) {
        started = true;
        startTimer();
      }

      if (event.inputType === 'insertText' || event.inputType === 'insertCompositionText') {
        const hiddenInput = event.target;
        const rawInput = hiddenInput.value;
        hiddenInput.value = '';
        const devInput = romanToDev(rawInput);
        // Append to the visible nepali input field text to allow user control
        nepaliInput.value += devInput;
        highlightNextNepaliKey();
      }

      if (event.inputType === 'insertParagraph' || event.key === ' ') {
        // On space or Enter, check the typed word
        const typedWord = nepaliInput.value.trim();
        const spans = wordDisplay.querySelectorAll('.word');

        if (spans[nepaliCurrentWordIndex]) {
          if (typedWord === spans[nepaliCurrentWordIndex].textContent) {
            spans[nepaliCurrentWordIndex].classList.add('correct');
            nepaliCorrectWords++;
          } else {
            spans[nepaliCurrentWordIndex].classList.add('wrong');
          }
          spans[nepaliCurrentWordIndex].classList.remove('current');
        }
        nepaliTotalTyped++;
        nepaliCurrentWordIndex++;
        nepaliInput.value = '';

        if (nepaliCurrentWordIndex < spans.length) {
          spans[nepaliCurrentWordIndex].classList.add('current');
          highlightNextNepaliKey();
        }

        updateStats();
        updateProgressBar();

        if (nepaliCurrentWordIndex >= spans.length) {
          endTest();
        }
      }
    }

    // Highlight the next Nepali key on the virtual keyboard
    function highlightNextNepaliKey() {
      // Clear previous highlights
      document.querySelectorAll('.nk-key').forEach(k => k.classList.remove('active', 'wrong'));

      const spans = wordDisplay.querySelectorAll('.word');
      if (nepaliCurrentWordIndex >= spans.length) return;
      const targetWord = spans[nepaliCurrentWordIndex].textContent;
      const typed = nepaliInput.value;
      const nextChar = targetWord.charAt(typed.length);
      if (!nextChar) return;

      const el = document.querySelector(`.nk-key[data-char="${nextChar}"]`);
      if(el) el.classList.add('active');
    }

    // Highlight key in English virtual keyboard
    function highlightKey(key) {
      const keyEl = document.getElementById(`key-${key.toLowerCase()}`);
      if (keyEl) keyEl.classList.add('active');
    }

    // Un-highlight key in English virtual keyboard
    function unhighlightKey(key) {
      const keyEl = document.getElementById(`key-${key.toLowerCase()}`);
      if (keyEl) {
        keyEl.classList.remove('active');
        setTimeout(() => {
          if(keyEl.classList.contains('incorrect')) {
            keyEl.classList.remove('incorrect');
          }
        }, 200);
      }
    }

    // End the typing test and show results
    function endTest() {
      if (timerId) clearInterval(timerId);
      timerId = null;
      started = false;

      if (cursor) cursor.style.display = 'none';
      nepaliInput.disabled = true;

      let wpm = 0, accuracy = 100, correctCount = 0, wrongCount = 0;

      if(currentMode === 'english'){
        const words = typed.trim().split(' ').filter(w => w.length > 0).length;
        wpm = Math.round((words / selectedTime) * 60);
        accuracy = typed.length > 0 ? Math.round(((typed.length - errors) / typed.length) * 100) : 100;
        correctCount = typed.length - errors;
        wrongCount = errors;
      } else {
        wpm = Math.round((nepaliCorrectWords / selectedTime) * 60);
        accuracy = nepaliTotalTyped > 0 ? Math.round((nepaliCorrectWords / nepaliTotalTyped) * 100) : 100;
        correctCount = nepaliCorrectWords;
        wrongCount = nepaliTotalTyped - nepaliCorrectWords;
      }

      wpmDisplay.textContent = wpm;
      accDisplay.textContent = `${accuracy}%`;

      results.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong>Test Complete! 🎉</strong>
        </div>
        <div>
          ✅ Correct: ${correctCount} | ❌ Wrong: ${wrongCount} | 
          🎯 Accuracy: ${accuracy}% | ⌨️ WPM: ${wpm} | 
          ⏱️ Time: ${selectedTime}s
        </div>
      `;

      setTimeout(() => {
        const message = currentMode === 'english'
          ? `English Test Complete!\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${selectedTime}s`
          : `नेपाली टेस्ट समाप्त!\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${selectedTime}s`;
        alert(message);
      }, 100);
    }

    // Restart test - reset and generate fresh content
    function restartTest() {
      resetTest();
      if (currentMode === 'english') {
        document.addEventListener('keydown', handleKeyDown);
      } else {
        nepaliInput.style.display = 'block';
        nepaliInput.focus();
      }
    }

    // Switch language mode and update UI
    function switchLanguage(lang) {
      currentMode = lang;
      const body = document.body;

      results.innerHTML = "";
      errors = 0;

      if (lang === 'nepali') {
        body.className = 'nepali-mode nepali';
        quoteText.innerHTML = '';
        nepaliInput.style.display = 'block';
        focusHiddenInput();
      } else {
        body.className = 'english-mode';
        wordDisplay.innerHTML = '';
        nepaliInput.value = '';
        nepaliInput.style.display = 'none';
      }
      resetTest();
      generateContent();
    }

    // Generate content based on current language selection
    function generateContent() {
      if (currentMode === 'english') {
        generateEnglishQuote();
      } else {
        generateNepaliWords();
      }
    }

    // Setup event listeners for language buttons
    function setupLanguageButtons() {
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-lang');
          switchLanguage(lang);
          document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    // Setup event listeners for time buttons
    function setupTimeButtons() {
      document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedTime = parseInt(btn.getAttribute('data-time'));
          document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          resetTest();
        });
      });
    }

    // Initialize on window load
    window.onload = () => {
      initKeyboard();
      initNepaliKeyboard();
      setupLanguageButtons();
      setupTimeButtons();
      generateContent();

      document.addEventListener('keydown', handleKeyDown);
      const nepaliHiddenInput = document.getElementById('nepali-hidden-input');
      nepaliHiddenInput.addEventListener('input', handleNepaliInput);

      document.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          if (currentMode === 'nepali' && !nepaliInput.disabled) {
            nepaliInput.focus();
          }
        }
      });

      testArea.addEventListener('contextmenu', e => e.preventDefault());

      nepaliInput.addEventListener('blur', () => {
        if (currentMode === 'nepali' && started && !nepaliInput.disabled) {
          setTimeout(() => nepaliInput.focus(), 10);
        }
      });

      focusHiddenInput();
    };