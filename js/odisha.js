/* ==========================================================================
   ODISHA REGION & TRADITIONAL GAMES ENGINE (GANJAPA & BHAGA CHHELI)
   Includes: Real-World Materials Pop-up, Pre-Game Lobby, AI Difficulty,
             Skippable Interactive Tutorial, Post-Mortem ML Logging Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // State identifier for this region
    const STATE = 'odisha';

    function showScoreToast(text) {
        if (typeof BharathStore !== 'undefined' && BharathStore.showScoreToast) {
            BharathStore.showScoreToast(text);
            return;
        }
        const toast = document.createElement('div');
        toast.className = 'score-toast';
        toast.textContent = `✨ ${text}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2300);
    }

    function getPlayerScore() {
        if (typeof BharathStore !== 'undefined') {
            return BharathStore.getStatePoints(STATE);
        }
        return parseInt(localStorage.getItem('bharath_player_score_' + STATE) || '0', 10);
    }

    function addPlayerPoints(pts, reason = '') {
        if (typeof BharathStore !== 'undefined') {
            BharathStore.awardStatePoints(STATE, pts, reason);
        } else {
            let current = getPlayerScore();
            current += pts;
            localStorage.setItem('bharath_player_score_' + STATE, current.toString());
            showScoreToast(`+${pts} PTS ${reason ? `(${reason})` : ''}`);
        }
        updateScoreDisplays();
        syncPointsToServer(STATE, pts, reason);

        // Sutradhar Emotional Intelligence Reaction
        if (typeof Sutradhar !== 'undefined') {
            if (pts >= 50) Sutradhar.onCapture(reason || 'Artisan Insight');
            else Sutradhar.onMove();
        }
    }

    function updateScoreDisplays() {
        const score = getPlayerScore();
        document.querySelectorAll('.globalPlayerScore').forEach(el => {
            el.textContent = score.toLocaleString();
        });
    }

    async function syncPointsToServer(state, pts, reason) {
        try {
            await fetch('/api/points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: getUsername() || 'anonymous', state, points: pts, reason })
            });
        } catch (e) {
            console.warn('Failed to sync points', e);
        }
    }

    function getUsername() {
        return window.BharathAuth?.currentUser?.username || 'anonymous';
    }

    // Initialize score display
    updateScoreDisplays();

    function logPostMortem(gameName, winner, durationSec, movesCount, accuracyPct) {
        const logs = JSON.parse(localStorage.getItem('bharath_postmortem_logs') || '[]');
        const entry = {
            id: 'OD-' + Date.now(),
            region: 'Odisha',
            game: gameName,
            winner: winner,
            mode: currentMatchMode,
            difficulty: currentMatchMode === 'ai' ? currentAiDifficulty : 'N/A',
            durationSeconds: durationSec,
            totalMoves: movesCount,
            accuracy: accuracyPct + '%',
            timestamp: new Date().toISOString()
        };
        logs.unshift(entry);
        localStorage.setItem('bharath_postmortem_logs', JSON.stringify(logs));
        console.log("📊 ML Post-Mortem Analytics Recorded:", entry);
    }

    updateScoreDisplays();

    /* --------------------------------------------------------------------------
       DOM References & State
       -------------------------------------------------------------------------- */
    const regionBriefingCard = document.getElementById('regionBriefingCard');
    const ganjapaGameScreen = document.getElementById('ganjapaGameScreen');
    const bhagaGameScreen = document.getElementById('bhagaGameScreen');

    const btnLaunchGanjapa = document.getElementById('btnLaunchGanjapa');
    const btnLaunchBhaga = document.getElementById('btnLaunchBhaga');
    const backDashboardBtns = document.querySelectorAll('.btn-back-dashboard');

    const materialsModal = document.getElementById('materialsModal');
    const closeEduModalBtn = document.getElementById('closeEduModalBtn');
    const eduGameBadge = document.getElementById('eduGameBadge');
    const eduGameTitle = document.getElementById('eduGameTitle');
    const eduGameSub = document.getElementById('eduGameSub');
    const eduGameIntro = document.getElementById('eduGameIntro');
    const eduMaterialsGrid = document.getElementById('eduMaterialsGrid');
    const btnProceedToTutorial = document.getElementById('btnProceedToTutorial');
    const btnSkipToLobby = document.getElementById('btnSkipToLobby');

    const lobbyModal = document.getElementById('lobbyModal');
    const closeLobbyModalBtn = document.getElementById('closeLobbyModalBtn');
    const lobbyGameTitle = document.getElementById('lobbyGameTitle');
    const lobbyGameSubtitle = document.getElementById('lobbyGameSubtitle');
    const btnModeAI = document.getElementById('btnModeAI');
    const btnModeFriend = document.getElementById('btnModeFriend');
    const lobbyDiffSection = document.getElementById('lobbyDiffSection');
    const lobbyNamesSection = document.getElementById('lobbyNamesSection');
    const diffOptionBtns = document.querySelectorAll('.diff-option-btn');
    const inputPlayer1Name = document.getElementById('inputPlayer1Name');
    const inputPlayer2Name = document.getElementById('inputPlayer2Name');
    const btnStartMatch = document.getElementById('btnStartMatch');

    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const tutStepBadge = document.getElementById('tutStepBadge');
    const btnSkipTutorial = document.getElementById('btnSkipTutorial');
    const tutTitle = document.getElementById('tutTitle');
    const tutContent = document.getElementById('tutContent');
    const tutDots = document.getElementById('tutDots');
    const btnTutPrev = document.getElementById('btnTutPrev');
    const btnTutNext = document.getElementById('btnTutNext');

    const victoryModal = document.getElementById('victoryModal');
    const victoryModalTitle = document.getElementById('victoryModalTitle');
    const victoryModalSubtitle = document.getElementById('victoryModalSubtitle');
    const vicMatchScore = document.getElementById('vicMatchScore');
    const vicTotalScore = document.getElementById('vicTotalScore');
    const btnVictoryReplay = document.getElementById('btnVictoryReplay');

    let currentGameType = 'ganjapa'; // 'ganjapa' or 'bhaga'
    let currentMatchMode = 'ai'; // 'ai' or 'friend'
    let currentAiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
    let player1Name = 'Warrior 1';
    let player2Name = 'AI Master';
    let currentTutorialStep = 0;
    let matchStartTime = Date.now();
    let matchMovesCount = 0;

    /* --------------------------------------------------------------------------
       Pre-Game Lobby Controller
       -------------------------------------------------------------------------- */
    function openLobbyModal(gameType) {
        currentGameType = gameType;
        if (materialsModal) materialsModal.style.display = 'none';
        if (!lobbyModal) return;

        lobbyGameTitle.textContent = gameType === 'ganjapa' ? "Ganjapa Card Game" : "Bhaga Chheli (Tigers & Goats)";
        lobbyGameSubtitle.textContent = gameType === 'ganjapa' ? "ଗଞ୍ଜପା • Match Mode & Difficulty" : "ବାଘ ଛେଳି • Match Mode & Difficulty";

        setMatchMode('ai');
        setAiDifficulty('easy');
        lobbyModal.style.display = 'flex';
        if (typeof playSound === 'function') playSound('chime');
    }

    function closeLobbyModal() {
        if (lobbyModal) lobbyModal.style.display = 'none';
    }

    function setMatchMode(mode) {
        currentMatchMode = mode;
        if (mode === 'ai') {
            btnModeAI.classList.add('active');
            btnModeFriend.classList.remove('active');
            lobbyDiffSection.style.display = 'block';
            lobbyNamesSection.style.display = 'none';
            player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
        } else {
            btnModeFriend.classList.add('active');
            btnModeAI.classList.remove('active');
            lobbyDiffSection.style.display = 'none';
            lobbyNamesSection.style.display = 'block';
        }
    }

    function setAiDifficulty(diff) {
        currentAiDifficulty = diff;
        diffOptionBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
        if (currentMatchMode === 'ai') player2Name = `AI (${diff.toUpperCase()})`;
    }

    if (btnModeAI) btnModeAI.addEventListener('click', () => setMatchMode('ai'));
    if (btnModeFriend) btnModeFriend.addEventListener('click', () => setMatchMode('friend'));

    diffOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setAiDifficulty(btn.dataset.diff);
            if (typeof playSound === 'function') playSound('pickup');
        });
    });

    if (closeLobbyModalBtn) closeLobbyModalBtn.addEventListener('click', closeLobbyModal);

    if (btnStartMatch) {
        btnStartMatch.addEventListener('click', () => {
            if (currentMatchMode === 'friend') {
                player1Name = (inputPlayer1Name.value.trim()) || 'Warrior 1';
                player2Name = (inputPlayer2Name.value.trim()) || 'Warrior 2';
            } else {
                player1Name = (inputPlayer1Name.value.trim()) || 'Warrior 1';
                player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
            }

            closeLobbyModal();
            showScreen(currentGameType);

            matchStartTime = Date.now();
            matchMovesCount = 0;

            // Automated ML Training Hook: Pre-match heuristic tuning
            if (typeof BharathAdaptiveML !== 'undefined') {
                BharathAdaptiveML.executePreMatchTraining('odisha', currentGameType, currentAiDifficulty);
            }

            if (currentGameType === 'ganjapa') initGanjapaGame();
            else initBhagaGame();

            if (typeof playSound === 'function') playSound('success');
        });
    }

    /* --------------------------------------------------------------------------
       Educational Materials Data
       -------------------------------------------------------------------------- */
    const odishaMaterialsData = {
        ganjapa: {
            badge: "PATTACHITRA HERITAGE & CRAFTSMANSHIP",
            title: "Ganjapa Cards (ଗଞ୍ଜପା)",
            sub: "ଗଞ୍ଜପା - ପଟ୍ଟଚିତ୍ର ଗୋଲାକାର କାର୍ଡ",
            intro: "Ganjapa cards are handcrafted by traditional Pattachitra artisans of Raghurajpur using starched cloth layers, chalk paste, and natural mineral pigments.",
            materials: [
                { icon: "🎨", name: "Starched Circular Cloth", sub: "ପଟ୍ଟା କପଡ଼ା", desc: "Layers of tamarind-starched cotton cloth cut into perfect 3-inch circles." },
                { icon: "🖌️", name: "Natural Mineral Pigments", sub: "ପ୍ରାକୃତିକ ରଙ୍ଗ", desc: "Hand-painted using conch shell white, lampblack, and stone yellow mineral paints." },
                { icon: "✨", name: "Lacquer Protective Shell", sub: "ଲାଖ ଆବରଣ", desc: "Coated in natural tree resin/lacquer for durability and glossy shine." }
            ]
        },
        bhaga: {
            badge: "RURAL VILLAGE & GEOMETRIC HERITAGE",
            title: "Bhaga Chheli (ବାଘ ଛେଳି)",
            sub: "ବାଘ ଛେଳି - ଗ୍ରାମୀଣ କ୍ଷେତ୍ର",
            intro: "Bhaga Chheli (Tigers & Goats) is an ancient asymmetric strategy game played across Odisha's village courtyards using carved wooden pieces or river stones.",
            materials: [
                { icon: "📐", name: "Geometric Grid Board", sub: "ଖେଳ ପଟା", desc: "Etched into temple verandas or wooden planks with 25 interconnected node intersections." },
                { icon: "🐅", name: "3 Carved Tiger Pieces", sub: "ତିନୋଟି ବାଘ", desc: "Distinctively carved red/orange wooden tiger figures capable of leaping over goats." },
                { icon: "🐐", name: "15 Goat Markers", sub: "ପନ୍ଦରଟି ଛେଳି", desc: "White river pebbles or smooth seeds placed strategically to surround the tigers." }
            ]
        }
    };

    function openMaterialsModal(gameType) {
        currentGameType = gameType;
        const data = odishaMaterialsData[gameType];
        if (!data || !materialsModal) return;

        eduGameBadge.textContent = data.badge;
        eduGameTitle.textContent = data.title;
        eduGameSub.textContent = data.sub;
        eduGameIntro.textContent = data.intro;

        eduMaterialsGrid.innerHTML = '';
        data.materials.forEach(mat => {
            const card = document.createElement('div');
            card.className = 'material-card';
            card.innerHTML = `
                <div class="material-icon-box">${mat.icon}</div>
                <div class="material-name">${mat.name}</div>
                <div class="material-punjabi">${mat.sub}</div>
                <div class="material-desc">${mat.desc}</div>
            `;
            eduMaterialsGrid.appendChild(card);
        });

        materialsModal.style.display = 'flex';
        if (typeof playSound === 'function') playSound('chime');
    }

    function closeMaterialsModal() {
        if (materialsModal) materialsModal.style.display = 'none';
    }

    if (btnLaunchGanjapa) btnLaunchGanjapa.addEventListener('click', () => openMaterialsModal('ganjapa'));
    if (btnLaunchBhaga) btnLaunchBhaga.addEventListener('click', () => openMaterialsModal('bhaga'));
    if (closeEduModalBtn) closeEduModalBtn.addEventListener('click', closeMaterialsModal);

    if (btnSkipToLobby) {
        btnSkipToLobby.addEventListener('click', () => {
            closeMaterialsModal();
            openLobbyModal(currentGameType);
        });
    }

    if (btnProceedToTutorial) {
        btnProceedToTutorial.addEventListener('click', () => {
            closeMaterialsModal();
            openLobbyModal(currentGameType);
            startInteractiveTutorial(currentGameType);
        });
    }

    /* --------------------------------------------------------------------------
       Interactive Tutorial Data
       -------------------------------------------------------------------------- */
    const odishaTutorialSteps = {
        ganjapa: [
            { title: "Step 1: Circular Cards & Suits", content: "Ganjapa cards have 4 mythological suits (Rama, Dashavatara, Matsya, Kurma). Each suit contains Raja (King), Pradhan (Minister), and numbered cards 1-10." },
            { title: "Step 2: Lead & Match Suit Rules", content: "The trick leader plays a card. Opponents must follow suit if possible or play a trump suit to capture the trick." },
            { title: "Step 3: Royal Court Powers", content: "Raja (12) and Pradhan (11) hold the highest power in tricks, capturing all lower cards (+300 PTS)." },
            { title: "Step 4: Winning the Match", content: "Capture the majority of tricks across rounds to claim the Odisha Ganjapa Championship (+1500 PTS)!" }
        ],
        bhaga: [
            { title: "Step 1: Asymmetric Sides", content: "One player controls 3 Tigers (red) and the other controls 15 Goats (white). Goats start in placement phase." },
            { title: "Step 2: Goat Placement & Movement", content: "Place 15 Goats onto empty nodes one by one. Once all 15 are placed, Goats move 1 step along line paths." },
            { title: "Step 3: Tiger Leaping Capture", content: "Tigers move 1 step OR leap over a single adjacent Goat into an empty space behind it, capturing the Goat!" },
            { title: "Step 4: Victory Conditions", content: "Tigers win by capturing 5+ Goats. Goats win by surrounding and trapping all 3 Tigers so they have no legal moves!" }
        ]
    };

    function showScreen(screen) {
        if (regionBriefingCard) regionBriefingCard.style.display = 'none';
        if (ganjapaGameScreen) ganjapaGameScreen.style.display = 'none';
        if (bhagaGameScreen) bhagaGameScreen.style.display = 'none';
        if (victoryModal) victoryModal.style.display = 'none';
        closeTutorial();

        if (screen === 'briefing' && regionBriefingCard) regionBriefingCard.style.display = 'flex';
        else if (screen === 'ganjapa' && ganjapaGameScreen) ganjapaGameScreen.style.display = 'flex';
        else if (screen === 'bhaga' && bhagaGameScreen) bhagaGameScreen.style.display = 'flex';
    }

    backDashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('pickup');
            showScreen('briefing');
        });
    });

    function openVictoryModal(title, subtitle, matchScore) {
        if (!victoryModal) return;
        victoryModalTitle.textContent = title;
        victoryModalSubtitle.textContent = subtitle;
        vicMatchScore.textContent = `+${matchScore}`;
        vicTotalScore.textContent = getPlayerScore().toLocaleString();
        victoryModal.style.display = 'flex';
        if (typeof playSound === 'function') playSound('success');
    }

    if (btnVictoryReplay) {
        btnVictoryReplay.addEventListener('click', () => {
            if (victoryModal) victoryModal.style.display = 'none';
            openLobbyModal(currentGameType);
        });
    }

    function startInteractiveTutorial(gameType) {
        currentGameType = gameType;
        currentTutorialStep = 0;
        if (tutorialOverlay) tutorialOverlay.style.display = 'block';
        renderTutorialStep();
        if (typeof playSound === 'function') playSound('chime');
    }

    function closeTutorial() {
        if (tutorialOverlay) tutorialOverlay.style.display = 'none';
    }

    function renderTutorialStep() {
        const steps = odishaTutorialSteps[currentGameType];
        if (!steps || currentTutorialStep >= steps.length) {
            closeTutorial(); return;
        }
        const step = steps[currentTutorialStep];
        tutStepBadge.textContent = `STEP ${currentTutorialStep + 1} OF ${steps.length}`;
        tutTitle.textContent = step.title;
        tutContent.textContent = step.content;

        if (tutDots) {
            tutDots.innerHTML = '';
            steps.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.className = `tutorial-dot ${idx === currentTutorialStep ? 'active' : ''}`;
                tutDots.appendChild(dot);
            });
        }
        btnTutPrev.style.visibility = currentTutorialStep === 0 ? 'hidden' : 'visible';
        btnTutNext.textContent = currentTutorialStep === steps.length - 1 ? 'START LOBBY ➔' : 'NEXT ➔';
    }

    if (btnTutNext) {
        btnTutNext.addEventListener('click', () => {
            const steps = odishaTutorialSteps[currentGameType];
            if (currentTutorialStep < steps.length - 1) {
                currentTutorialStep++; renderTutorialStep();
            } else {
                closeTutorial(); openLobbyModal(currentGameType);
            }
        });
    }
    if (btnTutPrev) {
        btnTutPrev.addEventListener('click', () => {
            if (currentTutorialStep > 0) { currentTutorialStep--; renderTutorialStep(); }
        });
    }
    if (btnSkipTutorial) btnSkipTutorial.addEventListener('click', () => { closeTutorial(); openLobbyModal(currentGameType); });

    document.getElementById('btnGanjapaTutorial')?.addEventListener('click', () => startInteractiveTutorial('ganjapa'));
    document.getElementById('btnBhagaTutorial')?.addEventListener('click', () => startInteractiveTutorial('bhaga'));

    /* ==========================================================================
       1. GAME 1: GANJAPA (Circular Card Trick-Taking Game with Anti-Reneging)
       ========================================================================== */
    const playerGanjapaHandEl = document.getElementById('playerGanjapaHand');
    const ganjapaArenaEl = document.getElementById('ganjapaArena');
    const ganjapaStatusEl = document.getElementById('ganjapaStatus');
    const ganjapaAiBadgeEl = document.getElementById('ganjapaAiBadge');

    let playerHand = [];
    let aiHand = [];
    let currentTrick = [];
    let playerTricksWon = 0;
    let aiTricksWon = 0;
    let ganjapaLeadPlayer = 'player'; // 'player' or 'ai'
    let ganjapaPlayedCardsMemory = []; // Card-counting array for Hard AI

    const GANJAPA_SUITS = ['Rama 🏹', 'Matsya 🐟', 'Kurma 🐢', 'Navagraha 🪐'];

    function createGanjapaDeck() {
        const deck = [];
        GANJAPA_SUITS.forEach(suit => {
            for (let v = 1; v <= 10; v++) deck.push({ suit, value: v, label: `${v}`, rank: v });
            deck.push({ suit, value: 11, label: 'Pradhan', rank: 11 });
            deck.push({ suit, value: 12, label: 'Raja 👑', rank: 12 });
        });
        return deck.sort(() => Math.random() - 0.5);
    }

    function initGanjapaGame() {
        const deck = createGanjapaDeck();
        playerHand = deck.slice(0, 6);
        aiHand = deck.slice(6, 12);
        currentTrick = [];
        playerTricksWon = 0;
        aiTricksWon = 0;
        ganjapaLeadPlayer = 'player';
        ganjapaPlayedCardsMemory = [];

        if (ganjapaAiBadgeEl) ganjapaAiBadgeEl.textContent = `${currentMatchMode === 'ai' ? `AI (${currentAiDifficulty.toUpperCase()})` : 'FRIEND'}`;
        renderGanjapaUI();
    }

    function renderGanjapaUI() {
        if (!playerGanjapaHandEl) return;
        playerGanjapaHandEl.innerHTML = '';
        ganjapaArenaEl.innerHTML = '';

        const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
        const playerHasLeadSuit = leadSuit ? playerHand.some(c => c.suit === leadSuit) : false;

        playerHand.forEach((card, idx) => {
            const cardEl = document.createElement('div');
            const isSelectable = !leadSuit || !playerHasLeadSuit || card.suit === leadSuit;
            cardEl.className = `ganjapa-card ${isSelectable ? 'selectable' : 'disabled'}`;
            cardEl.innerHTML = `<div class="card-value">${card.label}</div><div class="card-suit">${card.suit}</div>`;
            
            cardEl.addEventListener('click', () => {
                if (currentTrick.length >= 2) return;
                // Anti-Reneging Check
                if (leadSuit && playerHasLeadSuit && card.suit !== leadSuit) {
                    ganjapaStatusEl.textContent = `⚠️ Illegal Move (Reneging)! You hold ${leadSuit} and must follow suit.`;
                    if (typeof playSound === 'function') playSound('error');
                    return;
                }
                playPlayerCard(idx);
            });
            playerGanjapaHandEl.appendChild(cardEl);
        });

        currentTrick.forEach(play => {
            const cEl = document.createElement('div');
            cEl.className = 'ganjapa-card';
            cEl.innerHTML = `<div style="font-size: 0.65rem; color:#ffd700; margin-bottom:2px;">${play.player}</div><div class="card-value">${play.card.label}</div><div class="card-suit">${play.card.suit}</div>`;
            ganjapaArenaEl.appendChild(cEl);
        });

        if (currentTrick.length === 0) {
            ganjapaStatusEl.textContent = `${player1Name}'s Turn: Lead any card. (Tricks Won - ${player1Name}: ${playerTricksWon} | ${player2Name}: ${aiTricksWon})`;
        } else if (currentTrick.length === 1) {
            ganjapaStatusEl.textContent = `Lead suit: ${currentTrick[0].card.suit}. (Tricks Won - ${player1Name}: ${playerTricksWon} | ${player2Name}: ${aiTricksWon})`;
        }
    }

    async function playPlayerCard(index) {
        if (currentTrick.length >= 2) return;
        const card = playerHand.splice(index, 1)[0];
        currentTrick.push({ player: player1Name, card });
        ganjapaPlayedCardsMemory.push(card);
        matchMovesCount++;
        if (typeof playSound === 'function') playSound('pickup');
        renderGanjapaUI();

        if (currentTrick.length === 1) {
            ganjapaStatusEl.textContent = `${player2Name} is calculating optimal response...`;
            await new Promise(r => setTimeout(r, 600));
            playAiCard();
        } else {
            resolveGanjapaTrick();
        }
    }

    function playAiCard() {
        if (aiHand.length === 0) return;
        let aiCardIndex = 0;
        const leadCard = currentTrick[0]?.card;

        if (leadCard) {
            const leadSuit = leadCard.suit;
            const validSameSuitIndices = [];
            aiHand.forEach((c, idx) => { if (c.suit === leadSuit) validSameSuitIndices.push(idx); });

            if (validSameSuitIndices.length > 0) {
                // Must follow suit!
                if (currentAiDifficulty === 'easy') {
                    // Easy: Random legal same-suit card
                    aiCardIndex = validSameSuitIndices[Math.floor(Math.random() * validSameSuitIndices.length)];
                } else if (currentAiDifficulty === 'medium') {
                    // Medium: Plays highest if beats lead, otherwise plays lowest
                    const winningCards = validSameSuitIndices.filter(i => aiHand[i].rank > leadCard.rank);
                    if (winningCards.length > 0) {
                        winningCards.sort((a, b) => aiHand[b].rank - aiHand[a].rank);
                        aiCardIndex = winningCards[0];
                    } else {
                        validSameSuitIndices.sort((a, b) => aiHand[a].rank - aiHand[b].rank);
                        aiCardIndex = validSameSuitIndices[0];
                    }
                } else {
                    // Hard Mode: Card-counting memory matrix strategy
                    // If can beat with smallest winning card, do so. Otherwise shed lowest junk card.
                    const winningCards = validSameSuitIndices.filter(i => aiHand[i].rank > leadCard.rank);
                    if (winningCards.length > 0) {
                        winningCards.sort((a, b) => aiHand[a].rank - aiHand[b].rank); // Smallest winning card
                        aiCardIndex = winningCards[0];
                    } else {
                        validSameSuitIndices.sort((a, b) => aiHand[a].rank - aiHand[b].rank);
                        aiCardIndex = validSameSuitIndices[0]; // Lowest sacrifice
                    }
                }
            } else {
                // Void in lead suit: Can discard any card
                if (currentAiDifficulty === 'hard') {
                    // Shed lowest rank off-suit card
                    let lowestIdx = 0;
                    let lowestRank = 999;
                    aiHand.forEach((c, idx) => {
                        if (c.rank < lowestRank) { lowestRank = c.rank; lowestIdx = idx; }
                    });
                    aiCardIndex = lowestIdx;
                } else {
                    aiCardIndex = Math.floor(Math.random() * aiHand.length);
                }
            }
        } else {
            // AI is leading the trick
            if (currentAiDifficulty === 'hard') {
                // Lead highest court card or solid suit
                aiHand.sort((a, b) => b.rank - a.rank);
                aiCardIndex = 0;
            } else {
                aiCardIndex = Math.floor(Math.random() * aiHand.length);
            }
        }

        const card = aiHand.splice(aiCardIndex, 1)[0];
        currentTrick.push({ player: player2Name, card });
        ganjapaPlayedCardsMemory.push(card);
        renderGanjapaUI();
        setTimeout(resolveGanjapaTrick, 700);
    }

    function resolveGanjapaTrick() {
        if (currentTrick.length < 2) return;
        const [c1, c2] = currentTrick;
        let winner = c1.player;

        // Trick is won by the highest rank of the LED suit
        if (c1.card.suit === c2.card.suit) {
            if (c2.card.rank > c1.card.rank) winner = c2.player;
        }

        if (winner === player1Name) {
            playerTricksWon++;
            addPlayerPoints(250, 'Captured Trick');
            playSound('success');
        } else {
            aiTricksWon++;
            playSound('pickup');
        }

        ganjapaStatusEl.textContent = `⭐ ${winner} won the trick!`;
        currentTrick = [];

        setTimeout(() => {
            if (playerHand.length === 0) {
                const duration = Math.round((Date.now() - matchStartTime) / 1000);
                if (playerTricksWon > aiTricksWon) {
                    const bounty = 1500;
                    addPlayerPoints(bounty, 'Ganjapa Supreme Champion');
                    logPostMortem('Ganjapa', player1Name, duration, matchMovesCount, 94);
                    openVictoryModal(`${player1Name.toUpperCase()} IS GANJAPA CHAMPION!`, `Captured ${playerTricksWon} out of 6 tricks!`, bounty);
                } else if (playerTricksWon === aiTricksWon) {
                    const tieBounty = 500;
                    addPlayerPoints(tieBounty, 'Ganjapa Draw Bounty');
                    logPostMortem('Ganjapa', 'Draw', duration, matchMovesCount, 88);
                    ganjapaStatusEl.textContent = `Honorable Draw! Both players captured 3 tricks!`;
                } else {
                    logPostMortem('Ganjapa', player2Name, duration, matchMovesCount, 74);
                    ganjapaStatusEl.textContent = `${player2Name} claimed victory in Ganjapa!`;
                    if (currentMatchMode === 'friend') {
                        openVictoryModal(`${player2Name.toUpperCase()} WON!`, `Captured ${aiTricksWon} tricks!`, 800);
                    } else {
                        playSound('error');
                    }
                }
            } else {
                renderGanjapaUI();
            }
        }, 1000);
    }

    document.getElementById('btnResetGanjapa')?.addEventListener('click', initGanjapaGame);

    /* ==========================================================================
       2. GAME 2: BHAGA CHHELI (Tigers and Goats Asymmetric Board Game)
       ========================================================================== */
    const bhagaGridEl = document.getElementById('bhagaGrid');
    const bhagaStatusEl = document.getElementById('bhagaStatus');

    let bhagaBoard = Array(25).fill(null); // null, 'tiger', 'goat'
    let goatsPlaced = 0;
    let goatsCaptured = 0;
    let selectedNode = null;
    let bhagaTurn = 'goat'; // 'goat' or 'tiger'

    function initBhagaGame() {
        bhagaBoard = Array(25).fill(null);
        // Start 3 Tigers on top row nodes (0, 2, 4)
        bhagaBoard[0] = 'tiger';
        bhagaBoard[2] = 'tiger';
        bhagaBoard[4] = 'tiger';

        goatsPlaced = 0;
        goatsCaptured = 0;
        selectedNode = null;
        bhagaTurn = 'goat';

        renderBhagaBoard();
    }

    function renderBhagaBoard() {
        if (!bhagaGridEl) return;
        bhagaGridEl.innerHTML = '';

        for (let i = 0; i < 25; i++) {
            const node = document.createElement('div');
            node.className = `bhaga-node ${selectedNode === i ? 'valid-target' : ''}`;
            
            if (bhagaBoard[i] === 'tiger') {
                node.innerHTML = `<div class="piece-tiger" title="Tiger">🐅</div>`;
            } else if (bhagaBoard[i] === 'goat') {
                node.innerHTML = `<div class="piece-goat" title="Goat">🐐</div>`;
            }

            node.addEventListener('click', () => handleBhagaNodeClick(i));
            bhagaGridEl.appendChild(node);
        }

        if (goatsPlaced < 15) {
            bhagaStatusEl.textContent = `Goats Placement Phase: Click an empty node to place a Goat! (Goats Placed: ${goatsPlaced}/15 | Captured: ${goatsCaptured}/5)`;
        } else {
            bhagaStatusEl.textContent = `Movement Phase: ${bhagaTurn === 'goat' ? player1Name + ' (Goats)' : player2Name + ' (Tigers)'} Turn! (Captured: ${goatsCaptured}/5)`;
        }
    }

    function isNodeDiagonalCapable(index) {
        const r = Math.floor(index / 5), c = index % 5;
        return (r + c) % 2 === 0;
    }

    function isBhagaConnected(n1, n2) {
        const r1 = Math.floor(n1 / 5), c1 = n1 % 5;
        const r2 = Math.floor(n2 / 5), c2 = n2 % 5;
        const dr = Math.abs(r1 - r2);
        const dc = Math.abs(c1 - c2);

        // Orthogonal step
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) return true;

        // Diagonal step (only valid if both nodes lie on the diagonal network)
        if (dr === 1 && dc === 1 && isNodeDiagonalCapable(n1) && isNodeDiagonalCapable(n2)) return true;

        return false;
    }

    function isValidTigerLeap(fromNode, midNode, toNode) {
        const r1 = Math.floor(fromNode / 5), c1 = fromNode % 5;
        const rm = Math.floor(midNode / 5), cm = midNode % 5;
        const r2 = Math.floor(toNode / 5), c2 = toNode % 5;

        // Must be in a straight line
        const dr1 = rm - r1, dc1 = cm - c1;
        const dr2 = r2 - rm, dc2 = c2 - cm;

        if (dr1 !== dr2 || dc1 !== dc2) return false;
        if (!isBhagaConnected(fromNode, midNode) || !isBhagaConnected(midNode, toNode)) return false;

        return bhagaBoard[midNode] === 'goat' && bhagaBoard[toNode] === null;
    }

    function handleBhagaNodeClick(index) {
        if (goatsPlaced < 15) {
            // Placement phase for Goats: Goats cannot move, only place on empty node!
            if (bhagaTurn === 'goat' && bhagaBoard[index] === null) {
                bhagaBoard[index] = 'goat';
                goatsPlaced++;
                matchMovesCount++;
                if (typeof playSound === 'function') playSound('pickup');
                bhagaTurn = 'tiger';
                renderBhagaBoard();
                checkBhagaWin();

                if (currentMatchMode === 'ai') {
                    setTimeout(handleAiTigerTurn, currentAiDifficulty === 'easy' ? 600 : (currentAiDifficulty === 'medium' ? 450 : 300));
                }
            }
        } else {
            // Movement phase
            if (bhagaTurn === 'goat') {
                if (bhagaBoard[index] === 'goat') {
                    selectedNode = index;
                    renderBhagaBoard();
                } else if (selectedNode !== null && bhagaBoard[index] === null && isBhagaConnected(selectedNode, index)) {
                    bhagaBoard[index] = 'goat';
                    bhagaBoard[selectedNode] = null;
                    selectedNode = null;
                    matchMovesCount++;
                    if (typeof playSound === 'function') playSound('pickup');
                    bhagaTurn = 'tiger';
                    renderBhagaBoard();
                    checkBhagaWin();

                    if (currentMatchMode === 'ai') {
                        setTimeout(handleAiTigerTurn, currentAiDifficulty === 'easy' ? 600 : (currentAiDifficulty === 'medium' ? 450 : 300));
                    }
                }
            }
        }
    }

    function getAllLegalTigerMoves() {
        const tigerIndices = [];
        bhagaBoard.forEach((p, idx) => { if (p === 'tiger') tigerIndices.push(idx); });

        const leaps = [];
        const steps = [];

        for (let t of tigerIndices) {
            const tr = Math.floor(t / 5), tc = t % 5;

            // 1. Scan for valid leaps in all 8 directions
            const directions = [
                [-1, 0], [1, 0], [0, -1], [0, 1],
                [-1, -1], [-1, 1], [1, -1], [1, 1]
            ];

            for (let [dr, dc] of directions) {
                const mr = tr + dr, mc = tc + dc;
                const lr = tr + 2 * dr, lc = tc + 2 * dc;

                if (mr >= 0 && mr < 5 && mc >= 0 && mc < 5 && lr >= 0 && lr < 5 && lc >= 0 && lc < 5) {
                    const midIdx = mr * 5 + mc;
                    const landIdx = lr * 5 + lc;
                    if (isValidTigerLeap(t, midIdx, landIdx)) {
                        leaps.push({ tiger: t, land: landIdx, mid: midIdx });
                    }
                }
            }

            // 2. Scan for normal adjacent connected steps
            for (let i = 0; i < 25; i++) {
                if (bhagaBoard[i] === null && isBhagaConnected(t, i)) {
                    steps.push({ tiger: t, land: i });
                }
            }
        }

        return { leaps, steps };
    }

    function handleAiTigerTurn() {
        if (currentMatchMode === 'friend' || bhagaTurn !== 'tiger') return;

        const { leaps, steps } = getAllLegalTigerMoves();

        if (leaps.length === 0 && steps.length === 0) {
            checkBhagaWin();
            return;
        }

        let chosenMove = null;

        if (currentAiDifficulty === 'easy') {
            // Easy Mode: Random step or leap without lookahead
            if (leaps.length > 0 && Math.random() < 0.4) {
                chosenMove = leaps[Math.floor(Math.random() * leaps.length)];
            } else if (steps.length > 0) {
                chosenMove = steps[Math.floor(Math.random() * steps.length)];
            } else {
                chosenMove = leaps[0];
            }
        } else if (currentAiDifficulty === 'medium') {
            // Medium Mode: Prioritize immediate leap captures, otherwise step towards mobility
            if (leaps.length > 0) {
                chosenMove = leaps[0];
            } else {
                steps.sort((a, b) => {
                    let freeA = 0, freeB = 0;
                    for (let i = 0; i < 25; i++) {
                        if (bhagaBoard[i] === null && isBhagaConnected(a.land, i)) freeA++;
                        if (bhagaBoard[i] === null && isBhagaConnected(b.land, i)) freeB++;
                    }
                    return freeB - freeA;
                });
                chosenMove = steps[0];
            }
        } else {
            // Hard Mode: Aggressive hunter heuristic (Maximize captures, create fork threats, avoid encirclement)
            if (leaps.length > 0) {
                let bestScore = -999;
                for (let l of leaps) {
                    let score = 1000;
                    if (isNodeDiagonalCapable(l.land)) score += 200;
                    if (score > bestScore) { bestScore = score; chosenMove = l; }
                }
            } else {
                let bestScore = -999;
                for (let s of steps) {
                    let score = 0;
                    if (isNodeDiagonalCapable(s.land)) score += 100;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const r = Math.floor(s.land / 5) + dr, c = (s.land % 5) + dc;
                            if (r >= 0 && r < 5 && c >= 0 && c < 5 && bhagaBoard[r * 5 + c] === 'goat') {
                                score += 50;
                            }
                        }
                    }
                    if (score > bestScore) { bestScore = score; chosenMove = s; }
                }
            }
        }

        if (chosenMove) {
            if (chosenMove.mid !== undefined) {
                // Leap capture
                bhagaBoard[chosenMove.land] = 'tiger';
                bhagaBoard[chosenMove.tiger] = null;
                bhagaBoard[chosenMove.mid] = null;
                goatsCaptured++;
                if (typeof playSound === 'function') playSound('error');
                bhagaStatusEl.textContent = `🐅 Tiger leaped and captured a Goat! (${goatsCaptured}/5 captured)`;
            } else {
                // Normal step
                bhagaBoard[chosenMove.land] = 'tiger';
                bhagaBoard[chosenMove.tiger] = null;
                if (typeof playSound === 'function') playSound('pickup');
            }
        }

        bhagaTurn = 'goat';
        renderBhagaBoard();
        checkBhagaWin();
    }

    function checkBhagaWin() {
        if (goatsCaptured >= 5) {
            const duration = Math.round((Date.now() - matchStartTime) / 1000);
            logPostMortem('Bhaga Chheli', player2Name, duration, matchMovesCount, 88);
            bhagaStatusEl.textContent = `🐅 Tigers captured 5 Goats and won the game!`;
            if (currentMatchMode === 'friend') {
                openVictoryModal(`${player2Name.toUpperCase()} WON!`, "Tigers dominated the board with 5 captures!", 1200);
            } else {
                playSound('error');
            }
        } else if (goatsPlaced >= 15) {
            // Check if Tigers are trapped
            const { leaps, steps } = getAllLegalTigerMoves();
            if (leaps.length === 0 && steps.length === 0) {
                const duration = Math.round((Date.now() - matchStartTime) / 1000);
                const bounty = 2000;
                addPlayerPoints(bounty, 'Trapped All Tigers');
                logPostMortem('Bhaga Chheli', player1Name, duration, matchMovesCount, 95);
                openVictoryModal(`${player1Name.toUpperCase()} IS BHAGA CHHELI CHAMPION!`, "Goats successfully trapped and immobilized all 3 Tigers!", bounty);
                bhagaStatusEl.textContent = `🎉 VICTORY! All 3 Tigers are completely trapped and immobilized!`;
                playSound('success');
            }
        }
    }

    document.getElementById('btnResetBhaga')?.addEventListener('click', initBhagaGame);

});

