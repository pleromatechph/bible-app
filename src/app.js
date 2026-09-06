// Complete 66 Bible Books Data
const bibleData = [
  { book: "Genesis", chapters: 50 }, { book: "Exodus", chapters: 40 },
  { book: "Leviticus", chapters: 27 }, { book: "Numbers", chapters: 36 },
  { book: "Deuteronomy", chapters: 34 }, { book: "Joshua", chapters: 24 },
  { book: "Judges", chapters: 21 }, { book: "Ruth", chapters: 4 },
  { book: "1 Samuel", chapters: 31 }, { book: "2 Samuel", chapters: 24 },
  { book: "1 Kings", chapters: 22 }, { book: "2 Kings", chapters: 25 },
  { book: "1 Chronicles", chapters: 29 }, { book: "2 Chronicles", chapters: 36 },
  { book: "Ezra", chapters: 10 }, { book: "Nehemiah", chapters: 13 },
  { book: "Esther", chapters: 10 }, { book: "Job", chapters: 42 },
  { book: "Psalms", chapters: 150 }, { book: "Proverbs", chapters: 31 },
  { book: "Ecclesiastes", chapters: 12 }, { book: "Song of Solomon", chapters: 8 },
  { book: "Isaiah", chapters: 66 }, { book: "Jeremiah", chapters: 52 },
  { book: "Lamentations", chapters: 5 }, { book: "Ezekiel", chapters: 48 },
  { book: "Daniel", chapters: 12 }, { book: "Hosea", chapters: 14 },
  { book: "Joel", chapters: 3 }, { book: "Amos", chapters: 9 },
  { book: "Obadiah", chapters: 1 }, { book: "Jonah", chapters: 4 },
  { book: "Micah", chapters: 7 }, { book: "Nahum", chapters: 3 },
  { book: "Habakkuk", chapters: 3 }, { book: "Zephaniah", chapters: 3 },
  { book: "Haggai", chapters: 2 }, { book: "Zechariah", chapters: 14 },
  { book: "Malachi", chapters: 4 }, { book: "Matthew", chapters: 28 },
  { book: "Mark", chapters: 16 }, { book: "Luke", chapters: 24 },
  { book: "John", chapters: 21 }, { book: "Acts", chapters: 28 },
  { book: "Romans", chapters: 16 }, { book: "1 Corinthians", chapters: 16 },
  { book: "2 Corinthians", chapters: 13 }, { book: "Galatians", chapters: 6 },
  { book: "Ephesians", chapters: 6 }, { book: "Philippians", chapters: 4 },
  { book: "Colossians", chapters: 4 }, { book: "1 Thessalonians", chapters: 5 },
  { book: "2 Thessalonians", chapters: 3 }, { book: "1 Timothy", chapters: 6 },
  { book: "2 Timothy", chapters: 4 }, { book: "Titus", chapters: 3 },
  { book: "Philemon", chapters: 1 }, { book: "Hebrews", chapters: 13 },
  { book: "James", chapters: 5 }, { book: "1 Peter", chapters: 5 },
  { book: "2 Peter", chapters: 3 }, { book: "1 John", chapters: 5 },
  { book: "2 John", chapters: 1 }, { book: "3 John", chapters: 1 },
  { book: "Jude", chapters: 1 }, { book: "Revelation", chapters: 22 }
];

// LAST READ MEMORY RESTORATION
const savedLastBookName = localStorage.getItem('sog_last_read_book');
const savedLastChapterNum = parseInt(localStorage.getItem('sog_last_read_chapter') || '1', 10);
let selectedBook = bibleData.find(b => b.book === savedLastBookName) || bibleData[0];
let selectedChapter = savedLastChapterNum;

// TRANSLATION STATE
const savedVersion = localStorage.getItem('sog_active_version');
let currentVersion = savedVersion || "NIV + Audio";
let pendingResetAction = null;
let activeDashboardTab = 'started';
let db = null;
let SQL = null;

// AUDIO SPEED STATE
const speedRates = [1.0, 1.25, 1.5, 1.75, 2.0, 0.75];
const savedSpeedIndex = parseInt(localStorage.getItem('sog_audio_speed_index') || '0', 10);
let currentSpeedIndex = (savedSpeedIndex >= 0 && savedSpeedIndex < speedRates.length) ? savedSpeedIndex : 0;

let initialPreviewNoteText = "";
let initialActionNoteText = "";

const SVG_DOWNLOAD_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
const SVG_TRASH_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

// DOM Elements
const navReaderBtn = document.getElementById('navReaderBtn');
const navMoreBtn = document.getElementById('navMoreBtn');
const dashboardView = document.getElementById('dashboardView');
const readerView = document.getElementById('readerView');
const miniAudioPlayer = document.getElementById('miniAudioPlayer');
const miniProgressFill = document.getElementById('miniProgressFill');
const minimizeReaderBtn = document.getElementById('minimizeReaderBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const settingsSheetModal = document.getElementById('settingsSheetModal');
const profileSheetModal = document.getElementById('profileSheetModal');
const offlineLibraryModal = document.getElementById('offlineLibraryModal');
const versionSheetModal = document.getElementById('versionSheetModal');
const fontSizeSheetModal = document.getElementById('fontSizeSheetModal');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeSettingsSheetBtn = document.getElementById('closeSettingsSheetBtn');
const closeProfileSheetBtn = document.getElementById('closeProfileSheetBtn');
const closeOfflineLibraryBtn = document.getElementById('closeOfflineLibraryBtn');
const closeVersionSheetBtn = document.getElementById('closeVersionSheetBtn');
const closeFeedbackSheetBtn = document.getElementById('closeFeedbackSheetBtn');
const feedbackSheetModal = document.getElementById('feedbackSheetModal');
const openFeedbackOption = document.getElementById('openFeedbackOption');
const openOfflineLibraryOption = document.getElementById('openOfflineLibraryOption');
const openProfileOption = document.getElementById('openProfileOption');
const versionBadgeBtn = document.getElementById('versionBadgeBtn');
const currentVersionLabel = document.getElementById('currentVersionLabel');
const openDownloadsCard = document.getElementById('openDownloadsCard');
const readingContainer = document.getElementById('readingContainer');
const bookTabBtn = document.getElementById('bookTabBtn');
const chapterTabBtn = document.getElementById('chapterTabBtn');
const selectBookChapterBtn = document.getElementById('selectBookChapterBtn');
const selectionModal = document.getElementById('selectionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const audioElement = document.getElementById('audioElement');
const playBtn = document.getElementById('playBtn');
const readerMiniPlayBtn = document.getElementById('readerMiniPlayBtn');
const speedBtn = document.getElementById('speedBtn');
const skipBackBtn = document.getElementById('skipBackBtn');
const skipForwardBtn = document.getElementById('skipForwardBtn');
const downloadAudioBtn = document.getElementById('downloadAudioBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeText = document.getElementById('currentTimeText');
const durationText = document.getElementById('durationText');
const readerOptionsBtn = document.getElementById('readerOptionsBtn');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const readerAudioDeck = document.getElementById('readerAudioDeck');
const readerMiniPlayer = document.getElementById('readerMiniPlayer');
const readerMaxPlayer = document.getElementById('readerMaxPlayer');
const minimizeMaxDeckBtn = document.getElementById('minimizeMaxDeckBtn');
const readerMiniProgressFill = document.getElementById('readerMiniProgressFill');

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function clearVerseHighlights() {
  try {
    document.querySelectorAll('.verse-item.selected-highlight').forEach(el => {
      el.classList.remove('selected-highlight');
    });
  } catch (e) {
    console.warn("Clear highlights safe exit:", e);
  }
}

function formatVerseRangeNumbers(verseNumbers) {
  if (!verseNumbers || verseNumbers.length === 0) return '';
  const sorted = [...verseNumbers].map(Number).sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
}

function copyTextToClipboard(textToCopy, successCallback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (successCallback) successCallback();
    }).catch(() => {
      fallbackCopyText(textToCopy, successCallback);
    });
  } else {
    fallbackCopyText(textToCopy, successCallback);
  }
}

function fallbackCopyText(textToCopy, successCallback) {
  const textArea = document.createElement("textarea");
  textArea.value = textToCopy;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful && successCallback) successCallback();
  } catch (err) {
    console.error("Fallback copy failed:", err);
  }
  document.body.removeChild(textArea);
}

// 0. SQL.js Initialization
if (typeof initSqlJs !== 'undefined') {
  initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  }).then(sql => {
    SQL = sql;
    loadDatabase(currentVersion);
  }).catch(err => console.error("SQL.js init error:", err));
}

async function loadDatabase(versionCode) {
  try {
    const cleanCode = versionCode === 'NIV + Audio' ? 'NIV' : versionCode;
    const selectedItem = availableTranslations.find(t => t.code === versionCode || t.code === cleanCode) || { file: `niv.sqlite3` };
    const fileName = selectedItem.file || `niv.sqlite3`;
    const dbPath = `./db/${fileName}`;
    let arrayBuffer;

    if ('caches' in window) {
      const cache = await caches.open(DB_CACHE_NAME);
      const cachedResponse = await cache.match(dbPath);
      if (cachedResponse) {
        arrayBuffer = await cachedResponse.arrayBuffer();
      } else {
        const response = await fetch(dbPath);
        if (!response.ok) throw new Error(`Database ${dbPath} not found`);
        await cache.put(dbPath, response.clone());
        arrayBuffer = await response.arrayBuffer();
      }
    } else {
      const response = await fetch(dbPath);
      if (!response.ok) throw new Error(`Database ${dbPath} not found`);
      arrayBuffer = await response.arrayBuffer();
    }

    const uInt8Array = new Uint8Array(arrayBuffer);
    if (db) db.close();
    db = new SQL.Database(uInt8Array);
    loadChapterVerses(selectedBook.book, selectedChapter);
  } catch (error) {
    console.error("Error loading SQLite DB:", error);
  }
}

function loadChapterVerses(bookName, chapterNum) {
  if (!db) return;
  const versesList = document.getElementById('versesList');
  const readingContainer = document.getElementById('readingContainer');
  if (!versesList) return;

  versesList.innerHTML = '';
  if (readingContainer) readingContainer.scrollTop = 0;

  try {
    let tableName = 'verses';
    const tablesStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND (name = 'verses' OR name LIKE '%verse%');");
    if (tablesStmt.step()) {
      tableName = tablesStmt.getAsObject().name;
    }
    tablesStmt.free();

    const bookIndex = bibleData.findIndex(b => b.book.toLowerCase() === bookName.toLowerCase()) + 1;
    const cleanBookName = bookName.toLowerCase().replace(/\s+/g, '');
    const shortPrefix = cleanBookName.substring(0, 3);
    const bookAliases = getBookAliases(bookName);

    const stmt = db.prepare(`SELECT * FROM ${tableName}`);

    let verseCount = 0;
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const rawBookVal = String(row.book !== undefined ? row.book : (row.book_number !== undefined ? row.book_number : (row.book_id !== undefined ? row.book_id : ''))).toLowerCase().trim().replace(/\s+/g, '');

      // Universal matching strategy: checks exact match, alias, book index, or prefix match
      const isBookMatch = rawBookVal === cleanBookName ||
                          rawBookVal === String(bookIndex) ||
                          parseInt(rawBookVal, 10) === bookIndex ||
                          bookAliases.includes(rawBookVal) ||
                          (shortPrefix.length >= 2 && rawBookVal.startsWith(shortPrefix));

      if (!isBookMatch) continue;

      let currentChap = row.chapter !== undefined ? row.chapter : row.chapter_number;
      let currentVerse = row.verse !== undefined ? row.verse : row.verse_number;

      if (typeof row.verse === 'number' && row.chapter === undefined) {
        const parts = row.verse.toFixed(3).split('.');
        currentChap = parseInt(parts[0], 10);
        currentVerse = parseInt(parts[1], 10);
      }

      if (String(currentChap) === String(chapterNum)) {
        let rawText = row.unformatted !== undefined ? row.unformatted : (row.text !== undefined ? row.text : (row.verse_text !== undefined ? row.verse_text : row.content));
        let textVal = '';

        if (rawText instanceof Uint8Array || (typeof rawText === 'object' && rawText !== null && typeof rawText.length === 'number')) {
          try {
            const bytes = rawText instanceof Uint8Array ? rawText : new Uint8Array(Object.values(rawText));
            textVal = new TextDecoder('utf-8').decode(bytes);
          } catch (e) {
            textVal = '';
          }
        } else if (typeof rawText === 'string') {
          if (/^(\d{1,3},){3,}\d{1,3}$/.test(rawText.trim())) {
            const byteArray = new Uint8Array(rawText.split(',').map(Number));
            try {
              textVal = new TextDecoder('utf-8').decode(byteArray);
            } catch (e) {
              textVal = rawText;
            }
          } else {
            textVal = rawText;
          }
        } else {
          textVal = String(rawText || '');
        }

        textVal = textVal.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '').trim();
        let formattedContent = '';

        if (textVal.includes('\n')) {
          const lines = textVal.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          const headerLines = [];
          let contentLines = [];

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const hasSentencePunctuation = ['.', ',', ';', ':', '?', '!', '—', '“', '”', '"'].some(p => line.includes(p));
            const words = line.split(/\s+/);
            const capitalizedWords = words.filter(w => /^[A-Z0-9]/.test(w));
            const isTitleCase = words.length > 0 && (capitalizedWords.length / words.length) >= 0.6;
            const isHeaderLength = line.length <= 60;

            if (!hasSentencePunctuation && isHeaderLength && isTitleCase && i < lines.length - 1) {
              headerLines.push(line);
            } else {
              contentLines = lines.slice(i);
              break;
            }
          }

          if (headerLines.length > 0 && contentLines.length > 0) {
            headerLines.forEach(hText => {
              const headerDiv = document.createElement('div');
              headerDiv.className = 'main-section-header';
              headerDiv.textContent = hText;
              versesList.appendChild(headerDiv);
            });
            const verseTextPart = contentLines.join('<br>');
            formattedContent = `<span class="verse-num">${currentVerse}</span> ${verseTextPart}`;
          } else {
            formattedContent = `<span class="verse-num">${currentVerse}</span> ${textVal.replace(/\n/g, '<br>')}`;
          }
        } else {
          formattedContent = `<span class="verse-num">${currentVerse}</span> ${textVal}`;
        }

        const p = document.createElement('p');
        const isFav = isVerseFavorite(selectedBook.book, selectedChapter, currentVerse);
        const hasNote = hasVerseNote(selectedBook.book, selectedChapter, currentVerse);
        let statusClass = '';

        if (isFav) {
          statusClass = 'has-favorite';
        } else if (hasNote) {
          statusClass = 'has-note-only';
        }

        p.className = `verse-item ${statusClass}`;
        p.id = `v${currentVerse}`;
        p.setAttribute('data-verse', currentVerse);
        p.innerHTML = formattedContent;
        attachVerseInteractions(p, selectedBook.book, selectedChapter, currentVerse);

        p.addEventListener('click', (e) => {
          if (e.target.classList.contains('verse-num') || e.target.closest('.verse-num')) {
            e.stopPropagation();
            const cleanText = p.innerText.replace(/^\d+\s*/, '').trim();
            const notes = getVerseNotes();
            const noteId = `note_${selectedBook.book}_${selectedChapter}_${currentVerse}`;
            const existingNote = notes[noteId] ? (typeof notes[noteId] === 'object' ? notes[noteId].text : notes[noteId]) : "";
            openNotePreviewSheet(`${selectedBook.book}_${selectedChapter}_${currentVerse}`, selectedBook.book, selectedChapter, currentVerse, cleanText, existingNote);
          }
        });

        versesList.appendChild(p);
        verseCount++;
      }
    }
    stmt.free();

    if (verseCount === 0) {
      versesList.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--icon-neutral);">No verses found for ${bookName} ${chapterNum} in ${currentVersion}.</p>`;
    }
  } catch (err) {
    console.error("Error querying database:", err);
    versesList.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--danger-color);">Error loading text for ${currentVersion}.</p>`;
  }
}

// DIRECT HEADER THEME SWITCHER ENGINE
function applyAppTheme(themeName) {
  const isDark = (themeName === 'theme-dark' || themeName === 'dark-theme');
  const validTheme = isDark ? 'theme-dark' : 'theme-light';
  
  document.body.classList.remove('theme-light', 'theme-dark', 'light-theme', 'dark-theme');
  document.body.classList.add(validTheme);
  localStorage.setItem('sog_active_theme', validTheme);

  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    refreshIcons();
  }
}

function getBookAbbreviation(bookName) {
  const cleanName = bookName.trim();
  const parts = cleanName.split(' ');
  if (parts.length > 1 && !isNaN(parts[0])) {
    return `${parts[0]}${parts[1].substring(0, 2).toUpperCase()}`;
  }
  return cleanName.substring(0, 3).toUpperCase();
}

function getBookAliases(bookName) {
  const clean = bookName.toLowerCase().replace(/\s+/g, '');
  const aliases = [clean];
  if (clean === 'psalms') aliases.push('psalm', 'psa', 'ps');
  if (clean === '1kings') aliases.push('1ki', '1kgs', '1king');
  if (clean === '2kings') aliases.push('2ki', '2kgs', '2king');
  if (clean === 'james') aliases.push('jas', 'jm');
  return aliases;
}

function getBookAliases(bookName) {
  const clean = bookName.toLowerCase().replace(/\s+/g, '');
  const aliases = [clean];
  if (clean === 'psalms') aliases.push('psalm', 'psa', 'ps');
  if (clean === '1kings') aliases.push('1ki', '1kgs', '1king');
  if (clean === '2kings') aliases.push('2ki', '2kgs', '2king');
  if (clean === 'james') aliases.push('jas', 'jm');
  return aliases;
}

// Header Quick Toggle Button
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('sog_active_theme') || 'theme-light';
    const isDark = (currentTheme === 'theme-dark' || currentTheme === 'dark-theme');
    const newTheme = isDark ? 'theme-light' : 'theme-dark';
    applyAppTheme(newTheme);
  });
}

const savedTheme = localStorage.getItem('sog_active_theme') || 'theme-light';
applyAppTheme(savedTheme);

// Theme Modal Selection Listeners
const themeSheetModal = document.getElementById('themeSheetModal');
const closeThemeSheetBtn = document.getElementById('closeThemeSheetBtn');

if (closeThemeSheetBtn) {
  closeThemeSheetBtn.addEventListener('click', () => {
    closeSubSheetToSettings(themeSheetModal);
  });
}

document.querySelectorAll('.theme-item-card').forEach(card => {
  card.addEventListener('click', () => {
    const themeVal = card.getAttribute('data-theme-val');
    if (themeVal) {
      applyAppTheme(themeVal);
      closeSubSheetToSettings(themeSheetModal);
    }
  });
});

if (drawerOverlay) {
  drawerOverlay.addEventListener('click', () => {
    closeAllModals();
    resetDashboardTabToStarted();
  });
}

// Navigation Controls
if (navReaderBtn) navReaderBtn.addEventListener('click', openReaderView);

if (navMoreBtn) {
  navMoreBtn.addEventListener('click', () => {
    closeAllModals();
    if (settingsSheetModal) settingsSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

function openReaderView() {
  setActiveNav(navReaderBtn);
  if (miniAudioPlayer) miniAudioPlayer.style.display = 'none';
  if (readerView) {
    readerView.classList.remove('slide-out-down');
    readerView.classList.add('open', 'slide-in-up');
  }
}

if (minimizeReaderBtn) {
  minimizeReaderBtn.addEventListener('click', () => {
    clearVerseHighlights();
    if (readerView) {
      readerView.classList.remove('slide-in-up');
      readerView.classList.add('slide-out-down');
    }
    setActiveNav(null);
    if (dashboardView) dashboardView.classList.add('active');
    setTimeout(() => {
      if (readerView) {
        readerView.classList.remove('open', 'slide-out-down');
      }
      closeAllModals();
      resetDashboardTabToStarted();
      if (audioElement && audioElement.src && currentVersion === 'NIV + Audio') {
        if (miniAudioPlayer) miniAudioPlayer.style.display = 'flex';
      }
    }, 280);
  });
}

function resetDashboardTabToStarted() {
  activeDashboardTab = 'started';
  const tabStarted = document.getElementById('tabBtnStarted');
  const tabFinished = document.getElementById('tabBtnFinished');
  if (tabStarted) tabStarted.classList.add('active');
  if (tabFinished) tabFinished.classList.remove('active');
  renderDashboardBooks();
}

function setActiveNav(btn) {
  [navReaderBtn, navMoreBtn].forEach(b => {
    if (b) b.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
}

// Sheets & Modals Close Handlers
const closeNotePreviewSheetBtn = document.getElementById('closeNotePreviewSheetBtn');
const notePreviewSheetModal = document.getElementById('notePreviewSheetModal');
const closeDonateSheetBtnRef = document.getElementById('closeDonateSheetBtn');
const closeFavoritesSheetBtnRef = document.getElementById('closeFavoritesSheetBtn');
const closeVerseActionSheetBtnRef = document.getElementById('closeVerseActionSheetBtn');
let openedFromSettings = false;

function closeSubSheetToSettings(currentModalEl) {
  if (currentModalEl) currentModalEl.classList.remove('open');
  if (openedFromSettings) {
    if (settingsSheetModal) settingsSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  } else {
    closeAllModals();
    resetDashboardTabToStarted();
  }
}

if (closeNotePreviewSheetBtn) {
  closeNotePreviewSheetBtn.addEventListener('click', () => {
    const editContainer = document.getElementById('noteEditViewContainer');
    const previewInput = document.getElementById('previewNoteInput');
    const currentVal = previewInput ? previewInput.value.trim() : '';
    const isEditMode = editContainer && (editContainer.style.display === 'flex' || editContainer.style.display === 'block');
    const hasUnsavedEdits = currentVal !== initialPreviewNoteText.trim();

    const executeClose = () => {
      if (notePreviewSheetModal) notePreviewSheetModal.classList.remove('open');
      if (drawerOverlay) drawerOverlay.classList.remove('open');
    };

    if (isEditMode && hasUnsavedEdits) {
      showInAppConfirmModal(
        "Discard Unsaved Note?",
        "You have unsaved edits in your note. Do you want to leave without saving?",
        () => { executeClose(); },
        "Keep Editing",
        "Discard"
      );
    } else {
      executeClose();
    }
  });
}

[closeSettingsSheetBtn, closeVersionSheetBtn].forEach(el => {
  if (el) el.addEventListener('click', () => {
    openedFromSettings = false;
    closeAllModals();
    resetDashboardTabToStarted();
  });
});

if (closeVerseActionSheetBtnRef) {
  closeVerseActionSheetBtnRef.addEventListener('click', (e) => {
    e.stopPropagation();
    handleVerseActionSheetClose();
  });
}

if (closeOfflineLibraryBtn) {
  closeOfflineLibraryBtn.addEventListener('click', () => closeSubSheetToSettings(offlineLibraryModal));
}

if (closeProfileSheetBtn) {
  closeProfileSheetBtn.addEventListener('click', () => closeSubSheetToSettings(profileSheetModal));
}

if (closeFeedbackSheetBtn) {
  closeFeedbackSheetBtn.addEventListener('click', () => closeSubSheetToSettings(feedbackSheetModal));
}

function closeAllModals() {
  const donateModal = document.getElementById('donateSheetModal');
  const favsModal = document.getElementById('favoritesSheetModal');
  const verseActModal = document.getElementById('verseActionSheetModal');
  [
    settingsSheetModal, profileSheetModal, offlineLibraryModal, versionSheetModal,
    fontSizeSheetModal, selectionModal, feedbackSheetModal, favsModal,
    donateModal, verseActModal, notePreviewSheetModal, drawerOverlay
  ].forEach(m => {
    if (m) m.classList.remove('open');
  });
}

if (openProfileOption) {
  openProfileOption.addEventListener('click', () => {
    openedFromSettings = true;
    closeAllModals();
    loadProfileAndAccountState();
    if (profileSheetModal) profileSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

let activeDownloadManagerTab = 'audio';

function openDownloadManagerSheet() {
  closeAllModals();
  activeDownloadManagerTab = 'audio';
  const audioDownloadTabBtn = document.getElementById('audioDownloadTabBtn');
  const transDownloadTabBtn = document.getElementById('transDownloadTabBtn');

  if (audioDownloadTabBtn) audioDownloadTabBtn.classList.add('active');
  if (transDownloadTabBtn) transDownloadTabBtn.classList.remove('active');
  if (offlineLibraryModal) offlineLibraryModal.classList.add('open');
  if (drawerOverlay) drawerOverlay.classList.add('open');

  renderDownloadManagerContent();
}

if (downloadAudioBtn) {
  downloadAudioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDownloadManagerSheet();
  });
}

if (openOfflineLibraryOption) {
  openOfflineLibraryOption.addEventListener('click', () => {
    openedFromSettings = true;
    openDownloadManagerSheet();
  });
}

if (openDownloadsCard) {
  openDownloadsCard.addEventListener('click', () => {
    openDownloadManagerSheet();
  });
}

const audioDownloadTabBtn = document.getElementById('audioDownloadTabBtn');
const transDownloadTabBtn = document.getElementById('transDownloadTabBtn');

if (audioDownloadTabBtn) {
  audioDownloadTabBtn.addEventListener('click', () => {
    activeDownloadManagerTab = 'audio';
    audioDownloadTabBtn.classList.add('active');
    if (transDownloadTabBtn) transDownloadTabBtn.classList.remove('active');
    renderDownloadManagerContent();
  });
}

if (transDownloadTabBtn) {
  transDownloadTabBtn.addEventListener('click', () => {
    activeDownloadManagerTab = 'translations';
    transDownloadTabBtn.classList.add('active');
    if (audioDownloadTabBtn) audioDownloadTabBtn.classList.remove('active');
    renderDownloadManagerContent();
  });
}

const activeDownloadControllers = {};
const audioBookSizes = {
  "Genesis": "98.4 MB", "Exodus": "78.2 MB", "Leviticus": "52.8 MB", "Numbers": "70.5 MB",
  "Deuteronomy": "66.3 MB", "Joshua": "46.8 MB", "Judges": "41.2 MB", "Ruth": "7.8 MB",
  "1 Samuel": "60.4 MB", "2 Samuel": "47.1 MB", "1 Kings": "55.6 MB", "2 Kings": "25.4 MB",
  "1 Chronicles": "29.8 MB", "2 Chronicles": "71.3 MB", "Ezra": "19.5 MB", "Nehemiah": "25.4 MB",
  "Esther": "19.8 MB", "Job": "82.1 MB", "Psalms": "294.5 MB", "Proverbs": "60.8 MB",
  "Ecclesiastes": "23.4 MB", "Song of Solomon": "8.8 MB", "Isaiah": "129.8 MB", "Jeremiah": "135.2 MB",
  "Lamentations": "12.8 MB", "Ezekiel": "118.6 MB", "Daniel": "32.4 MB", "Hosea": "27.5 MB",
  "Joel": "5.9 MB", "Amos": "17.6 MB", "Obadiah": "2.1 MB", "Jonah": "7.8 MB",
  "Micah": "13.7 MB", "Nahum": "5.9 MB", "Habakkuk": "5.9 MB", "Zephaniah": "5.9 MB",
  "Haggai": "3.9 MB", "Zechariah": "27.5 MB", "Malachi": "7.8 MB", "Matthew": "54.8 MB",
  "Mark": "31.3 MB", "Luke": "56.8 MB", "John": "41.1 MB", "Acts": "54.8 MB",
  "Romans": "31.3 MB", "1 Corinthians": "31.3 MB", "2 Corinthians": "25.4 MB", "Galatians": "11.8 MB",
  "Ephesians": "11.8 MB", "Philippians": "4.0 MB", "Colossians": "7.8 MB", "1 Thessalonians": "9.8 MB",
  "2 Thessalonians": "5.9 MB", "1 Timothy": "11.8 MB", "2 Timothy": "7.8 MB", "Titus": "5.9 MB",
  "Philemon": "2.1 MB", "Hebrews": "25.4 MB", "James": "9.8 MB", "1 Peter": "9.8 MB",
  "2 Peter": "5.9 MB", "1 John": "9.8 MB", "2 John": "2.1 MB", "3 John": "2.1 MB",
  "Jude": "2.1 MB", "Revelation": "43.1 MB"
};

window.filterAudioBooksList = function() {
  const input = document.getElementById('audioSearchInput');
  const countHeader = document.getElementById('audioBooksHeaderCount');
  if (!input) return;
  const query = input.value.toLowerCase().trim();
  const rows = document.querySelectorAll('.audio-book-row-item');
  let visibleCount = 0;

  rows.forEach(row => {
    const bookName = row.getAttribute('data-book-name') || '';
    if (bookName.includes(query)) {
      row.style.display = 'flex';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  if (countHeader) {
    countHeader.textContent = query ? `Audio Books (${visibleCount} found)` : `Audio Books (${bibleData.length})`;
  }
};

function renderDownloadManagerContent() {
  const container = document.getElementById('downloadManagerBody');
  if (!container) return;
  container.innerHTML = '';

  if (activeDownloadManagerTab === 'audio') {
    let html = `
      <div class="dl-search-input-wrapper">
        <i data-lucide="search" class="dl-search-icon"></i>
        <input type="text" id="audioSearchInput" class="dl-search-input" placeholder="Search audio books..." oninput="filterAudioBooksList()" />
      </div>
      <div id="audioBooksHeaderCount" style="font-weight: 700; font-size: 0.88rem; margin-bottom: 10px; color: var(--text-color);">
        Audio Books (${bibleData.length})
      </div>
      <div id="scrollableAudioBooksList" style="display: flex; flex-direction: column; gap: 6px;">
    `;
    bibleData.forEach(b => {
      const formattedKey = b.book.replace(/\s+/g, '_');
      const sizeStr = audioBookSizes[b.book] ? ` (${audioBookSizes[b.book]})` : '';
      html += `
        <div class="font-option-item audio-book-row-item" data-book-name="${b.book.toLowerCase()}" id="bookAudioRow_${formattedKey}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 10px;">
          <div style="display: flex; flex-direction: column; flex: 1;">
            <span style="font-weight: 700; font-size: 0.9rem;">${b.book}</span>
            <span class="audio-status-sub" id="audioSub_${formattedKey}" style="font-size: 0.72rem; color: var(--icon-neutral);">${b.chapters} Chapters Audio Track${sizeStr}</span>
          </div>
          <div class="audio-book-action-slot" id="audioSlot_${formattedKey}">
            <button class="download-action-btn" onclick="triggerBookAudioDownload('${b.book}')">
              ${SVG_DOWNLOAD_ICON}
            </button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
    checkAllBooksAudioStatus();
  } else {
    const validTranslations = availableTranslations.filter(item => {
      const fileName = item.file || `${item.code.toLowerCase()}.sqlite3`;
      return availableDbFiles.includes(fileName) || item.default;
    });

    validTranslations.forEach(item => {
      const isNiv = item.code === 'NIV + Audio' || item.code === 'NIV';
      const div = document.createElement('div');
      div.className = 'font-option-item';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.id = `transRow_${item.code.replace(/[^a-zA-Z0-9]/g, '')}`;
      div.innerHTML = `
        <div style="display: flex; flex-direction: column; flex: 1;">
          <span style="font-weight: 600; font-size: 0.9rem;">${item.name}</span>
          <span class="trans-status-label" style="font-size: 0.72rem; color: var(--icon-neutral);">
            ${item.default ? 'Default' : 'Available for Download'}
          </span>
        </div>
        <div class="trans-action-slot">
          ${isNiv ? '' : `<button class="download-action-btn download-trans-btn" title="Download Database">${SVG_DOWNLOAD_ICON}</button>`}
        </div>
      `;
      container.appendChild(div);
    });
    updateDownloadedTranslationsState(validTranslations);
  }
}

async function updateDownloadedTranslationsState(validTranslations) {
  const installedVersions = await getDownloadedVersions();
  const downloadedRows = [];
  const notDownloadedRows = [];

  validTranslations.forEach(item => {
    const isInstalled = installedVersions.includes(item.code);
    const isNiv = item.code === 'NIV + Audio' || item.code === 'NIV';
    const rowEl = document.getElementById(`transRow_${item.code.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (!rowEl) return;

    const labelEl = rowEl.querySelector('.trans-status-label');
    const slotEl = rowEl.querySelector('.trans-action-slot');

    if (labelEl) {
      labelEl.textContent = item.default ? 'Default' : (isInstalled ? 'Installed' : 'Available for Download');
    }

    if (slotEl && !isNiv) {
      if (isInstalled) {
        slotEl.innerHTML = `<button class="icon-btn delete-trans-btn" style="color: var(--danger-color); padding: 6px;" title="Delete Database">${SVG_TRASH_ICON}</button>`;
        const deleteBtn = slotEl.querySelector('.delete-trans-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async () => {
            await deleteVersionDatabase(item);
          });
        }
      } else {
        slotEl.innerHTML = `<button class="download-action-btn download-trans-btn" title="Download Database">${SVG_DOWNLOAD_ICON}</button>`;
        const downloadBtn = slotEl.querySelector('.download-trans-btn');
        if (downloadBtn) {
          downloadBtn.addEventListener('click', async () => {
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon" style="width: 18px; height: 18px;"></i>`;
            refreshIcons();
            await handleVersionSelection(item, false);
            renderDownloadManagerContent();
          });
        }
      }
    }

    if (isInstalled || item.default) {
      downloadedRows.push(rowEl);
    } else {
      notDownloadedRows.push(rowEl);
    }
  });

  const container = document.getElementById('downloadManagerBody');
  if (container) {
    downloadedRows.forEach(row => container.appendChild(row));
    notDownloadedRows.forEach(row => container.appendChild(row));
  }

  refreshIcons();
}

async function checkAllBooksAudioStatus() {
  try {
    if (!('caches' in window)) return;
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const requests = await cache.keys();
    const cachedUrls = new Set(requests.map(req => req.url));

    const NEW_TESTAMENT_BOOKS = [
      "matthew", "mark", "luke", "john", "acts", "romans", "1 corinthians", "2 corinthians",
      "galatians", "ephesians", "philippians", "colossians", "1 thessalonians", "2 thessalonians",
      "1 timothy", "2 timothy", "titus", "philemon", "hebrews", "james", "1 peter", "2 peter",
      "1 john", "2 john", "3 john", "jude", "revelation"
    ];

    const downloadedRows = [];
    const notDownloadedRows = [];

    for (const b of bibleData) {
      const formattedKey = b.book.replace(/\s+/g, '_');
      const slot = document.getElementById(`audioSlot_${formattedKey}`);
      const subLabel = document.getElementById(`audioSub_${formattedKey}`);
      const rowEl = document.getElementById(`bookAudioRow_${formattedKey}`);
      if (!slot) continue;

      const isNT = NEW_TESTAMENT_BOOKS.includes(b.book.toLowerCase());
      const formattedBook = b.book.toLowerCase().replace(/\s+/g, '_');
      const sizeStr = audioBookSizes[b.book] ? ` (${audioBookSizes[b.book]})` : '';
      let downloadedCount = 0;

      for (let ch = 1; ch <= b.chapters; ch++) {
        const formattedChapter = String(ch).padStart(2, '0');
        const fileName = `${formattedBook}_chapter_${formattedChapter}.mp3`;
        const url = getAudioStreamUrl(isNT, fileName);
        if (cachedUrls.has(url)) downloadedCount++;
      }

      if (activeDownloadControllers[formattedKey]) continue;

      if (downloadedCount === b.chapters) {
        if (subLabel) {
          subLabel.textContent = `${b.chapters}/${b.chapters} Chapters (Downloaded)${sizeStr}`;
          subLabel.style.color = 'var(--icon-neutral)';
        }
        slot.innerHTML = `
          <button class="icon-btn delete-audio-book-btn" onclick="deleteBookAudioDownload('${b.book}')" style="color: var(--danger-color); padding: 6px;" title="Delete Offline Audio">
            ${SVG_TRASH_ICON}
          </button>
        `;
        if (rowEl) downloadedRows.push(rowEl);
      } else if (downloadedCount > 0) {
        const pct = Math.round((downloadedCount / b.chapters) * 100);
        if (subLabel) {
          subLabel.textContent = `Downloaded ${downloadedCount}/${b.chapters} Chapters (${pct}%)${sizeStr}`;
          subLabel.style.color = 'var(--accent-blue)';
        }
        slot.innerHTML = `
          <button class="download-action-btn" onclick="triggerBookAudioDownload('${b.book}')" title="Resume Download">
            ${SVG_DOWNLOAD_ICON}
          </button>
        `;
        if (rowEl) downloadedRows.push(rowEl);
      } else {
        if (subLabel) {
          subLabel.textContent = `${b.chapters} Chapters Audio Track${sizeStr}`;
          subLabel.style.color = 'var(--icon-neutral)';
        }
        slot.innerHTML = `
          <button class="download-action-btn" onclick="triggerBookAudioDownload('${b.book}')">
            ${SVG_DOWNLOAD_ICON}
          </button>
        `;
        if (rowEl) notDownloadedRows.push(rowEl);
      }
    }

    const listContainer = document.getElementById('scrollableAudioBooksList');
    if (listContainer) {
      downloadedRows.forEach(row => listContainer.appendChild(row));
      notDownloadedRows.forEach(row => listContainer.appendChild(row));
    }
  } catch (err) {
    console.warn("Audio cache checking error safely caught:", err);
  }
}

window.triggerBookAudioDownload = async function(bookName) {
  const targetBookObj = bibleData.find(b => b.book === bookName);
  if (!targetBookObj || !('caches' in window)) return;

  const keyName = targetBookObj.book.replace(/\s+/g, '_');
  const slot = document.getElementById(`audioSlot_${keyName}`);
  const subLabel = document.getElementById(`audioSub_${keyName}`);
  if (!slot) return;

  const controller = new AbortController();
  activeDownloadControllers[keyName] = controller;

  slot.innerHTML = `
    <button class="download-action-btn downloading" onclick="cancelBookAudioDownload('${targetBookObj.book}')" title="Stop Download">
      <div class="download-stop-square"></div>
    </button>
  `;

  const NEW_TESTAMENT_BOOKS = [
    "matthew", "mark", "luke", "john", "acts", "romans", "1 corinthians", "2 corinthians",
    "galatians", "ephesians", "philippians", "colossians", "1 thessalonians", "2 thessalonians",
    "1 timothy", "2 timothy", "titus", "philemon", "hebrews", "james", "1 peter", "2 peter",
    "1 john", "2 john", "3 john", "jude", "revelation"
  ];
  const isNT = NEW_TESTAMENT_BOOKS.includes(targetBookObj.book.toLowerCase());
  const formattedBook = targetBookObj.book.toLowerCase().replace(/\s+/g, '_');

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    for (let ch = 1; ch <= targetBookObj.chapters; ch++) {
      if (controller.signal.aborted) break;
      const formattedChapter = String(ch).padStart(2, '0');
      const fileName = `${formattedBook}_chapter_${formattedChapter}.mp3`;
      const url = getAudioStreamUrl(isNT, fileName);
      const match = await cache.match(url);

      if (subLabel) {
        const pct = Math.round((ch / targetBookObj.chapters) * 100);
        subLabel.textContent = `Downloading ${ch}/${targetBookObj.chapters} Chapters (${pct}%)...`;
        subLabel.style.color = 'var(--accent-blue)';
      }

      if (!match) {
        const response = await fetch(url, { mode: 'no-cors', signal: controller.signal });
        await cache.put(url, response);
        await new Promise(r => setTimeout(r, 150));
      }
    }

    delete activeDownloadControllers[keyName];

    if (!controller.signal.aborted) {
      if (subLabel) {
        subLabel.textContent = `${targetBookObj.chapters}/${targetBookObj.chapters} Chapters (Downloaded)`;
        subLabel.style.color = 'var(--icon-neutral)';
      }
      slot.innerHTML = `
        <button class="icon-btn delete-audio-book-btn" onclick="deleteBookAudioDownload('${targetBookObj.book}')" style="color: var(--danger-color); padding: 6px;" title="Delete Offline Audio">
          ${SVG_TRASH_ICON}
        </button>
      `;
      showToast(`Downloaded all ${targetBookObj.chapters} chapters of ${targetBookObj.book}!`);
    } else {
      await checkAllBooksAudioStatus();
    }
  } catch (err) {
    delete activeDownloadControllers[keyName];
    if (err.name === 'AbortError') {
      showToast(`Download stopped for ${targetBookObj.book}`);
    } else {
      console.error("Detailed audio download error:", err);
      showToast(`Download interrupted`);
    }
    await checkAllBooksAudioStatus();
  }

  updateOfflineAudioMetrics();
  updateDisplay();
  refreshIcons();
};

window.cancelBookAudioDownload = function(bookName) {
  const keyName = bookName.replace(/\s+/g, '_');
  if (activeDownloadControllers[keyName]) {
    activeDownloadControllers[keyName].abort();
    delete activeDownloadControllers[keyName];
    showToast(`Stopping download...`);
  }
};

window.deleteBookAudioDownload = async function(bookName) {
  const targetBookObj = bibleData.find(b => b.book === bookName);
  if (!targetBookObj || !('caches' in window)) return;

  showInAppConfirmModal(
    `Delete ${bookName} Audio?`,
    `Are you sure you want to remove all offline audio files for ${bookName}?`,
    async () => {
      const NEW_TESTAMENT_BOOKS = [
        "matthew", "mark", "luke", "john", "acts", "romans", "1 corinthians", "2 corinthians",
        "galatians", "ephesians", "philippians", "colossians", "1 thessalonians", "2 thessalonians",
        "1 timothy", "2 timothy", "titus", "philemon", "hebrews", "james", "1 peter", "2 peter",
        "1 john", "2 john", "3 john", "jude", "revelation"
      ];
      const isNT = NEW_TESTAMENT_BOOKS.includes(targetBookObj.book.toLowerCase());
      const formattedBook = targetBookObj.book.toLowerCase().replace(/\s+/g, '_');
      const cache = await caches.open(AUDIO_CACHE_NAME);

      for (let ch = 1; ch <= targetBookObj.chapters; ch++) {
        const formattedChapter = String(ch).padStart(2, '0');
        const fileName = `${formattedBook}_chapter_${formattedChapter}.mp3`;
        const url = getAudioStreamUrl(isNT, fileName);
        await cache.delete(url);
      }

      showToast(`Deleted audio tracks for ${bookName}`);
      renderDownloadManagerContent();
      updateOfflineAudioMetrics();
      updateDisplay();
    },
    "Cancel",
    "Delete"
  );
};

if (openFeedbackOption) {
  openFeedbackOption.addEventListener('click', () => {
    openedFromSettings = true;
    closeAllModals();
    if (feedbackSheetModal) feedbackSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sendBtn = document.getElementById('sendFeedbackBtn');
    const email = document.getElementById('feedbackEmailInput').value.trim();
    const category = document.getElementById('feedbackCategorySelect').value;
    const message = document.getElementById('feedbackMessageInput').value.trim();

    if (!email || !message) return;

    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Submitting...';
    }

    try {
      const response = await fetch('https://formspree.io/f/xbjnqpkp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipient: 'pleromatechph@gmail.com',
          email: email,
          category: category,
          message: message,
          app_version: '1.0.0',
          current_translation: currentVersion
        })
      });

      if (response.ok || response.status === 200) {
        showToast("Thank you! Feedback sent directly to our team.");
        feedbackForm.reset();
        closeSubSheetToSettings(feedbackSheetModal);
      } else {
        throw new Error("Feedback delivery failed.");
      }
    } catch (err) {
      showToast("Feedback sent! Thank you for helping us improve Seed of Grace.");
      feedbackForm.reset();
      closeSubSheetToSettings(feedbackSheetModal);
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Submit Feedback';
      }
    }
  });
}

function loadProfileAndAccountState() {
  const userNameInput = document.getElementById('userNameInput');
  const accountStatusTitle = document.getElementById('accountStatusTitle');
  const accountStatusSub = document.getElementById('accountStatusSub');
  const accountStatusIcon = document.getElementById('accountStatusIcon');
  const userProfileAvatar = document.getElementById('userProfileAvatar');
  const googleBtnText = document.getElementById('googleBtnText');
  const googleSignInBtn = document.getElementById('googleSignInBtn');

  const savedName = localStorage.getItem('sog_user_name') || '';
  const savedEmail = localStorage.getItem('sog_user_email') || '';
  const savedAvatar = localStorage.getItem('sog_user_avatar') || '';

  if (userNameInput) userNameInput.value = savedName;

  if (savedEmail) {
    if (accountStatusTitle) accountStatusTitle.textContent = `Linked: ${savedEmail}`;
    if (accountStatusSub) accountStatusSub.textContent = 'Realtime Cloud Sync Active ☁️';
    if (savedAvatar && userProfileAvatar) {
      userProfileAvatar.src = savedAvatar;
      userProfileAvatar.style.display = 'block';
      if (accountStatusIcon) accountStatusIcon.style.display = 'none';
    } else if (accountStatusIcon) {
      accountStatusIcon.setAttribute('data-lucide', 'shield-check');
      accountStatusIcon.style.color = 'var(--accent-blue)';
      if (userProfileAvatar) userProfileAvatar.style.display = 'none';
    }
    if (googleBtnText) googleBtnText.textContent = 'Sign Out Google Account';
    if (googleSignInBtn) googleSignInBtn.style.color = 'var(--danger-color)';
  } else {
    if (accountStatusTitle) accountStatusTitle.textContent = 'Guest Account';
    if (accountStatusSub) accountStatusSub.textContent = 'Data stored locally on this device';
    if (userProfileAvatar) userProfileAvatar.style.display = 'none';
    if (accountStatusIcon) {
      accountStatusIcon.style.display = 'block';
      accountStatusIcon.setAttribute('data-lucide', 'shield-alert');
      accountStatusIcon.style.color = 'var(--icon-neutral)';
    }
    if (googleBtnText) googleBtnText.textContent = 'Sign in with Google Account';
    if (googleSignInBtn) googleSignInBtn.style.color = 'var(--text-color)';
  }
  refreshIcons();
}

const userNameInput = document.getElementById('userNameInput');
if (userNameInput) {
  userNameInput.addEventListener('input', () => {
    localStorage.setItem('sog_user_name', userNameInput.value.trim());
    renderUserGreetingBanner();
  });
}

function getStartedChapters() {
  const saved = localStorage.getItem('startedChapters');
  return saved ? JSON.parse(saved) : {};
}

function getBookTimestamps() {
  const saved = localStorage.getItem('sog_book_timestamps');
  return saved ? JSON.parse(saved) : {};
}

function updateBookTimestamp(bookName) {
  const timestamps = getBookTimestamps();
  timestamps[bookName] = Date.now();
  localStorage.setItem('sog_book_timestamps', JSON.stringify(timestamps));
}

function markChapterStarted(bookName, chNum) {
  const started = getStartedChapters();
  if (!started[bookName]) started[bookName] = [];
  if (!started[bookName].includes(chNum)) {
    started[bookName].push(chNum);
    localStorage.setItem('startedChapters', JSON.stringify(started));
  }
  updateBookTimestamp(bookName);
  updateDashboardMetrics();
}

function getFinishedChapters() {
  const saved = localStorage.getItem('finishedChapters');
  return saved ? JSON.parse(saved) : {};
}

function markChapterFinished(bookName, chNum) {
  const finished = getFinishedChapters();
  if (!finished[bookName]) finished[bookName] = [];
  if (!finished[bookName].includes(chNum)) {
    finished[bookName].push(chNum);
    localStorage.setItem('finishedChapters', JSON.stringify(finished));
  }
  updateBookTimestamp(bookName);
  updateDailyStreakOnRead();
  updateDashboardMetrics();
  syncLocalDataToCloud();
}

function renderDashboardBooks() {
  const container = document.getElementById('dashboardBooksContainer');
  if (!container) return;
  const started = getStartedChapters();
  const finished = getFinishedChapters();
  const timestamps = getBookTimestamps();

  container.innerHTML = '';
  const filteredBooks = bibleData.filter(b => {
    const startedList = started[b.book] || [];
    const finishedList = finished[b.book] || [];
    const isCompleted = finishedList.length === b.chapters;
    const isStarted = startedList.length > 0 && !isCompleted;
    if (activeDashboardTab === 'started') return isStarted;
    if (activeDashboardTab === 'finished') return isCompleted;
    return false;
  });

  filteredBooks.sort((a, b) => {
    const timeA = timestamps[a.book] || 0;
    const timeB = timestamps[b.book] || 0;
    return timeB - timeA;
  });

  const currentTab = activeDashboardTab || 'started';
  if (filteredBooks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: var(--icon-neutral); font-size: 0.88rem;">
        No ${currentTab} books yet.
      </div>
    `;
    return;
  }

  filteredBooks.forEach(b => {
    const doneList = finished[b.book] || [];
    const doneCount = doneList.length;
    const pct = Math.round((doneCount / b.chapters) * 100);
    const abbrev = getBookAbbreviation(b.book);

    const card = document.createElement('div');
    card.className = 'progress-card clickable-progress';
    card.innerHTML = `
      <div class="book-abbrev-box">${abbrev}</div>
      <div class="progress-details">
        <span class="progress-title">${b.book}</span>
        <span class="progress-subtitle">${doneCount} / ${b.chapters} Chapters</span>
        <span class="progress-percent-text">${pct}% Completed</span>
      </div>
      <i data-lucide="chevron-right" class="card-arrow"></i>
    `;
    card.addEventListener('click', () => {
      selectedBook = b;
      let nextCh = 1;
      for (let i = 1; i <= b.chapters; i++) {
        if (!doneList.includes(i)) {
          nextCh = i;
          break;
        }
      }
      selectedChapter = nextCh;
      updateDisplay();
      openReaderView();
    });
    container.appendChild(card);
  });
  refreshIcons();
}

const spiritualTaglines = [
  "Rooted in Faith, Growing in Grace", "Planted by Purpose, Flourishing in Christ",
  "Cultivating Faith, Nurturing Souls", "Deep Roots, Radiant Growth",
  "Sown in Love, Strong in the Lord", "From Small Seeds to Mighty Faith",
  "Nurturing Hearts to Blossom in Christ", "Anchored in Truth, Rising in Grace",
  "Grace Sown, Faith Grown", "Watered by the Word, Growing in the Light"
];

function calculateDailyStreak() {
  const lastReadDate = localStorage.getItem('sog_last_read_date');
  let currentStreak = parseInt(localStorage.getItem('sog_daily_streak') || '0', 10);
  const todayStr = new Date().toISOString().split('T')[0];

  if (!lastReadDate) return currentStreak;

  const lastDate = new Date(lastReadDate);
  const todayDate = new Date(todayStr);
  const diffTime = Math.abs(todayDate - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    currentStreak = 0;
    localStorage.setItem('sog_daily_streak', '0');
  }
  return currentStreak;
}

function updateDailyStreakOnRead() {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastReadDate = localStorage.getItem('sog_last_read_date');
  let currentStreak = parseInt(localStorage.getItem('sog_daily_streak') || '0', 10);

  if (lastReadDate !== todayStr) {
    if (!lastReadDate) {
      currentStreak = 1;
    } else {
      const lastDate = new Date(lastReadDate);
      const todayDate = new Date(todayStr);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    localStorage.setItem('sog_last_read_date', todayStr);
    localStorage.setItem('sog_daily_streak', currentStreak.toString());
  }
}

function updateDashboardMetrics() {
  const finished = getFinishedChapters();
  let totalDone = 0;
  let otDone = 0;
  let ntDone = 0;

  const otBooks = bibleData.slice(0, 39).map(b => b.book);
  const ntBooks = bibleData.slice(39).map(b => b.book);

  Object.keys(finished).forEach(b => {
    const count = finished[b].length;
    totalDone += count;
    if (otBooks.includes(b)) {
      otDone += count;
    } else if (ntBooks.includes(b)) {
      ntDone += count;
    }
  });

  const pctOverall = ((totalDone / 1189) * 100).toFixed(1);
  const pctOt = ((otDone / 929) * 100).toFixed(1);
  const pctNt = ((ntDone / 260) * 100).toFixed(1);
  const activeStreak = calculateDailyStreak();

  const overallSubVal = document.getElementById('overallSubVal');
  const glassFillOverall = document.getElementById('glassFillOverall');
  if (overallSubVal) overallSubVal.textContent = `${totalDone} / 1189 (${pctOverall}%)`;
  if (glassFillOverall) glassFillOverall.style.width = `${pctOverall}%`;

  const streakDaysVal = document.getElementById('streakDaysVal');
  if (streakDaysVal) streakDaysVal.textContent = `${activeStreak} ${activeStreak === 1 ? 'Day' : 'Days'}`;

  const otSubVal = document.getElementById('otSubVal');
  const glassFillOT = document.getElementById('glassFillOT');
  if (otSubVal) otSubVal.textContent = `${otDone} / 929 (${pctOt}%)`;
  if (glassFillOT) glassFillOT.style.width = `${pctOt}%`;

  const ntSubVal = document.getElementById('ntSubVal');
  const glassFillNT = document.getElementById('glassFillNT');
  if (ntSubVal) ntSubVal.textContent = `${ntDone} / 260 (${pctNt}%)`;
  if (glassFillNT) glassFillNT.style.width = `${pctNt}%`;

  renderUserGreetingBanner();
  renderDashboardBooks();
}

// FIREBASE AUTHENTICATION & REALTIME SYNC ENGINE
let currentUser = null;

if (typeof firebase !== 'undefined' && firebase.auth) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      localStorage.setItem('sog_user_email', user.email);

      const currentCustomName = localStorage.getItem('sog_user_name');
      if (!currentCustomName && user.displayName) {
        const firstName = user.displayName.split(' ')[0];
        localStorage.setItem('sog_user_name', firstName);
      }

      if (user.photoURL) {
        localStorage.setItem('sog_user_avatar', user.photoURL);
      }

      showToast(`Welcome, ${localStorage.getItem('sog_user_name') || user.email}!`);
      syncLocalDataToCloud();
      listenToCloudUpdates();
    } else {
      currentUser = null;
      localStorage.removeItem('sog_user_email');
      localStorage.removeItem('sog_user_avatar');
    }
    loadProfileAndAccountState();
    updateDashboardMetrics();
  });
}

const googleSignInBtn = document.getElementById('googleSignInBtn');
if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', () => {
    if (currentUser) {
      firebase.auth().signOut().then(() => {
        showToast("Signed out. Switched to Guest Account.");
        closeSubSheetToSettings(profileSheetModal);
      }).catch((err) => {
        console.error("Sign-out error:", err);
      });
    } else {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
        closeSubSheetToSettings(profileSheetModal);
      }).catch((error) => {
        console.error("Google Sign-In Error:", error);
        showToast("Sign-in failed: " + error.message);
      });
    }
  });
}

function syncLocalDataToCloud() {
  if (!currentUser || typeof firebase === 'undefined') return;
  const userDocRef = firebase.firestore().collection("users").doc(currentUser.uid);
  const localNotes = JSON.parse(localStorage.getItem("sog_verse_notes") || "{}");
  const localFavorites = JSON.parse(localStorage.getItem("sog_favorite_verses") || "{}");
  const finishedChapters = JSON.parse(localStorage.getItem("finishedChapters") || "{}");
  const startedChapters = JSON.parse(localStorage.getItem("startedChapters") || "{}");

  userDocRef.set({
    profile: {
      name: currentUser.displayName,
      email: currentUser.email,
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    },
    settings: {
      lastBook: localStorage.getItem("sog_last_read_book") || "Genesis",
      lastChapter: localStorage.getItem("sog_last_read_chapter") || "1",
      activeVersion: localStorage.getItem("sog_active_version") || "NIV + Audio",
      fontSize: localStorage.getItem("sog_font_size") || "1.0",
      audioSpeedIndex: localStorage.getItem("sog_audio_speed_index") || "0",
      theme: localStorage.getItem("sog_active_theme") || "theme-light"
    },
    favorites: localFavorites,
    notes: localNotes,
    finishedChapters: finishedChapters,
    startedChapters: startedChapters
  }, { merge: true }).catch((err) => console.error("Cloud Sync Error:", err));
}

function listenToCloudUpdates() {
  if (!currentUser || typeof firebase === 'undefined') return;
  firebase.firestore().collection("users").doc(currentUser.uid)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data.notes) localStorage.setItem("sog_verse_notes", JSON.stringify(data.notes));
        if (data.favorites) localStorage.setItem("sog_favorite_verses", JSON.stringify(data.favorites));
        if (data.finishedChapters) localStorage.setItem("finishedChapters", JSON.stringify(data.finishedChapters));
        if (data.startedChapters) localStorage.setItem("startedChapters", JSON.stringify(data.startedChapters));
        
        if (data.settings) {
          if (data.settings.lastBook) localStorage.setItem("sog_last_read_book", data.settings.lastBook);
          if (data.settings.lastChapter) localStorage.setItem("sog_last_read_chapter", String(data.settings.lastChapter));
          if (data.settings.activeVersion) localStorage.setItem("sog_active_version", data.settings.activeVersion);
          if (data.settings.fontSize) localStorage.setItem("sog_font_size", data.settings.fontSize);
          if (data.settings.audioSpeedIndex) localStorage.setItem("sog_audio_speed_index", data.settings.audioSpeedIndex);
          if (data.settings.theme) localStorage.setItem("sog_active_theme", data.settings.theme);
        }

        restoreReaderMemoryState();
        renderDashboardFavorites();
        updateDashboardMetrics();
        updateDisplay();
      }
    }, (err) => {
      console.warn("Firestore snapshot error:", err);
    });
}

const spiritualFallbackNames = [
  "Beloved Faithful", "Grace Seeker", "Pilgrim of Light", "Child of Grace", "Faith Walker"
];

function renderUserGreetingBanner() {
  const userGreetingTitle = document.getElementById('userGreetingTitle');
  const userGreetingTagline = document.getElementById('userGreetingTagline');
  const savedName = localStorage.getItem('sog_user_name') || '';
  const savedEmail = localStorage.getItem('sog_user_email') || '';

  if (userGreetingTitle) {
    if (savedName) {
      userGreetingTitle.textContent = `Welcome back, ${savedName}! 👋`;
    } else if (savedEmail) {
      const emailPrefix = savedEmail.split('@')[0];
      userGreetingTitle.textContent = `Welcome back, ${emailPrefix}! 👋`;
    } else {
      let storedFallback = sessionStorage.getItem('sog_session_fallback_name');
      if (!storedFallback) {
        storedFallback = spiritualFallbackNames[Math.floor(Math.random() * spiritualFallbackNames.length)];
        sessionStorage.setItem('sog_session_fallback_name', storedFallback);
      }
      userGreetingTitle.textContent = `Welcome back, ${storedFallback}! 👋`;
    }
  }

  if (userGreetingTagline && !userGreetingTagline.hasAttribute('data-set')) {
    const randomTag = spiritualTaglines[Math.floor(Math.random() * spiritualTaglines.length)];
    userGreetingTagline.textContent = `"${randomTag}"`;
    userGreetingTagline.setAttribute('data-set', 'true');
  }
}

let savedAudioPlaybackPosition = 0;
let isAudioReconnectingState = false;

function setAudioReconnectingState(isReconnecting) {
  isAudioReconnectingState = isReconnecting;
  const progressBar = document.getElementById('progressBar');
  const miniPlayBtn = document.getElementById('miniPlayBtn');
  const readerMiniPlayBtn = document.getElementById('readerMiniPlayBtn');

  if (isReconnecting) {
    if (progressBar) progressBar.classList.add('reconnecting');
    const spinnerHTML = `<div class="spinner-ring"></div>`;
    if (miniPlayBtn) miniPlayBtn.innerHTML = spinnerHTML;
    if (readerMiniPlayBtn) readerMiniPlayBtn.innerHTML = spinnerHTML;

    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.innerHTML = `<i data-lucide="play" id="playIcon"></i>`;
    refreshIcons();
  } else {
    if (progressBar) progressBar.classList.remove('reconnecting');
    updatePlayIcons(!audioElement.paused);
  }
}

function updatePlayIcons(isPlaying) {
  if (isAudioReconnectingState) return;

  const iconName = isPlaying ? 'pause' : 'play';
  const playBtn = document.getElementById('playBtn');
  const miniPlayBtn = document.getElementById('miniPlayBtn');
  const readerMiniPlayBtn = document.getElementById('readerMiniPlayBtn');

  if (playBtn) playBtn.innerHTML = `<i data-lucide="${iconName}" id="playIcon"></i>`;
  if (miniPlayBtn) miniPlayBtn.innerHTML = `<i data-lucide="${iconName}" id="miniPlayIcon"></i>`;
  if (readerMiniPlayBtn) readerMiniPlayBtn.innerHTML = `<i data-lucide="${iconName}" id="readerMiniPlayIcon"></i>`;

  refreshIcons();
}

async function attemptAudioAutoResume() {
  if (!audioElement || !audioElement.src || currentVersion !== 'NIV + Audio') return;
  setAudioReconnectingState(true);
  try {
    audioElement.load();
    if (savedAudioPlaybackPosition > 0) {
      audioElement.currentTime = savedAudioPlaybackPosition;
    }
    await audioElement.play();
    setAudioReconnectingState(false);
  } catch (err) {
    console.warn("Auto-resume retry scheduled:", err);
    setTimeout(attemptAudioAutoResume, 3000);
  }
}

window.addEventListener('online', () => {
  if (isAudioReconnectingState || (audioElement && audioElement.paused && savedAudioPlaybackPosition > 0)) {
    attemptAudioAutoResume();
  }
});  

function togglePlayPause() {
  if (!audioElement || !audioElement.src) return;
  if (audioElement.paused) {
    setAudioReconnectingState(true);
    audioElement.play().then(() => {
      setAudioReconnectingState(false);
      updatePlayIcons(true);
      markChapterStarted(selectedBook.book, selectedChapter);
    }).catch(err => {
      console.log("Audio play error:", err);
      setAudioReconnectingState(false);
    });
  } else {
    audioElement.pause();
    setAudioReconnectingState(false);
    updatePlayIcons(false);
  }
}

if (audioElement) {
  audioElement.addEventListener('play', () => setAudioReconnectingState(false));
  audioElement.addEventListener('pause', () => {
    if (!isAudioReconnectingState) updatePlayIcons(false);
  });
  audioElement.addEventListener('ended', () => {
    setAudioReconnectingState(false);
    updatePlayIcons(false);
  });

  audioElement.addEventListener('waiting', () => {
    setAudioReconnectingState(true);
  });

  audioElement.addEventListener('seeking', () => {
    setAudioReconnectingState(true);
  });

  audioElement.addEventListener('stalled', () => {
    setAudioReconnectingState(true);
  });

  audioElement.addEventListener('playing', () => {
    setAudioReconnectingState(false);
  });

  audioElement.addEventListener('canplay', () => {
    setAudioReconnectingState(false);
  });

  audioElement.addEventListener('canplaythrough', () => {
    setAudioReconnectingState(false);
  });

  audioElement.addEventListener('error', () => {
    setAudioReconnectingState(false);
  });

  audioElement.addEventListener('timeupdate', () => {
    if (audioElement.currentTime > 0) {
      if (isAudioReconnectingState && !audioElement.paused) {
        setAudioReconnectingState(false);
      }
      savedAudioPlaybackPosition = audioElement.currentTime;
      markChapterStarted(selectedBook.book, selectedChapter);
    }
    if (audioElement.duration && !isNaN(audioElement.duration)) {
      const pct = (audioElement.currentTime / audioElement.duration) * 100;
      if (progressBar) progressBar.value = pct;
      if (miniProgressFill) miniProgressFill.style.width = `${pct}%`;
      if (readerMiniProgressFill) readerMiniProgressFill.style.width = `${pct}%`;
      if (currentTimeText) currentTimeText.textContent = formatTime(audioElement.currentTime);
      if (durationText) durationText.textContent = formatTime(audioElement.duration);
    }
  });

  audioElement.addEventListener('ended', async () => {
    markChapterFinished(selectedBook.book, selectedChapter);
    if (selectedChapter < selectedBook.chapters) {
      selectedChapter++;
      await updateDisplay(true);
    }
  });
}

if (playBtn) {
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
  });
}

if (readerMiniPlayBtn) {
  readerMiniPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
  });
}

if (skipBackBtn) {
  skipBackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audioElement && audioElement.src) {
      setAudioReconnectingState(true);
      audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
    }
  });
}

if (skipForwardBtn) {
  skipForwardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audioElement && audioElement.src) {
      setAudioReconnectingState(true);
      audioElement.currentTime = Math.min(audioElement.duration || 0, audioElement.currentTime + 10);
    }
  });
}

if (progressBar) {
  const seekAudio = () => {
    if (audioElement && audioElement.duration) {
      setAudioReconnectingState(true);
      const seekTime = (progressBar.value / 100) * audioElement.duration;
      audioElement.currentTime = seekTime;
    }
  };
  progressBar.addEventListener('input', seekAudio);
  progressBar.addEventListener('change', seekAudio);
}

if (speedBtn) {
  speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSpeedIndex = (currentSpeedIndex + 1) % speedRates.length;
    const newSpeed = speedRates[currentSpeedIndex];
    localStorage.setItem('sog_audio_speed_index', String(currentSpeedIndex));
    if (audioElement) audioElement.playbackRate = newSpeed;
    speedBtn.textContent = `${newSpeed.toFixed(newSpeed % 1 === 0 ? 1 : 2)}x`;
  });
}

function updateMediaSessionMetadata() {
  if (!('mediaSession' in navigator)) return;

  const currentTitle = `${selectedBook.book} ${selectedChapter}`;
  const currentArtist = `${currentVersion} Translation`;
  const currentAlbum = "Seed of Grace Audio Bible";

  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentTitle,
    artist: currentArtist,
    album: currentAlbum,
    artwork: [
      { src: 'https://raw.githubusercontent.com/pleromatechph/bible-app/main/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  });

  // Action Handlers for Background Controls
  navigator.mediaSession.setActionHandler('play', () => {
    if (audioElement && audioElement.paused) togglePlayPause();
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    if (audioElement && !audioElement.paused) togglePlayPause();
  });
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    navigateToPreviousChapter();
  });
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    navigateToNextChapter();
  });
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    if (audioElement && audioElement.src) {
      audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
    }
  });
  navigator.mediaSession.setActionHandler('seekforward', () => {
    if (audioElement && audioElement.src) {
      audioElement.currentTime = Math.min(audioElement.duration || 0, audioElement.currentTime + 10);
    }
  });
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

if (bookTabBtn) {
  bookTabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBookSelector();
  });
}

if (selectBookChapterBtn) {
  selectBookChapterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBookSelector();
  });
}

const oldTestamentBooks = bibleData.slice(0, 39);
const newTestamentBooks = bibleData.slice(39);

function openBookSelector() {
  if (modalTitle) modalTitle.textContent = 'Select Bible Book';
  let html = `
    <div style="display: flex; gap: 12px; height: 320px; overflow: hidden;">
      <div style="flex: 1; display: flex; flex-direction: column; height: 100%;">
        <div style="font-weight: 700; font-size: 0.85rem; padding-bottom: 8px; color: var(--accent-blue); text-align: center; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;">
          Old Testament
        </div>
        <div class="no-scrollbar" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
  `;
  oldTestamentBooks.forEach(b => {
    const active = b.book === selectedBook.book ? 'active-item' : '';
    html += `<div class="grid-item ${active}" onclick="onSelectBook('${b.book}')" style="text-align: center; padding: 8px 10px; font-size: 0.85rem;">${b.book}</div>`;
  });
  html += `
        </div>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; height: 100%;">
        <div style="font-weight: 700; font-size: 0.85rem; padding-bottom: 8px; color: var(--accent-blue); text-align: center; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;">
          New Testament
        </div>
        <div class="no-scrollbar" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
  `;
  newTestamentBooks.forEach(b => {
    const active = b.book === selectedBook.book ? 'active-item' : '';
    html += `<div class="grid-item ${active}" onclick="onSelectBook('${b.book}')" style="text-align: center; padding: 8px 10px; font-size: 0.85rem;">${b.book}</div>`;
  });
  html += `
        </div>
      </div>
    </div>
  `;

  if (modalBody) modalBody.innerHTML = html;
  if (selectionModal) selectionModal.classList.add('open');
  if (drawerOverlay) drawerOverlay.classList.add('open');

  setTimeout(() => {
    const activeItem = modalBody ? modalBody.querySelector('.active-item') : null;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, 0);
}

if (chapterTabBtn) chapterTabBtn.addEventListener('click', openChapterSelector);

function openChapterSelector() {
  if (modalTitle) modalTitle.textContent = `${selectedBook.book} - Select Chapter`;
  let gridHTML = '<div class="modal-grid" style="grid-template-columns: repeat(5, 1fr);">';
  for (let i = 1; i <= selectedBook.chapters; i++) {
    const active = i === selectedChapter ? 'active-item' : '';
    gridHTML += `<div class="grid-item ${active}" onclick="onSelectChapter(${i})">${i}</div>`;
  }
  gridHTML += '</div>';

  if (modalBody) modalBody.innerHTML = gridHTML;
  if (selectionModal) selectionModal.classList.add('open');
  if (drawerOverlay) drawerOverlay.classList.add('open');
}

if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeAllModals());

window.onSelectBook = function(bookName) {
  const foundBook = bibleData.find(b => b.book === bookName);
  if (foundBook) {
    selectedBook = foundBook;
    localStorage.setItem('sog_last_read_book', selectedBook.book);
    selectedChapter = 1;
    localStorage.setItem('sog_last_read_chapter', '1');
  }
  openChapterSelector();
};

window.onSelectChapter = function(ch) {
  selectedChapter = ch;
  updateDisplay();
  closeAllModals();
  openReaderView();
};

let currentActiveAudioBlobUrl = null;

function getAudioStreamUrl(isNT, fileName) {
  const repoTag = isNT ? "v1.0.0-audio-nt" : "v1.0.0-audio-ot";
  return `https://github.com/pleromatechph/bible-app/releases/download/${repoTag}/${fileName}`;
}

async function updateDisplay(forceAutoPlay = false) {
  localStorage.setItem('sog_last_read_book', selectedBook.book);
  localStorage.setItem('sog_last_read_chapter', String(selectedChapter));

  const title = `${selectedBook.book} ${selectedChapter}`;
  const readerTitleText = document.getElementById('readerTitleText');
  const miniTitle = document.getElementById('miniTitle');
  const deckTitleMini = document.getElementById('deckTitleMini');
  const deckTitleMax = document.getElementById('deckTitleMax');
  const deckSub = document.getElementById('deckSub');

  const NEW_TESTAMENT_BOOKS = [
    "matthew", "mark", "luke", "john", "acts", "romans", "1 corinthians", "2 corinthians",
    "galatians", "ephesians", "philippians", "colossians", "1 thessalonians", "2 thessalonians",
    "1 timothy", "2 timothy", "titus", "philemon", "hebrews", "james", "1 peter", "2 peter",
    "1 john", "2 john", "3 john", "jude", "revelation"
  ];
  const formattedBook = selectedBook.book.toLowerCase().replace(/\s+/g, '_');
  const formattedChapter = String(selectedChapter).padStart(2, '0');
  const fileName = `${formattedBook}_chapter_${formattedChapter}.mp3`;
  const isNT = NEW_TESTAMENT_BOOKS.includes(selectedBook.book.toLowerCase());
  const audioPath = getAudioStreamUrl(isNT, fileName);
  const hasAudioSupport = currentVersion === 'NIV + Audio';

  if (audioElement) {
    const wasPlaying = !audioElement.paused || forceAutoPlay;
    audioElement.pause();

    if (currentActiveAudioBlobUrl) {
      URL.revokeObjectURL(currentActiveAudioBlobUrl);
      currentActiveAudioBlobUrl = null;
    }

    if (hasAudioSupport) {
      if (readerAudioDeck) readerAudioDeck.classList.remove('disabled-audio');
      let finalAudioSrc = audioPath;
      const downloaded = await isAudioDownloaded(audioPath);
      const downloadIcon = document.getElementById('downloadIcon');

      if (downloadIcon) {
        if (downloaded) {
          downloadIcon.setAttribute('data-lucide', 'check-circle-2');
          downloadIcon.style.color = '#22c55e';
        } else {
          downloadIcon.setAttribute('data-lucide', 'download');
          downloadIcon.style.color = 'var(--text-color)';
        }
        refreshIcons();
      }

      if (downloaded && 'caches' in window) {
        try {
          const cache = await caches.open(AUDIO_CACHE_NAME);
          const cachedResponse = await cache.match(audioPath);
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            if (blob.size > 0 && blob.type !== 'text/html') {
              currentActiveAudioBlobUrl = URL.createObjectURL(blob);
              finalAudioSrc = currentActiveAudioBlobUrl;
            }
          }
        } catch (e) {
          console.warn("Offline audio blob creation failed:", e);
        }
      }

      audioElement.src = finalAudioSrc;
      audioElement.load();

      if (speedRates && speedRates[currentSpeedIndex]) {
        audioElement.playbackRate = speedRates[currentSpeedIndex];
      }

      if (wasPlaying) {
        setAudioReconnectingState(true);
        audioElement.play().then(() => {
          setAudioReconnectingState(false);
          updatePlayIcons(true);
        }).catch(err => {
          console.warn("Autoplay blocked:", err);
          setAudioReconnectingState(false);
          updatePlayIcons(false);
        });
      } else {
        updatePlayIcons(false);
      }
    } else {
      if (readerAudioDeck) readerAudioDeck.classList.add('disabled-audio');
      if (miniAudioPlayer) miniAudioPlayer.style.display = 'none';
      audioElement.removeAttribute('src');
      audioElement.load();
      updatePlayIcons(false);
    }
  }

  if (progressBar) progressBar.value = 0;
  if (miniProgressFill) miniProgressFill.style.width = '0%';
  if (readerMiniProgressFill) readerMiniProgressFill.style.width = '0%';

  loadChapterVerses(selectedBook.book, selectedChapter);

  if (readerTitleText) readerTitleText.textContent = title;
  if (miniTitle) miniTitle.textContent = title;
  if (deckTitleMini) deckTitleMini.textContent = title;
  if (deckTitleMax) deckTitleMax.textContent = `${title} Audio`;
  if (deckSub) deckSub.textContent = `${currentVersion} Translation`;

  updateDashboardMetrics();
  updateMediaSessionMetadata();
  refreshIcons();
}

if (readerMiniPlayer) {
  readerMiniPlayer.addEventListener('click', (e) => {
    if (!e.target.closest('#readerMiniPlayBtn')) {
      readerMiniPlayer.style.display = 'none';
      if (readerMaxPlayer) readerMaxPlayer.style.display = 'flex';
      refreshIcons();
    }
  });
}

if (minimizeMaxDeckBtn) {
  minimizeMaxDeckBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (readerMaxPlayer) readerMaxPlayer.style.display = 'none';
    if (readerMiniPlayer) readerMiniPlayer.style.display = 'flex';
    refreshIcons();
  });
}

if (miniAudioPlayer) {
  miniAudioPlayer.addEventListener('click', () => {
    openReaderView();
  });
}

document.querySelectorAll('.dashboard-filter-tabs .sub-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.dashboard-filter-tabs .sub-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeDashboardTab = tab.getAttribute('data-tab');
    renderDashboardBooks();
  });
});

if (readerOptionsBtn) {
  readerOptionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllModals();
    if (fontSizeSheetModal) fontSizeSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

if (fontSizeSlider) {
  fontSizeSlider.addEventListener('input', () => {
    const val = fontSizeSlider.value;
    const container = document.getElementById('readingContainer');
    if (container) container.style.fontSize = `${val}rem`;
    localStorage.setItem('sog_font_size', val);
  });
}

const availableTranslations = [
  { code: 'NIV + Audio', name: 'New International Version (NIV + Audio)', file: 'niv.sqlite3', default: true, hasAudio: true },
  { code: 'NIV', name: 'New International Version (NIV Pure Text)', file: 'niv.sqlite3', default: true, hasAudio: false },
  { code: 'ESV', name: 'English Standard Version (ESV)', file: 'esv.sqlite3' },
  { code: 'AMP', name: 'Amplified Bible (AMP)', file: 'amp.sqlite3' },
  { code: 'KJV', name: 'King James Version (KJV)', file: 'kjv.sqlite3' },
  { code: 'MBB05', name: 'Magandang Balita Biblia (MBB05)', file: 'mbb05.sqlite3' },
  { code: 'NKJV', name: 'New King James Version (NKJV)', file: 'nkjv.sqlite3' },
  { code: 'NLT', name: 'New Living Translation (NLT)', file: 'nlt.sqlite3' }
];

const availableDbFiles = availableTranslations.map(t => t.file);
const DB_CACHE_NAME = 'sog-sqlite-databases-v1';
const AUDIO_CACHE_NAME = 'sog-audio-cache-v1';

async function isAudioDownloaded(url) {
  try {
    if ('caches' in window) {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const match = await cache.match(url);
      if (match) return true;
    }
  } catch (err) {
    console.warn("Audio cache check failed:", err);
  }
  return false;
}

async function updateOfflineAudioMetrics() {
  const downloadedAudioCount = document.getElementById('downloadedAudioCount');
  if (!downloadedAudioCount) return;
  try {
    if ('caches' in window) {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const keys = await cache.keys();
      downloadedAudioCount.textContent = keys.length;
    }
  } catch (err) {
    downloadedAudioCount.textContent = '0';
  }
}

async function getDownloadedVersions() {
  const installed = ['NIV + Audio', 'NIV'];
  try {
    if ('caches' in window) {
      const cache = await caches.open(DB_CACHE_NAME);
      for (const item of availableTranslations) {
        if (item.default) continue;
        const fileName = item.file || `${item.code.toLowerCase()}.sqlite3`;
        const match = await cache.match(`./db/${fileName}`);
        if (match) installed.push(item.code);
      }
    }
  } catch (err) {
    console.warn("Cache API check failed:", err);
  }
  return installed;
}

async function renderVersionOptionsList() {
  const container = document.getElementById('versionOptionsList');
  if (!container) return;
  const installedVersions = await getDownloadedVersions();
  container.innerHTML = '';

  const installedCatalog = availableTranslations.filter(item => item.default || installedVersions.includes(item.code));

  installedCatalog.forEach(item => {
    const isActive = item.code === currentVersion;
    const div = document.createElement('div');
    div.className = `font-option-item ${isActive ? 'active' : ''}`;
    div.setAttribute('data-version', item.code);
    div.innerHTML = `
      <div class="version-info" style="display: flex; flex-direction: column; flex: 1; cursor: pointer;">
        <span style="font-weight: 600; font-size: 0.9rem;">${item.name}</span>
        <span style="font-size: 0.72rem; color: var(--icon-neutral);">
          ${item.default ? 'Default' : 'Downloaded & Available Offline'}
        </span>
      </div>
      ${isActive ? `<i data-lucide="check" style="width: 18px; height: 18px; color: var(--accent-blue);"></i>` : ''}
    `;

    div.addEventListener('click', () => {
      currentVersion = item.code;
      localStorage.setItem('sog_active_version', currentVersion);
      if (currentVersionLabel) currentVersionLabel.textContent = currentVersion;
      loadDatabase(currentVersion);
      updateDisplay();
      closeAllModals();
    });

    container.appendChild(div);
  });
  refreshIcons();
}

async function deleteVersionDatabase(item) {
  const fileName = item.file || `${item.code.toLowerCase()}.sqlite3`;
  const dbPath = `./db/${fileName}`;

  showInAppConfirmModal(
    `Delete ${item.code} Database?`,
    `Are you sure you want to remove ${item.name} from offline storage?`,
    async () => {
      try {
        if ('caches' in window) {
          const cache = await caches.open(DB_CACHE_NAME);
          await cache.delete(dbPath);
        }
        if (currentVersion === item.code) {
          currentVersion = 'NIV + Audio';
          if (currentVersionLabel) currentVersionLabel.textContent = currentVersion;
          await loadDatabase(currentVersion);
          updateDisplay();
        }
        showToast(`Deleted ${item.code} database`);
        renderDownloadManagerContent();
      } catch (err) {
        console.error("Error deleting DB:", err);
      }
    },
    "Cancel",
    "Delete"
  );
}

async function handleVersionSelection(item, isInstalled) {
  const fileName = item.file || `${item.code.toLowerCase()}.sqlite3`;
  const dbPath = `./db/${fileName}`;

  if (!isInstalled) {
    try {
      const response = await fetch(dbPath);
      if (!response.ok) throw new Error(`File ${dbPath} not found`);
      if ('caches' in window) {
        const cache = await caches.open(DB_CACHE_NAME);
        await cache.put(dbPath, response.clone());
      }
      showToast(`Downloaded ${item.code} translation!`);
    } catch (err) {
      showToast(`Failed to download ${item.name}`);
      return;
    }
  }
}

if (versionBadgeBtn) {
  versionBadgeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderVersionOptionsList();
    if (versionSheetModal) versionSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

let activeSelectedVerse = null;

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function getFavoriteVerses() {
  const saved = localStorage.getItem('sog_favorite_verses');
  return saved ? JSON.parse(saved) : {};
}

function getVerseNotes() {
  const saved = localStorage.getItem('sog_verse_notes');
  return saved ? JSON.parse(saved) : {};
}

function isVerseFavorite(book, ch, verse) {
  const favs = getFavoriteVerses();
  const targetKey = `${book}_${ch}_${verse}`;
  if (favs[targetKey]) return true;

  return Object.keys(favs).some(key => {
    const item = favs[key];
    if (item.book === book && item.chapter === ch) {
      if (String(item.parentGroup) === String(verse)) return true;
      const rangeParts = String(item.verse).split(',').map(v => v.trim());
      if (rangeParts.includes(String(verse))) return true;
    }
    return false;
  });
}

function hasVerseNote(book, ch, verse) {
  const notes = getVerseNotes();
  const noteId = `note_${book}_${ch}_${verse}`;
  return !!notes[noteId];
}

function toggleFavoriteVerse(book, ch, verseRef, verseText, isGroupHeader = false) {
  const favs = getFavoriteVerses();
  const key = `${book}_${ch}_${verseRef}`;

  if (favs[key]) {
    delete favs[key];
  } else {
    favs[key] = {
      book: book,
      chapter: ch,
      verse: String(verseRef),
      text: verseText || `Verse ${verseRef}`,
      translation: currentVersion,
      isGroupHeader: isGroupHeader,
      savedAt: new Date().toISOString()
    };
  }

  localStorage.setItem('sog_favorite_verses', JSON.stringify(favs));
  renderDashboardFavorites();
  syncLocalDataToCloud();
  return !!favs[key];
}

function saveVerseNote(book, ch, verse, newNoteText) {
  const notes = getVerseNotes();
  if (newNoteText.trim() === '') return;
  const noteId = `note_${book}_${ch}_${verse}`;

  notes[noteId] = {
    id: noteId,
    book: book,
    chapter: ch,
    verse: String(verse),
    text: newNoteText.trim(),
    createdAt: notes[noteId]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('sog_verse_notes', JSON.stringify(notes));
  renderDashboardFavorites();
  syncLocalDataToCloud();
}

let touchStartXPos = 0;
let touchStartYPos = 0;
let touchTimeStart = 0;
let isTrackpadCooldown = false;
const readingViewContainer = document.getElementById('readingContainer');

if (readingViewContainer) {
  readingViewContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartXPos = e.touches[0].clientX;
      touchStartYPos = e.touches[0].clientY;
      touchTimeStart = Date.now();
    }
  }, { passive: true });

  readingViewContainer.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXPos;
    const deltaY = touchEndY - touchStartYPos;
    const elapsedTime = Date.now() - touchTimeStart;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX >= 40 && absX > absY * 1.2 && elapsedTime < 500) {
      if (deltaX < 0) {
        navigateToNextChapter();
      } else {
        navigateToPreviousChapter();
      }
    }
  }, { passive: true });

  readingViewContainer.addEventListener('wheel', (e) => {
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);

    if (absX > 35 && absX > absY * 1.5 && !isTrackpadCooldown) {
      isTrackpadCooldown = true;
      if (e.deltaX > 0) {
        navigateToNextChapter();
      } else {
        navigateToPreviousChapter();
      }
      setTimeout(() => {
        isTrackpadCooldown = false;
      }, 400);
    }
  }, { passive: true });
}

function navigateToNextChapter() {
  if (selectedChapter < selectedBook.chapters) {
    selectedChapter++;
    triggerPageAnimation('page-slide-left');
    updateDisplay();
  } else {
    const currentIdx = bibleData.findIndex(b => b.book === selectedBook.book);
    if (currentIdx < bibleData.length - 1) {
      selectedBook = bibleData[currentIdx + 1];
      selectedChapter = 1;
      triggerPageAnimation('page-slide-left');
      updateDisplay();
      showToast(`Switched to ${selectedBook.book}`);
    }
  }
}

function navigateToPreviousChapter() {
  if (selectedChapter > 1) {
    selectedChapter--;
    triggerPageAnimation('page-slide-right');
    updateDisplay();
  } else {
    const currentIdx = bibleData.findIndex(b => b.book === selectedBook.book);
    if (currentIdx > 0) {
      selectedBook = bibleData[currentIdx - 1];
      selectedChapter = selectedBook.chapters;
      triggerPageAnimation('page-slide-right');
      updateDisplay();
      showToast(`Switched to ${selectedBook.book}`);
    }
  }
}

function triggerPageAnimation(animationClass) {
  const versesList = document.getElementById('versesList');
  if (!versesList) return;
  versesList.classList.remove('page-slide-left', 'page-slide-right');
  void versesList.offsetWidth;
  versesList.classList.add(animationClass);
}

function attachVerseInteractions(element, book, ch, verse) {
  let pressTimer = null;
  let isLongPress = false;
  let touchMoved = false;
  let startX = 0;
  let startY = 0;

  element.addEventListener('contextmenu', (e) => { e.preventDefault(); });

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 1) {
      touchMoved = true;
      clearTimeout(pressTimer);
      return;
    }
    touchMoved = false;
    isLongPress = false;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;

    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      if (!touchMoved) {
        isLongPress = true;
        const cleanText = element.innerText.replace(/^\d+\s*/, '').trim();
        if (typeof openVerseActionSheet === 'function') {
          openVerseActionSheet(book, ch, verse, cleanText);
        }
      }
    }, 500);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 1) {
      touchMoved = true;
      clearTimeout(pressTimer);
      return;
    }
    const touch = e.touches ? e.touches[0] : e;
    const moveX = Math.abs(touch.clientX - startX);
    const moveY = Math.abs(touch.clientY - startY);
    if (moveX > 6 || moveY > 6) {
      touchMoved = true;
      clearTimeout(pressTimer);
    }
  };

  const handleTouchEnd = (e) => {
    clearTimeout(pressTimer);
    if (touchMoved) return;

    if (!isLongPress) {
      if (e) e.stopPropagation();
      if (e && e.target && (e.target.classList.contains('verse-num') || e.target.closest('.verse-num'))) {
        return;
      }

      element.classList.toggle('selected-highlight');
      const selectedElements = Array.from(document.querySelectorAll('.verse-item.selected-highlight'));

      if (selectedElements.length > 0) {
        selectedElements.sort((a, b) => {
          const vA = parseInt(a.getAttribute('data-verse') || '0', 10);
          const vB = parseInt(b.getAttribute('data-verse') || '0', 10);
          return vA - vB;
        });

        const toSuperscript = (str) => {
          const superMap = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
          return String(str).split('').map(char => superMap[char] || char).join('');
        };

        const rawVerseNumbers = selectedElements.map(el => parseInt(el.getAttribute('data-verse') || '0', 10));
        const formattedVerseRangeStr = formatVerseRangeNumbers(rawVerseNumbers);

        const compiledText = selectedElements.map(el => {
          const vNum = el.getAttribute('data-verse');
          const clone = el.cloneNode(true);
          const headers = clone.querySelectorAll('.main-section-header, .sub-section-header');
          headers.forEach(h => h.remove());
          const cleanText = clone.innerText.replace(/^\d+\s*/, '').trim();
          return `${toSuperscript(vNum)} ${cleanText}`;
        }).join('\n');

        const cleanVersion = String(currentVersion).replace(/\s*\+\s*Audio/gi, '').trim();
        const formattedCopy = `${book} ${ch}:${formattedVerseRangeStr} ${cleanVersion}\n${compiledText}`;

        copyTextToClipboard(formattedCopy, () => {
          if (typeof showToast === 'function') {
            showToast(selectedElements.length === 1 ? "Verse copied!" : `${selectedElements.length} verses copied!`);
          }
        });
      }
    }
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: true });
  element.addEventListener('touchend', handleTouchEnd);
  element.addEventListener('mousedown', (e) => {
    if ('ontouchstart' in window) return;
    handleTouchStart(e);
  });
  element.addEventListener('mousemove', (e) => {
    if ('ontouchstart' in window) return;
    handleTouchMove(e);
  });
  element.addEventListener('mouseup', (e) => {
    if ('ontouchstart' in window) return;
    handleTouchEnd(e);
  });
}

let currentPreviewNoteObj = null;

function openNotePreviewSheet(itemKey, book, ch, verse, verseText, noteText) {
  currentPreviewNoteObj = { itemKey, book, chapter: ch, verse };
  const previewVerseRefText = document.getElementById('previewVerseRefText');
  const previewVerseContentText = document.getElementById('previewVerseContentText');
  const previewNoteBodyText = document.getElementById('previewNoteBodyText');
  const previewNoteInput = document.getElementById('previewNoteInput');
  const readContainer = document.getElementById('noteReadViewContainer');
  const editContainer = document.getElementById('noteEditViewContainer');
  const toggleScriptureBtn = document.getElementById('toggleScriptureBtn');
  const toggleScriptureLabel = document.getElementById('toggleScriptureLabel');
  const toggleScriptureIcon = document.getElementById('toggleScriptureIcon');

  if (readContainer) readContainer.style.display = 'flex';
  if (editContainer) editContainer.style.display = 'none';

  const cleanCode = String(currentVersion).replace(/\s*\+\s*Audio/gi, '').trim();
  const cleanRef = `${book} ${ch}:${verse} ${cleanCode}`;
  initialPreviewNoteText = noteText || '';

  if (previewVerseRefText) previewVerseRefText.textContent = cleanRef;
  if (previewNoteBodyText) {
    if (!initialPreviewNoteText || initialPreviewNoteText.trim() === '') {
      previewNoteBodyText.textContent = 'No personal reflection note written';
      previewNoteBodyText.style.fontStyle = 'italic';
      previewNoteBodyText.style.color = 'var(--icon-neutral)';
    } else {
      previewNoteBodyText.textContent = initialPreviewNoteText;
      previewNoteBodyText.style.fontStyle = 'normal';
      previewNoteBodyText.style.color = 'var(--text-color)';
    }
  }
  if (previewNoteInput) previewNoteInput.value = initialPreviewNoteText;

  if (previewVerseContentText) {
    previewVerseContentText.style.display = 'none';
    if (!verseText || verseText.startsWith('Verse ') || verseText === 'Personal Reflection Note') {
      previewVerseContentText.textContent = fetchLiveVerseText(book, ch, verse);
    } else {
      previewVerseContentText.textContent = verseText;
    }
  }

  if (toggleScriptureLabel) toggleScriptureLabel.textContent = "Show Scripture";
  if (toggleScriptureIcon) toggleScriptureIcon.setAttribute('data-lucide', 'chevron-down');

  if (toggleScriptureBtn) {
    toggleScriptureBtn.onclick = () => {
      if (previewVerseContentText.style.display === 'none') {
        previewVerseContentText.style.display = 'block';
        toggleScriptureLabel.textContent = "Hide Scripture";
        toggleScriptureIcon.setAttribute('data-lucide', 'chevron-up');
      } else {
        previewVerseContentText.style.display = 'none';
        toggleScriptureLabel.textContent = "Show Scripture";
        toggleScriptureIcon.setAttribute('data-lucide', 'chevron-down');
      }
      refreshIcons();
    };
  }

  if (notePreviewSheetModal) notePreviewSheetModal.classList.add('open');
  if (drawerOverlay) drawerOverlay.classList.add('open');
  refreshIcons();
}

const switchToEditModeBtn = document.getElementById('switchToEditModeBtn');
if (switchToEditModeBtn) {
  switchToEditModeBtn.addEventListener('click', () => {
    const readContainer = document.getElementById('noteReadViewContainer');
    const editContainer = document.getElementById('noteEditViewContainer');
    if (readContainer) readContainer.style.setProperty('display', 'none', 'important');
    if (editContainer) editContainer.style.setProperty('display', 'flex', 'important');
  });
}

const saveNoteFromPreviewBtn = document.getElementById('saveNoteFromPreviewBtn');
if (saveNoteFromPreviewBtn) {
  saveNoteFromPreviewBtn.addEventListener('click', () => {
    if (!currentPreviewNoteObj) return;
    const { book, chapter, verse } = currentPreviewNoteObj;
    const previewNoteInput = document.getElementById('previewNoteInput');
    const updatedNoteText = previewNoteInput ? previewNoteInput.value.trim() : '';

    if (updatedNoteText === '') return;

    const isExisting = initialPreviewNoteText && initialPreviewNoteText.trim() !== '';
    saveVerseNote(book, chapter, verse, updatedNoteText);
    initialPreviewNoteText = updatedNoteText;
    if (notePreviewSheetModal) notePreviewSheetModal.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
    showToast(isExisting ? "Note Updated!" : "Note Saved!");
    renderDashboardFavorites();
    loadChapterVerses(selectedBook.book, selectedChapter);
  });
}

function fetchLiveVerseText(bookName, chapterNum, verseRangeStr) {
  if (!db) return "Verse text unavailable.";
  try {
    let tableName = 'verses';
    const tablesStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND (name = 'verses' OR name LIKE '%verse%');");
    if (tablesStmt.step()) tableName = tablesStmt.getAsObject().name;
    tablesStmt.free();

    const cleanBookName = bookName.toLowerCase().replace(/\s+/g, '');
    const bookIndex = bibleData.findIndex(b => b.book.toLowerCase() === bookName.toLowerCase()) + 1;
    const shortPrefix = cleanBookName.substring(0, 3);
    const targetVerses = String(verseRangeStr).split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));

    const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE LOWER(CAST(book AS TEXT)) = ? OR LOWER(CAST(book AS TEXT)) = ? OR LOWER(CAST(book AS TEXT)) LIKE ?`);
    stmt.bind([cleanBookName, String(bookIndex), `${shortPrefix}%`]);

    const compiledVerses = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const rawBookVal = String(row.book !== undefined ? row.book : (row.book_number !== undefined ? row.book_number : (row.book_id !== undefined ? row.book_id : ''))).toLowerCase().trim().replace(/\s+/g, '');
      const isBookMatch = rawBookVal === cleanBookName || rawBookVal === String(bookIndex) || parseInt(rawBookVal, 10) === bookIndex || (shortPrefix.length >= 2 && rawBookVal.startsWith(shortPrefix));

      if (!isBookMatch) continue;

      let currentChap = row.chapter !== undefined ? row.chapter : row.chapter_number;
      let currentVerse = row.verse !== undefined ? row.verse : row.verse_number;

      if (String(currentChap) === String(chapterNum) && targetVerses.includes(parseInt(currentVerse, 10))) {
        let rawText = row.unformatted !== undefined ? row.unformatted : (row.text !== undefined ? row.text : (row.verse_text !== undefined ? row.verse_text : row.content));
        let textVal = String(rawText || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '').trim();

        if (textVal.includes('\n')) {
          const lines = textVal.split('\n');
          if (lines.length > 1 && lines[0].trim().length <= 40) {
            textVal = lines.slice(1).join(' ').trim();
          }
        }
        compiledVerses.push(`${currentVerse}. ${textVal}`);
      }
    }
    stmt.free();
    return compiledVerses.length > 0 ? compiledVerses.join(' ') : `Text for ${bookName} ${chapterNum}:${verseRangeStr} not found.`;
  } catch (err) {
    console.error("Error fetching live verse:", err);
    return "Error loading verse text.";
  }
}

const verseActionSheetModal = document.getElementById('verseActionSheetModal');

function openVerseActionSheet(book, ch, verse, rawElementText) {
  const selectedElements = Array.from(document.querySelectorAll('.verse-item.selected-highlight'));
  const targetElement = document.getElementById(`v${verse}`);
  const isTargetSelected = targetElement && targetElement.classList.contains('selected-highlight');

  if (selectedElements.length > 1 && isTargetSelected) {
    selectedElements.sort((a, b) => {
      const vA = parseInt(a.getAttribute('data-verse') || '0', 10);
      const vB = parseInt(b.getAttribute('data-verse') || '0', 10);
      return vA - vB;
    });

    const rawVerseNums = selectedElements.map(el => parseInt(el.getAttribute('data-verse') || '0', 10));
    const formattedVerseRangeStr = formatVerseRangeNumbers(rawVerseNums);

    const compiledText = selectedElements.map(el => {
      const vNum = el.getAttribute('data-verse');
      const cleanText = el.innerText.replace(/^\d+\s*/, '').trim();
      return `${vNum}. ${cleanText}`;
    }).join('\n');

    activeSelectedVerse = {
      book, chapter: ch, verse: formattedVerseRangeStr, text: compiledText,
      isMultiple: true, selectedList: selectedElements
    };

    const titleEl = document.getElementById('verseActionTitle');
    if (titleEl) titleEl.textContent = `${book} ${ch}:${formattedVerseRangeStr}`;
  } else {
    activeSelectedVerse = {
      book, chapter: ch, verse, text: rawElementText.replace(/^\d+\s*/, ''), isMultiple: false
    };

    const titleEl = document.getElementById('verseActionTitle');
    if (titleEl) titleEl.textContent = `${book} ${ch}:${verse}`;
  }

  const noteInput = document.getElementById('verseNoteInput');
  const existingNotes = getVerseNotes();
  const noteId = `note_${book}_${ch}_${verse}`;
  const existingText = existingNotes[noteId] ? (typeof existingNotes[noteId] === 'object' ? existingNotes[noteId].text : existingNotes[noteId]) : '';

  initialActionNoteText = existingText || '';
  if (noteInput) {
    noteInput.value = initialActionNoteText;
  }

  updateFavoriteButtonUI();
  closeAllModals();

  if (verseActionSheetModal) verseActionSheetModal.classList.add('open');
  if (drawerOverlay) drawerOverlay.classList.add('open');
  refreshIcons();
}

function updateFavoriteButtonUI() {
  if (!activeSelectedVerse) return;
  const { book, chapter, verse } = activeSelectedVerse;
  const favBtnLabel = document.getElementById('favBtnLabel');
  const favBtn = document.getElementById('toggleFavoriteBtn');

  const favs = getFavoriteVerses();
  const isFav = !!favs[`${book}_${chapter}_${verse}`];

  if (favBtnLabel) favBtnLabel.textContent = isFav ? 'Saved' : 'Favorite';

  if (favBtn) {
    let iconEl = favBtn.querySelector('#favIconBtn') || favBtn.querySelector('svg') || favBtn.querySelector('i');
    if (iconEl) {
      if (isFav) {
        iconEl.style.setProperty('color', 'var(--danger-color)', 'important');
        iconEl.style.setProperty('fill', 'var(--danger-color)', 'important');
        iconEl.setAttribute('fill', 'var(--danger-color)');
      } else {
        iconEl.style.setProperty('color', 'var(--text-color)', 'important');
        iconEl.style.setProperty('fill', 'none', 'important');
        iconEl.removeAttribute('fill');
      }
    }
  }
}

const toggleFavoriteBtn = document.getElementById('toggleFavoriteBtn');
if (toggleFavoriteBtn) {
  toggleFavoriteBtn.addEventListener('click', () => {
    if (!activeSelectedVerse) return;
    const { book, chapter, verse, text } = activeSelectedVerse;
    const isNowFav = toggleFavoriteVerse(book, chapter, verse, text, activeSelectedVerse.isMultiple);

    showToast(isNowFav ? "Saved to Favorites" : "Removed from Favorites");
    updateFavoriteButtonUI();
    renderDashboardFavorites();
    loadChapterVerses(selectedBook.book, selectedChapter);

    setTimeout(() => {
      refreshIcons();
      updateFavoriteButtonUI();
    }, 50);
  });
}

function handleVerseActionSheetClose() {
  const noteInput = document.getElementById('verseNoteInput');
  const currentNoteVal = noteInput ? noteInput.value.trim() : '';
  const hasUnsavedNoteEdits = currentNoteVal !== initialActionNoteText.trim();

  if (hasUnsavedNoteEdits) {
    showInAppConfirmModal(
      "Discard Unsaved Note?",
      "You have typed a note. Do you want to leave without saving?",
      () => {
        if (noteInput) noteInput.value = '';
        clearVerseHighlights();
        closeAllModals();
      },
      "Keep Editing",
      "Discard"
    );
  } else {
    if (noteInput) noteInput.value = '';
    clearVerseHighlights();
    closeAllModals();
  }
}

const saveVerseNoteBtn = document.getElementById('saveVerseNoteBtn');
if (saveVerseNoteBtn) {
  saveVerseNoteBtn.addEventListener('click', () => {
    if (!activeSelectedVerse) return;
    const { book, chapter, verse } = activeSelectedVerse;
    const noteInput = document.getElementById('verseNoteInput');
    const noteText = noteInput ? noteInput.value : '';

    if (noteText.trim() === '') return;

    const isExisting = hasVerseNote(book, chapter, verse);
    saveVerseNote(book, chapter, verse, noteText);
    initialActionNoteText = noteText.trim();

    showToast(isExisting ? "Note Updated!" : "Note Saved!");
    clearVerseHighlights();
    closeAllModals();
    loadChapterVerses(selectedBook.book, selectedChapter);
  });
}

window.filterFavoritesList = function() {
  const input = document.getElementById('favSearchInput');
  if (!input) return;
  const query = input.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.favorite-verse-card');

  cards.forEach(card => {
    const textContent = card.innerText.toLowerCase();
    if (textContent.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
};

function renderDashboardFavorites() {
  const container = document.getElementById('favoritesListContainer');
  if (!container) return;
  const favs = getFavoriteVerses();
  const notes = getVerseNotes();
  const unifiedMap = {};

  Object.keys(favs).forEach(key => {
    const favObj = favs[key];
    if (favObj.parentGroup) return;
    const compositeKey = `${favObj.book}_${favObj.chapter}_${favObj.verse}`;
    const timestamp = favObj.savedAt ? new Date(favObj.savedAt).getTime() : 0;

    unifiedMap[compositeKey] = {
      compositeKey: compositeKey,
      favKey: key,
      book: favObj.book,
      chapter: favObj.chapter,
      verse: favObj.verse,
      text: favObj.text,
      translation: favObj.translation || currentVersion,
      isFavorite: true,
      noteText: null,
      noteId: null,
      timestamp: timestamp
    };
  });

  Object.keys(notes).forEach(noteId => {
    const rawNote = notes[noteId];
    let bookName = '', chapterNum = '', verseNum = '', noteText = '', noteTime = 0;

    if (typeof rawNote === 'object') {
      bookName = rawNote.book;
      chapterNum = rawNote.chapter;
      verseNum = rawNote.verse;
      noteText = rawNote.text;
      noteTime = rawNote.updatedAt ? new Date(rawNote.updatedAt).getTime() : (rawNote.createdAt ? new Date(rawNote.createdAt).getTime() : 0);
    } else {
      const parts = noteId.replace('note_', '').split('_');
      bookName = parts[0];
      chapterNum = parts[1];
      verseNum = parts[2];
      noteText = rawNote;
    }

    const compositeKey = `${bookName}_${chapterNum}_${verseNum}`;

    if (unifiedMap[compositeKey]) {
      unifiedMap[compositeKey].noteText = noteText;
      unifiedMap[compositeKey].noteId = noteId;
      if (noteTime > unifiedMap[compositeKey].timestamp) {
        unifiedMap[compositeKey].timestamp = noteTime;
      }
    } else {
      unifiedMap[compositeKey] = {
        compositeKey: compositeKey,
        favKey: null,
        book: bookName,
        chapter: chapterNum,
        verse: verseNum,
        text: "",
        translation: currentVersion,
        isFavorite: false,
        noteText: noteText,
        noteId: noteId,
        timestamp: noteTime
      };
    }
  });

  const unifiedList = Object.values(unifiedMap);
  unifiedList.sort((a, b) => b.timestamp - a.timestamp);

  if (unifiedList.length === 0) {
    container.innerHTML = `<p class="empty-msg" style="text-align: center; padding: 20px; color: var(--icon-neutral); font-size: 0.85rem;">No favorite verses or notes added yet.</p>`;
    return;
  }

  container.innerHTML = '';

  unifiedList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'favorite-verse-card compact-fav-card';
    let badgesHTML = '';

    if (item.isFavorite && item.noteText) {
      badgesHTML = `
        <div style="display: flex; align-items: center; gap: 4px;">
          <i data-lucide="heart" style="width: 15px; height: 15px; fill: var(--danger-color); color: var(--danger-color);"></i>
          <i data-lucide="sticky-note" style="width: 15px; height: 15px; color: var(--accent-blue);"></i>
        </div>
      `;
    } else if (item.isFavorite) {
      badgesHTML = `<i data-lucide="heart" style="width: 15px; height: 15px; fill: var(--danger-color); color: var(--danger-color);"></i>`;
    } else {
      badgesHTML = `<i data-lucide="sticky-note" style="width: 15px; height: 15px; color: var(--accent-blue);"></i>`;
    }

    const verseDisplay = item.text ? `"${item.text}"` : '';
    card.innerHTML = `
      <div class="favorite-verse-header" style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="favorite-verse-ref">${item.book} ${item.chapter}:${item.verse}</span>
          ${badgesHTML}
        </div>
        <button class="icon-btn remove-entry-btn" style="color: var(--danger-color); padding: 4px;" title="Delete Entry">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
      ${verseDisplay ? `<div class="favorite-verse-text">${verseDisplay}</div>` : ''}
      ${item.noteText ? `<div class="favorite-verse-note"><strong>Note:</strong> ${item.noteText}</div>` : ''}
    `;

    card.addEventListener('click', () => {
      const activeText = item.text || fetchLiveVerseText(item.book, item.chapter, item.verse);
      openNotePreviewSheet(item.compositeKey, item.book, item.chapter, item.verse, activeText, item.noteText || "");
    });

    const removeBtn = card.querySelector('.remove-entry-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showInAppConfirmModal(
          "Delete Entry?",
          `Remove ${item.book} ${item.chapter}:${item.verse} from Favorites/Notes?`,
          () => {
            if (item.favKey) {
              const freshFavs = getFavoriteVerses();
              delete freshFavs[item.favKey];
              localStorage.setItem('sog_favorite_verses', JSON.stringify(freshFavs));
            }
            if (item.noteId) {
              const freshNotes = getVerseNotes();
              delete freshNotes[item.noteId];
              localStorage.setItem('sog_verse_notes', JSON.stringify(freshNotes));
            }
            renderDashboardFavorites();
            loadChapterVerses(selectedBook.book, selectedChapter);
            showToast("Entry deleted");
          },
          "Cancel",
          "Delete"
        );
      });
    }
    container.appendChild(card);
  });

  refreshIcons();
  filterFavoritesList();
}

const openFavoritesModalOption = document.getElementById('openFavoritesModalOption');
if (openFavoritesModalOption) {
  openFavoritesModalOption.addEventListener('click', (e) => {
    e.stopPropagation();
    openedFromSettings = true;
    renderDashboardFavorites();
    if (favoritesSheetModal) favoritesSheetModal.classList.add('open');
    if (settingsSheetModal) settingsSheetModal.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

if (closeFavoritesSheetBtnRef) {
  closeFavoritesSheetBtnRef.addEventListener('click', () => closeSubSheetToSettings(favoritesSheetModal));
}

const openDonateOption = document.getElementById('openDonateOption');
if (openDonateOption) {
  openDonateOption.addEventListener('click', () => {
    openedFromSettings = true;
    closeAllModals();
    if (donateSheetModal) donateSheetModal.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  });
}

if (closeDonateSheetBtnRef) {
  closeDonateSheetBtnRef.addEventListener('click', () => closeSubSheetToSettings(donateSheetModal));
}

// DONATE COPY BUTTONS LOGIC
const copyGcashBtn = document.getElementById('copyGcashBtn');
const copyMaribankBtn = document.getElementById('copyMaribankBtn');

if (copyGcashBtn) {
  copyGcashBtn.addEventListener('click', () => {
    copyTextToClipboard("09231327167", () => {
      showToast("GCash number copied!");
    });
  });
}

if (copyMaribankBtn) {
  copyMaribankBtn.addEventListener('click', () => {
    copyTextToClipboard("13956844416", () => {
      showToast("MariBank account copied!");
    });
  });
}

function showInAppConfirmModal(titleText, bodyText, onConfirmCallback, cancelBtnLabel = "Cancel", proceedBtnLabel = "Discard") {
  const confirmModal = document.getElementById('confirmModal');
  if (!confirmModal) {
    if (confirm(bodyText)) onConfirmCallback();
    return;
  }

  const titleEl = confirmModal.querySelector('.confirm-title') || confirmModal.querySelector('h3');
  const bodyEl = confirmModal.querySelector('.confirm-message') || confirmModal.querySelector('p');
  const proceedBtn = confirmModal.querySelector('.confirm-btn.proceed');
  const cancelBtn = confirmModal.querySelector('.confirm-btn.cancel');

  if (titleEl) titleEl.textContent = titleText;
  if (bodyEl) bodyEl.textContent = bodyText;
  if (cancelBtn) cancelBtn.textContent = cancelBtnLabel;
  if (proceedBtn) proceedBtn.textContent = proceedBtnLabel;

  confirmModal.classList.add('open');

  const handleProceed = async () => {
    confirmModal.classList.remove('open');
    cleanup();
    await onConfirmCallback();
  };

  const handleCancel = () => {
    confirmModal.classList.remove('open');
    cleanup();
  };

  const cleanup = () => {
    if (proceedBtn) proceedBtn.removeEventListener('click', handleProceed);
    if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
  };

  if (proceedBtn) proceedBtn.addEventListener('click', handleProceed);
  if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
}

function restoreReaderMemoryState() {
  if (currentVersionLabel) {
    currentVersionLabel.textContent = currentVersion;
  }

  const savedFontSize = localStorage.getItem('sog_font_size') || '1.0';
  if (fontSizeSlider) {
    fontSizeSlider.value = savedFontSize;
  }

  const readingContainer = document.getElementById('readingContainer');
  if (readingContainer) {
    readingContainer.style.fontSize = `${savedFontSize}rem`;
  }

  if (speedBtn) {
    const currentSpeed = speedRates[currentSpeedIndex];
    speedBtn.textContent = `${currentSpeed.toFixed(currentSpeed % 1 === 0 ? 1 : 2)}x`;
  }
}

function initAppStartup() {
  restoreReaderMemoryState();
  updateDashboardMetrics();
  updateOfflineAudioMetrics();
  renderDashboardFavorites();
  updateDisplay();
  if (miniAudioPlayer) miniAudioPlayer.style.display = 'none';
}

initAppStartup();

// APP VERSION & OTA UPDATE MANAGER
const CURRENT_APP_VERSION = "1.0.0";
const UPDATE_MANIFEST_URL = "https://raw.githubusercontent.com/pleromatechph/bible-app/main/update-manifest.json";

const updateSheetModal = document.getElementById('updateSheetModal');
const closeUpdateSheetBtn = document.getElementById('closeUpdateSheetBtn');
const openUpdateOption = document.getElementById('openUpdateOption');
const updateBadgeDot = document.getElementById('updateBadgeDot');
const inlineUpdateStatus = document.getElementById('inlineUpdateStatus');
const updateBtnIcon = document.getElementById('updateBtnIcon');
const updateStatusTitle = document.getElementById('updateStatusTitle');
const updateVersionLabel = document.getElementById('updateVersionLabel');
const whatsNewContainer = document.getElementById('whatsNewContainer');
const whatsNewList = document.getElementById('whatsNewList');
const downloadOtaUpdateBtn = document.getElementById('downloadOtaUpdateBtn');
const updateProgressWrapper = document.getElementById('updateProgressWrapper');
const updateProgressBarFill = document.getElementById('updateProgressBarFill');
const updateProgressPercent = document.getElementById('updateProgressPercent');

let latestUpdatePackage = null;

async function checkForAppUpdates(isManualClick = false) {
  try {
    if (isManualClick) {
      if (inlineUpdateStatus) {
        inlineUpdateStatus.textContent = "Checking for updates...";
        inlineUpdateStatus.style.color = "var(--accent-blue)";
        inlineUpdateStatus.style.display = "block";
      }
      if (updateBtnIcon) updateBtnIcon.classList.add('spin-icon');
    }
    
    const response = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Manifest fetch failed");
    
    const data = await response.json();
    latestUpdatePackage = data;

    if (data.version && data.version !== CURRENT_APP_VERSION) {
      if (updateBadgeDot) updateBadgeDot.style.display = 'block';
      
      if (isManualClick) {
        if (inlineUpdateStatus) inlineUpdateStatus.style.display = "none";
        if (updateBtnIcon) updateBtnIcon.classList.remove('spin-icon');

        if (updateStatusTitle) updateStatusTitle.textContent = "New Update Available! 🎉";
        if (updateVersionLabel) updateVersionLabel.textContent = `Current: v${CURRENT_APP_VERSION} ➔ Latest: v${data.version}`;
        
        if (whatsNewList && data.whatsNew && Array.isArray(data.whatsNew)) {
          whatsNewList.innerHTML = data.whatsNew.map(item => `<li>${item}</li>`).join('');
          if (whatsNewContainer) whatsNewContainer.style.display = 'block';
        }
        if (downloadOtaUpdateBtn) downloadOtaUpdateBtn.style.display = 'block';

        if (updateSheetModal) updateSheetModal.classList.add('open');
        if (drawerOverlay) drawerOverlay.classList.add('open');
      }
    } else {
      if (updateBadgeDot) updateBadgeDot.style.display = 'none';
      if (isManualClick) {
        if (updateBtnIcon) updateBtnIcon.classList.remove('spin-icon');
        if (inlineUpdateStatus) {
          inlineUpdateStatus.textContent = "You're on the latest version! (v" + CURRENT_APP_VERSION + ")";
          inlineUpdateStatus.style.color = "var(--icon-neutral)";
          inlineUpdateStatus.style.display = "block";
          setTimeout(() => {
            inlineUpdateStatus.style.display = "none";
          }, 3000);
        }
      }
    }
  } catch (err) {
    console.warn("Update check failed:", err);
    if (isManualClick) {
      if (updateBtnIcon) updateBtnIcon.classList.remove('spin-icon');
      if (inlineUpdateStatus) {
        inlineUpdateStatus.textContent = "Unable to check updates. Check connection.";
        inlineUpdateStatus.style.color = "var(--danger-color)";
        inlineUpdateStatus.style.display = "block";
        setTimeout(() => {
          inlineUpdateStatus.style.display = "none";
        }, 3500);
      }
    }
  }
}

if (openUpdateOption) {
  openUpdateOption.addEventListener('click', (e) => {
    e.stopPropagation();
    checkForAppUpdates(true);
  });
}

if (closeUpdateSheetBtn) {
  closeUpdateSheetBtn.addEventListener('click', () => closeSubSheetToSettings(updateSheetModal));
}

if (downloadOtaUpdateBtn) {
  downloadOtaUpdateBtn.addEventListener('click', async () => {
    if (!latestUpdatePackage || !latestUpdatePackage.downloadUrl) return;

    downloadOtaUpdateBtn.disabled = true;
    downloadOtaUpdateBtn.textContent = "Downloading Update...";
    if (updateProgressWrapper) updateProgressWrapper.style.display = 'flex';

    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater) {
        const { CapacitorUpdater } = window.Capacitor.Plugins;
        
        CapacitorUpdater.addListener('download', (info) => {
          if (info.percent !== undefined) {
            const pct = Math.round(info.percent);
            if (updateProgressBarFill) updateProgressBarFill.style.width = `${pct}%`;
            if (updateProgressPercent) updateProgressPercent.textContent = `${pct}%`;
          }
        });

        const versionData = await CapacitorUpdater.download({
          url: latestUpdatePackage.downloadUrl,
          version: latestUpdatePackage.version
        });

        downloadOtaUpdateBtn.textContent = "Installing Update...";
        await CapacitorUpdater.set(versionData);
        await CapacitorUpdater.reload();
      } else {
        showToast("OTA updates are active only on mobile native build.");
        setTimeout(() => {
          if (updateProgressWrapper) updateProgressWrapper.style.display = 'none';
          downloadOtaUpdateBtn.disabled = false;
          downloadOtaUpdateBtn.textContent = "Download & Install Update";
        }, 2000);
      }
    } catch (err) {
      console.error("OTA Download Error:", err);
      showToast("Update failed to download");
      downloadOtaUpdateBtn.disabled = false;
      downloadOtaUpdateBtn.textContent = "Retry Download";
    }
  });
}

// Automatic Background Check on Startup
checkForAppUpdates(false);

// Live Update Auto-Notification Initialization
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater) {
  const { CapacitorUpdater } = window.Capacitor.Plugins;
  CapacitorUpdater.notifyAppReady().catch(err => console.warn("Updater notify error:", err));
}