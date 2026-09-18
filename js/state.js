/* ==========================================================================
   GAME OF BHARATH — UNIFIED GLOBAL STATE & HIERARCHICAL SCORING STORE
   Modules:
     - State-Specific Point Tracking: karnataka, punjab, odisha, maharashtra, jammuKashmir
     - Total Points Aggregator Middleware (auto-sums all regional scores)
     - Reactive Store API (getState, setState, subscribe, dispatch)
     - Firestore Document Adapter (users/{username}) & LocalStorage Persistence
   ========================================================================== */

const BharathStore = (() => {
    // Canonical playable states schema
    const PLAYABLE_STATES = [
        { key: 'karnataka', name: 'Karnataka', native: 'ಕರ್ನಾಟಕ' },
        { key: 'punjab', name: 'Punjab', native: 'ਪੰਜਾਬ' },
        { key: 'odisha', name: 'Odisha', native: 'ଓଡ଼ିଶା' },
        { key: 'maharashtra', name: 'Maharashtra', native: 'महाराष्ट्र' },
        { key: 'jammuKashmir', name: 'Jammu & Kashmir', native: 'जम्मू और कश्मीर' }
    ];

    const STORAGE_KEY_DOC = 'bharath_player_doc_';
    const STORAGE_KEY_LANG = 'bharath_language';
    const STORAGE_KEY_POINTS = 'bharath_player_points';
    const STORAGE_KEY_TOTAL = 'bharath_total_points';

    // Subscribers array
    const listeners = new Set();

    // Default Schema as required by Module 2 & Module 4 (Sutradhar Lore Journal)
    function createInitialState(username = 'player', language = 'en') {
        return {
            username: username,
            language: language,
            points: {
                karnataka: 0,
                punjab: 0,
                odisha: 0,
                maharashtra: 0,
                jammuKashmir: 0
            },
            totalPoints: 0,
            unlockedLore: [],
            updatedAt: new Date().toISOString()
        };
    }

    // Middleware: Automatically sums all individual state points
    function aggregateTotalPoints(points) {
        if (!points || typeof points !== 'object') return 0;
        let total = 0;
        for (const s of PLAYABLE_STATES) {
            const val = parseInt(points[s.key], 10);
            if (!isNaN(val) && val > 0) {
                total += val;
            }
        }
        return total;
    }

    // Current active state
    let state = createInitialState();

    // Resolve current username from session
    function resolveCurrentUser() {
        if (typeof BharathAuth !== 'undefined' && typeof BharathAuth.getUsername === 'function') {
            return BharathAuth.getUsername() || 'player';
        }
        try {
            const session = JSON.parse(sessionStorage.getItem('bharath_session') || '{}');
            if (session && session.username) return session.username;
        } catch (e) {}
        return 'player';
    }

    // Firestore Client & Local Document Adapter
    const FirestoreAdapter = {
        async getDoc(username) {
            // Priority 1: Check if real Firebase / Firestore SDK is loaded on window
            if (typeof window.firebase !== 'undefined' && window.firebase.firestore) {
                try {
                    const db = window.firebase.firestore();
                    const docSnap = await db.collection('users').doc(username).get();
                    if (docSnap.exists) {
                        return docSnap.data();
                    }
                } catch (err) {
                    console.warn('[Firestore] Remote fetch error, falling back to local doc:', err);
                }
            }

            // Priority 2: Local document storage
            try {
                const raw = localStorage.getItem(STORAGE_KEY_DOC + username);
                if (raw) return JSON.parse(raw);
            } catch (e) {}

            return null;
        },

        async setDoc(username, data) {
            data.updatedAt = new Date().toISOString();

            // Local Document storage persistence
            try {
                localStorage.setItem(STORAGE_KEY_DOC + username, JSON.stringify(data));
            } catch (e) {}

            // Priority 1: Write to Firestore if connected
            if (typeof window.firebase !== 'undefined' && window.firebase.firestore) {
                try {
                    const db = window.firebase.firestore();
                    await db.collection('users').doc(username).set(data, { merge: true });
                } catch (err) {
                    console.warn('[Firestore] Remote sync error:', err);
                }
            }

            // Optional Backend Sync to server.py
            try {
                fetch('/api/player/' + encodeURIComponent(username), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }).catch(() => {});
            } catch (e) {}
        }
    };

    // Load state for player from storage and migrate legacy scores if needed
    function loadState() {
        const username = resolveCurrentUser();
        let loaded = null;

        try {
            const rawDoc = localStorage.getItem(STORAGE_KEY_DOC + username);
            if (rawDoc) {
                loaded = JSON.parse(rawDoc);
            }
        } catch (e) {}

        if (!loaded) {
            loaded = createInitialState(username);

            // Check if legacy points exist in localStorage
            try {
                const legacyPoints = JSON.parse(localStorage.getItem(STORAGE_KEY_POINTS) || '{}');
                const ka = parseInt(localStorage.getItem('bharath_player_score_karnataka') || legacyPoints.karnataka || '0', 10);
                const pb = parseInt(localStorage.getItem('bharath_player_score_punjab') || legacyPoints.punjab || '0', 10);
                const od = parseInt(localStorage.getItem('bharath_player_score_odisha') || legacyPoints.odisha || '0', 10);
                const mh = parseInt(localStorage.getItem('bharath_player_score_maharashtra') || legacyPoints.maharashtra || '0', 10);
                const jk = parseInt(localStorage.getItem('bharath_player_score_jammuKashmir') || localStorage.getItem('bharath_player_score_jk') || legacyPoints.jammuKashmir || '0', 10);

                loaded.points = {
                    karnataka: isNaN(ka) ? 0 : ka,
                    punjab: isNaN(pb) ? 0 : pb,
                    odisha: isNaN(od) ? 0 : od,
                    maharashtra: isNaN(mh) ? 0 : mh,
                    jammuKashmir: isNaN(jk) ? 0 : jk
                };
            } catch (e) {}
        }

        // Language resolution
        const savedLang = localStorage.getItem(STORAGE_KEY_LANG) || loaded.language || 'en';
        loaded.language = savedLang;
        loaded.username = username;

        // Auto-aggregate total points via middleware
        loaded.totalPoints = aggregateTotalPoints(loaded.points);

        state = loaded;
        syncToLegacyStorage();
        FirestoreAdapter.setDoc(username, state);
    }

    // Synchronize to localStorage legacy keys for backward compatibility
    function syncToLegacyStorage() {
        try {
            localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(state.points));
            localStorage.setItem(STORAGE_KEY_TOTAL, state.totalPoints.toString());
            localStorage.setItem(STORAGE_KEY_LANG, state.language);
            localStorage.setItem('bharath_player_score', state.totalPoints.toString());

            localStorage.setItem('bharath_player_score_karnataka', (state.points.karnataka || 0).toString());
            localStorage.setItem('bharath_player_score_punjab', (state.points.punjab || 0).toString());
            localStorage.setItem('bharath_player_score_odisha', (state.points.odisha || 0).toString());
            localStorage.setItem('bharath_player_score_maharashtra', (state.points.maharashtra || 0).toString());
            localStorage.setItem('bharath_player_score_jammuKashmir', (state.points.jammuKashmir || 0).toString());
            localStorage.setItem('bharath_player_score_jk', (state.points.jammuKashmir || 0).toString());
        } catch (e) {}
    }

    // Notify all reactive store subscribers
    function notify() {
        for (const listener of listeners) {
            try {
                listener(state);
            } catch (err) {
                console.error('[BharathStore] Subscriber error:', err);
            }
        }
        // Also update any elements with .globalPlayerScore or #mapGlobalScore
        document.querySelectorAll('.globalPlayerScore, #mapGlobalScore').forEach(el => {
            el.textContent = state.totalPoints.toLocaleString();
        });
    }

    // Public API
    return {
        PLAYABLE_STATES,

        init() {
            loadState();
            notify();
            return this;
        },

        getState() {
            return JSON.parse(JSON.stringify(state));
        },

        getTotalPoints() {
            return state.totalPoints;
        },

        getStatePoints(stateKey) {
            // Normalise stateKey (e.g. 'jk' -> 'jammuKashmir')
            const canonicalKey = stateKey === 'jk' ? 'jammuKashmir' : stateKey;
            return state.points[canonicalKey] || 0;
        },

        getLanguage() {
            return state.language || 'en';
        },

        // Subscribe to state updates (Redux/Zustand style)
        subscribe(listener) {
            if (typeof listener === 'function') {
                listeners.add(listener);
                // Call immediately with current state
                listener(this.getState());
            }
            return () => listeners.delete(listener);
        },

        /**
         * Increments ONLY a specific state's points.
         * Automatically invokes the aggregator middleware to sum all state points into totalPoints.
         * Persists to Firestore document and localStorage.
         */
        awardStatePoints(stateKey, pts, reason = '') {
            const canonicalKey = stateKey === 'jk' ? 'jammuKashmir' : stateKey;
            const pointsToAdd = parseInt(pts, 10);
            if (isNaN(pointsToAdd) || pointsToAdd <= 0) return state;

            if (!(canonicalKey in state.points)) {
                console.warn('[BharathStore] Unknown state key:', canonicalKey);
                state.points[canonicalKey] = 0;
            }

            // 1. Increment ONLY the target state
            state.points[canonicalKey] = (state.points[canonicalKey] || 0) + pointsToAdd;

            // 2. Middleware aggregator: sum all state points
            state.totalPoints = aggregateTotalPoints(state.points);
            state.updatedAt = new Date().toISOString();

            // 3. Persist to Firestore & LocalStorage
            syncToLegacyStorage();
            FirestoreAdapter.setDoc(state.username, state);

            // 4. Dispatch notification
            notify();

            // Show celebratory toast if available
            this.showScoreToast(`+${pointsToAdd} PTS (${reason || canonicalKey.toUpperCase()})`);

            return this.getState();
        },

        /**
         * Sets the app language, updates state, persists to localStorage & Firestore,
         * and triggers internationalization update.
         */
        setLanguage(newLang) {
            if (!newLang || typeof newLang !== 'string') return;
            state.language = newLang;
            state.updatedAt = new Date().toISOString();

            localStorage.setItem(STORAGE_KEY_LANG, newLang);
            FirestoreAdapter.setDoc(state.username, state);

            if (typeof window.BharathI18n !== 'undefined' && typeof window.BharathI18n.setLanguage === 'function') {
                window.BharathI18n.setLanguage(newLang);
            }

            notify();
        },

        /**
         * MODULE 1 UTILITY: Reset All Scores
         * Resets all state points and total score explicitly to 0.
         * Persists to Firestore document and localStorage.
         */
        async resetAllScores() {
            state.points = {
                karnataka: 0,
                punjab: 0,
                odisha: 0,
                maharashtra: 0,
                jammuKashmir: 0
            };
            state.totalPoints = 0;
            state.updatedAt = new Date().toISOString();

            syncToLegacyStorage();
            await FirestoreAdapter.setDoc(state.username, state);

            notify();
            this.showScoreToast('All Scores Reset to 0 PTS');

            // Send reset signal to server.py if running
            try {
                fetch('/api/player/' + encodeURIComponent(state.username) + '/reset', {
                    method: 'POST'
                }).catch(() => {});
            } catch (e) {}

            return this.getState();
        },

        /**
         * MODULE 3: Descending Score Breakdown with Zero-Point Fallback
         * Mathematical sort descending (highest to lowest points).
         * Every state is guaranteed to appear even if 0 points ("State Name: 0 Points").
         */
        getScoreBreakdown() {
            const breakdown = PLAYABLE_STATES.map(s => {
                const pts = state.points[s.key] || 0;
                return {
                    key: s.key,
                    name: s.name,
                    nativeName: s.native,
                    points: pts,
                    formattedString: `${s.name}: ${pts} Points`
                };
            });

            // Mathematical descending sort
            breakdown.sort((a, b) => b.points - a.points);
            return breakdown;
        },

        /**
         * MODULE 4: Sutradhar Lore Journal & Gamification
         * Unlocks a deep-dive lore entry and syncs to Firestore & localStorage
         */
        unlockLore(loreId, deepDiveData = null) {
            if (!loreId) return;
            if (!state.unlockedLore) state.unlockedLore = [];
            
            if (!state.unlockedLore.includes(loreId)) {
                state.unlockedLore.push(loreId);
                state.updatedAt = new Date().toISOString();

                // Persist to localStorage and Firestore
                syncToLegacyStorage();
                FirestoreAdapter.setDoc(state.username, state);

                try {
                    const stored = JSON.parse(localStorage.getItem('bharath_unlocked_lore') || '[]');
                    if (!stored.includes(loreId)) {
                        stored.push(loreId);
                        localStorage.setItem('bharath_unlocked_lore', JSON.stringify(stored));
                    }
                } catch (e) {}

                notify();
                this.showScoreToast(`📜 Lore Unlocked: ${deepDiveData?.title || 'Sutradhar Journal'}`);
            }
            return state.unlockedLore;
        },

        getUnlockedLore() {
            return state.unlockedLore || [];
        },

        hasUnlockedLore(loreId) {
            return (state.unlockedLore || []).includes(loreId);
        },

        showScoreToast(text) {
            try {
                const existing = document.querySelector('.score-toast');
                if (existing) existing.remove();

                const toast = document.createElement('div');
                toast.className = 'score-toast';
                toast.style.position = 'fixed';
                toast.style.bottom = '24px';
                toast.style.right = '24px';
                toast.style.padding = '12px 20px';
                toast.style.background = 'linear-gradient(135deg, rgba(35,15,45,0.95), rgba(70,20,40,0.95))';
                toast.style.border = '1px solid #ffd700';
                toast.style.borderRadius = '10px';
                toast.style.color = '#ffd700';
                toast.style.fontFamily = "'Outfit', sans-serif";
                toast.style.fontWeight = '700';
                toast.style.fontSize = '0.9rem';
                toast.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6), 0 0 15px rgba(255,215,0,0.4)';
                toast.style.zIndex = '999999';
                toast.style.animation = 'fadeInUp 0.3s ease-out';
                toast.textContent = `✨ ${text}`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
            } catch (e) {}
        }
    };
})();

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        BharathStore.init();
    });
}
