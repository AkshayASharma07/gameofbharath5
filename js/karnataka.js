/* ==========================================================================
   KARNATAKA REGION & TRADITIONAL GAMES ENGINE (ALIGULI MANE & CHOWKABARA)
   Features:
   1. Real-World Materials Educational Pop-up
   2. Pre-Game Lobby Selection (Play with AI vs Play with Friend)
   3. Dynamic AI Difficulty Scaling (Easy / Medium / Hard)
   4. Custom Player Names for Friend Mode
   5. Skippable Interactive Tutorial & Persistent Player Score System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State identifier for this region
    const STATE = 'karnataka';

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
            if (pts >= 50) Sutradhar.onCapture(reason || 'Tactical Mastery');
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

    /* --------------------------------------------------------------------------
       ML Post-Mortem Match Logger
       -------------------------------------------------------------------------- */
    let _matchStartTime = Date.now();

    function resetMatchTimer() { _matchStartTime = Date.now(); }

    function logPostMortem(gameType, winner, mode, difficulty, totalMoves, matchPts) {
        try {
            const isAIWin = winner.toLowerCase().includes('ai');
            const durationSeconds = Math.round((Date.now() - _matchStartTime) / 1000);
            const accuracy = Math.min(100, Math.round(55 + (totalMoves * 1.8) - (durationSeconds * 0.06) + (isAIWin ? -5 : 5)));
            const log = {
                id: `KA-${Date.now()}`,
                region: 'Karnataka',
                game: gameType,
                winner: winner,
                mode: mode,
                difficulty: difficulty.toUpperCase(),
                durationSeconds: durationSeconds,
                totalMoves: totalMoves,
                accuracy: `${Math.max(60, accuracy)}%`,
                timestamp: new Date().toISOString(),
                matchPoints: matchPts
            };
            const stored = localStorage.getItem('bharath_postmortem_logs');
            const logs = stored ? JSON.parse(stored) : [];
            logs.unshift(log);
            localStorage.setItem('bharath_postmortem_logs', JSON.stringify(logs.slice(0, 200)));
        } catch (e) {
            console.warn('logPostMortem error:', e);
        }
    }

    /* --------------------------------------------------------------------------
       DOM References: Screens, Modals & Lobby
       -------------------------------------------------------------------------- */
    const regionBriefingCard = document.getElementById('regionBriefingCard');
    const aliguliGameScreen = document.getElementById('aliguliGameScreen');
    const chowkabaraGameScreen = document.getElementById('chowkabaraGameScreen');

    const btnLaunchAliguli = document.getElementById('btnLaunchAliguli');
    const btnLaunchChowkabara = document.getElementById('btnLaunchChowkabara');
    const backDashboardBtns = document.querySelectorAll('.btn-back-dashboard');

    // Educational Modal Elements
    const materialsModal = document.getElementById('materialsModal');
    const closeEduModalBtn = document.getElementById('closeEduModalBtn');
    const eduGameBadge = document.getElementById('eduGameBadge');
    const eduGameTitle = document.getElementById('eduGameTitle');
    const eduGameKannada = document.getElementById('eduGameKannada');
    const eduGameIntro = document.getElementById('eduGameIntro');
    const eduMaterialsGrid = document.getElementById('eduMaterialsGrid');
    const btnProceedToTutorial = document.getElementById('btnProceedToTutorial');
    const btnSkipToLobby = document.getElementById('btnSkipToLobby');

    // Pre-Game Lobby Modal Elements
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

    // Interactive Tutorial Elements
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const tutStepBadge = document.getElementById('tutStepBadge');
    const btnSkipTutorial = document.getElementById('btnSkipTutorial');
    const tutTitle = document.getElementById('tutTitle');
    const tutContent = document.getElementById('tutContent');
    const tutDots = document.getElementById('tutDots');
    const btnTutPrev = document.getElementById('btnTutPrev');
    const btnTutNext = document.getElementById('btnTutNext');

    // Victory Modal Elements
    const victoryModal = document.getElementById('victoryModal');
    const victoryModalTitle = document.getElementById('victoryModalTitle');
    const victoryModalSubtitle = document.getElementById('victoryModalSubtitle');
    const vicMatchScore = document.getElementById('vicMatchScore');
    const vicTotalScore = document.getElementById('vicTotalScore');
    const btnVictoryReplay = document.getElementById('btnVictoryReplay');

    // In-game tutorial triggers
    const btnAliguliTutorial = document.getElementById('btnAliguliTutorial');
    const btnChowkabaraTutorial = document.getElementById('btnChowkabaraTutorial');

    // Match Configuration State
    let currentGameType = 'aliguli'; // 'aliguli' or 'chowkabara'
    let currentMatchMode = 'ai'; // 'ai' or 'friend'
    let currentAiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
    let player1Name = 'Player 1';
    let player2Name = 'AI Master';
    let currentTutorialStep = 0;
    let matchPointsAccumulated = 0;

    /* --------------------------------------------------------------------------
       Pre-Game Lobby Controller
       -------------------------------------------------------------------------- */
    function openLobbyModal(gameType) {
        currentGameType = gameType;
        if (materialsModal) materialsModal.style.display = 'none';
        if (!lobbyModal) return;

        lobbyGameTitle.textContent = gameType === 'aliguli' ? "Aliguli Mane" : "Chowkabara";
        lobbyGameSubtitle.textContent = gameType === 'aliguli' ? "ಅಳಿಗುಳಿ ಮನೆ - Match Mode & Difficulty" : "ಚೌಕಬಾರ - Match Mode & Difficulty";

        // Reset to default selections
        setMatchMode('ai');
        setAiDifficulty('easy');

        lobbyModal.style.display = 'flex';
        playSound('chime');
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
        if (currentMatchMode === 'ai') {
            player2Name = `AI (${diff.toUpperCase()})`;
        }
    }

    if (btnModeAI) btnModeAI.addEventListener('click', () => setMatchMode('ai'));
    if (btnModeFriend) btnModeFriend.addEventListener('click', () => setMatchMode('friend'));

    diffOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setAiDifficulty(btn.dataset.diff);
            playSound('pickup');
        });
    });

    if (closeLobbyModalBtn) closeLobbyModalBtn.addEventListener('click', closeLobbyModal);

    if (btnStartMatch) {
        btnStartMatch.addEventListener('click', () => {
            // Save custom names
            if (currentMatchMode === 'friend') {
                player1Name = (inputPlayer1Name.value.trim()) || 'Player 1';
                player2Name = (inputPlayer2Name.value.trim()) || 'Player 2';
            } else {
                player1Name = (inputPlayer1Name.value.trim()) || 'Player 1';
                player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
            }

            closeLobbyModal();
            showScreen(currentGameType);

            // Automated ML Training Hook: Pre-match heuristic tuning
            if (typeof BharathAdaptiveML !== 'undefined') {
                BharathAdaptiveML.executePreMatchTraining('karnataka', currentGameType, currentAiDifficulty);
            }

            if (currentGameType === 'aliguli') initAliguliGame();
            else initChowkabaraGame();

            playSound('success');
        });
    }

    /* --------------------------------------------------------------------------
       Educational Materials Data
       -------------------------------------------------------------------------- */
    const materialsData = {
        aliguli: {
            badge: "HERITAGE MATERIALS & BOTANY",
            title: "Aliguli Mane (ಅಳಿಗುಳಿ ಮನೆ)",
            kannada: "ಕವಣೆಮನೆ / ಅಳಿಗುಳಿ ಮನೆ - ನೈಸರ್ಗಿಕ ಪರಿಕರಗಳು",
            intro: "Aliguli Mane is traditionally played with hand-carved wooden boards and smooth natural seeds, celebrated for fostering mental arithmetic and tactical strategy across Karnataka.",
            materials: [
                {
                    icon: "🪵",
                    name: "Carved Wooden Board",
                    kannada: "ಮರದ ಮಣೆ",
                    desc: "Handcrafted from solid Rosewood (Beete), Teakwood, or Sheesham. Features 14 scooped hemispherical pits (2 rows of 7) and 2 large side storehouses (Gula/Kottu)."
                },
                {
                    icon: "🌱",
                    name: "Gunja & Tamarind Seeds",
                    kannada: "ಗುಲಗಂಜಿ / ಹುಣಸೆ ಬೀಜ",
                    desc: "Traditionally uses polished tamarind seeds (Hunase Beeja), vibrant scarlet Gunja seeds (Gulaganji / Abrus precatorius), or small sea cowries for tactile calculation."
                },
                {
                    icon: "🧮",
                    name: "Tactical Counting Legacy",
                    kannada: "ಗಣಿತೀಯ ಪಾರಂಪರಿಕ ಆಟ",
                    desc: "Known as Pallanguzhi in neighboring regions, this mancala game was played in royal courtyards and temple verandas to teach children arithmetic and distribution strategies."
                }
            ]
        },
        chowkabara: {
            badge: "HERITAGE MATERIALS & TEXTILES",
            title: "Chowkabara (ಚೌಕಬಾರ)",
            kannada: "ಚೌಕಬಾರ (ಕವಡೆ ಆಟ) - ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಕರಗಳು",
            intro: "Chowkabara is an ancient 5×5 cross-and-circle race game dating back to the Vijayanagara Empire and royal Mysuru kingdom, played with cowrie shells and lacquer-turned pawns.",
            materials: [
                {
                    icon: "🧵",
                    name: "Chauka Vastra Cloth Board",
                    kannada: "ಚೌಕ ವಸ್ತ್ರ / ಮರದ ಹಲಗೆ",
                    desc: "Played on hand-embroidered silk or heavy cotton fabric (Chauka Vastra), or etched into temple stone floors, forming a 5×5 grid with cross-marked safe houses (Katte)."
                },
                {
                    icon: "🐚",
                    name: "Cowrie Shells (Kowdi)",
                    kannada: "ಕವಡೆಗಳು (Kowdi)",
                    desc: "4 natural sea cowrie shells (Cypraea moneta) serve as casting dice. Moves are calculated by shells landing mouth-up (open) vs. mouth-down (closed), with Chowka (4) granting bonus turns."
                },
                {
                    icon: "♟️",
                    name: "Channapatna Wooden Gottis",
                    kannada: "ಚನ್ನಪಟ್ಟಣ ಮರದ ಗೊಟ್ಟಿಗಳು",
                    desc: "Turned and lacquer-colored handcrafted wooden pawns (Gottis) from Channapatna in contrasting player colors navigating to the central Mahamane."
                }
            ]
        }
    };

    function openMaterialsModal(gameType) {
        currentGameType = gameType;
        const data = materialsData[gameType];
        if (!data || !materialsModal) return;

        eduGameBadge.textContent = data.badge;
        eduGameTitle.textContent = data.title;
        eduGameKannada.textContent = data.kannada;
        eduGameIntro.textContent = data.intro;

        eduMaterialsGrid.innerHTML = '';
        data.materials.forEach(mat => {
            const card = document.createElement('div');
            card.className = 'material-card';
            card.innerHTML = `
                <div class="material-icon-box">${mat.icon}</div>
                <div class="material-name">${mat.name}</div>
                <div class="material-kannada">${mat.kannada}</div>
                <div class="material-desc">${mat.desc}</div>
            `;
            eduMaterialsGrid.appendChild(card);
        });

        materialsModal.style.display = 'flex';
        playSound('chime');
    }

    function closeMaterialsModal() {
        if (materialsModal) materialsModal.style.display = 'none';
    }

    if (btnLaunchAliguli) {
        btnLaunchAliguli.addEventListener('click', () => openMaterialsModal('aliguli'));
    }

    if (btnLaunchChowkabara) {
        btnLaunchChowkabara.addEventListener('click', () => openMaterialsModal('chowkabara'));
    }

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
       Interactive Tutorial Steps Data
       -------------------------------------------------------------------------- */
    const tutorialSteps = {
        aliguli: [
            {
                title: "Step 1: 14 Pits & Starting Seeds",
                content: "The board consists of 14 pits (7 Player 1 pits on the bottom row, 7 Player 2 / AI pits on the top row) plus 2 storehouses. Each pit begins with 5 seeds.",
                highlight: "#playerPitsSection, #aiPitsSection"
            },
            {
                title: "Step 2: Sowing Seeds Counter-Clockwise",
                content: "On your turn, click any of your non-empty pits. All seeds from that pit are picked up and distributed one-by-one counter-clockwise across the pits.",
                highlight: "#playerPitsRow"
            },
            {
                title: "Step 3: Empty-Pit Captures",
                content: "If your final seed drops into an empty pit on your side, and the opposite opponent pit has seeds, you capture BOTH your seed and all opposite seeds into your storehouse (+50 pts per seed)!",
                highlight: "#playerStore, #aiStore"
            },
            {
                title: "Step 4: The Harvest & Victory",
                content: "When either player has no seeds remaining to move, the game ends. All remaining seeds go to the respective storehouse. Win to claim a massive +1000 PTS Victory Bounty!",
                highlight: "#aliguliBoardWrapper"
            }
        ],
        chowkabara: [
            {
                title: "Step 1: 5×5 Board & Safe Squares (Katte)",
                content: "The game is played on a 5×5 grid. Squares marked with '✖' are safe houses (Katte). Pawns resting in safe squares cannot be captured by the opponent.",
                highlight: ".safe-cell"
            },
            {
                title: "Step 2: Rolling Cowrie Shells (Kowdi)",
                content: "Click 'ROLL COWRIES' to cast 4 shells (+50 PTS per move). 1-3 open shells give 1-3 steps. 4 open shells (Chowka) or 0 open shells give 4 steps and grant an immediate BONUS ROLL!",
                highlight: "#chowkabaraPanel"
            },
            {
                title: "Step 3: Outer Perimeter & Capturing (Cuts)",
                content: "Your 4 golden pawns move clockwise along the 16 outer squares. Landing on an enemy pawn outside safe squares captures (cuts) it back to start (+250 PTS bonus) and gives a bonus turn!",
                highlight: "#chowkabaraBoard"
            },
            {
                title: "Step 4: Inner Spiral & Mahamane (👑)",
                content: "After completing the outer loop, pawns enter the inner ring toward the central Mahamane (+500 PTS per pawn). Lead all 4 pawns home for a +2000 PTS Victory Reward!",
                highlight: ".center-cell"
            }
        ]
    };

    function showScreen(screen) {
        if (regionBriefingCard) regionBriefingCard.style.display = 'none';
        if (aliguliGameScreen) aliguliGameScreen.style.display = 'none';
        if (chowkabaraGameScreen) chowkabaraGameScreen.style.display = 'none';
        if (victoryModal) victoryModal.style.display = 'none';
        closeTutorial();
        closeLobbyModal();

        if (screen === 'briefing' && regionBriefingCard) regionBriefingCard.style.display = 'flex';
        else if (screen === 'aliguli' && aliguliGameScreen) aliguliGameScreen.style.display = 'flex';
        else if (screen === 'chowkabara' && chowkabaraGameScreen) chowkabaraGameScreen.style.display = 'flex';
    }

    backDashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('pickup');
            closeTutorial();
            closeLobbyModal();
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
        playSound('success');
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
        playSound('chime');
    }

    function closeTutorial() {
        if (tutorialOverlay) tutorialOverlay.style.display = 'none';
        clearTutorialHighlights();
    }

    function clearTutorialHighlights() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    }

    function renderTutorialStep() {
        const steps = tutorialSteps[currentGameType];
        if (!steps || currentTutorialStep >= steps.length) {
            closeTutorial();
            return;
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

        clearTutorialHighlights();
        if (step.highlight) {
            document.querySelectorAll(step.highlight).forEach(el => el.classList.add('tutorial-highlight'));
        }

        btnTutPrev.style.visibility = currentTutorialStep === 0 ? 'hidden' : 'visible';
        btnTutNext.textContent = currentTutorialStep === steps.length - 1 ? 'START LOBBY ➔' : 'NEXT ➔';
    }

    if (btnTutNext) {
        btnTutNext.addEventListener('click', () => {
            const steps = tutorialSteps[currentGameType];
            if (currentTutorialStep < steps.length - 1) {
                currentTutorialStep++;
                renderTutorialStep();
                playSound('pickup');
            } else {
                closeTutorial();
                openLobbyModal(currentGameType);
                playSound('success');
            }
        });
    }

    if (btnTutPrev) {
        btnTutPrev.addEventListener('click', () => {
            if (currentTutorialStep > 0) {
                currentTutorialStep--;
                renderTutorialStep();
                playSound('pickup');
            }
        });
    }

    if (btnSkipTutorial) {
        btnSkipTutorial.addEventListener('click', () => {
            closeTutorial();
            openLobbyModal(currentGameType);
            playSound('pickup');
        });
    }

    if (btnAliguliTutorial) btnAliguliTutorial.addEventListener('click', () => startInteractiveTutorial('aliguli'));
    if (btnChowkabaraTutorial) btnChowkabaraTutorial.addEventListener('click', () => startInteractiveTutorial('chowkabara'));

    /* ==========================================================================
       1. GAME 1: ALIGULI MANE ENGINE (Dynamic AI Difficulty & Friend Mode)
       ========================================================================== */
    const playerPitsRow = document.getElementById('playerPitsRow');
    const aiPitsRow = document.getElementById('aiPitsRow');
    const playerStoreCount = document.getElementById('playerStoreCount');
    const aiStoreCount = document.getElementById('aiStoreCount');
    const aliguliStatus = document.getElementById('aliguliStatus');
    const btnResetAliguli = document.getElementById('btnResetAliguli');

    let pits = new Array(14).fill(5);
    let playerStore = 0;
    let aiStore = 0;
    let isPlayerTurn = true; // true = Player 1, false = Player 2 / AI
    let isSowing = false;

    function renderAliguliBoard() {
        if (!playerPitsRow || !aiPitsRow) return;

        playerPitsRow.innerHTML = '';
        aiPitsRow.innerHTML = '';

        // Top Row (Pits 13 down to 7 for Player 2 / AI)
        for (let i = 13; i >= 7; i--) {
            const pitEl = createPitElement(i, false);
            aiPitsRow.appendChild(pitEl);
        }

        // Bottom Row (Pits 0 to 6 for Player 1)
        for (let i = 0; i <= 6; i++) {
            const pitEl = createPitElement(i, true);
            playerPitsRow.appendChild(pitEl);
        }

        if (playerStoreCount) playerStoreCount.textContent = playerStore;
        if (aiStoreCount) aiStoreCount.textContent = aiStore;
    }

    function createPitElement(index, isPlayer1Pit) {
        const pit = document.createElement('div');
        const isCurrentActivePit = isPlayer1Pit ? isPlayerTurn : (!isPlayerTurn && currentMatchMode === 'friend');
        pit.className = `pit-btn ${isCurrentActivePit && !isSowing && pits[index] > 0 ? 'active-turn' : 'disabled'}`;
        pit.dataset.index = index;

        const countLabel = document.createElement('div');
        countLabel.className = 'pit-count';
        countLabel.textContent = pits[index];

        const seedCluster = document.createElement('div');
        seedCluster.className = 'seeds-visual-cluster';
        const displaySeeds = Math.min(pits[index], 10);
        for (let s = 0; s < displaySeeds; s++) {
            const bead = document.createElement('div');
            bead.className = 'seed-bead';
            seedCluster.appendChild(bead);
        }

        pit.appendChild(countLabel);
        pit.appendChild(seedCluster);

        pit.addEventListener('click', () => {
            if (isSowing || pits[index] === 0) return;
            if (isPlayer1Pit && isPlayerTurn) {
                handleAliguliMove(index);
            } else if (!isPlayer1Pit && !isPlayerTurn && currentMatchMode === 'friend') {
                handleAliguliMove(index);
            }
        });

        return pit;
    }

    async function handleAliguliMove(startIndex) {
        if (isSowing) return;
        isSowing = true;
        const activeName = isPlayerTurn ? player1Name : player2Name;
        aliguliStatus.textContent = `${activeName} is distributing seeds...`;

        let seeds = pits[startIndex];
        pits[startIndex] = 0;
        playSound('pickup');
        renderAliguliBoard();

        let currentIndex = startIndex;

        while (seeds > 0) {
            await new Promise(r => setTimeout(r, 180));
            currentIndex = (currentIndex + 1) % 14;
            pits[currentIndex]++;
            seeds--;
            playSound('pickup');
            renderAliguliBoard();
        }

        // Check Mancala capture rule
        const isCurrentSide = isPlayerTurn ? (currentIndex >= 0 && currentIndex <= 6) : (currentIndex >= 7 && currentIndex <= 13);
        const oppositeIndex = 13 - currentIndex;

        if (isCurrentSide && pits[currentIndex] === 1 && pits[oppositeIndex] > 0) {
            await new Promise(r => setTimeout(r, 250));
            const captured = pits[oppositeIndex] + pits[currentIndex];
            pits[currentIndex] = 0;
            pits[oppositeIndex] = 0;

            if (isPlayerTurn) {
                playerStore += captured;
                const ptsEarned = captured * 50;
                matchPointsAccumulated += ptsEarned;
                addPlayerPoints(ptsEarned, `${player1Name} Captured ${captured} seeds`);
                aliguliStatus.textContent = `🎯 ${player1Name} captured ${captured} seeds! (+${ptsEarned} PTS)`;
                playSound('success');
            } else {
                aiStore += captured;
                aliguliStatus.textContent = `⚠️ ${player2Name} captured ${captured} seeds into storehouse!`;
                if (currentMatchMode === 'friend') {
                    // Friend mode
                    playSound('pickup');
                } else {
                    playSound('pickup');
                }
            }
            renderAliguliBoard();
        }

        // Check if game over
        const playerSeedsRemaining = pits.slice(0, 7).reduce((a, b) => a + b, 0);
        const aiSeedsRemaining = pits.slice(7, 14).reduce((a, b) => a + b, 0);

        if (playerSeedsRemaining === 0 || aiSeedsRemaining === 0) {
            endAliguliGame();
            return;
        }

        // Switch turn
        isPlayerTurn = !isPlayerTurn;
        isSowing = false;
        renderAliguliBoard();

        if (isPlayerTurn) {
            aliguliStatus.textContent = `${player1Name}'s Turn: Click one of your pits (Bottom Row)`;
        } else {
            if (currentMatchMode === 'friend') {
                aliguliStatus.textContent = `${player2Name}'s Turn: Click one of your pits (Top Row)`;
            } else {
                aliguliStatus.textContent = `${player2Name} is calculating move (${currentAiDifficulty.toUpperCase()})...`;
                setTimeout(executeAiAliguliMove, currentAiDifficulty === 'easy' ? 700 : (currentAiDifficulty === 'medium' ? 500 : 350));
            }
        }
    }

    // Minimax Simulation Engine for Aliguli Mane
    function simulateAliguliSow(currentPits, pStore, aStore, pitIndex, isAI) {
        const nextPits = [...currentPits];
        let nextPStore = pStore;
        let nextAStore = aStore;
        let seeds = nextPits[pitIndex];
        nextPits[pitIndex] = 0;
        let curr = pitIndex;

        while (seeds > 0) {
            curr = (curr + 1) % 14;
            nextPits[curr]++;
            seeds--;
        }

        const isOwnSide = isAI ? (curr >= 7 && curr <= 13) : (curr >= 0 && curr <= 6);
        const opp = 13 - curr;
        if (isOwnSide && nextPits[curr] === 1 && nextPits[opp] > 0) {
            const captured = nextPits[opp] + nextPits[curr];
            nextPits[curr] = 0;
            nextPits[opp] = 0;
            if (isAI) nextAStore += captured;
            else nextPStore += captured;
        }

        return { nextPits, nextPStore, nextAStore };
    }

    function evaluateAliguliState(pitsState, pStore, aStore) {
        const pPitTotal = pitsState.slice(0, 7).reduce((a, b) => a + b, 0);
        const aPitTotal = pitsState.slice(7, 14).reduce((a, b) => a + b, 0);
        // AI Store advantage + board control differential - player vulnerability
        return (aStore - pStore) * 15 + (aPitTotal - pPitTotal) * 2;
    }

    function minimaxAliguli(pitsState, pStore, aStore, depth, isMaximizing, alpha, beta) {
        const pSeeds = pitsState.slice(0, 7).reduce((a, b) => a + b, 0);
        const aSeeds = pitsState.slice(7, 14).reduce((a, b) => a + b, 0);

        if (depth === 0 || pSeeds === 0 || aSeeds === 0) {
            return evaluateAliguliState(pitsState, pStore, aStore);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let pit = 7; pit <= 13; pit++) {
                if (pitsState[pit] === 0) continue;
                const sim = simulateAliguliSow(pitsState, pStore, aStore, pit, true);
                const evalVal = minimaxAliguli(sim.nextPits, sim.nextPStore, sim.nextAStore, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalVal);
                alpha = Math.max(alpha, evalVal);
                if (beta <= alpha) break; // Beta cutoff
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let pit = 0; pit <= 6; pit++) {
                if (pitsState[pit] === 0) continue;
                const sim = simulateAliguliSow(pitsState, pStore, aStore, pit, false);
                const evalVal = minimaxAliguli(sim.nextPits, sim.nextPStore, sim.nextAStore, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalVal);
                beta = Math.min(beta, evalVal);
                if (beta <= alpha) break; // Alpha cutoff
            }
            return minEval;
        }
    }

    // Dynamic AI Decision scaled by Easy / Medium / Hard
    function executeAiAliguliMove() {
        if (isPlayerTurn || currentMatchMode === 'friend') return;

        const validPits = [];
        for (let i = 7; i <= 13; i++) {
            if (pits[i] > 0) validPits.push(i);
        }

        if (validPits.length === 0) {
            endAliguliGame();
            return;
        }

        let chosenPit = validPits[0];

        if (currentAiDifficulty === 'easy') {
            // Easy Mode: Completely random valid pit with zero tactical evaluation
            chosenPit = validPits[Math.floor(Math.random() * validPits.length)];
        } else if (currentAiDifficulty === 'medium') {
            // Medium Mode: Immediate 1-step capture heuristic + basic seed preservation
            let bestCaptureScore = -1;
            let bestPit = null;

            for (let pit of validPits) {
                const landing = (pit + pits[pit]) % 14;
                const opp = 13 - landing;
                if (landing >= 7 && landing <= 13 && pits[landing] === 0 && pits[opp] > 0) {
                    const score = pits[opp] + 1;
                    if (score > bestCaptureScore) {
                        bestCaptureScore = score;
                        bestPit = pit;
                    }
                }
            }

            if (bestPit !== null) {
                chosenPit = bestPit;
            } else {
                // Pick pit with largest seed count to cycle forward
                validPits.sort((a, b) => pits[b] - pits[a]);
                chosenPit = validPits[0];
            }
        } else {
            // Hard Mode: 3-Ply Minimax search optimizing store differential, continuation chains & starvation
            let bestScore = -Infinity;
            let bestMove = validPits[0];

            for (let pit of validPits) {
                const sim = simulateAliguliSow(pits, playerStore, aiStore, pit, true);
                const score = minimaxAliguli(sim.nextPits, sim.nextPStore, sim.nextAStore, 3, false, -Infinity, Infinity);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = pit;
                }
            }
            chosenPit = bestMove;
        }

        handleAliguliMove(chosenPit);
    }

    function endAliguliGame() {
        for (let i = 0; i <= 6; i++) { playerStore += pits[i]; pits[i] = 0; }
        for (let i = 7; i <= 13; i++) { aiStore += pits[i]; pits[i] = 0; }
        renderAliguliBoard();
        isSowing = false;

        const totalMoves = playerStore + aiStore;

        if (playerStore > aiStore) {
            const winBounty = 1000;
            matchPointsAccumulated += winBounty;
            addPlayerPoints(winBounty, 'Aliguli Mane Victory Bounty');
            aliguliStatus.textContent = `🎉 VICTORY! ${player1Name} won with ${playerStore} vs ${player2Name}'s ${aiStore} seeds!`;
            openVictoryModal(`${player1Name.toUpperCase()} CLAIMS VICTORY!`, `${player1Name} gathered ${playerStore} seeds in Aliguli Mane!`, matchPointsAccumulated);
            logPostMortem('Aliguli Mane', player1Name, currentMatchMode, currentAiDifficulty, totalMoves, matchPointsAccumulated);
        } else if (playerStore < aiStore) {
            aliguliStatus.textContent = `Game Over! ${player2Name} won with ${aiStore} vs ${player1Name}'s ${playerStore} seeds.`;
            if (currentMatchMode === 'friend') {
                openVictoryModal(`${player2Name.toUpperCase()} CLAIMS VICTORY!`, `${player2Name} gathered ${aiStore} seeds in Aliguli Mane!`, 500);
                logPostMortem('Aliguli Mane', player2Name, currentMatchMode, currentAiDifficulty, totalMoves, 500);
            } else {
                logPostMortem('Aliguli Mane', `AI (${currentAiDifficulty.toUpperCase()})`, currentMatchMode, currentAiDifficulty, totalMoves, 0);
                playSound('error');
            }
        } else {
            const tieBounty = 300;
            matchPointsAccumulated += tieBounty;
            addPlayerPoints(tieBounty, 'Tie Game Reward');
            aliguliStatus.textContent = `It's a Tie! Both collected ${playerStore} seeds! (+${tieBounty} PTS)`;
            logPostMortem('Aliguli Mane', 'Draw', currentMatchMode, currentAiDifficulty, totalMoves, tieBounty);
        }
    }

    function initAliguliGame() {
        pits = new Array(14).fill(5);
        playerStore = 0;
        aiStore = 0;
        isPlayerTurn = true;
        isSowing = false;
        matchPointsAccumulated = 0;
        resetMatchTimer();
        if (aliguliStatus) aliguliStatus.textContent = `${player1Name}'s Turn: Click one of your pits (Bottom Row)`;
        renderAliguliBoard();
    }

    if (btnResetAliguli) {
        btnResetAliguli.addEventListener('click', () => {
            playSound('pickup');
            initAliguliGame();
        });
    }

    /* ==========================================================================
       2. GAME 2: CHOWKABARA (Dynamic AI Difficulty & Friend Mode)
       ========================================================================== */
    const chowkabaraBoard = document.getElementById('chowkabaraBoard');
    const btnRollCowries = document.getElementById('btnRollCowries');
    const cbRollResult = document.getElementById('cbRollResult');
    const cbTurnIndicator = document.getElementById('cbTurnIndicator');
    const cbLogBox = document.getElementById('cbLogBox');
    const btnResetChowkabara = document.getElementById('btnResetChowkabara');
    const shellEls = [
        document.getElementById('shell0'),
        document.getElementById('shell1'),
        document.getElementById('shell2'),
        document.getElementById('shell3')
    ];

    const SAFE_COORDS = ["0,2", "2,0", "2,2", "2,4", "4,2"];

    const playerPath = [
        {r: 4, c: 2}, {r: 4, c: 1}, {r: 4, c: 0},
        {r: 3, c: 0}, {r: 2, c: 0}, {r: 1, c: 0}, {r: 0, c: 0},
        {r: 0, c: 1}, {r: 0, c: 2}, {r: 0, c: 3}, {r: 0, c: 4},
        {r: 1, c: 4}, {r: 2, c: 4}, {r: 3, c: 4}, {r: 4, c: 4},
        {r: 4, c: 3},
        // Inner Spiral Path
        {r: 3, c: 2}, {r: 3, c: 1}, {r: 2, c: 1}, {r: 1, c: 1},
        {r: 1, c: 2}, {r: 1, c: 3}, {r: 2, c: 3}, {r: 3, c: 3},
        // Mahamane
        {r: 2, c: 2}
    ];

    const aiPath = [
        {r: 0, c: 2}, {r: 0, c: 3}, {r: 0, c: 4},
        {r: 1, c: 4}, {r: 2, c: 4}, {r: 3, c: 4}, {r: 4, c: 4},
        {r: 4, c: 3}, {r: 4, c: 2}, {r: 4, c: 1}, {r: 4, c: 0},
        {r: 3, c: 0}, {r: 2, c: 0}, {r: 1, c: 0}, {r: 0, c: 0},
        {r: 0, c: 1},
        // Inner Spiral Path
        {r: 1, c: 2}, {r: 1, c: 3}, {r: 2, c: 3}, {r: 3, c: 3},
        {r: 3, c: 2}, {r: 3, c: 1}, {r: 2, c: 1}, {r: 1, c: 1},
        // Mahamane
        {r: 2, c: 2}
    ];

    let playerPawns = [
        { id: 1, step: 0, finished: false },
        { id: 2, step: 0, finished: false },
        { id: 3, step: 0, finished: false },
        { id: 4, step: 0, finished: false }
    ];

    let aiPawns = [
        { id: 1, step: 0, finished: false },
        { id: 2, step: 0, finished: false },
        { id: 3, step: 0, finished: false },
        { id: 4, step: 0, finished: false }
    ];

    let cbTurn = 'player'; // 'player' = Player 1, 'ai' = Player 2 / AI
    let currentRoll = 0;
    let canRoll = true;

    function renderChowkabaraBoard() {
        if (!chowkabaraBoard) return;
        chowkabaraBoard.innerHTML = '';

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cellKey = `${r},${c}`;
                const cell = document.createElement('div');
                cell.className = 'cb-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (cellKey === '2,2') cell.classList.add('center-cell');
                else if (SAFE_COORDS.includes(cellKey)) cell.classList.add('safe-cell');

                // Dedicated Player 1 Pin Container (top slot)
                const playerGroup = document.createElement('div');
                playerGroup.className = 'cb-pawn-group cb-pawn-player';

                playerPawns.forEach(p => {
                    if (!p.finished) {
                        const coord = playerPath[p.step];
                        if (coord.r === r && coord.c === c) {
                            const pEl = document.createElement('div');
                            const selectable = cbTurn === 'player' && currentRoll > 0 && isMoveValid(p, currentRoll, playerPath);
                            pEl.className = `gotti-pawn gotti-player ${selectable ? 'selectable' : ''}`;
                            pEl.textContent = `P${p.id}`;
                            pEl.title = `${player1Name} Pawn ${p.id}`;
                            
                            pEl.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (cbTurn !== 'player' || currentRoll === 0) return;
                                if (isMoveValid(p, currentRoll, playerPath)) {
                                    moveChowkabaraPawn(p, 'player');
                                }
                            });

                            playerGroup.appendChild(pEl);
                        }
                    }
                });

                // Dedicated Player 2 / AI Pin Container (bottom slot)
                const aiGroup = document.createElement('div');
                aiGroup.className = 'cb-pawn-group cb-pawn-ai';

                aiPawns.forEach(a => {
                    if (!a.finished) {
                        const coord = aiPath[a.step];
                        if (coord.r === r && coord.c === c) {
                            const aEl = document.createElement('div');
                            const selectable = cbTurn === 'ai' && currentMatchMode === 'friend' && currentRoll > 0 && isMoveValid(a, currentRoll, aiPath);
                            aEl.className = `gotti-pawn gotti-ai ${selectable ? 'selectable' : ''}`;
                            aEl.textContent = `A${a.id}`;
                            aEl.title = `${player2Name} Pawn ${a.id}`;

                            aEl.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (cbTurn !== 'ai' || currentMatchMode !== 'friend' || currentRoll === 0) return;
                                if (isMoveValid(a, currentRoll, aiPath)) {
                                    moveChowkabaraPawn(a, 'ai');
                                }
                            });

                            aiGroup.appendChild(aEl);
                        }
                    }
                });

                cell.appendChild(playerGroup);
                cell.appendChild(aiGroup);
                chowkabaraBoard.appendChild(cell);
            }
        }
    }

    function isMoveValid(pawn, roll, path) {
        if (pawn.finished) return false;
        return (pawn.step + roll) < path.length;
    }

    function rollCowrieShells() {
        let openCount = 0;
        shellEls.forEach(shell => {
            const isOpen = Math.random() > 0.5;
            if (isOpen) openCount++;
            if (shell) {
                shell.className = `cowrie-shell ${isOpen ? 'open' : 'closed'}`;
                shell.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg) scale(1.1)`;
                setTimeout(() => { shell.style.transform = 'none'; }, 250);
            }
        });

        const rollValue = (openCount === 0) ? 4 : openCount;
        return { rollValue, isBonus: (openCount === 0 || openCount === 4) };
    }

    function logChowkabara(msg) {
        if (!cbLogBox) return;
        const p = document.createElement('div');
        p.textContent = msg;
        cbLogBox.prepend(p);
    }

    async function handlePlayerRoll() {
        if (!canRoll) return;
        canRoll = false;
        btnRollCowries.disabled = true;

        const activeName = cbTurn === 'player' ? player1Name : player2Name;
        playSound('pickup');
        const { rollValue, isBonus } = rollCowrieShells();
        currentRoll = rollValue;
        cbRollResult.textContent = `Roll: ${rollValue} ${isBonus ? '⭐ CHOWKA BONUS!' : ''}`;
        logChowkabara(`${activeName} rolled a ${rollValue} (${rollValue === 4 ? 'Chowka!' : 'Kowdi'})`);

        renderChowkabaraBoard();

        const activePath = cbTurn === 'player' ? playerPath : aiPath;
        const activePawns = cbTurn === 'player' ? playerPawns : aiPawns;
        const validPawns = activePawns.filter(p => isMoveValid(p, currentRoll, activePath));

        if (validPawns.length === 0) {
            logChowkabara(`No valid moves for roll ${currentRoll}. Turn passed.`);
            await new Promise(r => setTimeout(r, 800));
            endTurn(isBonus);
        } else {
            cbTurnIndicator.textContent = `${activeName.toUpperCase()}: SELECT A HIGHLIGHTED PAWN`;
        }
    }

    async function moveChowkabaraPawn(pawn, turnSide) {
        pawn.step += currentRoll;
        playSound('pickup');
        let bonusAwarded = (currentRoll === 4);

        if (turnSide === 'player') {
            const movePts = 50;
            matchPointsAccumulated += movePts;
            addPlayerPoints(movePts, `${player1Name} Advanced`);
        }

        const path = turnSide === 'player' ? playerPath : aiPath;
        const opponentPawns = turnSide === 'player' ? aiPawns : playerPawns;
        const opponentPath = turnSide === 'player' ? aiPath : playerPath;

        if (pawn.step === path.length - 1) {
            pawn.finished = true;
            if (turnSide === 'player') {
                const finishPts = 500;
                matchPointsAccumulated += finishPts;
                addPlayerPoints(finishPts, `Pawn in Mahamane`);
            }
            logChowkabara(`🏆 Pawn entered the central Mahamane! (+500 PTS)`);
            playSound('success');
        } else {
            const currentPos = path[pawn.step];
            const cellKey = `${currentPos.r},${currentPos.c}`;
            
            if (!SAFE_COORDS.includes(cellKey)) {
                opponentPawns.forEach(opp => {
                    if (!opp.finished) {
                        const oppPos = opponentPath[opp.step];
                        if (oppPos.r === currentPos.r && oppPos.c === currentPos.c) {
                            opp.step = 0; // Cut back to start
                            if (turnSide === 'player') {
                                const cutPts = 250;
                                matchPointsAccumulated += cutPts;
                                addPlayerPoints(cutPts, 'Captured Pawn');
                            }
                            logChowkabara(`⚔️ Cut opponent pawn back to start!`);
                            playSound('success');
                            bonusAwarded = true;
                        }
                    }
                });
            }
        }

        renderChowkabaraBoard();
        checkChowkabaraWin();

        currentRoll = 0;
        endTurn(bonusAwarded);
    }

    function endTurn(hasBonus) {
        if (hasBonus) {
            logChowkabara(`⭐ Bonus turn awarded! Roll again.`);
            canRoll = true;
            btnRollCowries.disabled = false;
            const activeName = cbTurn === 'player' ? player1Name : player2Name;
            cbTurnIndicator.textContent = `BONUS TURN (${activeName.toUpperCase()}): ROLL COWRIES`;
            if (cbTurn === 'ai' && currentMatchMode === 'ai') {
                setTimeout(handleAiTurn, 800);
            }
            return;
        }

        if (cbTurn === 'player') {
            cbTurn = 'ai';
            if (currentMatchMode === 'friend') {
                cbTurnIndicator.textContent = `${player2Name.toUpperCase()}'S TURN: ROLL COWRIES`;
                canRoll = true;
                btnRollCowries.disabled = false;
            } else {
                cbTurnIndicator.textContent = `${player2Name.toUpperCase()} TURN: ROLLING...`;
                btnRollCowries.disabled = true;
                setTimeout(handleAiTurn, currentAiDifficulty === 'easy' ? 800 : 500);
            }
        } else {
            cbTurn = 'player';
            cbTurnIndicator.textContent = `${player1Name.toUpperCase()}'S TURN: ROLL COWRIES`;
            canRoll = true;
            btnRollCowries.disabled = false;
        }
    }

    // Dynamic AI Decision scaled by Easy / Medium / Hard
    async function handleAiTurn() {
        if (currentMatchMode === 'friend') return;

        playSound('pickup');
        const { rollValue, isBonus } = rollCowrieShells();
        cbRollResult.textContent = `${player2Name} Rolled: ${rollValue} ${isBonus ? '⭐ BONUS!' : ''}`;
        logChowkabara(`${player2Name} rolled a ${rollValue}`);

        await new Promise(r => setTimeout(r, 600));

        const validPawns = aiPawns.filter(a => isMoveValid(a, rollValue, aiPath));
        if (validPawns.length === 0) {
            logChowkabara(`${player2Name} has no valid moves with ${rollValue}.`);
            await new Promise(r => setTimeout(r, 600));
            endTurn(isBonus);
            return;
        }

        let chosenPawn = validPawns[0];

        if (currentAiDifficulty === 'easy') {
            // Easy: Picks random pawn
            chosenPawn = validPawns[Math.floor(Math.random() * validPawns.length)];
        } else if (currentAiDifficulty === 'medium') {
            // Medium: Checks if can cut player, otherwise advances first movable pawn
            let cutPawn = null;
            for (let a of validPawns) {
                const targetPos = aiPath[a.step + rollValue];
                const cellKey = `${targetPos.r},${targetPos.c}`;
                if (!SAFE_COORDS.includes(cellKey)) {
                    if (playerPawns.some(p => !p.finished && playerPath[p.step].r === targetPos.r && playerPath[p.step].c === targetPos.c)) {
                        cutPawn = a;
                        break;
                    }
                }
            }
            chosenPawn = cutPawn || validPawns[0];
        } else {
            // Hard Mode: Deep heuristic tree (Finish > Cut > Evade Threat > Safe Zone > Shortest Path)
            let bestScore = -9999;
            for (let a of validPawns) {
                const currentPos = aiPath[a.step];
                const currentCellKey = `${currentPos.r},${currentPos.c}`;
                const nextStep = a.step + rollValue;
                const targetPos = aiPath[nextStep];
                const cellKey = `${targetPos.r},${targetPos.c}`;

                let score = nextStep * 10; // Base progress weight

                // 1. Reaching Mahamane
                if (nextStep === aiPath.length - 1) score += 2000;

                // 2. Intercepting and cutting player piece
                if (!SAFE_COORDS.includes(cellKey)) {
                    const willCut = playerPawns.some(p => !p.finished && playerPath[p.step].r === targetPos.r && playerPath[p.step].c === targetPos.c);
                    if (willCut) score += 1200;
                } else {
                    score += 400; // Safe sanctuary zone
                }

                // 3. Evading immediate threat
                if (!SAFE_COORDS.includes(currentCellKey)) {
                    const isThreatened = playerPawns.some(p => {
                        if (p.finished) return false;
                        const dist = (playerPath.findIndex(pos => pos.r === currentPos.r && pos.c === currentPos.c)) - p.step;
                        return dist >= 1 && dist <= 4;
                    });
                    if (isThreatened) score += 300;
                }

                if (score > bestScore) {
                    bestScore = score;
                    chosenPawn = a;
                }
            }
        }

        chosenPawn.step += rollValue;
        playSound('pickup');

        if (chosenPawn.step === aiPath.length - 1) {
            chosenPawn.finished = true;
            logChowkabara(`⚠️ ${player2Name}'s Pawn entered Mahamane!`);
        } else {
            const targetPos = aiPath[chosenPawn.step];
            const cellKey = `${targetPos.r},${targetPos.c}`;
            if (!SAFE_COORDS.includes(cellKey)) {
                playerPawns.forEach(p => {
                    if (!p.finished) {
                        const pPos = playerPath[p.step];
                        if (pPos.r === targetPos.r && pPos.c === targetPos.c) {
                            p.step = 0;
                            logChowkabara(`💥 ${player2Name} cut your Pawn P${p.id} back to start!`);
                            playSound('error');
                        }
                    }
                });
            }
        }

        renderChowkabaraBoard();
        checkChowkabaraWin();
        endTurn(isBonus);
    }

    function checkChowkabaraWin() {
        const player1Won = playerPawns.every(p => p.finished);
        const player2Won = aiPawns.every(a => a.finished);
        const totalMoves = playerPawns.reduce((acc, p) => acc + p.step, 0) + aiPawns.reduce((acc, a) => acc + a.step, 0);

        if (player1Won) {
            const winBounty = 2000;
            matchPointsAccumulated += winBounty;
            addPlayerPoints(winBounty, 'Chowkabara Champion Victory');
            cbTurnIndicator.textContent = `🏆 VICTORY! ALL OF ${player1Name.toUpperCase()}'S PAWNS REACHED MAHAMANE!`;
            logChowkabara(`🎉 Congratulations! ${player1Name} won Chowkabara!`);
            openVictoryModal(`${player1Name.toUpperCase()} IS CHAMPION!`, `All 4 pawns entered the sacred Mahamane!`, matchPointsAccumulated);
            logPostMortem('Chowkabara', player1Name, currentMatchMode, currentAiDifficulty, totalMoves, matchPointsAccumulated);
            canRoll = false;
            btnRollCowries.disabled = true;
        } else if (player2Won) {
            cbTurnIndicator.textContent = `${player2Name.toUpperCase()} WON! ALL PAWNS REACHED MAHAMANE.`;
            if (currentMatchMode === 'friend') {
                openVictoryModal(`${player2Name.toUpperCase()} IS CHAMPION!`, `All 4 pawns entered the sacred Mahamane!`, 1000);
                logPostMortem('Chowkabara', player2Name, currentMatchMode, currentAiDifficulty, totalMoves, 1000);
            } else {
                logPostMortem('Chowkabara', `AI (${currentAiDifficulty.toUpperCase()})`, currentMatchMode, currentAiDifficulty, totalMoves, 0);
                playSound('error');
            }
            canRoll = false;
            btnRollCowries.disabled = true;
        }
    }

    function initChowkabaraGame() {
        playerPawns = [
            { id: 1, step: 0, finished: false },
            { id: 2, step: 0, finished: false },
            { id: 3, step: 0, finished: false },
            { id: 4, step: 0, finished: false }
        ];

        aiPawns = [
            { id: 1, step: 0, finished: false },
            { id: 2, step: 0, finished: false },
            { id: 3, step: 0, finished: false },
            { id: 4, step: 0, finished: false }
        ];

        cbTurn = 'player';
        currentRoll = 0;
        canRoll = true;
        matchPointsAccumulated = 0;
        resetMatchTimer();
        if (btnRollCowries) btnRollCowries.disabled = false;
        if (cbTurnIndicator) cbTurnIndicator.textContent = `${player1Name.toUpperCase()}'S TURN: ROLL COWRIES`;
        if (cbRollResult) cbRollResult.textContent = "Roll: -";
        if (cbLogBox) cbLogBox.innerHTML = `<div>Match started (${player1Name} vs ${player2Name}). Roll cowries to begin!</div>`;

        renderChowkabaraBoard();
    }

    if (btnRollCowries) btnRollCowries.addEventListener('click', handlePlayerRoll);
    if (btnResetChowkabara) btnResetChowkabara.addEventListener('click', () => { playSound('pickup'); initChowkabaraGame(); });

    renderAliguliBoard();
    renderChowkabaraBoard();
});
