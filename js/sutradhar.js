/* ==========================================================================
   GAME OF BHARATH — SUTRADHAR (INTERACTIVE HERITAGE & WELLNESS COMPANION)
   Modules:
     - Module 1: Floating, Draggable UI Widget & Regional Animated SVG Avatars
     - Module 2: Centralized Knowledge Graph Consumer & Prompt Engine
     - Module 3: Context-Aware Trigger Engine (Struggle, Brilliant Move, Opening)
     - Module 4: Gamification & Lore Library Discovery with Web Speech API
   ========================================================================== */

const Sutradhar = (() => {
    // Session memory for deduplication
    const STORAGE_KEY_SEEN = 'sutradhar_displayed_facts_session';
    let displayedFacts = new Set();

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY_SEEN);
        if (raw) displayedFacts = new Set(JSON.parse(raw));
    } catch (e) {}

    function recordFactSeen(factText) {
        if (!factText) return;
        displayedFacts.add(factText);
        try {
            sessionStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(Array.from(displayedFacts)));
        } catch (e) {}
    }

    // Active state and game tracking
    let currentRegion = 'karnataka';
    let currentGameKey = 'aliguliMane';
    let isMinimized = false;
    let isDragging = false;
    let typewriterTimeout = null;
    let currentFactObject = null;
    let idleTimer = null;
    const IDLE_STRUGGLE_THRESHOLD_MS = 20000; // 20 seconds struggle trigger

    // DOM Elements
    let widgetEl = null;
    let orbBtn = null;
    let bubbleEl = null;
    let avatarContainer = null;
    let bodyTextEl = null;
    let cursorEl = null;
    let categoryPillEl = null;
    let nameEl = null;
    let titleSubEl = null;
    let btnSpeak = null;
    let btnExplore = null;
    let btnNext = null;
    let btnClose = null;
    let modalBackdrop = null;

    /**
     * Regional Avatar SVG Generators with Idle & Gesture Animations
     */
    const AVATAR_SVGS = {
        karnataka: `
            <svg class="sutradhar-avatar-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="avatar-halo" cx="50" cy="50" r="46" stroke="#ffd700" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
                <g class="avatar-body">
                    <!-- Royal Mysore Angavastram -->
                    <path d="M22 88 Q50 65 78 88 L85 100 L15 100 Z" fill="#b88a28"/>
                    <path d="M28 88 Q50 72 72 88 L75 100 L25 100 Z" fill="#8b0000"/>
                    <!-- Face & Ears -->
                    <path d="M50 28 C34 28 32 44 32 54 C32 68 40 76 50 76 C60 76 68 68 68 54 C68 44 66 28 50 28 Z" fill="#f5d0a9"/>
                    <circle cx="31" cy="54" r="5" fill="#e8bc92"/>
                    <circle cx="69" cy="54" r="5" fill="#e8bc92"/>
                    <!-- Vermilion Tilak / Gandham -->
                    <rect x="48" y="36" width="4" height="12" rx="2" fill="#d9381e"/>
                    <circle cx="50" cy="48" r="2.5" fill="#ffd700"/>
                    <!-- Eyes & Smile -->
                    <g class="avatar-eyes">
                        <circle cx="42" cy="50" r="2.5" fill="#2d1500"/>
                        <circle cx="58" cy="50" r="2.5" fill="#2d1500"/>
                        <path d="M40 46 Q43 44 46 46" stroke="#2d1500" stroke-width="1.2" stroke-linecap="round"/>
                        <path d="M54 46 Q57 44 60 46" stroke="#2d1500" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <path d="M45 62 Q50 66 55 62" stroke="#8b4513" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <!-- Royal Mysore Peta Turban with Gold Zari & Kalgi -->
                    <path d="M24 34 C24 16 40 10 50 10 C62 10 76 16 76 34 Q50 26 24 34 Z" fill="#e65100"/>
                    <path d="M22 32 C35 24 65 24 78 32 C72 38 28 38 22 32 Z" fill="#ffd700"/>
                    <path d="M48 6 L52 6 L51 16 L49 16 Z" fill="#ffd700"/>
                    <circle cx="50" cy="6" r="3" fill="#00e5ff"/>
                    <!-- Pearl Kundala Earrings -->
                    <circle cx="31" cy="58" r="2.5" fill="#ffd700"/>
                    <circle cx="69" cy="58" r="2.5" fill="#ffd700"/>
                </g>
            </svg>
        `,
        punjab: `
            <svg class="sutradhar-avatar-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="avatar-halo" cx="50" cy="50" r="46" stroke="#ff9900" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
                <g class="avatar-body">
                    <!-- Kurta & Phulkari Stole -->
                    <path d="M22 88 Q50 66 78 88 L85 100 L15 100 Z" fill="#ff9900"/>
                    <path d="M26 88 L34 100 L44 86 Z" fill="#10b981"/>
                    <path d="M74 88 L66 100 L56 86 Z" fill="#ff0055"/>
                    <!-- Face & Majestic White Beard -->
                    <path d="M50 30 C35 30 34 46 34 54 C34 68 40 76 50 76 C60 76 66 68 66 54 C66 46 65 30 50 30 Z" fill="#f5d0a9"/>
                    <path d="M34 58 C34 78 42 86 50 86 C58 86 66 78 66 58 C60 62 40 62 34 58 Z" fill="#f0ede6"/>
                    <path d="M40 56 Q50 62 60 56 Q50 66 40 56 Z" fill="#f0ede6"/>
                    <!-- Eyes & Warm Expression -->
                    <g class="avatar-eyes">
                        <circle cx="43" cy="48" r="2.5" fill="#2d1500"/>
                        <circle cx="57" cy="48" r="2.5" fill="#2d1500"/>
                        <path d="M40 44 Q44 42 47 44" stroke="#f0ede6" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M53 44 Q56 42 60 44" stroke="#f0ede6" stroke-width="1.8" stroke-linecap="round"/>
                    </g>
                    <!-- Punjabi Pagri (Turban) with Turla Crest -->
                    <path d="M22 36 C22 14 42 8 50 8 C64 8 78 16 78 36 Q50 26 22 36 Z" fill="#ff6f00"/>
                    <path d="M26 30 Q50 20 74 30 L76 36 Q50 28 24 36 Z" fill="#ffd700"/>
                    <!-- Turla / Fan Crest -->
                    <path d="M42 8 Q50 -2 58 8 Z" fill="#ff6f00"/>
                    <circle cx="50" cy="8" r="3.5" fill="#ffd700"/>
                </g>
            </svg>
        `,
        odisha: `
            <svg class="sutradhar-avatar-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="avatar-halo" cx="50" cy="50" r="46" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
                <g class="avatar-body">
                    <!-- Odishan Handloom Cotton Kurta -->
                    <path d="M22 88 Q50 66 78 88 L85 100 L15 100 Z" fill="#880e4f"/>
                    <path d="M30 88 L50 78 L70 88 L65 100 L35 100 Z" fill="#00e5ff"/>
                    <!-- Face & Sacred Chandan Tilak -->
                    <path d="M50 28 C34 28 32 44 32 54 C32 68 40 76 50 76 C60 76 68 68 68 54 C68 44 66 28 50 28 Z" fill="#f5d0a9"/>
                    <!-- Chandan & Tulsi Tilak -->
                    <path d="M46 36 Q50 44 54 36 L50 32 Z" fill="#fff9c4"/>
                    <circle cx="50" cy="44" r="2" fill="#d9381e"/>
                    <!-- Eyes & Artistic Gaze -->
                    <g class="avatar-eyes">
                        <circle cx="42" cy="50" r="2.5" fill="#2d1500"/>
                        <circle cx="58" cy="50" r="2.5" fill="#2d1500"/>
                        <path d="M38 46 Q43 43 47 46" stroke="#2d1500" stroke-width="1.3" stroke-linecap="round"/>
                        <path d="M53 46 Q57 43 62 46" stroke="#2d1500" stroke-width="1.3" stroke-linecap="round"/>
                    </g>
                    <path d="M45 63 Q50 67 55 63" stroke="#8b4513" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <!-- Traditional Odishan Topknot with Peacock Feather Brush -->
                    <circle cx="50" cy="18" r="12" fill="#1a0c02"/>
                    <circle cx="50" cy="24" r="6" fill="#ffd700"/>
                    <path d="M48 6 Q50 0 54 4 Q58 8 50 14" fill="#00b0ff"/>
                    <circle cx="53" cy="5" r="2" fill="#00e676"/>
                </g>
            </svg>
        `,
        maharashtra: `
            <svg class="sutradhar-avatar-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="avatar-halo" cx="50" cy="50" r="46" stroke="#ff5252" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
                <g class="avatar-body">
                    <!-- Angarkha & Saffron Shela -->
                    <path d="M22 88 Q50 66 78 88 L85 100 L15 100 Z" fill="#1a237e"/>
                    <path d="M25 86 Q50 70 75 86 L78 100 L22 100 Z" fill="#ff6f00"/>
                    <!-- Face & Traditional Chandrakor Tilak (Crescent Moon) -->
                    <path d="M50 28 C34 28 32 44 32 54 C32 68 40 76 50 76 C60 76 68 68 68 54 C68 44 66 28 50 28 Z" fill="#f5d0a9"/>
                    <!-- Maratha Chandrakor Tilak -->
                    <path d="M47 38 C47 43 53 43 53 38 C51 40 49 40 47 38 Z" fill="#d9381e"/>
                    <circle cx="50" cy="43" r="1.5" fill="#2d1500"/>
                    <!-- Eyes & Determined Scholar Smile -->
                    <g class="avatar-eyes">
                        <circle cx="42" cy="50" r="2.5" fill="#2d1500"/>
                        <circle cx="58" cy="50" r="2.5" fill="#2d1500"/>
                        <path d="M39 45 Q44 43 47 46" stroke="#2d1500" stroke-width="1.4" stroke-linecap="round"/>
                        <path d="M53 46 Q56 43 61 45" stroke="#2d1500" stroke-width="1.4" stroke-linecap="round"/>
                    </g>
                    <path d="M40 58 Q50 61 60 58" stroke="#2d1500" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M45 64 Q50 68 55 64" stroke="#8b4513" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <!-- Classical Maratha Pagadi (Shahi Pheta) with Gold Jari -->
                    <path d="M20 34 C20 18 36 12 50 12 C64 12 80 18 80 34 Q50 26 20 34 Z" fill="#b71c1c"/>
                    <path d="M72 20 L84 14 L80 26 Z" fill="#ffd700"/>
                    <path d="M24 32 Q50 24 76 32 L78 36 Q50 28 22 36 Z" fill="#ffd700"/>
                </g>
            </svg>
        `,
        jammuKashmir: `
            <svg class="sutradhar-avatar-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="avatar-halo" cx="50" cy="50" r="46" stroke="#b388ff" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
                <g class="avatar-body">
                    <!-- Kashmiri Woolen Pheran with Kashida Collar -->
                    <path d="M22 88 Q50 64 78 88 L85 100 L15 100 Z" fill="#311b92"/>
                    <path d="M38 74 Q50 86 62 74 L60 100 L40 100 Z" fill="#b388ff"/>
                    <!-- Face & Serene Demeanor -->
                    <path d="M50 28 C34 28 32 44 32 54 C32 68 40 76 50 76 C60 76 68 68 68 54 C68 44 66 28 50 28 Z" fill="#faebd7"/>
                    <!-- Eyes & Serene Smile -->
                    <g class="avatar-eyes">
                        <circle cx="42" cy="50" r="2.5" fill="#2d1500"/>
                        <circle cx="58" cy="50" r="2.5" fill="#2d1500"/>
                        <path d="M39 45 Q43 43 47 45" stroke="#3e2723" stroke-width="1.3" stroke-linecap="round"/>
                        <path d="M53 45 Q57 43 61 45" stroke="#3e2723" stroke-width="1.3" stroke-linecap="round"/>
                    </g>
                    <path d="M45 62 Q50 66 55 62" stroke="#5d4037" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <!-- Kashmiri Karakul / Taranga Cap -->
                    <path d="M26 34 C26 18 38 12 50 12 C62 12 74 18 74 34 Z" fill="#212121"/>
                    <path d="M24 32 Q50 26 76 32 L78 36 Q50 30 22 36 Z" fill="#8d6e63"/>
                    <!-- Autumn Chinar Leaf Pin -->
                    <path d="M48 18 L52 18 L50 24 Z" fill="#ff7043"/>
                </g>
            </svg>
        `
    };

    /**
     * Creates and mounts the Sutradhar Widget and Deep Dive Modal in DOM
     */
    function setupDOM() {
        if (widgetEl && document.body.contains(widgetEl)) return;

        // Container
        widgetEl = document.createElement('div');
        widgetEl.id = 'sutradharCompanion';
        widgetEl.className = 'sutradhar-widget';

        widgetEl.innerHTML = `
            <!-- Chat Bubble -->
            <div class="sutradhar-bubble" id="sutradharBubble">
                <header class="sutradhar-header">
                    <div class="sutradhar-identity">
                        <span id="sutradharIcon" style="font-size: 1.2rem;">🦚</span>
                        <div>
                            <div class="sutradhar-name">
                                <span id="sutradharAvatarName">Vidyaranya Acharya</span>
                            </div>
                            <span class="sutradhar-title-sub" id="sutradharAvatarTitle">Mysore Court Scholar</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="sutradhar-category-pill cat-history" id="sutradharCatPill">HISTORICAL</span>
                        <button class="sutradhar-close-btn" id="btnSutradharClose" title="Minimize Companion">&times;</button>
                    </div>
                </header>

                <div class="sutradhar-body" id="sutradharBody">
                    <span id="sutradharText"></span><span class="sutradhar-typewriter-cursor" id="sutradharCursor"></span>
                </div>

                <footer class="sutradhar-actions">
                    <button class="sutradhar-btn btn-explore" id="btnSutradharDeepDive" title="Explore Deeper into Ancient Lore">
                        <span>📜</span> EXPLORE DEEPER
                    </button>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button class="sutradhar-btn btn-speak" id="btnSutradharSpeak" title="Narrate with Web Speech API">
                            <span id="speakIcon">🔊</span>
                        </button>
                        <button class="sutradhar-btn btn-next" id="btnSutradharNext" title="Tell me something else">
                            <span>🔄</span> NEXT
                        </button>
                    </div>
                </footer>
            </div>

            <!-- Floating Minimized Orb -->
            <button class="sutradhar-orb-btn" id="sutradharOrbBtn" title="Sutradhar — Heritage & Wellness Companion">
                <div class="sutradhar-orb-pulse"></div>
                <div class="sutradhar-orb-badge" id="sutradharOrbBadge">TIP</div>
                <div id="sutradharAvatarContainer">
                    ${AVATAR_SVGS.karnataka}
                </div>
            </button>
        `;

        document.body.appendChild(widgetEl);

        // Reference elements
        orbBtn = document.getElementById('sutradharOrbBtn');
        bubbleEl = document.getElementById('sutradharBubble');
        avatarContainer = document.getElementById('sutradharAvatarContainer');
        bodyTextEl = document.getElementById('sutradharText');
        cursorEl = document.getElementById('sutradharCursor');
        categoryPillEl = document.getElementById('sutradharCatPill');
        nameEl = document.getElementById('sutradharAvatarName');
        titleSubEl = document.getElementById('sutradharAvatarTitle');
        btnSpeak = document.getElementById('btnSutradharSpeak');
        btnExplore = document.getElementById('btnSutradharDeepDive');
        btnNext = document.getElementById('btnSutradharNext');
        btnClose = document.getElementById('btnSutradharClose');

        // Deep Dive Modal Container
        setupDeepDiveModal();

        // Event bindings
        bindEvents();
        makeDraggable(widgetEl, orbBtn);
    }

    /**
     * Creates the Deep Dive Educational Lore Modal
     */
    function setupDeepDiveModal() {
        if (document.getElementById('sutradharDeepDiveModal')) return;

        modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'sutradharDeepDiveModal';
        modalBackdrop.className = 'sutradhar-modal-backdrop';
        modalBackdrop.innerHTML = `
            <div class="sutradhar-modal-card">
                <button type="button" class="sutradhar-close-btn" id="btnCloseDeepDiveModal" style="position: absolute; top: 20px; right: 20px; font-size: 1.4rem;">&times;</button>
                <div class="sutradhar-modal-badge" id="modalBadge">🏆 LORE UNLOCKED</div>
                <h3 class="sutradhar-modal-title" id="modalTitle">Sacred Origins</h3>
                <div class="sutradhar-modal-toast" id="modalToast">
                    <span>✨</span> Unlocked in Sutradhar's Journal (Player Profile)!
                </div>
                <div class="sutradhar-modal-content" id="modalContent"></div>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="sutradhar-btn btn-explore" id="btnAcknowledgeLore" style="padding: 10px 24px;">CONTINUE PLAYING</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalBackdrop);

        const btnCloseModal = document.getElementById('btnCloseDeepDiveModal');
        const btnAck = document.getElementById('btnAcknowledgeLore');
        if (btnCloseModal) btnCloseModal.addEventListener('click', closeDeepDiveModal);
        if (btnAck) btnAck.addEventListener('click', closeDeepDiveModal);
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeDeepDiveModal();
        });
    }

    function openDeepDiveModal() {
        if (!currentFactObject || !currentFactObject.deep_dive) return;
        const dd = currentFactObject.deep_dive;

        document.getElementById('modalBadge').textContent = `🏆 ${dd.badge || 'LORE UNLOCKED'}`;
        document.getElementById('modalTitle').textContent = dd.title;
        document.getElementById('modalContent').textContent = dd.content;

        modalBackdrop.classList.add('is-visible');

        // Gamification unlock event: Record lore in global store
        if (typeof BharathStore !== 'undefined' && typeof BharathStore.unlockLore === 'function') {
            BharathStore.unlockLore(dd.loreId, dd);
        } else {
            // LocalStorage persistence fallback
            try {
                const stored = JSON.parse(localStorage.getItem('bharath_unlocked_lore') || '[]');
                if (!stored.includes(dd.loreId)) {
                    stored.push(dd.loreId);
                    localStorage.setItem('bharath_unlocked_lore', JSON.stringify(stored));
                }
            } catch (e) {}
        }
    }

    function closeDeepDiveModal() {
        if (modalBackdrop) modalBackdrop.classList.remove('is-visible');
    }

    /**
     * Draggable Widget Physics and Boundary Clamping
     */
    function makeDraggable(element, handle) {
        let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
        let moved = false;

        const onPointerDown = (e) => {
            if (e.target.closest('.sutradhar-bubble') && !e.target.closest('.sutradhar-header')) return;
            isDragging = true;
            moved = false;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startY = e.clientY || (e.touches && e.touches[0].clientY);

            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            element.classList.add('is-dragging');
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            const currentX = e.clientX || (e.touches && e.touches[0].clientX);
            const currentY = e.clientY || (e.touches && e.touches[0].clientY);
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            if (Math.hypot(deltaX, deltaY) > 5) moved = true;

            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;

            // Viewport clamping
            const pad = 10;
            const maxLeft = window.innerWidth - element.offsetWidth - pad;
            const maxTop = window.innerHeight - element.offsetHeight - pad;

            newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
            newTop = Math.max(pad, Math.min(newTop, maxTop));

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        };

        const onPointerUp = () => {
            isDragging = false;
            element.classList.remove('is-dragging');
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        handle.addEventListener('pointerdown', onPointerDown);
    }

    /**
     * Typewriter Text Reveal Animation
     */
    function typeText(targetEl, text, speed = 20, callback) {
        if (typewriterTimeout) clearTimeout(typewriterTimeout);
        targetEl.textContent = '';
        if (cursorEl) cursorEl.style.display = 'inline-block';

        let index = 0;
        function type() {
            if (index < text.length) {
                targetEl.textContent += text.charAt(index);
                index++;
                typewriterTimeout = setTimeout(type, speed);
            } else {
                if (cursorEl) cursorEl.style.display = 'none';
                if (typeof callback === 'function') callback();
            }
        }
        type();
    }

    /**
     * Advanced Conversational Text-to-Speech Engine
     * Prioritizes high-quality natural Indian English & regional voices with natural cadence
     */
    let isSpeaking = false;
    let availableVoices = [];

    function loadVoices() {
        if ('speechSynthesis' in window) {
            availableVoices = window.speechSynthesis.getVoices();
        }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    function selectBestVoice(lang = 'en') {
        if (!availableVoices || availableVoices.length === 0) {
            loadVoices();
        }
        if (!availableVoices || availableVoices.length === 0) return null;

        // Preference ranking for natural, conversational Indian & natural voices
        const indianVoiceMatchers = [
            /india/i, /prabhat/i, /neerja/i, /heera/i, /ravi/i, /en-in/i, /hi-in/i,
            /google.*uk.*male/i, /google.*english/i, /natural/i, /samantha/i
        ];

        for (const matcher of indianVoiceMatchers) {
            const match = availableVoices.find(v => matcher.test(v.name) || matcher.test(v.lang));
            if (match) return match;
        }

        return availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
    }

    function speakText(text, category = 'TRIVIA') {
        if (!('speechSynthesis' in window)) {
            console.warn('Voice narration not supported.');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            if (btnSpeak) btnSpeak.classList.remove('is-speaking');
            return;
        }

        window.speechSynthesis.cancel();

        // Conversational prosody pacing: soften abrupt transitions
        const conversationalText = text
            .replace(/\s*;\s*/g, ', ')
            .replace(/\s*—\s*/g, ', ')
            .replace(/\s*\(\s*/g, ' — ')
            .replace(/\s*\)\s*/g, ' — ');

        const utterance = new SpeechSynthesisUtterance(conversationalText);
        const bestVoice = selectBestVoice();
        if (bestVoice) utterance.voice = bestVoice;

        // Emotional & Category Modulation
        const cat = (category || 'TRIVIA').toUpperCase();
        if (cat === 'COGNITIVE' || cat === 'TRIUMPH') {
            utterance.rate = 0.98;
            utterance.pitch = 1.06;
        } else if (cat === 'HISTORY' || cat === 'THERAPY') {
            utterance.rate = 0.90;
            utterance.pitch = 0.98;
        } else {
            utterance.rate = 0.94;
            utterance.pitch = 1.02;
        }

        utterance.lang = bestVoice ? bestVoice.lang : 'en-IN';

        utterance.onstart = () => {
            isSpeaking = true;
            if (btnSpeak) btnSpeak.classList.add('is-speaking');
            triggerAvatarAnimation('nod');
        };

        utterance.onend = () => {
            isSpeaking = false;
            if (btnSpeak) btnSpeak.classList.remove('is-speaking');
        };

        utterance.onerror = () => {
            isSpeaking = false;
            if (btnSpeak) btnSpeak.classList.remove('is-speaking');
        };

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Triggers avatar gesture animations
     */
    function triggerAvatarAnimation(type = 'nod') {
        if (!avatarContainer) return;
        const svg = avatarContainer.querySelector('svg');
        if (!svg) return;

        svg.classList.remove('anim-nod', 'anim-clap', 'anim-point');
        void svg.offsetWidth; // trigger reflow
        svg.classList.add(`anim-${type}`);
        setTimeout(() => {
            svg.classList.remove(`anim-${type}`);
        }, 1800);
    }

    /**
     * Updates and presents dialogue with Category formatting and deduplication
     */
    function showPrompt(category, text, deepDiveData = null, gesture = 'nod') {
        setupDOM();
        if (isMinimized) {
            bubbleEl.classList.remove('is-hidden');
            isMinimized = false;
        }

        currentFactObject = {
            category,
            text,
            deep_dive: deepDiveData
        };

        recordFactSeen(text);

        // Update Header Pill
        categoryPillEl.className = `sutradhar-category-pill cat-${category.toLowerCase()}`;
        categoryPillEl.textContent = category.toUpperCase();

        // Trigger gesture
        triggerAvatarAnimation(gesture);

        // Run typewriter effect
        typeText(bodyTextEl, text, 18);
    }

    /**
     * Resolves game object from SUTRADHAR_DATA
     */
    function getGameData(regionKey, gameKey) {
        if (typeof SUTRADHAR_DATA === 'undefined') return null;
        const r = SUTRADHAR_DATA[regionKey] || SUTRADHAR_DATA.karnataka;
        if (!r || !r.games) return null;
        return r.games[gameKey] || Object.values(r.games)[0];
    }

    /**
     * Fetches an unrepeated fact or least recently seen fact
     */
    function getRandomUnseenFact(arr) {
        if (!arr || arr.length === 0) return "Explore the timeless wisdom of traditional Bharath games!";
        const unseens = arr.filter(f => !displayedFacts.has(f));
        if (unseens.length > 0) {
            return unseens[Math.floor(Math.random() * unseens.length)];
        }
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Context-Aware Trigger: Struggle / Cognitive Load ($>20s idle)
     */
    function triggerStruggleRelief() {
        const data = getGameData(currentRegion, currentGameKey);
        if (!data) return;
        const fact = getRandomUnseenFact(data.therapeutic_relief);
        showPrompt('THERAPY', fact, data.deep_dive, 'nod');
    }

    /**
     * Context-Aware Trigger: Brilliant Move / Multi-Piece Capture
     */
    function triggerBrilliantMove(reason = '') {
        const data = getGameData(currentRegion, currentGameKey);
        if (!data) return;
        const fact = getRandomUnseenFact(data.cognitive_mapping);
        const prefix = reason ? `${reason}! ` : 'Brilliant move! ';
        showPrompt('COGNITIVE', `${prefix}${fact}`, data.deep_dive, 'clap');
    }

    /**
     * Context-Aware Trigger: Opening Lobby / Game Launch
     */
    function triggerOpeningLore() {
        const data = getGameData(currentRegion, currentGameKey);
        if (!data) return;
        const fact = getRandomUnseenFact(data.historical_impact);
        showPrompt('HISTORY', fact, data.deep_dive, 'point');
    }

    /**
     * Next Fact Rotator
     */
    function cycleNextFact() {
        const data = getGameData(currentRegion, currentGameKey);
        if (!data) return;

        const categories = ['history', 'cognitive', 'therapy', 'trivia'];
        const chosenCat = categories[Math.floor(Math.random() * categories.length)];

        let fact = '';
        let label = 'TRIVIA';
        let gesture = 'nod';

        if (chosenCat === 'history') {
            fact = getRandomUnseenFact(data.historical_impact);
            label = 'HISTORY';
            gesture = 'point';
        } else if (chosenCat === 'cognitive') {
            fact = getRandomUnseenFact(data.cognitive_mapping);
            label = 'COGNITIVE';
            gesture = 'clap';
        } else if (chosenCat === 'therapy') {
            fact = getRandomUnseenFact(data.therapeutic_relief);
            label = 'THERAPY';
            gesture = 'nod';
        } else {
            fact = getRandomUnseenFact(data.interactive_trivia);
            label = 'TRIVIA';
            gesture = 'point';
        }

        showPrompt(label, fact, data.deep_dive, gesture);
    }

    /**
     * Resets and monitors player idle struggle timer
     */
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            triggerStruggleRelief();
        }, IDLE_STRUGGLE_THRESHOLD_MS);
    }

    /**
     * Event Listeners Binding
     */
    function bindEvents() {
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                bubbleEl.classList.add('is-hidden');
                isMinimized = true;
            });
        }

        if (orbBtn) {
            orbBtn.addEventListener('click', () => {
                if (bubbleEl.classList.contains('is-hidden')) {
                    bubbleEl.classList.remove('is-hidden');
                    isMinimized = false;
                } else {
                    cycleNextFact();
                }
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', (e) => {
                e.stopPropagation();
                cycleNextFact();
            });
        }

        if (btnExplore) {
            btnExplore.addEventListener('click', (e) => {
                e.stopPropagation();
                openDeepDiveModal();
            });
        }

        if (btnSpeak) {
            btnSpeak.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentFactObject && currentFactObject.text) {
                    speakText(currentFactObject.text, currentFactObject.category);
                }
            });
        }

        // Global user interaction hooks to reset struggle timer
        ['pointerdown', 'keydown'].forEach(evt => {
            window.addEventListener(evt, () => resetIdleTimer(), { passive: true });
        });
    }

    /**
     * Updates active region and game
     */
    function setContext(regionKey, gameKey = null) {
        setupDOM();
        const rKey = (regionKey === 'jk' || regionKey === 'jammuKashmir') ? 'jammuKashmir' : regionKey;
        currentRegion = rKey;

        if (gameKey) {
            currentGameKey = gameKey;
        } else {
            // Default games per region
            if (rKey === 'karnataka') currentGameKey = 'aliguliMane';
            else if (rKey === 'punjab') currentGameKey = 'chaupar';
            else if (rKey === 'odisha') currentGameKey = 'ganjapa';
            else if (rKey === 'maharashtra') currentGameKey = 'chaturanga';
            else if (rKey === 'jammuKashmir') currentGameKey = 'zarabzero';
        }

        // Swap Avatar SVG & Details
        if (typeof SUTRADHAR_DATA !== 'undefined' && SUTRADHAR_DATA[rKey]) {
            const info = SUTRADHAR_DATA[rKey];
            nameEl.textContent = info.avatarName;
            titleSubEl.textContent = info.avatarTitle;
            document.getElementById('sutradharIcon').textContent = info.avatarIcon;
            avatarContainer.innerHTML = AVATAR_SVGS[rKey] || AVATAR_SVGS.karnataka;
        }

        resetIdleTimer();
    }

    /**
     * Auto-detect environment on page load
     */
    function autoInit() {
        const path = window.location.pathname.toLowerCase();
        let region = 'karnataka';
        let game = 'aliguliMane';

        if (path.includes('karnataka.html')) {
            region = 'karnataka';
            game = 'aliguliMane';
        } else if (path.includes('punjab.html')) {
            region = 'punjab';
            game = 'chaupar';
        } else if (path.includes('odisha.html')) {
            region = 'odisha';
            game = 'ganjapa';
        } else if (path.includes('maharashtra.html')) {
            region = 'maharashtra';
            game = 'chaturanga';
        } else if (path.includes('jk.html')) {
            region = 'jammuKashmir';
            game = 'zarabzero';
        } else if (path.includes('map.html')) {
            region = 'karnataka';
            game = 'aliguliMane';
        }

        setContext(region, game);

        // Delayed opening greeting
        setTimeout(() => {
            triggerOpeningLore();
        }, 1200);
    }

    return {
        init() {
            setupDOM();
            autoInit();
            return this;
        },
        setContext,
        onGameStart: (gKey) => {
            if (gKey) currentGameKey = gKey;
            triggerOpeningLore();
            resetIdleTimer();
        },
        onMove: () => {
            resetIdleTimer();
        },
        onCapture: (reason) => {
            triggerBrilliantMove(reason);
            resetIdleTimer();
        },
        onStruggle: () => {
            triggerStruggleRelief();
        },
        showTip: (cat, text, deepDive) => {
            showPrompt(cat, text, deepDive);
        }
    };
})();

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Sutradhar.init();
    });
}
