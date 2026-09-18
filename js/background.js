/* ==========================================================================
   GAME OF BHARATH — DYNAMIC HERITAGE BACKGROUND & CANVAS ENGINE
   Modules:
     - MODULE 1: Centralized State-Based Asset Mapping & Dynamic Transitions
     - MODULE 2: Cultural, Historical & Folk Art Themes Integration
     - MODULE 3: Accessibility Scrim Overlays, WebP Preloading & Optimization
     - Sanskrit Floating Particle Canvas Engine
   ========================================================================== */

const BharathBackground = (() => {
    // 1. Centralized State Asset Dictionary
    const STATE_BACKGROUNDS = {
        karnataka: 'assets/bg-karnataka.webp',
        punjab: 'assets/bg-punjab.webp',
        odisha: 'assets/bg-odisha.webp',
        maharashtra: 'assets/bg-maharashtra.webp',
        jammuKashmir: 'assets/bg-jk.webp'
    };

    const JPG_FALLBACKS = {
        karnataka: 'assets/bg-karnataka.jpg',
        punjab: 'assets/bg-punjab.jpg',
        odisha: 'assets/bg-odisha.jpg',
        maharashtra: 'assets/bg-maharashtra.jpg',
        jammuKashmir: 'assets/bg-jk.jpg'
    };

    // State key normalizer
    function normalizeStateKey(key) {
        if (!key) return null;
        const k = String(key).toLowerCase().trim();
        if (k === 'jk' || k === 'jammukashmir' || k === 'jammu_kashmir' || k === 'jammu & kashmir') return 'jammuKashmir';
        if (k === 'ka' || k === 'karnataka') return 'karnataka';
        if (k === 'pb' || k === 'punjab') return 'punjab';
        if (k === 'or' || k === 'odi' || k === 'odisha' || k === 'orissa') return 'odisha';
        if (k === 'mh' || k === 'mah' || k === 'maharashtra') return 'maharashtra';
        return k in STATE_BACKGROUNDS ? k : null;
    }

    // Cache of preloaded Image objects
    const preloadedImages = new Map();
    let isPreloading = false;
    let currentState = null;
    let containerEl = null;
    let layerA = null;
    let layerB = null;
    let activeLayerIndex = 0; // 0 for layerA, 1 for layerB

    /**
     * Creates and mounts the double-buffered background layer DOM structure
     */
    function setupDOM() {
        if (containerEl && document.body.contains(containerEl)) return;

        let existing = document.getElementById('heritageBgContainer');
        if (existing) {
            containerEl = existing;
            layerA = document.getElementById('heritageBgLayerA');
            layerB = document.getElementById('heritageBgLayerB');
            return;
        }

        containerEl = document.createElement('div');
        containerEl.id = 'heritageBgContainer';
        containerEl.className = 'heritage-bg-container';

        layerA = document.createElement('div');
        layerA.id = 'heritageBgLayerA';
        layerA.className = 'heritage-bg-layer is-active';

        layerB = document.createElement('div');
        layerB.id = 'heritageBgLayerB';
        layerB.className = 'heritage-bg-layer';

        const overlay = document.createElement('div');
        overlay.className = 'heritage-bg-overlay';

        containerEl.appendChild(layerA);
        containerEl.appendChild(layerB);
        containerEl.appendChild(overlay);

        const wrapper = document.getElementById('viewport-wrapper') || document.body;
        if (wrapper.firstChild) {
            wrapper.insertBefore(containerEl, wrapper.firstChild);
        } else {
            wrapper.appendChild(containerEl);
        }
    }

    /**
     * Preloads all regional background assets for zero-flicker transitions
     */
    function preloadAll(callback) {
        if (isPreloading) return;
        isPreloading = true;

        const keys = Object.keys(STATE_BACKGROUNDS);
        let loadedCount = 0;

        keys.forEach(key => {
            const webpUrl = STATE_BACKGROUNDS[key];
            const img = new Image();
            img.src = webpUrl;
            img.onload = () => {
                preloadedImages.set(key, img);
                loadedCount++;
                if (loadedCount === keys.length && typeof callback === 'function') {
                    callback();
                }
            };
            img.onerror = () => {
                // Try fallback JPG
                const fallbackImg = new Image();
                fallbackImg.src = JPG_FALLBACKS[key];
                fallbackImg.onload = () => {
                    preloadedImages.set(key, fallbackImg);
                    loadedCount++;
                    if (loadedCount === keys.length && typeof callback === 'function') {
                        callback();
                    }
                };
                fallbackImg.onerror = () => {
                    loadedCount++;
                    if (loadedCount === keys.length && typeof callback === 'function') {
                        callback();
                    }
                };
            };
        });
    }

    /**
     * Seamlessly transitions the background image to the specified state's cultural artwork
     * @param {string} stateKey - 'karnataka', 'punjab', 'odisha', 'maharashtra', 'jammuKashmir'
     * @param {boolean} immediate - If true, skips transition duration
     */
    function setTheme(stateKey, immediate = false) {
        setupDOM();
        const canonicalKey = normalizeStateKey(stateKey);

        if (!canonicalKey) {
            resetTheme();
            return;
        }

        if (currentState === canonicalKey && !immediate) {
            return;
        }

        currentState = canonicalKey;
        const assetUrl = STATE_BACKGROUNDS[canonicalKey];

        const targetLayer = activeLayerIndex === 0 ? layerB : layerA;
        const outgoingLayer = activeLayerIndex === 0 ? layerA : layerB;

        if (immediate) {
            targetLayer.style.transition = 'none';
            outgoingLayer.style.transition = 'none';
        } else {
            targetLayer.style.transition = '';
            outgoingLayer.style.transition = '';
        }

        // Clean folk art theme application
        targetLayer.style.backgroundImage = '';
        targetLayer.classList.add('is-active');
        outgoingLayer.classList.remove('is-active');

        // Toggle active index
        activeLayerIndex = activeLayerIndex === 0 ? 1 : 0;

        // Apply state theme class on body
        document.body.classList.remove(
            'theme-state-karnataka',
            'theme-state-punjab',
            'theme-state-odisha',
            'theme-state-maharashtra',
            'theme-state-jammuKashmir'
        );
        document.body.classList.add(`theme-state-${canonicalKey}`);

        // Dispatch background change event
        window.dispatchEvent(new CustomEvent('bharath:backgroundchange', {
            detail: { state: canonicalKey }
        }));
    }

    /**
     * Resets background to default mandala / atmospheric dark space
     */
    function resetTheme() {
        currentState = null;
        if (layerA) {
            layerA.classList.remove('is-active');
            layerA.style.backgroundImage = 'none';
        }
        if (layerB) {
            layerB.classList.remove('is-active');
            layerB.style.backgroundImage = 'none';
        }
        document.body.classList.remove(
            'theme-state-karnataka',
            'theme-state-punjab',
            'theme-state-odisha',
            'theme-state-maharashtra',
            'theme-state-jammuKashmir'
        );
    }

    /**
     * Auto-detect state environment based on pathname or body attributes
     */
    function autoDetect() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('karnataka.html')) {
            setTheme('karnataka', true);
        } else if (path.includes('punjab.html')) {
            setTheme('punjab', true);
        } else if (path.includes('odisha.html')) {
            setTheme('odisha', true);
        } else if (path.includes('maharashtra.html')) {
            setTheme('maharashtra', true);
        } else if (path.includes('jk.html')) {
            setTheme('jammuKashmir', true);
        } else {
            // Main menu, map, or settings: preload all assets for zero-flicker
            preloadAll();
        }
    }

    return {
        STATE_BACKGROUNDS,
        JPG_FALLBACKS,
        preloadAll,
        setTheme,
        resetTheme,
        getCurrentState: () => currentState,
        normalizeStateKey,
        init() {
            setupDOM();
            autoDetect();
            return this;
        }
    };
})();

// Sanskrit particle canvas animation engine
function initSanskritCanvas() {
    const bgCanvas = document.getElementById('bg-canvas');
    if (!bgCanvas) return;
    const bgCtx = bgCanvas.getContext('2d');

    let w = bgCanvas.width = window.innerWidth;
    let h = bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        w = bgCanvas.width = window.innerWidth;
        h = bgCanvas.height = window.innerHeight;
    });

    const sanskritGlyphs = ['ॐ', 'श्री', 'धर्म', 'कर्म', 'सत्य', 'मोक्ष', 'वीर', 'जय', 'ज्ञान', 'तेज', 'शक्ति', 'योग', 'अमर'];
    const bgParticles = [];

    for (let i = 0; i < 45; i++) {
        bgParticles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 14 + 10,
            glyph: sanskritGlyphs[Math.floor(Math.random() * sanskritGlyphs.length)],
            vy: -(Math.random() * 0.5 + 0.25),
            vx: (Math.random() - 0.5) * 0.25,
            alpha: Math.random() * 0.45 + 0.15,
            color: '#e6c670'
        });
    }

    function animateBgCanvas() {
        bgCtx.clearRect(0, 0, w, h);
        bgParticles.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            if (p.y < -30) { p.y = h + 20; p.x = Math.random() * w; }
            bgCtx.save();
            bgCtx.globalAlpha = p.alpha;
            bgCtx.font = `${p.size}px "Noto Serif Devanagari", serif`;
            bgCtx.fillStyle = p.color;
            bgCtx.shadowColor = '#ffd700';
            bgCtx.shadowBlur = 8;
            bgCtx.fillText(p.glyph, p.x, p.y);
            bgCtx.restore();
        });
        requestAnimationFrame(animateBgCanvas);
    }
    animateBgCanvas();
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        BharathBackground.init();
        initSanskritCanvas();
    });
}
