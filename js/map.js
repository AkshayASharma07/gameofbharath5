/* ==========================================================================
   INDIA VECTOR POLITICAL MAP INTERACTION ENGINE
   Includes: hover tooltips, region click routing,
             Karnataka (kar.mp4) & Punjab (pun.mp4) video overlays
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /* ── DOM References ──────────────────────────────────────────────────── */
    const mapTooltip = document.getElementById('mapTooltip');
    const mapGlobalScore = document.getElementById('mapGlobalScore');

    /* ── Module 3: Score Breakdown Modal Elements ── */
    const btnTotalPointsHud = document.getElementById('btnTotalPointsHud');
    const scoreBreakdownModal = document.getElementById('scoreBreakdownModal');
    const btnCloseBreakdownModal = document.getElementById('btnCloseBreakdownModal');
    const breakdownTotalPoints = document.getElementById('breakdownTotalPoints');
    const breakdownListContainer = document.getElementById('breakdownListContainer');

    function updateScoreUI(storeState) {
        const total = storeState ? storeState.totalPoints : (typeof BharathStore !== 'undefined' ? BharathStore.getTotalPoints() : 0);
        if (mapGlobalScore) {
            mapGlobalScore.textContent = total.toLocaleString();
        }
        if (breakdownTotalPoints) {
            breakdownTotalPoints.textContent = `${total.toLocaleString()} PTS`;
        }
    }

    if (typeof BharathStore !== 'undefined') {
        BharathStore.subscribe((newState) => {
            updateScoreUI(newState);
        });
    } else {
        const score = parseInt(localStorage.getItem('bharath_total_points') || localStorage.getItem('bharath_player_score') || '0', 10);
        if (mapGlobalScore) mapGlobalScore.textContent = score.toLocaleString();
    }

    /* MODULE 3: Descending Score Breakdown with Zero-Point Fallback */
    function renderScoreBreakdown() {
        if (!breakdownListContainer) return;
        breakdownListContainer.innerHTML = '';

        // Fetch score breakdown from BharathStore
        const breakdown = typeof BharathStore !== 'undefined' 
            ? BharathStore.getScoreBreakdown() 
            : [
                { key: 'karnataka', name: 'Karnataka', nativeName: 'ಕರ್ನಾಟಕ', points: 0 },
                { key: 'punjab', name: 'Punjab', nativeName: 'ਪੰਜਾਬ', points: 0 },
                { key: 'odisha', name: 'Odisha', nativeName: 'ଓଡ଼ିଶା', points: 0 },
                { key: 'maharashtra', name: 'Maharashtra', nativeName: 'महाराष्ट्र', points: 0 },
                { key: 'jammuKashmir', name: 'Jammu & Kashmir', nativeName: 'जम्मू और कश्मीर', points: 0 }
            ];

        // Ensure mathematical descending sort (highest points to lowest)
        breakdown.sort((a, b) => b.points - a.points);

        const rankIcons = ['🥇', '🥈', '🥉', '4', '5'];

        breakdown.forEach((item, index) => {
            const isZero = item.points === 0;
            const row = document.createElement('div');
            row.className = `breakdown-item ${isZero ? 'zero-points' : ''}`;

            // Strict zero-point fallback: Ensure all 5 states are displayed, and 0-point states render as "State Name: 0 Points"
            const pointsText = isZero 
                ? `${item.name}: 0 Points` 
                : `${item.name}: ${item.points.toLocaleString()} Points`;

            row.innerHTML = `
                <div class="breakdown-item-left">
                    <div class="breakdown-rank">${rankIcons[index] || (index + 1)}</div>
                    <div>
                        <span class="breakdown-state-name">${item.name}</span>
                        <span class="breakdown-native-name">(${item.nativeName || ''})</span>
                    </div>
                </div>
                <div class="breakdown-points-tag">${pointsText}</div>
            `;
            breakdownListContainer.appendChild(row);
        });

        const total = typeof BharathStore !== 'undefined' ? BharathStore.getTotalPoints() : 0;
        if (breakdownTotalPoints) {
            breakdownTotalPoints.textContent = `${total.toLocaleString()} PTS`;
        }
    }

    function openScoreBreakdown() {
        if (!scoreBreakdownModal) return;
        renderScoreBreakdown();
        scoreBreakdownModal.classList.add('is-visible');
        if (typeof playSound === 'function') playSound('pickup');
    }

    function closeScoreBreakdown() {
        if (!scoreBreakdownModal) return;
        scoreBreakdownModal.classList.remove('is-visible');
    }

    if (btnTotalPointsHud) {
        btnTotalPointsHud.addEventListener('click', openScoreBreakdown);
    }
    if (btnCloseBreakdownModal) {
        btnCloseBreakdownModal.addEventListener('click', closeScoreBreakdown);
    }
    if (scoreBreakdownModal) {
        scoreBreakdownModal.addEventListener('click', (e) => {
            if (e.target === scoreBreakdownModal) closeScoreBreakdown();
        });
    }

    // Karnataka overlay elements
    const karnatakaModal       = document.getElementById('videoOverlayModal');
    const karnatakaVideo       = document.getElementById('karnatakaIntroVideo');
    const skipKarnatakaBtn     = document.getElementById('skipVideoBtn');
    const karnatakaProgressBar = document.getElementById('videoProgressBar');

    // Punjab overlay elements
    const punjabModal       = document.getElementById('punjabVideoOverlayModal');
    const punjabVideo       = document.getElementById('punjabIntroVideo');
    const skipPunjabBtn     = document.getElementById('skipPunjabVideoBtn');
    const punjabProgressBar = document.getElementById('punjabVideoProgressBar');

    // Odisha overlay elements
    const odishaModal       = document.getElementById('odishaVideoOverlayModal');
    const odishaVideo       = document.getElementById('odishaIntroVideo');
    const skipOdishaBtn     = document.getElementById('skipOdishaVideoBtn');
    const odishaProgressBar = document.getElementById('odishaVideoProgressBar');

    // Maharashtra overlay elements
    const maharashtraModal       = document.getElementById('maharashtraVideoOverlayModal');
    const maharashtraVideo       = document.getElementById('maharashtraIntroVideo');
    const skipMaharashtraBtn     = document.getElementById('skipMaharashtraVideoBtn');
    const maharashtraProgressBar = document.getElementById('maharashtraVideoProgressBar');

    // Jammu & Kashmir overlay elements
    const jkModal       = document.getElementById('jkVideoOverlayModal');
    const jkVideo       = document.getElementById('jkIntroVideo');
    const skipJkBtn     = document.getElementById('skipJkVideoBtn');
    const jkProgressBar = document.getElementById('jkVideoProgressBar');



    /* ====================================================================== *
     *  GENERIC VIDEO OVERLAY HELPERS
     *  A single pair of functions parameterised by modal/video/destination
     *  to avoid copy-pasting logic for each region.
     * ====================================================================== */

    /**
     * Opens a region video overlay and starts playback from frame 0.
     * @param {HTMLElement} modal   – the overlay <div>
     * @param {HTMLVideoElement} video – the <video> element inside
     */
    function openVideoOverlay(modal, video) {
        if (!modal || !video) return;

        // Reset to the beginning and reload so it always plays fresh
        video.currentTime = 0;
        video.load();

        // Show the overlay
        modal.classList.add('is-visible');

        // Attempt autoplay
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.warn('Video autoplay was blocked by the browser policy.');
            });
        }
    }

    /**
     * Closes a region video overlay and navigates to the destination page.
     * @param {HTMLElement}      modal       – the overlay <div>
     * @param {HTMLVideoElement} video       – the <video> element inside
     * @param {string}           destination – URL to navigate to
     */
    function closeVideoOverlay(modal, video, destination) {
        if (!modal || !video) {
            window.location.href = destination;
            return;
        }

        // Pause immediately
        video.pause();

        // Fade out
        modal.classList.remove('is-visible');

        // Navigate after the CSS transition (550 ms defined in map.css)
        setTimeout(() => {
            window.location.href = destination;
        }, 560);
    }


    /* ====================================================================== *
     *  KARNATAKA — open / close wrappers
     * ====================================================================== */
    function openKarnatakaVideo() {
        openVideoOverlay(karnatakaModal, karnatakaVideo);
    }

    function closeKarnatakaVideo() {
        closeVideoOverlay(karnatakaModal, karnatakaVideo, 'karnataka.html');
    }

    // Progress bar — Karnataka
    if (karnatakaVideo && karnatakaProgressBar) {
        karnatakaVideo.addEventListener('timeupdate', () => {
            if (karnatakaVideo.duration > 0) {
                karnatakaProgressBar.style.width =
                    `${(karnatakaVideo.currentTime / karnatakaVideo.duration) * 100}%`;
            }
        });
        karnatakaVideo.addEventListener('ended', closeKarnatakaVideo);
    }

    // Skip button — Karnataka
    if (skipKarnatakaBtn) {
        skipKarnatakaBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('chime');
            closeKarnatakaVideo();
        });
    }

    // Backdrop click — Karnataka
    if (karnatakaModal) {
        karnatakaModal.addEventListener('click', (e) => {
            if (e.target === karnatakaModal) closeKarnatakaVideo();
        });
    }


    /* ====================================================================== *
     *  PUNJAB — open / close wrappers
     * ====================================================================== */
    function openPunjabVideo() {
        openVideoOverlay(punjabModal, punjabVideo);
    }

    function closePunjabVideo() {
        closeVideoOverlay(punjabModal, punjabVideo, 'punjab.html');
    }

    // Progress bar — Punjab
    if (punjabVideo && punjabProgressBar) {
        punjabVideo.addEventListener('timeupdate', () => {
            if (punjabVideo.duration > 0) {
                punjabProgressBar.style.width =
                    `${(punjabVideo.currentTime / punjabVideo.duration) * 100}%`;
            }
        });
        punjabVideo.addEventListener('ended', closePunjabVideo);
    }

    // Skip button — Punjab
    if (skipPunjabBtn) {
        skipPunjabBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('chime');
            closePunjabVideo();
        });
    }

    // Backdrop click — Punjab
    if (punjabModal) {
        punjabModal.addEventListener('click', (e) => {
            if (e.target === punjabModal) closePunjabVideo();
        });
    }


    
    /* ====================================================================== *
     *  ODISHA — open / close wrappers
     * ====================================================================== */
    function openOdishaVideo() { openVideoOverlay(odishaModal, odishaVideo); }
    function closeOdishaVideo() { closeVideoOverlay(odishaModal, odishaVideo, 'odisha.html'); }

    if (odishaVideo && odishaProgressBar) {
        odishaVideo.addEventListener('timeupdate', () => {
            if (odishaVideo.duration > 0) odishaProgressBar.style.width = `${(odishaVideo.currentTime / odishaVideo.duration) * 100}%`;
        });
        odishaVideo.addEventListener('ended', closeOdishaVideo);
    }
    if (skipOdishaBtn) {
        skipOdishaBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('chime');
            closeOdishaVideo();
        });
    }
    if (odishaModal) {
        odishaModal.addEventListener('click', (e) => { if (e.target === odishaModal) closeOdishaVideo(); });
    }

    /* ====================================================================== *
     *  MAHARASHTRA — open / close wrappers
     * ====================================================================== */
    function openMaharashtraVideo() { openVideoOverlay(maharashtraModal, maharashtraVideo); }
    function closeMaharashtraVideo() { closeVideoOverlay(maharashtraModal, maharashtraVideo, 'maharashtra.html'); }

    if (maharashtraVideo && maharashtraProgressBar) {
        maharashtraVideo.addEventListener('timeupdate', () => {
            if (maharashtraVideo.duration > 0) maharashtraProgressBar.style.width = `${(maharashtraVideo.currentTime / maharashtraVideo.duration) * 100}%`;
        });
        maharashtraVideo.addEventListener('ended', closeMaharashtraVideo);
    }
    if (skipMaharashtraBtn) {
        skipMaharashtraBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('chime');
            closeMaharashtraVideo();
        });
    }
    if (maharashtraModal) {
        maharashtraModal.addEventListener('click', (e) => { if (e.target === maharashtraModal) closeMaharashtraVideo(); });
    }

    /* ====================================================================== *
     *  JAMMU & KASHMIR — open / close wrappers
     * ====================================================================== */
    function openJKVideo() { openVideoOverlay(jkModal, jkVideo); }
    function closeJKVideo() { closeVideoOverlay(jkModal, jkVideo, 'jk.html'); }

    if (jkVideo && jkProgressBar) {
        jkVideo.addEventListener('timeupdate', () => {
            if (jkVideo.duration > 0) jkProgressBar.style.width = `${(jkVideo.currentTime / jkVideo.duration) * 100}%`;
        });
        jkVideo.addEventListener('ended', closeJKVideo);
    }
    if (skipJkBtn) {
        skipJkBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('chime');
            closeJKVideo();
        });
    }
    if (jkModal) {
        jkModal.addEventListener('click', (e) => { if (e.target === jkModal) closeJKVideo(); });
    }


    /* ====================================================================== *
     *  GLOBAL KEYBOARD — Escape closes whichever overlay is open
     * ====================================================================== */
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (scoreBreakdownModal && scoreBreakdownModal.classList.contains('is-visible')) {
            closeScoreBreakdown();
        } else if (karnatakaModal && karnatakaModal.classList.contains('is-visible')) {
            closeKarnatakaVideo();
        } else if (punjabModal && punjabModal.classList.contains('is-visible')) {
            closePunjabVideo();
        } else if (odishaModal && odishaModal.classList.contains('is-visible')) {
            closeOdishaVideo();
        } else if (maharashtraModal && maharashtraModal.classList.contains('is-visible')) {
            closeMaharashtraVideo();
        } else if (jkModal && jkModal.classList.contains('is-visible')) {
            closeJKVideo();
        }
    });


    /* ====================================================================== *
     *  MAP TOOLTIP – follows the cursor
     * ====================================================================== */
    document.addEventListener('mousemove', (e) => {
        if (mapTooltip && mapTooltip.classList.contains('active')) {
            mapTooltip.style.left = `${e.clientX + 16}px`;
            mapTooltip.style.top  = `${e.clientY + 16}px`;
        }
    });


    /* ====================================================================== *
     *  DYNAMIC CULTURAL BACKGROUND INTEGRATION (MODULE 1 & MODULE 2)
     * ====================================================================== */
    const stateKeyMap = {
        'svg-karnataka': 'karnataka',
        'svg-punjab': 'punjab',
        'svg-or': 'odisha',
        'svg-mh': 'maharashtra',
        'svg-jk': 'jammuKashmir'
    };

    function triggerStateBackground(key) {
        if (typeof BharathBackground !== 'undefined' && typeof BharathBackground.setTheme === 'function') {
            BharathBackground.setTheme(key);
        }
    }

    /* Preload all background assets during map initialization */
    if (typeof BharathBackground !== 'undefined' && typeof BharathBackground.preloadAll === 'function') {
        BharathBackground.preloadAll();
    }

    /* ====================================================================== *
     *  SVG STATE PATHS – hover & click
     * ====================================================================== */
    document.querySelectorAll('.state-path').forEach(path => {

        // Tooltip & Dynamic Background Transition on hover
        path.addEventListener('mouseenter', () => {
            if (!mapTooltip) return;
            mapTooltip.textContent = path.dataset.name || 'Indian Realm';
            mapTooltip.classList.add('active');

            if (path.classList.contains('active-state') && stateKeyMap[path.id]) {
                triggerStateBackground(stateKeyMap[path.id]);
            }
        });

        path.addEventListener('mouseleave', () => {
            if (mapTooltip) mapTooltip.classList.remove('active');
        });

        // Click routing with dynamic background transition
        path.addEventListener('click', () => {
            if (path.classList.contains('active-state')) {
                if (typeof playSound === 'function') playSound('chime');

                const key = stateKeyMap[path.id];
                if (key) triggerStateBackground(key);

                if (path.id === 'svg-karnataka') {
                    openKarnatakaVideo();          // ← KARNATAKA VIDEO OVERLAY
                } else if (path.id === 'svg-punjab') {
                    openPunjabVideo();             // ← PUNJAB VIDEO OVERLAY
                } else if (path.id === 'svg-or') {
                    openOdishaVideo();             // ← ODISHA VIDEO OVERLAY
                } else if (path.id === 'svg-mh') {
                    openMaharashtraVideo();        // ← MAHARASHTRA VIDEO OVERLAY
                } else if (path.id === 'svg-jk') {
                    openJKVideo();                 // ← JAMMU & KASHMIR VIDEO OVERLAY
                }
            } else {
                if (typeof playSound === 'function') playSound('error');
                showLockedAlert(path.dataset.name);
            }
        });
    });

    /* ====================================================================== *
     *  MAP PIN MARKERS (with dynamic background transitions on hover & click)
     * ====================================================================== */
    const pinPunjab      = document.getElementById('pinPunjabMarker');
    const pinKarnataka   = document.getElementById('pinKarnatakaMarker');
    const pinOdisha      = document.getElementById('pinOdishaMarker');
    const pinMaharashtra = document.getElementById('pinMaharashtraMarker');
    const pinJk          = document.getElementById('pinJkMarker');

    if (pinPunjab) {
        pinPunjab.addEventListener('mouseenter', () => triggerStateBackground('punjab'));
        pinPunjab.addEventListener('click', () => { triggerStateBackground('punjab'); if (typeof playSound === 'function') playSound('chime'); openPunjabVideo(); });
    }
    if (pinKarnataka) {
        pinKarnataka.addEventListener('mouseenter', () => triggerStateBackground('karnataka'));
        pinKarnataka.addEventListener('click', () => { triggerStateBackground('karnataka'); if (typeof playSound === 'function') playSound('chime'); openKarnatakaVideo(); });
    }
    if (pinOdisha) {
        pinOdisha.addEventListener('mouseenter', () => triggerStateBackground('odisha'));
        pinOdisha.addEventListener('click', () => { triggerStateBackground('odisha'); if (typeof playSound === 'function') playSound('chime'); openOdishaVideo(); });
    }
    if (pinMaharashtra) {
        pinMaharashtra.addEventListener('mouseenter', () => triggerStateBackground('maharashtra'));
        pinMaharashtra.addEventListener('click', () => { triggerStateBackground('maharashtra'); if (typeof playSound === 'function') playSound('chime'); openMaharashtraVideo(); });
    }
    if (pinJk) {
        pinJk.addEventListener('mouseenter', () => triggerStateBackground('jammuKashmir'));
        pinJk.addEventListener('click', () => { triggerStateBackground('jammuKashmir'); if (typeof playSound === 'function') playSound('chime'); openJKVideo(); });
    }

    /* ====================================================================== *
     *  SIDEBAR REGION CARDS (with dynamic background transitions on hover & click)
     * ====================================================================== */
    const cardKarnataka   = document.getElementById('cardKarnataka');
    const cardPunjab      = document.getElementById('cardPunjab');
    const cardOdisha      = document.getElementById('cardOdisha');
    const cardMaharashtra = document.getElementById('cardMaharashtra');
    const cardJk          = document.getElementById('cardJk');

    if (cardKarnataka) {
        cardKarnataka.addEventListener('mouseenter', () => triggerStateBackground('karnataka'));
        cardKarnataka.addEventListener('click', () => { triggerStateBackground('karnataka'); if (typeof playSound === 'function') playSound('chime'); openKarnatakaVideo(); });
    }
    if (cardPunjab) {
        cardPunjab.addEventListener('mouseenter', () => triggerStateBackground('punjab'));
        cardPunjab.addEventListener('click', () => { triggerStateBackground('punjab'); if (typeof playSound === 'function') playSound('chime'); openPunjabVideo(); });
    }
    if (cardOdisha) {
        cardOdisha.addEventListener('mouseenter', () => triggerStateBackground('odisha'));
        cardOdisha.addEventListener('click', () => { triggerStateBackground('odisha'); if (typeof playSound === 'function') playSound('chime'); openOdishaVideo(); });
    }
    if (cardMaharashtra) {
        cardMaharashtra.addEventListener('mouseenter', () => triggerStateBackground('maharashtra'));
        cardMaharashtra.addEventListener('click', () => { triggerStateBackground('maharashtra'); if (typeof playSound === 'function') playSound('chime'); openMaharashtraVideo(); });
    }
    if (cardJk) {
        cardJk.addEventListener('mouseenter', () => triggerStateBackground('jammuKashmir'));
        cardJk.addEventListener('click', () => { triggerStateBackground('jammuKashmir'); if (typeof playSound === 'function') playSound('chime'); openJKVideo(); });
    }

    /* ====================================================================== *
     *  LOCKED REGION CARDS
     * ====================================================================== */
    document.querySelectorAll('.region-card.locked').forEach(card => {
        card.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('error');
            showLockedAlert(card.querySelector('h3')?.textContent);
        });
    });


    /* ====================================================================== *
     *  LOCKED ALERT HELPER
     * ====================================================================== */
    function showLockedAlert(regionName) {
        const name = regionName || 'This province';
        alert(`${name} is sealed by ancient temporal barriers.\nComplete active chapters to unlock!`);
    }

    /* ====================================================================== *
     *  FLOATING LANGUAGE SWITCHER WIDGET (BOTTOM-LEFT) & SETTINGS NAV AUDIT
     * ====================================================================== */
    const globalLangSelect = document.getElementById('globalLangSelect');
    if (globalLangSelect && typeof BharathI18n !== 'undefined') {
        globalLangSelect.innerHTML = '';
        const supported = BharathI18n.getSupportedLanguages();
        const curLang = typeof BharathStore !== 'undefined' ? BharathStore.getLanguage() : (localStorage.getItem('bharath_language') || 'en');

        supported.forEach(lang => {
            const opt = document.createElement('option');
            opt.value = lang.code;
            opt.textContent = `${lang.native} (${lang.name})`;
            opt.style.background = '#1c0e26';
            opt.style.color = '#ffd700';
            if (lang.code === curLang) opt.selected = true;
            globalLangSelect.appendChild(opt);
        });

        globalLangSelect.addEventListener('change', (e) => {
            const newCode = e.target.value;
            if (typeof playSound === 'function') playSound('chime');
            if (typeof BharathStore !== 'undefined') {
                BharathStore.setLanguage(newCode);
            } else {
                BharathI18n.setLanguage(newCode);
                localStorage.setItem('bharath_language', newCode);
            }
        });
    }

    // Verify Settings button navigation
    const mapSettingsBtn = document.getElementById('mapSettingsBtn');
    if (mapSettingsBtn) {
        mapSettingsBtn.addEventListener('mouseenter', () => {
            if (typeof playSound === 'function') playSound('hover');
        });
    }

});
