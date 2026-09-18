/* ==========================================================================
   JAMMU & KASHMIR REGION & TRADITIONAL GAMES ENGINE (ZARABZERO & TURUF)
   Includes: Real-World Materials Pop-up, Pre-Game Lobby, AI Difficulty,
             Skippable Interactive Tutorial, Minimax / Card-Counting AI,
             Anti-Reneging Engine, Post-Mortem ML Logging Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // State identifier for this region
    const STATE = 'jammuKashmir';

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
        if (pts <= 0) return;
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
            if (pts >= 50) Sutradhar.onCapture(reason || 'Valley Triumph');
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
            id: 'JK-' + Date.now(),
            region: 'Jammu & Kashmir',
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
    const zarabGameScreen = document.getElementById('zarabGameScreen');
    const turufGameScreen = document.getElementById('turufGameScreen');

    const btnLaunchZarab = document.getElementById('btnLaunchZarab');
    const btnLaunchTuruf = document.getElementById('btnLaunchTuruf');
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

    let currentGameType = 'zarab';
    let currentMatchMode = 'ai';
    let currentAiDifficulty = 'medium';
    let player1Name = 'Climber 1';
    let player2Name = 'AI Climber';
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

        lobbyGameTitle.textContent = gameType === 'zarab' ? "Zarabzero Strategy" : "Turuf Card Game";
        lobbyGameSubtitle.textContent = gameType === 'zarab' ? "ज़राबज़ीरो • Match Mode & Difficulty" : "तुरुफ़ • Match Mode & Difficulty";

        setMatchMode('ai');
        setAiDifficulty('medium');
        lobbyModal.style.display = 'flex';
        if (typeof playSound === 'function') playSound('chime');
    }

    function closeLobbyModal() {
        if (lobbyModal) lobbyModal.style.display = 'none';
    }

    function setMatchMode(mode) {
        currentMatchMode = mode;
        if (mode === 'ai') {
            btnModeAI?.classList.add('active');
            btnModeFriend?.classList.remove('active');
            if (lobbyDiffSection) lobbyDiffSection.style.display = 'block';
            if (lobbyNamesSection) lobbyNamesSection.style.display = 'none';
            player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
        } else {
            btnModeFriend?.classList.add('active');
            btnModeAI?.classList.remove('active');
            if (lobbyDiffSection) lobbyDiffSection.style.display = 'none';
            if (lobbyNamesSection) lobbyNamesSection.style.display = 'block';
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
                player1Name = (inputPlayer1Name?.value.trim()) || 'Climber 1';
                player2Name = (inputPlayer2Name?.value.trim()) || 'Climber 2';
            } else {
                player1Name = (inputPlayer1Name?.value.trim()) || 'Climber 1';
                player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
            }

            closeLobbyModal();
            showScreen(currentGameType);

            matchStartTime = Date.now();
            matchMovesCount = 0;

            // Automated ML Training Hook: Pre-match heuristic tuning
            if (typeof BharathAdaptiveML !== 'undefined') {
                BharathAdaptiveML.executePreMatchTraining('jammuKashmir', currentGameType, currentAiDifficulty);
            }

            if (currentGameType === 'zarab') initZarabGame();
            else initTurufGame();

            if (typeof playSound === 'function') playSound('success');
        });
    }

    /* --------------------------------------------------------------------------
       Educational Data
       -------------------------------------------------------------------------- */
    const jkMaterialsData = {
        zarab: {
            badge: "HIMALAYAN CRAFTSMANSHIP",
            title: "Zarabzero Board (ज़राबज़ीरो)",
            sub: "कश्मीर घाटी हस्तकला",
            intro: "Zarabzero is an ancient mountain valley routing game played on walnut wood carved boards using polished river stones.",
            materials: [
                { icon: "🪵", name: "Walnut Wood Carved Board", sub: "अखरोट लकड़ी पट", desc: "Carved from dense Kashmir walnut wood with 25 valley grid intersections." },
                { icon: "🪨", name: "Polished Mountain Stones", sub: "पहाड़ी रोड़े", desc: "Smooth river pebbles collected from Lidder and Jhelum river beds." },
                { icon: "🧶", name: "Pashmina Drawstring Pouch", sub: "पश्मीना थैली", desc: "Hand-woven Pashmina wool pouch for storing game pieces." }
            ]
        },
        turuf: {
            badge: "MOUNTAIN TRICK-TAKING HERITAGE",
            title: "Turuf Cards (तुरुफ़)",
            sub: "तुरुफ़ कार्ड परंपरा",
            intro: "Turuf is a traditional trick-taking game played in Kashmir's mountain hearths during long winter nights.",
            materials: [
                { icon: "♠️", name: "Hukumat (Spades / Royal Trump)", sub: "हुकुमत रंग", desc: "The designated Trump suit that overrides all other suits in trick evaluation." },
                { icon: "🎴", name: "Traditional Deck Ranks", sub: "कार्ड श्रेणी", desc: "Includes King, Queen, Jack, 10, 9, 8, 7, and Ace rank cards." },
                { icon: "☕", name: "Kahwa Hearth Tradition", sub: "कहवा शीतकाल", desc: "Played around warm Kangri hearths while sipping traditional Kashmiri Kahwa." }
            ]
        }
    };

    function openMaterialsModal(gameType) {
        currentGameType = gameType;
        const data = jkMaterialsData[gameType];
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

    if (btnLaunchZarab) btnLaunchZarab.addEventListener('click', () => openMaterialsModal('zarab'));
    if (btnLaunchTuruf) btnLaunchTuruf.addEventListener('click', () => openMaterialsModal('turuf'));
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
    const jkTutorialSteps = {
        zarab: [
            { title: "Step 1: The 5x5 Valley Grid", content: "Zarabzero is played on a 5x5 grid. You command 5 Purple mountain counters at the bottom row." },
            { title: "Step 2: Mountain Routing & Jumps", content: "Move 1 step orthogonally/diagonally to adjacent empty nodes, OR jump over an adjacent enemy piece to capture it (+300 PTS)!" },
            { title: "Step 3: Summit Control & Defense", content: "Controlling the central summit node (r=2, c=2) grants supreme mobility across all quadrant paths." },
            { title: "Step 4: Summit Victory", content: "Reach the enemy starting base row or eliminate all enemy counters to achieve victory (+1500 PTS)!" }
        ],
        turuf: [
            { title: "Step 1: Royal Trump Suit (Hukumat ♠️)", content: "Spades ♠️ is the supreme Hukumat (Trump) suit. A trump card beats any non-trump card regardless of rank!" },
            { title: "Step 2: Strict Anti-Reneging Rule", content: "You MUST follow the suit led if you hold it in your hand. You may only play a trump or off-suit card if you are void in the lead suit!" },
            { title: "Step 3: Card Hierarchy & Trick Wins", content: "Card ranks: Ace > King > Queen > Jack > 10 > 9 > 8 > 7. Win each trick to capture points (+250 PTS)!" },
            { title: "Step 4: Himalayan Championship", content: "Win the majority of 6 tricks to claim the Himalayan Turuf Championship (+1500 PTS)!" }
        ]
    };

    function showScreen(screen) {
        if (regionBriefingCard) regionBriefingCard.style.display = 'none';
        if (zarabGameScreen) zarabGameScreen.style.display = 'none';
        if (turufGameScreen) turufGameScreen.style.display = 'none';
        if (victoryModal) victoryModal.style.display = 'none';
        closeTutorial();

        if (screen === 'briefing' && regionBriefingCard) regionBriefingCard.style.display = 'flex';
        else if (screen === 'zarab' && zarabGameScreen) zarabGameScreen.style.display = 'flex';
        else if (screen === 'turuf' && turufGameScreen) turufGameScreen.style.display = 'flex';
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
        const steps = jkTutorialSteps[currentGameType];
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
            const steps = jkTutorialSteps[currentGameType];
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

    document.getElementById('btnZarabTutorial')?.addEventListener('click', () => startInteractiveTutorial('zarab'));
    document.getElementById('btnTurufTutorial')?.addEventListener('click', () => startInteractiveTutorial('turuf'));

    /* ==========================================================================
       1. GAME 1: ZARABZERO (5x5 Mountain Strategy Game)
       ========================================================================== */
    const zarabGridEl = document.getElementById('zarabGrid');
    const zarabStatusEl = document.getElementById('zarabStatus');
    const zarabAiBadgeEl = document.getElementById('zarabAiBadge');

    let zarabBoard = Array(25).fill(null);
    let zarabTurn = 'p1'; // 'p1' (Purple) or 'p2' (Silver/AI)
    let selectedZarabNode = null;
    let zarabGameOver = false;

    function initZarabGame() {
        zarabBoard = Array(25).fill(null);
        // P1 Purple pawns at bottom row (20..24)
        for (let i = 20; i < 25; i++) zarabBoard[i] = 'p1';
        // P2 Silver pawns at top row (0..4)
        for (let i = 0; i < 5; i++) zarabBoard[i] = 'p2';

        zarabTurn = 'p1';
        selectedZarabNode = null;
        zarabGameOver = false;
        matchStartTime = Date.now();
        matchMovesCount = 0;

        if (zarabAiBadgeEl) {
            zarabAiBadgeEl.textContent = `${currentMatchMode === 'ai' ? `AI (${currentAiDifficulty.toUpperCase()})` : 'FRIEND'}`;
        }
        renderZarabBoard();
    }

    function isZarabAdjacent(n1, n2) {
        const r1 = Math.floor(n1 / 5), c1 = n1 % 5;
        const r2 = Math.floor(n2 / 5), c2 = n2 % 5;
        return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
    }

    // Get all legal moves for a piece or player
    function getZarabMoves(board, player) {
        const moves = [];
        const opponent = player === 'p1' ? 'p2' : 'p1';

        for (let from = 0; from < 25; from++) {
            if (board[from] !== player) continue;
            const r1 = Math.floor(from / 5), c1 = from % 5;

            // 1. Step moves (adjacent empty cells)
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r1 + dr, nc = c1 + dc;
                    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
                        const to = nr * 5 + nc;
                        if (board[to] === null) {
                            moves.push({ from, to, isJump: false, captured: null });
                        }
                    }
                }
            }

            // 2. Jumping captures over opponent
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const midR = r1 + dr, midC = c1 + dc;
                    const landR = r1 + dr * 2, landC = c1 + dc * 2;
                    if (landR >= 0 && landR < 5 && landC >= 0 && landC < 5) {
                        const midIdx = midR * 5 + midC;
                        const landIdx = landR * 5 + landC;
                        if (board[midIdx] === opponent && board[landIdx] === null) {
                            moves.push({ from, to: landIdx, isJump: true, captured: midIdx });
                        }
                    }
                }
            }
        }
        return moves;
    }

    function renderZarabBoard() {
        if (!zarabGridEl) return;
        zarabGridEl.innerHTML = '';

        const validDestinations = [];
        if (selectedZarabNode !== null) {
            const allMoves = getZarabMoves(zarabBoard, zarabTurn);
            allMoves.filter(m => m.from === selectedZarabNode).forEach(m => validDestinations.push(m.to));
        }

        for (let i = 0; i < 25; i++) {
            const node = document.createElement('div');
            node.className = 'zarab-node';
            if (selectedZarabNode === i) node.classList.add('selected');
            if (validDestinations.includes(i)) node.style.boxShadow = '0 0 12px #00e5ff';

            // Mark center summit
            if (i === 12) {
                node.style.borderColor = '#ffd700';
            }

            if (zarabBoard[i] === 'p1') {
                node.innerHTML = `🟣`;
                node.title = `${player1Name} Counter`;
            } else if (zarabBoard[i] === 'p2') {
                node.innerHTML = `⚪`;
                node.title = `${player2Name} Counter`;
            }

            node.addEventListener('click', () => handleZarabNodeClick(i));
            zarabGridEl.appendChild(node);
        }

        if (!zarabGameOver) {
            const activeName = zarabTurn === 'p1' ? player1Name : player2Name;
            zarabStatusEl.textContent = `${activeName.toUpperCase()}'S TURN: SELECT COUNTER TO MOVE / JUMP`;
        }
    }

    function handleZarabNodeClick(index) {
        if (zarabGameOver) return;
        if (zarabTurn === 'p2' && currentMatchMode === 'ai') return; // Wait for AI

        if (selectedZarabNode === null) {
            if (zarabBoard[index] === zarabTurn) {
                selectedZarabNode = index;
                renderZarabBoard();
            }
        } else {
            if (selectedZarabNode === index) {
                selectedZarabNode = null;
                renderZarabBoard();
            } else if (zarabBoard[index] === zarabTurn) {
                selectedZarabNode = index;
                renderZarabBoard();
            } else {
                const moves = getZarabMoves(zarabBoard, zarabTurn).filter(m => m.from === selectedZarabNode && m.to === index);
                if (moves.length > 0) {
                    executeZarabMove(moves[0]);
                }
            }
        }
    }

    function executeZarabMove(move) {
        zarabBoard[move.to] = zarabTurn;
        zarabBoard[move.from] = null;
        if (move.isJump && move.captured !== null) {
            zarabBoard[move.captured] = null;
            if (typeof playSound === 'function') playSound('chime');
            if (zarabTurn === 'p1') {
                addPlayerPoints(300, 'Zarabzero Mountain Jump Capture');
            }
        } else {
            if (typeof playSound === 'function') playSound('pickup');
        }

        selectedZarabNode = null;
        matchMovesCount++;

        const isWin = checkZarabWin();
        if (isWin) return;

        zarabTurn = zarabTurn === 'p1' ? 'p2' : 'p1';
        renderZarabBoard();

        if (zarabTurn === 'p2' && currentMatchMode === 'ai' && !zarabGameOver) {
            setTimeout(handleAiZarabTurn, 600);
        }
    }

    function handleAiZarabTurn() {
        if (zarabGameOver || zarabTurn !== 'p2') return;
        const moves = getZarabMoves(zarabBoard, 'p2');
        if (moves.length === 0) {
            // AI has no moves, P1 wins!
            handleZarabWinResult('p1', 'AI was completely immobilized!');
            return;
        }

        let chosenMove = null;
        if (currentAiDifficulty === 'easy') {
            chosenMove = moves[Math.floor(Math.random() * moves.length)];
        } else if (currentAiDifficulty === 'medium') {
            // Medium AI: prioritize jumps/captures, then advances towards row 4, then center
            const jumps = moves.filter(m => m.isJump);
            if (jumps.length > 0) {
                chosenMove = jumps[Math.floor(Math.random() * jumps.length)];
            } else {
                // Sort by row advance (closer to row 4)
                moves.sort((a, b) => Math.floor(b.to / 5) - Math.floor(a.to / 5));
                chosenMove = moves[0];
            }
        } else {
            // Hard AI: Minimax 3-ply lookahead with alpha-beta search
            chosenMove = getBestZarabMoveMinimax(zarabBoard, 3);
            if (!chosenMove) chosenMove = moves[0];
        }

        executeZarabMove(chosenMove);
    }

    function evaluateZarabBoard(board) {
        let p1Score = 0;
        let p2Score = 0;

        for (let i = 0; i < 25; i++) {
            const piece = board[i];
            if (!piece) continue;
            const r = Math.floor(i / 5), c = i % 5;
            if (piece === 'p1') {
                p1Score += 100;
                // Distance to row 0
                p1Score += (4 - r) * 20;
                // Center control
                if (i === 12) p1Score += 35;
            } else {
                p2Score += 100;
                // Distance to row 4
                p2Score += r * 20;
                // Center control
                if (i === 12) p2Score += 35;
            }
        }
        return p2Score - p1Score; // AI perspective
    }

    function getBestZarabMoveMinimax(board, depth) {
        const moves = getZarabMoves(board, 'p2');
        if (moves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMove = moves[0];

        for (const move of moves) {
            // Apply move
            const nextBoard = [...board];
            nextBoard[move.to] = 'p2';
            nextBoard[move.from] = null;
            if (move.isJump && move.captured !== null) nextBoard[move.captured] = null;

            const score = minimaxZarab(nextBoard, depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    function minimaxZarab(board, depth, alpha, beta, isMaximizing) {
        // Terminal check
        const p1Count = board.filter(p => p === 'p1').length;
        const p2Count = board.filter(p => p === 'p2').length;
        const p1Reached = [0, 1, 2, 3, 4].some(i => board[i] === 'p1');
        const p2Reached = [20, 21, 22, 23, 24].some(i => board[i] === 'p2');

        if (p2Reached || p1Count === 0) return 10000 + depth;
        if (p1Reached || p2Count === 0) return -10000 - depth;
        if (depth === 0) return evaluateZarabBoard(board);

        if (isMaximizing) {
            let maxEval = -Infinity;
            const moves = getZarabMoves(board, 'p2');
            if (moves.length === 0) return -5000;
            for (const move of moves) {
                const nextBoard = [...board];
                nextBoard[move.to] = 'p2';
                nextBoard[move.from] = null;
                if (move.isJump && move.captured !== null) nextBoard[move.captured] = null;
                const evalVal = minimaxZarab(nextBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalVal);
                alpha = Math.max(alpha, evalVal);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            const moves = getZarabMoves(board, 'p1');
            if (moves.length === 0) return 5000;
            for (const move of moves) {
                const nextBoard = [...board];
                nextBoard[move.to] = 'p1';
                nextBoard[move.from] = null;
                if (move.isJump && move.captured !== null) nextBoard[move.captured] = null;
                const evalVal = minimaxZarab(nextBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalVal);
                beta = Math.min(beta, evalVal);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function checkZarabWin() {
        const p1Count = zarabBoard.filter(p => p === 'p1').length;
        const p2Count = zarabBoard.filter(p => p === 'p2').length;
        const p1HomeReached = [0, 1, 2, 3, 4].some(i => zarabBoard[i] === 'p1');
        const p2HomeReached = [20, 21, 22, 23, 24].some(i => zarabBoard[i] === 'p2');

        if (p1HomeReached || p2Count === 0) {
            handleZarabWinResult('p1', p1HomeReached ? 'Reached the enemy summit base row!' : 'Eliminated all enemy mountain counters!');
            return true;
        } else if (p2HomeReached || p1Count === 0) {
            handleZarabWinResult('p2', p2HomeReached ? `${player2Name} reached base row!` : `${player2Name} eliminated all counters!`);
            return true;
        }
        return false;
    }

    function handleZarabWinResult(winner, reason) {
        zarabGameOver = true;
        const duration = Math.round((Date.now() - matchStartTime) / 1000);

        if (winner === 'p1') {
            const bounty = 1500;
            addPlayerPoints(bounty, 'Zarabzero Himalayan Conqueror');
            logPostMortem('Zarabzero', player1Name, duration, matchMovesCount, 95);
            openVictoryModal(`${player1Name.toUpperCase()} CONQUERED ZARABZERO!`, reason, bounty);
        } else {
            logPostMortem('Zarabzero', player2Name, duration, matchMovesCount, 78);
            zarabStatusEl.textContent = `${player2Name} won Zarabzero! (${reason})`;
        }
    }

    document.getElementById('btnResetZarab')?.addEventListener('click', initZarabGame);

    /* ==========================================================================
       2. GAME 2: TURUF (Himalayan Trump Suit Trick Game)
       ========================================================================== */
    const playerTurufHandEl = document.getElementById('playerTurufHand');
    const turufArenaEl = document.getElementById('turufArena');
    const turufStatusEl = document.getElementById('turufStatus');
    const turufAiBadgeEl = document.getElementById('turufAiBadge');

    let pTurufHand = [];
    let aiTurufHand = [];
    let turufCurrentTrick = [];
    let pTurufTricksWon = 0;
    let aiTurufTricksWon = 0;
    let turufLeadSuit = null;
    let turufLeader = 'p1'; // 'p1' (Player) or 'p2' (AI/Friend)
    let turufPlayedHistory = []; // Card counting memory for AI
    let turufGameOver = false;

    const TURUF_SUITS = [
        { name: 'Hukumat (Spades)', symbol: '♠️', isRed: false },
        { name: 'Lal (Hearts)', symbol: '♥️', isRed: true },
        { name: 'Eek (Diamonds)', symbol: '♦️', isRed: true },
        { name: 'Chiri (Clubs)', symbol: '♣️', isRed: false }
    ];

    function createTurufDeck() {
        const deck = [];
        TURUF_SUITS.forEach(s => {
            // 8 ranks per suit: 7, 8, 9, 10, J(11), Q(12), K(13), A(14)
            for (let v = 7; v <= 14; v++) {
                let label = `${v}`;
                if (v === 11) label = 'J';
                if (v === 12) label = 'Q';
                if (v === 13) label = 'K';
                if (v === 14) label = 'A';
                deck.push({ suit: s.symbol, name: s.name, isRed: s.isRed, rank: v, label });
            }
        });
        return deck.sort(() => Math.random() - 0.5);
    }

    function initTurufGame() {
        const deck = createTurufDeck();
        pTurufHand = deck.slice(0, 6);
        aiTurufHand = deck.slice(6, 12);
        turufCurrentTrick = [];
        turufPlayedHistory = [];
        pTurufTricksWon = 0;
        aiTurufTricksWon = 0;
        turufLeadSuit = null;
        turufLeader = 'p1';
        turufGameOver = false;
        matchStartTime = Date.now();
        matchMovesCount = 0;

        // Sort hands by suit and rank for clean display
        sortTurufHand(pTurufHand);
        sortTurufHand(aiTurufHand);

        if (turufAiBadgeEl) {
            turufAiBadgeEl.textContent = `${currentMatchMode === 'ai' ? `AI (${currentAiDifficulty.toUpperCase()})` : 'FRIEND'}`;
        }
        renderTurufUI();
    }

    function sortTurufHand(hand) {
        hand.sort((a, b) => {
            if (a.suit === b.suit) return b.rank - a.rank;
            return a.suit.localeCompare(b.suit);
        });
    }

    function isCardPlayable(card, hand, leadSuit) {
        if (!leadSuit) return true; // Leading card can be anything
        const hasLeadSuit = hand.some(c => c.suit === leadSuit);
        if (hasLeadSuit) {
            return card.suit === leadSuit; // Anti-reneging enforcement
        }
        return true; // May play any card if void in lead suit
    }

    function renderTurufUI() {
        if (!playerTurufHandEl || !turufArenaEl) return;
        playerTurufHandEl.innerHTML = '';
        turufArenaEl.innerHTML = '';

        pTurufHand.forEach((card, idx) => {
            const isLegal = isCardPlayable(card, pTurufHand, turufLeadSuit);
            const cardEl = document.createElement('div');
            cardEl.className = `turuf-card ${card.isRed ? 'red-suit' : ''}`;
            if (!isLegal && turufCurrentTrick.length === 1 && turufLeader === 'p2') {
                cardEl.style.opacity = '0.4';
                cardEl.style.cursor = 'not-allowed';
                cardEl.title = `Must follow lead suit: ${turufLeadSuit}`;
            }

            cardEl.innerHTML = `<div class="t-card-val">${card.label}</div><div class="t-card-suit">${card.suit}</div>`;
            cardEl.addEventListener('click', () => handlePlayerCardClick(idx));
            playerTurufHandEl.appendChild(cardEl);
        });

        turufCurrentTrick.forEach(play => {
            const cEl = document.createElement('div');
            cEl.className = `turuf-card ${play.card.isRed ? 'red-suit' : ''}`;
            cEl.innerHTML = `<div style="font-size: 0.65rem; color: #ffd700; margin-bottom: 2px;">${play.player}</div><div class="t-card-val">${play.card.label}</div><div class="t-card-suit">${play.card.suit}</div>`;
            turufArenaEl.appendChild(cEl);
        });

        if (!turufGameOver) {
            const leadText = turufLeadSuit ? ` | Lead Suit: ${turufLeadSuit}` : '';
            turufStatusEl.textContent = `Trump: ♠️ Hukumat${leadText} | Tricks Won: ${player1Name}: ${pTurufTricksWon} / ${player2Name}: ${aiTurufTricksWon}`;
        }
    }

    async function handlePlayerCardClick(index) {
        if (turufGameOver || turufCurrentTrick.length >= 2) return;
        const card = pTurufHand[index];

        // Validate Anti-Reneging
        if (!isCardPlayable(card, pTurufHand, turufLeadSuit)) {
            showScoreToast(`Anti-Reneging: You must follow suit ${turufLeadSuit}!`);
            if (typeof playSound === 'function') playSound('pickup');
            return;
        }

        // Play card
        pTurufHand.splice(index, 1);
        if (!turufLeadSuit) turufLeadSuit = card.suit;
        turufCurrentTrick.push({ player: player1Name, card, side: 'p1' });
        turufPlayedHistory.push(card);
        matchMovesCount++;
        if (typeof playSound === 'function') playSound('pickup');
        renderTurufUI();

        if (turufCurrentTrick.length === 1) {
            // AI's turn to respond
            turufStatusEl.textContent = `${player2Name} evaluating strategy...`;
            await new Promise(r => setTimeout(r, 650));
            playAiTurufCard();
        } else {
            // Resolve trick
            setTimeout(resolveTurufTrick, 800);
        }
    }

    function playAiTurufCard() {
        if (aiTurufHand.length === 0 || turufGameOver) return;

        let cardIndex = 0;
        const leadSuit = turufLeadSuit;
        const legalIndices = [];

        aiTurufHand.forEach((c, idx) => {
            if (isCardPlayable(c, aiTurufHand, leadSuit)) {
                legalIndices.push(idx);
            }
        });

        if (currentAiDifficulty === 'easy') {
            // Random legal card
            cardIndex = legalIndices[Math.floor(Math.random() * legalIndices.length)];
        } else if (currentAiDifficulty === 'medium') {
            // Medium AI: if following, try to win cheaply; if leading, lead high non-trump
            cardIndex = chooseMediumAiCard(aiTurufHand, legalIndices, turufCurrentTrick, leadSuit);
        } else {
            // Hard AI: Card-counting, finesse, trump preservation
            cardIndex = chooseHardAiCard(aiTurufHand, legalIndices, turufCurrentTrick, leadSuit, turufPlayedHistory);
        }

        const card = aiTurufHand.splice(cardIndex, 1)[0];
        if (!turufLeadSuit) turufLeadSuit = card.suit;
        turufCurrentTrick.push({ player: player2Name, card, side: 'p2' });
        turufPlayedHistory.push(card);
        if (typeof playSound === 'function') playSound('pickup');
        renderTurufUI();

        if (turufCurrentTrick.length === 2) {
            setTimeout(resolveTurufTrick, 800);
        } else {
            // AI led first, player now plays
            renderTurufUI();
            turufStatusEl.textContent = `${player2Name} led ${card.suit} ${card.label}. Your turn to follow suit!`;
        }
    }

    function chooseMediumAiCard(hand, legalIndices, currentTrick, leadSuit) {
        if (currentTrick.length === 0) {
            // Leading: prefer high non-trump, then highest trump
            let bestIdx = legalIndices[0];
            let bestRank = -1;
            for (let idx of legalIndices) {
                const c = hand[idx];
                if (c.suit !== '♠️' && c.rank > bestRank) {
                    bestRank = c.rank;
                    bestIdx = idx;
                }
            }
            return bestIdx;
        }

        // Following:
        const opponentCard = currentTrick[0].card;
        const winningIndices = legalIndices.filter(idx => canCardBeat(hand[idx], opponentCard, leadSuit));

        if (winningIndices.length > 0) {
            // Win with the lowest winning card
            winningIndices.sort((a, b) => hand[a].rank - hand[b].rank);
            return winningIndices[0];
        } else {
            // Cannot win: discard lowest card
            legalIndices.sort((a, b) => hand[a].rank - hand[b].rank);
            return legalIndices[0];
        }
    }

    function chooseHardAiCard(hand, legalIndices, currentTrick, leadSuit, history) {
        // Hard AI with full memory tracking
        if (currentTrick.length === 0) {
            // Leading:
            // 1. If we have high cards (Ace/King) of a suit where trump is known to be drained or we hold trumps, lead high
            const nonTrumps = legalIndices.filter(idx => hand[idx].suit !== '♠️');
            if (nonTrumps.length > 0) {
                nonTrumps.sort((a, b) => hand[b].rank - hand[a].rank);
                return nonTrumps[0];
            }
            // Lead lowest trump to draw out player's trump
            const trumps = legalIndices.filter(idx => hand[idx].suit === '♠️');
            trumps.sort((a, b) => hand[a].rank - hand[b].rank);
            return trumps[0];
        }

        // Following:
        const opponentCard = currentTrick[0].card;
        const winningIndices = legalIndices.filter(idx => canCardBeat(hand[idx], opponentCard, leadSuit));

        if (winningIndices.length > 0) {
            // Win as cheaply as possible
            // If winning with a Trump on a non-trump trick, use lowest trump
            winningIndices.sort((a, b) => {
                const isATrump = hand[a].suit === '♠️' ? 1 : 0;
                const isBTrump = hand[b].suit === '♠️' ? 1 : 0;
                if (isATrump !== isBTrump) return isATrump - isBTrump; // Non-trump win preferred over trump
                return hand[a].rank - hand[b].rank;
            });
            return winningIndices[0];
        } else {
            // Discard lowest useless non-trump card first
            legalIndices.sort((a, b) => {
                const isATrump = hand[a].suit === '♠️' ? 1 : 0;
                const isBTrump = hand[b].suit === '♠️' ? 1 : 0;
                if (isATrump !== isBTrump) return isATrump - isBTrump; // Dump non-trumps first
                return hand[a].rank - hand[b].rank;
            });
            return legalIndices[0];
        }
    }

    function canCardBeat(candidate, base, leadSuit) {
        // Trump (♠️) beats non-trump
        if (candidate.suit === '♠️' && base.suit !== '♠️') return true;
        if (base.suit === '♠️' && candidate.suit !== '♠️') return false;
        // Same suit: higher rank wins
        if (candidate.suit === base.suit) return candidate.rank > base.rank;
        // Off-suit non-trump cannot beat lead suit
        if (candidate.suit !== leadSuit && base.suit === leadSuit) return false;
        return false;
    }

    function resolveTurufTrick() {
        if (turufCurrentTrick.length < 2) return;
        const [c1, c2] = turufCurrentTrick;
        let trickWinner = c1;

        // Evaluate winner
        if (c2.card.suit === '♠️' && c1.card.suit !== '♠️') {
            trickWinner = c2;
        } else if (c1.card.suit === '♠️' && c2.card.suit !== '♠️') {
            trickWinner = c1;
        } else if (c1.card.suit === c2.card.suit) {
            trickWinner = c2.card.rank > c1.card.rank ? c2 : c1;
        } else {
            // c2 played off-suit non-trump; c1 wins
            trickWinner = c1;
        }

        const isPlayerWin = trickWinner.side === 'p1';
        if (isPlayerWin) {
            pTurufTricksWon++;
            addPlayerPoints(250, 'Captured Turuf Trick');
            turufLeader = 'p1';
        } else {
            aiTurufTricksWon++;
            turufLeader = 'p2';
        }

        turufCurrentTrick = [];
        turufLeadSuit = null;

        if (pTurufHand.length === 0) {
            // All 6 tricks complete
            turufGameOver = true;
            const duration = Math.round((Date.now() - matchStartTime) / 1000);

            if (pTurufTricksWon > aiTurufTricksWon) {
                const bounty = 1500;
                addPlayerPoints(bounty, 'Turuf Himalayan Champion');
                logPostMortem('Turuf', player1Name, duration, matchMovesCount, 92);
                openVictoryModal(`${player1Name.toUpperCase()} IS TURUF CHAMPION!`, `Won ${pTurufTricksWon} out of 6 tricks!`, bounty);
            } else if (pTurufTricksWon === aiTurufTricksWon) {
                const bounty = 500;
                addPlayerPoints(bounty, 'Turuf Stalemate Split');
                logPostMortem('Turuf', 'Draw', duration, matchMovesCount, 85);
                openVictoryModal(`HONORABLE DRAW IN TURUF!`, `Both sides won 3 tricks each.`, bounty);
            } else {
                logPostMortem('Turuf', player2Name, duration, matchMovesCount, 75);
                turufStatusEl.textContent = `${player2Name} won Turuf (${aiTurufTricksWon} - ${pTurufTricksWon})!`;
            }
        } else {
            renderTurufUI();
            if (turufLeader === 'p2' && currentMatchMode === 'ai') {
                turufStatusEl.textContent = `${player2Name} won trick and is leading next...`;
                setTimeout(playAiTurufCard, 700);
            }
        }
    }

    document.getElementById('btnResetTuruf')?.addEventListener('click', initTurufGame);

});
