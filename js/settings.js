/* ==========================================================================
   GAME OF BHARATH — SETTINGS CONTROLLER (settings.js)
   Handles:
     - Language Dropdown selection & immediate reactive updates
     - Persistence in BharathStore, localStorage, and Firestore
     - Score Reset Confirmation Dialog & zeroing execution
     - Warrior Profile display
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Enforce Page Guard
    if (typeof BharathAuth !== 'undefined') {
        BharathAuth.guardPage();
    }

    // 2. DOM References
    const languageSelect = document.getElementById('languageSelect');
    const settingsUsername = document.getElementById('settingsUsername');
    const settingsRoleBadge = document.getElementById('settingsRoleBadge');
    const settingsSessionTime = document.getElementById('settingsSessionTime');

    const btnOpenResetModal = document.getElementById('btnOpenResetModal');
    const resetConfirmationModal = document.getElementById('resetConfirmationModal');
    const btnCancelReset = document.getElementById('btnCancelReset');
    const btnConfirmReset = document.getElementById('btnConfirmReset');

    // 3. Populate Account Preferences
    const username = (typeof BharathAuth !== 'undefined' ? BharathAuth.getUsername() : 'player') || 'player';
    const role = (typeof BharathAuth !== 'undefined' ? BharathAuth.getRole() : 'player') || 'player';

    if (settingsUsername) {
        settingsUsername.textContent = username;
    }
    if (settingsRoleBadge) {
        settingsRoleBadge.textContent = role === 'admin' ? '🛡️ ADMIN LINEAGE' : '⚔ PLAYER LINEAGE';
    }
    if (settingsSessionTime) {
        settingsSessionTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • Lineage Active';
    }

    // 4. Populate Language Select Dropdown
    if (languageSelect && typeof BharathI18n !== 'undefined') {
        languageSelect.innerHTML = '';
        const langs = BharathI18n.getSupportedLanguages();
        const activeLang = typeof BharathStore !== 'undefined' ? BharathStore.getLanguage() : (localStorage.getItem('bharath_language') || 'en');

        langs.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.code;
            opt.textContent = `${item.native} (${item.name})`;
            if (item.code === activeLang) {
                opt.selected = true;
            }
            languageSelect.appendChild(opt);
        });

        // Event: Language selection change
        languageSelect.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            if (typeof playSound === 'function') playSound('chime');

            // Update global store, localStorage and Firestore document
            if (typeof BharathStore !== 'undefined') {
                BharathStore.setLanguage(selectedLang);
            } else if (typeof BharathI18n !== 'undefined') {
                BharathI18n.setLanguage(selectedLang);
                localStorage.setItem('bharath_language', selectedLang);
            }
        });
    }

    // 5. Reset All Scores Modal Logic
    function openResetModal() {
        if (resetConfirmationModal) {
            resetConfirmationModal.classList.add('is-visible');
            if (typeof playSound === 'function') playSound('pickup');
        }
    }

    function closeResetModal() {
        if (resetConfirmationModal) {
            resetConfirmationModal.classList.remove('is-visible');
        }
    }

    if (btnOpenResetModal) {
        btnOpenResetModal.addEventListener('click', openResetModal);
    }

    if (btnCancelReset) {
        btnCancelReset.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('pickup');
            closeResetModal();
        });
    }

    // Backdrop click dismiss
    if (resetConfirmationModal) {
        resetConfirmationModal.addEventListener('click', (e) => {
            if (e.target === resetConfirmationModal) {
                closeResetModal();
            }
        });
    }

    // Keyboard Escape dismiss
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resetConfirmationModal?.classList.contains('is-visible')) {
            closeResetModal();
        }
    });

    // Execute Confirmed Reset
    if (btnConfirmReset) {
        btnConfirmReset.addEventListener('click', async () => {
            if (typeof playSound === 'function') playSound('success');
            btnConfirmReset.disabled = true;
            btnConfirmReset.textContent = 'RESETTING...';

            if (typeof BharathStore !== 'undefined') {
                await BharathStore.resetAllScores();
            }

            btnConfirmReset.disabled = false;
            btnConfirmReset.textContent = 'YES, RESET ALL TO 0';
            closeResetModal();
        });
    }

    // 6. Sutradhar's Journal & Lore Library (MODULE 4)
    function renderLoreJournal() {
        const grid = document.getElementById('loreCardsGrid');
        const countDisplay = document.getElementById('loreCountDisplay');
        const percentDisplay = document.getElementById('lorePercentDisplay');
        const progressBar = document.getElementById('loreProgressBar');

        if (!grid || typeof SUTRADHAR_DATA === 'undefined') return;

        grid.innerHTML = '';
        const allLoreEntries = [];

        // Collect all deep dive lore entries across regions and games
        Object.keys(SUTRADHAR_DATA).forEach(regKey => {
            const reg = SUTRADHAR_DATA[regKey];
            Object.keys(reg.games || {}).forEach(gKey => {
                const game = reg.games[gKey];
                if (game.deep_dive) {
                    allLoreEntries.push({
                        ...game.deep_dive,
                        regionName: reg.regionName,
                        gameTitle: game.title,
                        themeColor: reg.themeColor
                    });
                }
            });
        });

        const totalLoreCount = allLoreEntries.length;
        const unlockedList = typeof BharathStore !== 'undefined'
            ? BharathStore.getUnlockedLore()
            : JSON.parse(localStorage.getItem('bharath_unlocked_lore') || '[]');

        let unlockedCount = 0;

        allLoreEntries.forEach(item => {
            const isUnlocked = unlockedList.includes(item.loreId);
            if (isUnlocked) unlockedCount++;

            const card = document.createElement('div');
            card.className = `lore-item-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}`;

            if (isUnlocked) {
                card.innerHTML = `
                    <div class="lore-badge-tag" style="color: ${item.themeColor || '#ffd700'}">
                        <span>🏆</span> ${item.badge || 'UNLOCKED LORE'}
                    </div>
                    <h3 class="lore-card-title">${item.title}</h3>
                    <div style="font-size: 0.72rem; color: #ffd700; font-weight: 600;">${item.regionName} &bull; ${item.gameTitle}</div>
                    <p class="lore-card-snippet">${item.content}</p>
                    <div class="lore-unlock-status">✨ Discovered &amp; Active in Lineage</div>
                `;
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    if (typeof Sutradhar !== 'undefined') {
                        Sutradhar.showTip('HISTORY', item.title, item);
                    }
                });
            } else {
                card.innerHTML = `
                    <div class="lore-badge-tag" style="color: #8c7f73;">
                        <span>🔒</span> LOCKED SCROLL
                    </div>
                    <h3 class="lore-card-title" style="color: #a89f91;">Ancient Wisdom of ${item.regionName}</h3>
                    <div style="font-size: 0.72rem; color: #8c7f73;">Play ${item.gameTitle}</div>
                    <p class="lore-card-snippet">Consult the Sutradhar during your match and select "Explore Deeper" to reveal this sacred chronicle.</p>
                    <div class="lore-unlock-status" style="color: #ffb347;">⚔ Unlocks in Match</div>
                `;
            }

            grid.appendChild(card);
        });

        // Update progress counters
        const pct = Math.round((unlockedCount / Math.max(1, totalLoreCount)) * 100);
        if (countDisplay) countDisplay.textContent = `${unlockedCount} / ${totalLoreCount}`;
        if (percentDisplay) percentDisplay.textContent = `${pct}% Discovered`;
        if (progressBar) progressBar.style.width = `${pct}%`;
    }

    renderLoreJournal();

    // Re-render when BharathStore updates
    if (typeof BharathStore !== 'undefined') {
        BharathStore.subscribe(() => {
            renderLoreJournal();
        });
    }
});

