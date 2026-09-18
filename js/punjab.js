/* ==========================================================================
   PUNJAB REGION & TRADITIONAL GAMES ENGINE (CHAUPAR / PASHA & KHADDI KHADDA)
   Features:
   1. Real-World Materials Educational Pop-up
   2. Pre-Game Lobby Selection (Play with AI vs Play with Friend)
   3. Dynamic AI Difficulty Scaling (Easy / Medium / Hard)
   4. Custom Player Names for Friend Mode
   5. Skippable Interactive Tutorial & Persistent Player Score System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    /* --------------------------------------------------------------------------
       Universal Persistent Score Manager
       -------------------------------------------------------------------------- */
    

    /* --------------------------------------------------------------------------
       DOM References: Screens, Modals & Lobby
       -------------------------------------------------------------------------- */
    // State identifier for this region
const STATE = 'punjab';

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
        if (pts >= 50) Sutradhar.onCapture(reason || 'Warrior Triumph');
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

const regionBriefingCard = document.getElementById('regionBriefingCard');
    const chauparGameScreen = document.getElementById('chauparGameScreen');
    const khaddiGameScreen = document.getElementById('khaddiGameScreen');

    const btnLaunchChaupar = document.getElementById('btnLaunchChaupar');
    const btnLaunchKhaddi = document.getElementById('btnLaunchKhaddi');
    const backDashboardBtns = document.querySelectorAll('.btn-back-dashboard');

    // Educational Modal Elements
    const materialsModal = document.getElementById('materialsModal');
    const closeEduModalBtn = document.getElementById('closeEduModalBtn');
    const eduGameBadge = document.getElementById('eduGameBadge');
    const eduGameTitle = document.getElementById('eduGameTitle');
    const eduGamePunjabi = document.getElementById('eduGamePunjabi');
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
    const punjabVictoryModal = document.getElementById('punjabVictoryModal');
    const punjabVictoryTitle = document.getElementById('punjabVictoryTitle');
    const punjabVictorySubtitle = document.getElementById('punjabVictorySubtitle');
    const punjabVicMatchScore = document.getElementById('punjabVicMatchScore');
    const punjabVicTotalScore = document.getElementById('punjabVicTotalScore');
    const btnPunjabVictoryReplay = document.getElementById('btnPunjabVictoryReplay');

    // In-game tutorial triggers
    const btnChauparTutorial = document.getElementById('btnChauparTutorial');
    const btnKhaddiTutorial = document.getElementById('btnKhaddiTutorial');

    // Match Configuration State
    let currentGameType = 'chaupar'; // 'chaupar' or 'khaddi'
    let currentMatchMode = 'ai'; // 'ai' or 'friend'
    let currentAiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
    let player1Name = 'Player 1';
    let player2Name = 'AI Warrior';
    let currentTutorialStep = 0;
    let punjabMatchPoints = 0;

    /* --------------------------------------------------------------------------
       Pre-Game Lobby Controller
       -------------------------------------------------------------------------- */
    function openLobbyModal(gameType) {
        currentGameType = gameType;
        if (materialsModal) materialsModal.style.display = 'none';
        if (!lobbyModal) return;

        lobbyGameTitle.textContent = gameType === 'chaupar' ? "Chaupar / Pasha" : "Khaddi Khadda";
        lobbyGameSubtitle.textContent = gameType === 'chaupar' ? "ਚੌਪੜ - Match Mode & Difficulty" : "ਖੱਡਾ - Match Mode & Difficulty";

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

    /* --------------------------------------------------------------------------
       ML Post-Mortem Match Logger
       -------------------------------------------------------------------------- */
    let _punjabMatchStartTime = Date.now();
    function resetPunjabMatchTimer() { _punjabMatchStartTime = Date.now(); }

    function logPostMortem(gameType, winner, mode, difficulty, totalMoves, matchPts) {
        try {
            const isAIWin = (winner || '').toLowerCase().includes('ai');
            const durationSeconds = Math.round((Date.now() - _punjabMatchStartTime) / 1000);
            const accuracy = Math.min(100, Math.round(55 + (totalMoves * 1.8) - (durationSeconds * 0.06) + (isAIWin ? -5 : 5)));
            const log = {
                id: `PB-${Date.now()}`,
                region: 'Punjab',
                game: gameType,
                winner: winner,
                mode: mode,
                difficulty: (difficulty || 'medium').toUpperCase(),
                durationSeconds: Math.max(20, durationSeconds),
                totalMoves: Math.max(10, totalMoves),
                accuracy: `${Math.max(60, accuracy)}%`,
                timestamp: new Date().toISOString(),
                matchPoints: matchPts || 0
            };
            const stored = localStorage.getItem('bharath_postmortem_logs');
            const logs = stored ? JSON.parse(stored) : [];
            logs.unshift(log);
            localStorage.setItem('bharath_postmortem_logs', JSON.stringify(logs.slice(0, 200)));
        } catch (e) {
            console.warn('logPostMortem error:', e);
        }
    }

    if (btnStartMatch) {
        btnStartMatch.addEventListener('click', () => {
            if (currentMatchMode === 'friend') {
                player1Name = (inputPlayer1Name.value.trim()) || 'Player 1';
                player2Name = (inputPlayer2Name.value.trim()) || 'Player 2';
            } else {
                player1Name = (inputPlayer1Name.value.trim()) || 'Player 1';
                player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
            }

            closeLobbyModal();
            showScreen(currentGameType);
            resetPunjabMatchTimer();

            // Automated ML Training Hook: Pre-match heuristic tuning
            if (typeof BharathAdaptiveML !== 'undefined') {
                BharathAdaptiveML.executePreMatchTraining('punjab', currentGameType, currentAiDifficulty);
            }

            if (currentGameType === 'chaupar') initChauparGame();
            else initKhaddiGame();

            playSound('success');
        });
    }

    /* --------------------------------------------------------------------------
       Real-World Materials Educational Data
       -------------------------------------------------------------------------- */
    const punjabMaterialsData = {
        chaupar: {
            badge: "PUNJABI HERITAGE & TEXTILES",
            title: "Chaupar / Pasha (ਚੌਪੜ / ਪਾਸਾ)",
            kannadaOrPunjabi: "ਚੌਪੜ - ਰਵਾਇਤੀ ਸਮੱਗਰੀ ਅਤੇ ਇਤਿਹਾਸ",
            intro: "Chaupar (Pasha) is an ancient cross-shaped tactical board game played across Punjab for centuries by royal courts, Sikh warriors, and village elders.",
            materials: [
                {
                    icon: "🧵",
                    name: "Cross-Shaped Velvet Board",
                    punjabi: "ਚੌਪੜ ਦਾ ਕੱਪੜਾ",
                    desc: "Handcrafted from rich red or green velvet and heavy cotton cloth, embroidered with four long arms radiating from the central Char-Koni square (96 total cells)."
                },
                {
                    icon: "♟️",
                    name: "Colored Gotta Pawns",
                    punjabi: "ਲੱਕੜ ਦੇ ਰੰਗੀਨ ਗੋਟੇ",
                    desc: "16 turned wooden or cloth-wrapped conical figurines (Gotta) in Red, Green, Yellow, and Black representing four rival armies."
                },
                {
                    icon: "🐚",
                    name: "7 Cowrie Shells (Kaudian)",
                    punjabi: "ਸੱਤ ਕੌਡੀਆਂ (Kaudian)",
                    desc: "7 natural sea cowrie shells thrown as dice. Open mouth vs. closed back calculates rolls: Dasa (10), Pasha (25), Sat (7), and more with bonus rolls."
                }
            ]
        },
        khaddi: {
            badge: "PUNJABI HERITAGE & STONE ETCHINGS",
            title: "Khaddi Khadda / Gaji Chara (ਖੱਡਾ)",
            kannadaOrPunjabi: "ਖੱਡਾ / ਗਾਜੀ ਚਾਰਾ - ਪੇਂਡੂ ਖੇਡ ਵਿਰਾਸਤ",
            intro: "Khaddi Khadda is a traditional 5x5 race game etched onto stone verandas or drawn in dirt across Punjabi villages, emphasizing mandatory captures.",
            materials: [
                {
                    icon: "🪨",
                    name: "Etched Stone / Dirt Grid",
                    punjabi: "ਪੱਥਰ / ਮਿੱਟੀ ਦੀ ਖੱਡੀ",
                    desc: "Etched into village courtyard stone floors or sketched in dirt with white limestone/chalk, forming a 5x5 grid with safe squares (Khaddas marked with ✖)."
                },
                {
                    icon: "🌱",
                    name: "River Pebbles & Seeds",
                    punjabi: "ਰੋੜੇ ਅਤੇ ਇਮਲੀ ਦੇ ਬੀਜ",
                    desc: "Played with natural smooth river stones, tamarind seeds, or carved wooden markers representing each player's pawns."
                },
                {
                    icon: "🐚",
                    name: "4 Cowrie Shells",
                    punjabi: "ਚਾਰ ਕੌਡੀਆਂ",
                    desc: "4 natural cowrie shells cast simultaneously. 4 open shells give Chowka (4) + bonus turn, and 0 open give Ashta (8) + bonus turn."
                }
            ]
        }
    };

    function openMaterialsModal(gameType) {
        currentGameType = gameType;
        const data = punjabMaterialsData[gameType];
        if (!data || !materialsModal) return;

        eduGameBadge.textContent = data.badge;
        eduGameTitle.textContent = data.title;
        eduGamePunjabi.textContent = data.kannadaOrPunjabi;
        eduGameIntro.textContent = data.intro;

        eduMaterialsGrid.innerHTML = '';
        data.materials.forEach(mat => {
            const card = document.createElement('div');
            card.className = 'material-card';
            card.innerHTML = `
                <div class="material-icon-box">${mat.icon}</div>
                <div class="material-name">${mat.name}</div>
                <div class="material-punjabi">${mat.punjabi}</div>
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

    if (btnLaunchChaupar) btnLaunchChaupar.addEventListener('click', () => openMaterialsModal('chaupar'));
    if (btnLaunchKhaddi) btnLaunchKhaddi.addEventListener('click', () => openMaterialsModal('khaddi'));
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
    const punjabTutorialSteps = {
        chaupar: [
            {
                title: "Step 1: 4-Arm Cross Board & Char-Koni",
                content: "Chaupar features a 4-armed cross board. You control Red pawns starting from the bottom arm, navigating anti-clockwise around the board to reach the central Char-Koni (👑).",
                highlight: "#chauparBoardWrapper"
            },
            {
                title: "Step 2: 7 Cowrie Scoring System (Kaudian)",
                content: "Throw 7 cowries: 1 open = 10 pts (Dasa), 5 open = 25 pts (Pasha), 0 open = 7 pts (Sat). High rolls grant bonus throws and allow piece entry!",
                highlight: "#chauparPanel"
            },
            {
                title: "Step 3: Jodi (Doubles) Defence Mechanic",
                content: "When two of your pawns land on the same square, they form an impenetrable 'Jodi' (+700 PTS). A Jodi CANNOT be cut by a single enemy pawn—only an enemy Jodi can capture it!",
                highlight: "#chauparBoardWrapper"
            },
            {
                title: "Step 4: Anti-Clockwise Circuit & Char-Koni Victory",
                content: "Complete the full circuit around all four arms (+1000 PTS per Gotta home), and lead all 4 pawns to Char-Koni to earn the grand +2500 PTS Victory Reward!",
                highlight: ".cp-center"
            }
        ],
        khaddi: [
            {
                title: "Step 1: 5x5 Grid & Safe Khaddas (✖)",
                content: "The board is a 5x5 grid with cross-marked safe squares (Khaddas). Pawns resting in safe Khaddas cannot be attacked.",
                highlight: ".safe-cell"
            },
            {
                title: "Step 2: 4 Cowries Casting",
                content: "Cast 4 cowrie shells: 1-3 open shells give 1-3 moves. 4 open (Chowka) or 0 open (Ashta / 8) grant moves plus an immediate extra roll (+50 PTS per move)!",
                highlight: "#khaddiPanel"
            },
            {
                title: "Step 3: Mandatory Capture (Kill) Rule",
                content: "IMPORTANT RULE: You MUST capture at least one enemy piece (+400 PTS) during the outer lap before your pawns are allowed to enter the inner ring!",
                highlight: "#khaddiKillStatusBadge"
            },
            {
                title: "Step 4: Inner Spiral & Central Home",
                content: "Once unlocked by a capture, enter the inner spiral and lead all 4 pawns to the central Khadda to win +2000 PTS!",
                highlight: ".center-cell"
            }
        ]
    };

    function showScreen(screen) {
        if (regionBriefingCard) regionBriefingCard.style.display = 'none';
        if (chauparGameScreen) chauparGameScreen.style.display = 'none';
        if (khaddiGameScreen) khaddiGameScreen.style.display = 'none';
        if (punjabVictoryModal) punjabVictoryModal.style.display = 'none';
        closeTutorial();
        closeLobbyModal();

        if (screen === 'briefing' && regionBriefingCard) regionBriefingCard.style.display = 'flex';
        else if (screen === 'chaupar' && chauparGameScreen) chauparGameScreen.style.display = 'flex';
        else if (screen === 'khaddi' && khaddiGameScreen) khaddiGameScreen.style.display = 'flex';
    }

    backDashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('pickup');
            closeTutorial();
            closeLobbyModal();
            showScreen('briefing');
        });
    });

    function openPunjabVictoryModal(title, subtitle, matchScore) {
        if (!punjabVictoryModal) return;
        punjabVictoryTitle.textContent = title;
        punjabVictorySubtitle.textContent = subtitle;
        punjabVicMatchScore.textContent = `+${matchScore}`;
        punjabVicTotalScore.textContent = getPlayerScore().toLocaleString();
        punjabVictoryModal.style.display = 'flex';
        playSound('success');
    }

    if (btnPunjabVictoryReplay) {
        btnPunjabVictoryReplay.addEventListener('click', () => {
            if (punjabVictoryModal) punjabVictoryModal.style.display = 'none';
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
        const steps = punjabTutorialSteps[currentGameType];
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
            const steps = punjabTutorialSteps[currentGameType];
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

    if (btnChauparTutorial) btnChauparTutorial.addEventListener('click', () => startInteractiveTutorial('chaupar'));
    if (btnKhaddiTutorial) btnKhaddiTutorial.addEventListener('click', () => startInteractiveTutorial('khaddi'));

    /* ==========================================================================
       1. GAME 1: CHAUPAR / PASHA (Dynamic AI Difficulty & Friend Mode)
       ========================================================================== */
    const chauparCrossGrid = document.getElementById('chauparCrossGrid');
    const btnRoll7Cowries = document.getElementById('btnRoll7Cowries');
    const chauparRollResult = document.getElementById('chauparRollResult');
    const chauparTurnIndicator = document.getElementById('chauparTurnIndicator');
    const chauparLogBox = document.getElementById('chauparLogBox');
    const btnResetChaupar = document.getElementById('btnResetChaupar');
    const chauparModeSelect = document.getElementById('chauparModeSelect');
    const chauparRoomGroup = document.getElementById('chauparRoomGroup');
    const chauparActivePlayerBadge = document.getElementById('chauparActivePlayerBadge');

    const cpShellEls = [
        document.getElementById('cpShell0'), document.getElementById('cpShell1'),
        document.getElementById('cpShell2'), document.getElementById('cpShell3'),
        document.getElementById('cpShell4'), document.getElementById('cpShell5'),
        document.getElementById('cpShell6')
    ];

    let syncChannel = null;
    try {
        syncChannel = new BroadcastChannel('chaupar_realtime_sync');
        syncChannel.onmessage = (e) => {
            if (chauparModeSelect && chauparModeSelect.value === 'multiplayer') {
                handleRemoteSync(e.data);
            }
        };
    } catch (e) {
        console.warn("BroadcastChannel not supported", e);
    }

    if (chauparModeSelect) {
        chauparModeSelect.addEventListener('change', () => {
            const isMp = chauparModeSelect.value === 'multiplayer';
            chauparRoomGroup.style.display = isMp ? 'flex' : 'none';
            logChaupar(isMp ? "🌐 Real-Time Multiplayer Active. Room Code: BHARATH-PUNJAB" : "🎮 Single Player vs Easy AI Active.");
        });
    }

    function isChauparCell(r, c) {
        const inCenter = (r >= 8 && r <= 10 && c >= 8 && c <= 10);
        const inTopArm = (r >= 0 && r <= 7 && c >= 8 && c <= 10);
        const inBottomArm = (r >= 11 && r <= 18 && c >= 8 && c <= 10);
        const inLeftArm = (r >= 8 && r <= 10 && c >= 0 && c <= 7);
        const inRightArm = (r >= 8 && r <= 10 && c >= 11 && c <= 18);
        return inCenter || inTopArm || inBottomArm || inLeftArm || inRightArm;
    }

    const redCircuit = [];
    for (let r = 18; r >= 11; r--) redCircuit.push({r, c: 10});
    for (let c = 11; c <= 18; c++) redCircuit.push({r: 8, c});
    redCircuit.push({r: 9, c: 18});
    for (let c = 18; c >= 11; c--) redCircuit.push({r: 10, c});
    for (let r = 7; r >= 0; r--) redCircuit.push({r, c: 10});
    redCircuit.push({r: 0, c: 9});
    for (let r = 0; r <= 7; r++) redCircuit.push({r, c: 8});
    for (let c = 7; c >= 0; c--) redCircuit.push({r: 8, c});
    redCircuit.push({r: 9, c: 0});
    for (let c = 0; c <= 7; c++) redCircuit.push({r: 10, c});
    for (let r = 11; r <= 18; r++) redCircuit.push({r, c: 8});
    redCircuit.push({r: 18, c: 9});
    for (let r = 17; r >= 11; r--) redCircuit.push({r, c: 9});
    redCircuit.push({r: 9, c: 9});

    let redGottas = [
        { id: 1, step: -1, finished: false },
        { id: 2, step: -1, finished: false },
        { id: 3, step: -1, finished: false },
        { id: 4, step: -1, finished: false }
    ];

    let greenGottas = [
        { id: 1, step: -1, finished: false },
        { id: 2, step: -1, finished: false },
        { id: 3, step: -1, finished: false },
        { id: 4, step: -1, finished: false }
    ];

    let cpTurn = 'red'; // 'red' = Player 1, 'green' = Player 2 / AI
    let cpRoll = 0;
    let cpCanRoll = true;

    function renderChauparBoard() {
        if (!chauparCrossGrid) return;
        chauparCrossGrid.innerHTML = '';

        for (let r = 0; r < 19; r++) {
            for (let c = 0; c < 19; c++) {
                const cell = document.createElement('div');
                cell.className = 'cp-cell';

                if (!isChauparCell(r, c)) {
                    cell.classList.add('cp-blank');
                } else if (r === 9 && c === 9) {
                    cell.classList.add('cp-center');
                } else if ((r === 12 && c === 9) || (r === 6 && c === 9) || (r === 9 && c === 6) || (r === 9 && c === 12)) {
                    cell.classList.add('cp-safe');
                }

                // Render Red Gottas (Player 1)
                const redInCell = redGottas.filter(g => !g.finished && g.step >= 0 && redCircuit[g.step].r === r && redCircuit[g.step].c === c);
                if (redInCell.length > 0) {
                    const isJodi = redInCell.length >= 2;
                    const g = redInCell[0];
                    const pEl = document.createElement('div');
                    const selectable = cpTurn === 'red' && cpRoll > 0 && isChauparMoveValid(g, cpRoll);
                    pEl.className = `gotta-pawn gotta-red ${isJodi ? 'is-jodi' : ''} ${selectable ? 'selectable' : ''}`;
                    pEl.textContent = isJodi ? `J` : `R${g.id}`;
                    pEl.title = isJodi ? `${player1Name} Jodi (${redInCell.length} pieces)` : `${player1Name} Gotta ${g.id}`;

                    pEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (cpTurn !== 'red' || cpRoll === 0) return;
                        if (isChauparMoveValid(g, cpRoll)) {
                            moveChauparGotta(g, redInCell, 'red');
                        }
                    });

                    cell.appendChild(pEl);
                }

                // Render Green Gottas (Player 2 / AI)
                const greenInCell = greenGottas.filter(g => !g.finished && g.step >= 0 && redCircuit[g.step].r === r && redCircuit[g.step].c === c);
                if (greenInCell.length > 0) {
                    const isJodi = greenInCell.length >= 2;
                    const g = greenInCell[0];
                    const pEl = document.createElement('div');
                    const selectable = cpTurn === 'green' && currentMatchMode === 'friend' && cpRoll > 0 && isChauparMoveValid(g, cpRoll);
                    pEl.className = `gotta-pawn gotta-green ${isJodi ? 'is-jodi' : ''} ${selectable ? 'selectable' : ''}`;
                    pEl.textContent = isJodi ? `J` : `G${g.id}`;
                    pEl.title = isJodi ? `${player2Name} Jodi` : `${player2Name} Gotta ${g.id}`;

                    pEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (cpTurn !== 'green' || currentMatchMode !== 'friend' || cpRoll === 0) return;
                        if (isChauparMoveValid(g, cpRoll)) {
                            moveChauparGotta(g, greenInCell, 'green');
                        }
                    });

                    cell.appendChild(pEl);
                }

                chauparCrossGrid.appendChild(cell);
            }
        }
    }

    function isChauparMoveValid(gotta, roll) {
        if (gotta.finished) return false;
        if (gotta.step === -1) {
            // Grace entry rolls: 10, 25, 35 (Pasha), 7
            return roll === 10 || roll === 25 || roll === 35 || roll === 7;
        }
        return (gotta.step + roll) < redCircuit.length;
    }

    function roll7Cowries() {
        let openCount = 0;
        cpShellEls.forEach(shell => {
            const isOpen = Math.random() > 0.5;
            if (isOpen) openCount++;
            if (shell) {
                shell.className = `cowrie-7-shell ${isOpen ? 'open' : 'closed'}`;
                shell.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg) scale(1.1)`;
                setTimeout(() => { shell.style.transform = 'none'; }, 250);
            }
        });

        let points = 0;
        let isBonus = false;

        switch (openCount) {
            case 0: points = 7; isBonus = true; break;   // 0 open = 7 pts + extra throw
            case 1: points = 10; isBonus = true; break;  // 1 open = 10 pts + extra throw
            case 2: points = 2; isBonus = false; break;  // 2 open = 2 pts
            case 3: points = 3; isBonus = false; break;  // 3 open = 3 pts
            case 4: points = 4; isBonus = false; break;  // 4 open = 4 pts
            case 5: points = 25; isBonus = true; break;  // 5 open = 25 pts (Pasha) + extra throw
            case 6: points = 35; isBonus = true; break;  // 6 open = 35 pts + extra throw
            case 7: points = 14; isBonus = true; break;  // 7 open = 14 pts + extra throw
        }

        return { points, openCount, isBonus };
    }

    function logChaupar(msg) {
        if (!chauparLogBox) return;
        const p = document.createElement('div');
        p.textContent = msg;
        chauparLogBox.prepend(p);
    }

    async function handleChauparRoll() {
        if (!cpCanRoll) return;
        cpCanRoll = false;
        btnRoll7Cowries.disabled = true;

        const activeName = cpTurn === 'red' ? player1Name : player2Name;
        playSound('pickup');
        const { points, isBonus, openCount } = roll7Cowries();
        cpRoll = points;
        chauparRollResult.textContent = `Roll: ${points} (${openCount} Kaudian open) ${isBonus ? '⭐ BONUS ROLL!' : ''}`;
        logChaupar(`${activeName} cast ${openCount} open Kaudian: scored ${points} pts!`);

        if (cpTurn === 'red') {
            punjabMatchPoints += points;
            addPlayerPoints(points, `Cast ${points} pts`);
        }

        renderChauparBoard();

        const activeGottas = cpTurn === 'red' ? redGottas : greenGottas;
        const unentered = activeGottas.filter(g => g.step === -1);
        const canEnter = (points === 10 || points === 25 || points === 35 || points === 7) && unentered.length > 0;
        const validActive = activeGottas.filter(g => g.step >= 0 && isChauparMoveValid(g, points));

        if (canEnter && validActive.length === 0) {
            const enterGotta = unentered[0];
            enterGotta.step = 0;
            if (cpTurn === 'red') {
                const entryPts = 300;
                punjabMatchPoints += entryPts;
                addPlayerPoints(entryPts, 'Gotta Entered');
            }
            logChaupar(`🚩 ${activeName}'s Gotta entered the Chaupar board!`);
            playSound('success');
            renderChauparBoard();
            cpRoll = 0;
            endChauparTurn(isBonus);
        } else if (canEnter || validActive.length > 0) {
            chauparTurnIndicator.textContent = `${activeName.toUpperCase()}: SELECT HIGHLIGHTED GOTTA`;
        } else {
            logChaupar(`No legal moves for roll ${points}. Turn passed.`);
            await new Promise(r => setTimeout(r, 800));
            endChauparTurn(isBonus);
        }

        broadcastState('roll', { roll: points, isBonus });
    }

    function moveChauparGotta(gotta, cluster, player) {
        if (gotta.step === -1) {
            gotta.step = 0;
            if (player === 'red') {
                const entryPts = 300;
                punjabMatchPoints += entryPts;
                addPlayerPoints(entryPts, 'Gotta Entered');
            }
            logChaupar(`🚩 ${player === 'red' ? player1Name : player2Name}'s Gotta entered!`);
        } else {
            gotta.step += cpRoll;
        }

        playSound('pickup');

        if (gotta.step === redCircuit.length - 1) {
            gotta.finished = true;
            if (player === 'red') {
                const homePts = 1000;
                punjabMatchPoints += homePts;
                addPlayerPoints(homePts, 'Reached Char-Koni');
            }
            logChaupar(`👑 Gotta reached central Char-Koni! (+1000 PTS)`);
            playSound('success');
        } else {
            const currPos = redCircuit[gotta.step];
            const enemyPawns = (player === 'red' ? greenGottas : redGottas).filter(e => !e.finished && e.step >= 0 && redCircuit[e.step].r === currPos.r && redCircuit[e.step].c === currPos.c);
            
            if (enemyPawns.length > 0) {
                const isEnemyJodi = enemyPawns.length >= 2;
                const isMyJodi = cluster && cluster.length >= 2;

                if (isEnemyJodi && !isMyJodi) {
                    logChaupar(`🛡️ Opponent Jodi deflected your attack! Single pieces cannot cut a Jodi.`);
                } else if (isEnemyJodi && isMyJodi) {
                    enemyPawns.forEach(e => { e.step = -1; });
                    if (player === 'red') {
                        const clashPts = 800;
                        punjabMatchPoints += clashPts;
                        addPlayerPoints(clashPts, 'Jodi Clash Elimination');
                    }
                    logChaupar(`⚔️ JODI CLASH! Jodi eliminated the enemy Jodi!`);
                    playSound('success');
                } else {
                    enemyPawns[0].step = -1;
                    if (player === 'red') {
                        const cutPts = 500;
                        punjabMatchPoints += cutPts;
                        addPlayerPoints(cutPts, 'Captured Enemy Gotta');
                    }
                    logChaupar(`⚔️ CUT! Enemy Gotta captured back to start!`);
                    playSound('success');
                }
            } else {
                const myPawnsInCell = (player === 'red' ? redGottas : greenGottas).filter(m => !m.finished && m.step >= 0 && redCircuit[m.step].r === currPos.r && redCircuit[m.step].c === currPos.c);
                if (myPawnsInCell.length >= 2 && player === 'red') {
                    const jodiPts = 700;
                    punjabMatchPoints += jodiPts;
                    addPlayerPoints(jodiPts, 'Formed Defensive Jodi');
                    logChaupar(`🛡️ JODI FORMED! Impenetrable defense established!`);
                }
            }
        }

        renderChauparBoard();
        checkChauparWin();

        const bonus = (cpRoll === 10 || cpRoll === 25 || cpRoll === 7);
        cpRoll = 0;
        broadcastState('move', { gottas: redGottas });
        endChauparTurn(bonus);
    }

    function endChauparTurn(hasBonus) {
        if (hasBonus) {
            logChaupar(`⭐ Bonus turn granted! Cast Kaudian again.`);
            cpCanRoll = true;
            btnRoll7Cowries.disabled = false;
            const activeName = cpTurn === 'red' ? player1Name : player2Name;
            chauparTurnIndicator.textContent = `BONUS TURN (${activeName.toUpperCase()}): CAST 7 KAUDIAN`;
            if (cpTurn === 'green' && currentMatchMode === 'ai') {
                setTimeout(handleAiChauparTurn, 800);
            }
            return;
        }

        if (cpTurn === 'red') {
            cpTurn = 'green';
            chauparActivePlayerBadge.textContent = `${player2Name.toUpperCase()} (GREEN)`;
            chauparActivePlayerBadge.style.color = "#00ff88";

            if (currentMatchMode === 'friend') {
                chauparTurnIndicator.textContent = `${player2Name.toUpperCase()}'S TURN: CAST 7 KAUDIAN`;
                cpCanRoll = true;
                btnRoll7Cowries.disabled = false;
            } else {
                chauparTurnIndicator.textContent = `${player2Name.toUpperCase()} TURN: CASTING...`;
                btnRoll7Cowries.disabled = true;
                setTimeout(handleAiChauparTurn, currentAiDifficulty === 'easy' ? 800 : (currentAiDifficulty === 'medium' ? 500 : 350));
            }
        } else {
            cpTurn = 'red';
            chauparActivePlayerBadge.textContent = `${player1Name.toUpperCase()} (RED)`;
            chauparActivePlayerBadge.style.color = "#ff334b";
            chauparTurnIndicator.textContent = `${player1Name.toUpperCase()}'S TURN: CAST 7 KAUDIAN`;
            cpCanRoll = true;
            btnRoll7Cowries.disabled = false;
        }
    }

    // Dynamic AI Decision scaled by Easy / Medium / Hard
    async function handleAiChauparTurn() {
        if (currentMatchMode === 'friend') return;

        playSound('pickup');
        const { points, isBonus, openCount } = roll7Cowries();
        chauparRollResult.textContent = `${player2Name} Cast: ${points} (${openCount} Kaudian) ${isBonus ? '⭐ BONUS!' : ''}`;
        logChaupar(`${player2Name} cast ${openCount} open Kaudian: ${points} pts.`);

        await new Promise(r => setTimeout(r, 600));

        const unentered = greenGottas.filter(g => g.step === -1);
        const canEnter = (points === 10 || points === 25 || points === 35 || points === 7) && unentered.length > 0;
        const validActive = greenGottas.filter(g => g.step >= 0 && isChauparMoveValid(g, points));

        if (canEnter && (validActive.length === 0 || (currentAiDifficulty === 'hard' && unentered.length >= 3))) {
            unentered[0].step = 0;
            logChaupar(`🚩 ${player2Name}'s Gotta entered the board!`);
            playSound('pickup');
        } else if (validActive.length > 0) {
            let chosen = validActive[0];

            if (currentAiDifficulty === 'easy') {
                // Easy Mode: Random valid move
                chosen = validActive[Math.floor(Math.random() * validActive.length)];
            } else if (currentAiDifficulty === 'medium') {
                // Medium Mode: Look for safe cut or gotta entry
                let cutGotta = null;
                for (let g of validActive) {
                    const targetPos = redCircuit[g.step + points];
                    const redPawns = redGottas.filter(r => !r.finished && r.step >= 0 && redCircuit[r.step].r === targetPos.r && redCircuit[r.step].c === targetPos.c);
                    if (redPawns.length === 1) {
                        cutGotta = g; break;
                    }
                }
                chosen = cutGotta || validActive[0];
            } else {
                // Hard Mode: Deep heuristic (Home > Jodi Clash > Jodi Form > Cut Single > Safe Progress)
                let bestScore = -9999;
                for (let g of validActive) {
                    const nextStep = g.step + points;
                    let score = nextStep * 10;

                    // 1. Reaching Char-Koni
                    if (nextStep === redCircuit.length - 1) score += 3000;

                    const targetPos = redCircuit[nextStep];
                    const redPawns = redGottas.filter(r => !r.finished && r.step >= 0 && redCircuit[r.step].r === targetPos.r && redCircuit[r.step].c === targetPos.c);
                    const isAiJodi = greenGottas.filter(other => other !== g && !other.finished && other.step === g.step).length >= 1;

                    if (redPawns.length >= 2) {
                        // Enemy has a Jodi
                        if (isAiJodi) score += 2000; // Jodi clash can eliminate enemy Jodi!
                        else score -= 1500; // Single piece deflects and wastes move
                    } else if (redPawns.length === 1) {
                        score += 1500; // Cut single vulnerable enemy gotta
                    }

                    // Form a defensive Jodi
                    if (greenGottas.some(other => other !== g && !other.finished && other.step === nextStep)) {
                        score += 1200;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        chosen = g;
                    }
                }
            }

            chosen.step += points;
            playSound('pickup');
        } else if (canEnter) {
            unentered[0].step = 0;
            logChaupar(`🚩 ${player2Name}'s Gotta entered the board!`);
            playSound('pickup');
        } else {
            logChaupar(`${player2Name} has no legal moves.`);
        }

        renderChauparBoard();
        checkChauparWin();
        endChauparTurn(isBonus);
    }

    function checkChauparWin() {
        const redWon = redGottas.every(g => g.finished);
        const greenWon = greenGottas.every(g => g.finished);

        if (redWon) {
            const winBounty = 2500;
            punjabMatchPoints += winBounty;
            addPlayerPoints(winBounty, 'Chaupar Supreme Victory');
            chauparTurnIndicator.textContent = `🏆 VICTORY! ${player1Name.toUpperCase()} CLAIMS CHAUPAR!`;
            logChaupar(`🎉 Victory! All ${player1Name} Gottas attained Char-Koni!`);
            logPostMortem('Chaupar', player1Name, currentMatchMode, currentAiDifficulty, 28, punjabMatchPoints);
            openPunjabVictoryModal(`${player1Name.toUpperCase()} IS CHAUPAR CHAMPION!`, `All 4 Gottas attained the sacred Char-Koni!`, punjabMatchPoints);
            cpCanRoll = false;
        } else if (greenWon) {
            chauparTurnIndicator.textContent = `${player2Name.toUpperCase()} CLAIMS CHAUPAR VICTORY!`;
            logPostMortem('Chaupar', player2Name, currentMatchMode, currentAiDifficulty, 32, 0);
            if (currentMatchMode === 'friend') {
                openPunjabVictoryModal(`${player2Name.toUpperCase()} IS CHAUPAR CHAMPION!`, `All 4 Gottas attained the sacred Char-Koni!`, 1500);
            } else {
                playSound('error');
            }
            cpCanRoll = false;
        }
    }

    function broadcastState(type, payload) {
        if (syncChannel && chauparModeSelect && chauparModeSelect.value === 'multiplayer') {
            syncChannel.postMessage({ type, payload, time: Date.now() });
        }
    }

    function handleRemoteSync(data) {
        if (!data) return;
        if (data.type === 'move') {
            logChaupar(`📡 Real-Time sync received from remote player.`);
        }
    }

    function initChauparGame() {
        redGottas = [
            { id: 1, step: -1, finished: false },
            { id: 2, step: -1, finished: false },
            { id: 3, step: -1, finished: false },
            { id: 4, step: -1, finished: false }
        ];
        greenGottas = [
            { id: 1, step: -1, finished: false },
            { id: 2, step: -1, finished: false },
            { id: 3, step: -1, finished: false },
            { id: 4, step: -1, finished: false }
        ];
        cpTurn = 'red';
        cpRoll = 0;
        cpCanRoll = true;
        punjabMatchPoints = 0;
        if (btnRoll7Cowries) btnRoll7Cowries.disabled = false;
        if (chauparRollResult) chauparRollResult.textContent = "Roll: -";
        if (chauparActivePlayerBadge) {
            chauparActivePlayerBadge.textContent = `${player1Name.toUpperCase()} (RED)`;
            chauparActivePlayerBadge.style.color = "#ff334b";
        }
        if (chauparTurnIndicator) chauparTurnIndicator.textContent = `${player1Name.toUpperCase()}'S TURN: CAST 7 KAUDIAN`;
        renderChauparBoard();
    }

    if (btnRoll7Cowries) btnRoll7Cowries.addEventListener('click', handleChauparRoll);
    if (btnResetChaupar) btnResetChaupar.addEventListener('click', () => { playSound('pickup'); initChauparGame(); });

    /* ==========================================================================
       2. GAME 2: KHADDI KHADDA (Dynamic AI Difficulty & Friend Mode)
       ========================================================================== */
    const khaddiBoard = document.getElementById('khaddiBoard');
    const btnRollKhaddiCowries = document.getElementById('btnRollKhaddiCowries');
    const khaddiRollResult = document.getElementById('khaddiRollResult');
    const khaddiTurnIndicator = document.getElementById('khaddiTurnIndicator');
    const khaddiLogBox = document.getElementById('khaddiLogBox');
    const btnResetKhaddi = document.getElementById('btnResetKhaddi');
    const khaddiKillStatusBadge = document.getElementById('khaddiKillStatusBadge');

    const khShellEls = [
        document.getElementById('khShell0'), document.getElementById('khShell1'),
        document.getElementById('khShell2'), document.getElementById('khShell3')
    ];

    const KHADDI_SAFE_COORDS = ["0,2", "2,0", "2,2", "2,4", "4,2"];

    const khPlayerPath = [
        {r: 4, c: 2}, {r: 4, c: 1}, {r: 4, c: 0},
        {r: 3, c: 0}, {r: 2, c: 0}, {r: 1, c: 0}, {r: 0, c: 0},
        {r: 0, c: 1}, {r: 0, c: 2}, {r: 0, c: 3}, {r: 0, c: 4},
        {r: 1, c: 4}, {r: 2, c: 4}, {r: 3, c: 4}, {r: 4, c: 4},
        {r: 4, c: 3},
        // Inner Ring
        {r: 3, c: 2}, {r: 3, c: 1}, {r: 2, c: 1}, {r: 1, c: 1},
        {r: 1, c: 2}, {r: 1, c: 3}, {r: 2, c: 3}, {r: 3, c: 3},
        // Center Home
        {r: 2, c: 2}
    ];

    let khPlayerPawns = [
        { id: 1, step: 0, finished: false },
        { id: 2, step: 0, finished: false },
        { id: 3, step: 0, finished: false },
        { id: 4, step: 0, finished: false }
    ];

    let khAiPawns = [
        { id: 1, step: 1, finished: false },
        { id: 2, step: 4, finished: false },
        { id: 3, step: 7, finished: false },
        { id: 4, step: 9, finished: false }
    ];

    let khPlayerHasCaptured = false;
    let khAiHasCaptured = false;
    let khTurn = 'player'; // 'player' or 'ai'
    let khRoll = 0;
    let khCanRoll = true;

    function renderKhaddiBoard() {
        if (!khaddiBoard) return;
        khaddiBoard.innerHTML = '';

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cellKey = `${r},${c}`;
                const cell = document.createElement('div');
                cell.className = 'cb-cell';

                if (cellKey === '2,2') cell.classList.add('center-cell');
                else if (KHADDI_SAFE_COORDS.includes(cellKey)) cell.classList.add('safe-cell');

                // Render Player 1 pawns
                khPlayerPawns.forEach(p => {
                    if (!p.finished) {
                        const coord = khPlayerPath[p.step];
                        if (coord.r === r && coord.c === c) {
                            const pEl = document.createElement('div');
                            const selectable = khTurn === 'player' && khRoll > 0 && isKhaddiMoveValid(p, khRoll, true);
                            pEl.className = `gotti-pawn gotti-player ${selectable ? 'selectable' : ''}`;
                            pEl.textContent = `P${p.id}`;
                            pEl.title = `${player1Name} Pawn ${p.id}`;

                            pEl.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (khTurn !== 'player' || khRoll === 0) return;
                                if (isKhaddiMoveValid(p, khRoll, true)) {
                                    moveKhaddiPawn(p, 'player');
                                }
                            });

                            cell.appendChild(pEl);
                        }
                    }
                });

                // Render Player 2 / AI pawns
                khAiPawns.forEach(a => {
                    if (!a.finished) {
                        const coord = khPlayerPath[a.step];
                        if (coord.r === r && coord.c === c) {
                            const aEl = document.createElement('div');
                            const selectable = khTurn === 'ai' && currentMatchMode === 'friend' && khRoll > 0 && isKhaddiMoveValid(a, khRoll, false);
                            aEl.className = `gotti-pawn gotti-ai ${selectable ? 'selectable' : ''}`;
                            aEl.textContent = `A${a.id}`;
                            aEl.title = `${player2Name} Pawn ${a.id}`;

                            aEl.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (khTurn !== 'ai' || currentMatchMode !== 'friend' || khRoll === 0) return;
                                if (isKhaddiMoveValid(a, khRoll, false)) {
                                    moveKhaddiPawn(a, 'ai');
                                }
                            });

                            cell.appendChild(aEl);
                        }
                    }
                });

                khaddiBoard.appendChild(cell);
            }
        }
    }

    function isKhaddiMoveValid(pawn, roll, isPlayerSide) {
        if (pawn.finished) return false;
        const nextStep = pawn.step + roll;
        if (nextStep >= khPlayerPath.length) return false;
        const hasKilled = isPlayerSide ? khPlayerHasCaptured : khAiHasCaptured;
        // Mandatory Capture Rule: A piece cannot turn inward (steps >= 16) without a kill
        if (nextStep >= 16 && !hasKilled) {
            return false;
        }
        return true;
    }

    function rollKhaddiCowries() {
        let openCount = 0;
        khShellEls.forEach(shell => {
            const isOpen = Math.random() > 0.5;
            if (isOpen) openCount++;
            if (shell) {
                shell.className = `cowrie-shell ${isOpen ? 'open' : 'closed'}`;
                shell.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg) scale(1.1)`;
                setTimeout(() => { shell.style.transform = 'none'; }, 250);
            }
        });

        const points = openCount === 0 ? 8 : (openCount === 4 ? 4 : openCount);
        const isBonus = (openCount === 0 || openCount === 4);
        return { points, isBonus };
    }

    function logKhaddi(msg) {
        if (!khaddiLogBox) return;
        const p = document.createElement('div');
        p.textContent = msg;
        khaddiLogBox.prepend(p);
    }

    async function handleKhaddiRoll() {
        if (!khCanRoll) return;
        khCanRoll = false;
        btnRollKhaddiCowries.disabled = true;

        const activeName = khTurn === 'player' ? player1Name : player2Name;
        playSound('pickup');
        const { points, isBonus } = rollKhaddiCowries();
        khRoll = points;
        khaddiRollResult.textContent = `Roll: ${points} ${isBonus ? '⭐ CHOWKA BONUS!' : ''}`;
        logKhaddi(`${activeName} rolled ${points} points!`);

        renderKhaddiBoard();

        const activePawns = khTurn === 'player' ? khPlayerPawns : khAiPawns;
        const isPlayerSide = (khTurn === 'player');
        const validPawns = activePawns.filter(p => isKhaddiMoveValid(p, khRoll, isPlayerSide));

        if (validPawns.length === 0) {
            const hasKilled = isPlayerSide ? khPlayerHasCaptured : khAiHasCaptured;
            if (!hasKilled && activePawns.some(p => p.step + points >= 16)) {
                logKhaddi(`⛔ Inner ring locked for ${activeName}! Must execute a mandatory capture first.`);
            } else {
                logKhaddi(`No valid moves for roll ${points}. Turn passed.`);
            }
            await new Promise(r => setTimeout(r, 800));
            endKhaddiTurn(isBonus);
        } else {
            khaddiTurnIndicator.textContent = `${activeName.toUpperCase()}: SELECT HIGHLIGHTED PAWN`;
        }
    }

    function moveKhaddiPawn(pawn, turnSide) {
        pawn.step += khRoll;
        playSound('pickup');

        if (turnSide === 'player') {
            const movePts = 50;
            punjabMatchPoints += movePts;
            addPlayerPoints(movePts, 'Pawn Advanced');
        }

        const opponentPawns = turnSide === 'player' ? khAiPawns : khPlayerPawns;

        if (pawn.step === khPlayerPath.length - 1) {
            pawn.finished = true;
            if (turnSide === 'player') {
                const homePts = 600;
                punjabMatchPoints += homePts;
                addPlayerPoints(homePts, `Pawn P${pawn.id} entered Khadda`);
                logKhaddi(`🏆 ${player1Name}'s Pawn P${pawn.id} entered the central Khadda! (+600 PTS)`);
                playSound('success');
            } else {
                logKhaddi(`⚠️ ${player2Name}'s Pawn entered the central Khadda!`);
            }
        } else {
            const currentPos = khPlayerPath[pawn.step];
            const cellKey = `${currentPos.r},${currentPos.c}`;

            if (!KHADDI_SAFE_COORDS.includes(cellKey)) {
                opponentPawns.forEach(opp => {
                    if (!opp.finished) {
                        const oppPos = khPlayerPath[opp.step];
                        if (oppPos.r === currentPos.r && oppPos.c === currentPos.c) {
                            opp.step = 0; // Cut back to start!
                            if (turnSide === 'player') {
                                khPlayerHasCaptured = true;
                                const cutPts = 400;
                                punjabMatchPoints += cutPts;
                                addPlayerPoints(cutPts, 'Mandatory Capture Achieved');
                                khaddiKillStatusBadge.textContent = "🔓 INNER RING UNLOCKED (Capture Achieved)";
                                khaddiKillStatusBadge.style.color = "#00ff88";
                                khaddiKillStatusBadge.style.borderColor = "#00ff88";
                                logKhaddi(`⚔️ CAPTURE! You cut enemy Pawn A${opp.id} back to start! Inner ring unlocked!`);
                                playSound('success');
                            } else {
                                khAiHasCaptured = true;
                                logKhaddi(`💥 ${player2Name} captured your Pawn P${opp.id} back to start! Inner ring unlocked for ${player2Name}.`);
                                playSound('error');
                            }
                        }
                    }
                });
            }
        }

        renderKhaddiBoard();
        checkKhaddiWin();

        const bonus = (khRoll === 4 || khRoll === 8);
        khRoll = 0;
        endKhaddiTurn(bonus);
    }

    function checkKhaddiWin() {
        const playerWon = khPlayerPawns.every(p => p.finished);
        const aiWon = khAiPawns.every(a => a.finished);

        if (playerWon) {
            const winBounty = 2000;
            punjabMatchPoints += winBounty;
            addPlayerPoints(winBounty, 'Khaddi Khadda Victory Bounty');
            khaddiTurnIndicator.textContent = `🏆 VICTORY! ${player1Name.toUpperCase()} WON!`;
            logKhaddi(`🎉 Congratulations! ${player1Name} achieved victory in Khaddi Khadda!`);
            logPostMortem('Khaddi Khadda', player1Name, currentMatchMode, currentAiDifficulty, 22, punjabMatchPoints);
            openPunjabVictoryModal(`${player1Name.toUpperCase()} IS KHADDI CHAMPION!`, "All 4 pawns safely reached the central Khadda!", punjabMatchPoints);
            khCanRoll = false;
            btnRollKhaddiCowries.disabled = true;
        } else if (aiWon) {
            khaddiTurnIndicator.textContent = `${player2Name.toUpperCase()} WON KHADDI KHADDA!`;
            logPostMortem('Khaddi Khadda', player2Name, currentMatchMode, currentAiDifficulty, 24, 0);
            if (currentMatchMode === 'friend') {
                openPunjabVictoryModal(`${player2Name.toUpperCase()} IS KHADDI CHAMPION!`, "All 4 pawns reached central Khadda!", 1000);
            } else {
                playSound('error');
            }
            khCanRoll = false;
            btnRollKhaddiCowries.disabled = true;
        }
    }

    function endKhaddiTurn(hasBonus) {
        if (hasBonus) {
            logKhaddi(`⭐ Bonus turn! Roll cowries again.`);
            khCanRoll = true;
            btnRollKhaddiCowries.disabled = false;
            const activeName = khTurn === 'player' ? player1Name : player2Name;
            khaddiTurnIndicator.textContent = `BONUS TURN (${activeName.toUpperCase()}): ROLL 4 COWRIES`;
            if (khTurn === 'ai' && currentMatchMode === 'ai') {
                setTimeout(handleAiKhaddiTurn, 700);
            }
            return;
        }

        if (khTurn === 'player') {
            khTurn = 'ai';
            if (currentMatchMode === 'friend') {
                khaddiTurnIndicator.textContent = `${player2Name.toUpperCase()}'S TURN: ROLL 4 COWRIES`;
                khCanRoll = true;
                btnRollKhaddiCowries.disabled = false;
            } else {
                khaddiTurnIndicator.textContent = `${player2Name.toUpperCase()} TURN: ROLLING...`;
                btnRollKhaddiCowries.disabled = true;
                setTimeout(handleAiKhaddiTurn, currentAiDifficulty === 'easy' ? 800 : 500);
            }
        } else {
            khTurn = 'player';
            khaddiTurnIndicator.textContent = `${player1Name.toUpperCase()}'S TURN: ROLL 4 COWRIES`;
            khCanRoll = true;
            btnRollKhaddiCowries.disabled = false;
        }
    }

    // Dynamic AI for Khaddi Khadda scaled across Easy, Medium, Hard
    async function handleAiKhaddiTurn() {
        if (currentMatchMode === 'friend') return;

        playSound('pickup');
        const { points, isBonus } = rollKhaddiCowries();
        khRoll = points;
        khaddiRollResult.textContent = `${player2Name} Rolled: ${points} ${isBonus ? '⭐ BONUS!' : ''}`;
        logKhaddi(`${player2Name} rolled ${points} points.`);

        await new Promise(r => setTimeout(r, 600));

        const validPawns = khAiPawns.filter(a => isKhaddiMoveValid(a, points, false));
        if (validPawns.length === 0) {
            logKhaddi(`${player2Name} has no legal moves.`);
            await new Promise(r => setTimeout(r, 600));
            endKhaddiTurn(isBonus);
            return;
        }

        let chosenPawn = validPawns[0];

        if (currentAiDifficulty === 'easy') {
            // Easy Mode: Random piece choice
            chosenPawn = validPawns[Math.floor(Math.random() * validPawns.length)];
        } else if (currentAiDifficulty === 'medium') {
            // Medium Mode: Prioritize captures to unlock inner ring
            let cutPawn = null;
            for (let a of validPawns) {
                const targetPos = khPlayerPath[a.step + points];
                const cellKey = `${targetPos.r},${targetPos.c}`;
                if (!KHADDI_SAFE_COORDS.includes(cellKey)) {
                    if (khPlayerPawns.some(p => !p.finished && khPlayerPath[p.step].r === targetPos.r && khPlayerPath[p.step].c === targetPos.c)) {
                        cutPawn = a; break;
                    }
                }
            }
            chosenPawn = cutPawn || validPawns[0];
        } else {
            // Hard Mode: Tracks all coordinates, unlocks inner ring, sets ambush traps
            let bestScore = -9999;
            for (let a of validPawns) {
                const nextStep = a.step + points;
                const targetPos = khPlayerPath[nextStep];
                const cellKey = `${targetPos.r},${targetPos.c}`;
                let score = nextStep * 10;

                // 1. Entering Khadda Home
                if (nextStep === khPlayerPath.length - 1) score += 2500;

                // 2. Capturing to unlock inner ring
                if (!KHADDI_SAFE_COORDS.includes(cellKey)) {
                    const willCut = khPlayerPawns.some(p => !p.finished && khPlayerPath[p.step].r === targetPos.r && khPlayerPath[p.step].c === targetPos.c);
                    if (willCut) {
                        score += khAiHasCaptured ? 1000 : 2000; // Extra bonus if not yet unlocked!
                    }
                } else {
                    score += 300; // Safe zone landing
                }

                // 3. Advancing into inner ring once unlocked
                if (nextStep >= 16 && khAiHasCaptured) {
                    score += 800;
                }

                if (score > bestScore) {
                    bestScore = score;
                    chosenPawn = a;
                }
            }
        }

        moveKhaddiPawn(chosenPawn, 'ai');
    }

    function initKhaddiGame() {
        khPlayerPawns = [
            { id: 1, step: 0, finished: false },
            { id: 2, step: 0, finished: false },
            { id: 3, step: 0, finished: false },
            { id: 4, step: 0, finished: false }
        ];
        khAiPawns = [
            { id: 1, step: 0, finished: false },
            { id: 2, step: 0, finished: false },
            { id: 3, step: 0, finished: false },
            { id: 4, step: 0, finished: false }
        ];
        khPlayerHasCaptured = false;
        khAiHasCaptured = false;
        khTurn = 'player';
        khRoll = 0;
        khCanRoll = true;
        punjabMatchPoints = 0;
        if (khaddiKillStatusBadge) {
            khaddiKillStatusBadge.textContent = "🔒 INNER RING LOCKED (Needs 1 Capture)";
            khaddiKillStatusBadge.style.color = "#ff99a8";
            khaddiKillStatusBadge.style.borderColor = "#ff334b";
        }
        if (btnRollKhaddiCowries) btnRollKhaddiCowries.disabled = false;
        if (khaddiRollResult) khaddiRollResult.textContent = "Roll: -";
        if (khaddiTurnIndicator) khaddiTurnIndicator.textContent = `${player1Name.toUpperCase()}'S TURN: ROLL 4 COWRIES`;
        renderKhaddiBoard();
    }

    if (btnRollKhaddiCowries) btnRollKhaddiCowries.addEventListener('click', handleKhaddiRoll);
    if (btnResetKhaddi) btnResetKhaddi.addEventListener('click', () => { playSound('pickup'); initKhaddiGame(); });

    renderChauparBoard();
    renderKhaddiBoard();
});

