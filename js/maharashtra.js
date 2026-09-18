/* ==========================================================================
   MAHARASHTRA REGION & TRADITIONAL GAMES ENGINE (CHATURANGA & TAABLA)
   Includes: Real-World Materials Pop-up, Pre-Game Lobby, AI Difficulty,
             Skippable Interactive Tutorial, Post-Mortem ML Logging Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // State identifier for this region
    const STATE = 'maharashtra';

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
            if (pts >= 50) Sutradhar.onCapture(reason || 'Sahyadri Tactics');
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
            id: 'MH-' + Date.now(),
            region: 'Maharashtra',
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
    const chaturangaGameScreen = document.getElementById('chaturangaGameScreen');
    const taablaGameScreen = document.getElementById('taablaGameScreen');

    const btnLaunchChaturanga = document.getElementById('btnLaunchChaturanga');
    const btnLaunchTaabla = document.getElementById('btnLaunchTaabla');
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

    let currentGameType = 'chaturanga';
    let currentMatchMode = 'ai';
    let currentAiDifficulty = 'easy';
    let player1Name = 'Commander 1';
    let player2Name = 'AI General';
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

        lobbyGameTitle.textContent = gameType === 'chaturanga' ? "Chaturanga (Ancient Chess)" : "Taabla (Mill Game)";
        lobbyGameSubtitle.textContent = gameType === 'chaturanga' ? "चतुरंग • Match Mode & AI Difficulty" : "ताब्ला • Match Mode & AI Difficulty";

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
                player1Name = (inputPlayer1Name.value.trim()) || 'Commander 1';
                player2Name = (inputPlayer2Name.value.trim()) || 'Commander 2';
            } else {
                player1Name = (inputPlayer1Name.value.trim()) || 'Commander 1';
                player2Name = `AI (${currentAiDifficulty.toUpperCase()})`;
            }

            closeLobbyModal();
            showScreen(currentGameType);

            matchStartTime = Date.now();
            matchMovesCount = 0;

            // Automated ML Training Hook: Pre-match heuristic tuning
            if (typeof BharathAdaptiveML !== 'undefined') {
                BharathAdaptiveML.executePreMatchTraining('maharashtra', currentGameType, currentAiDifficulty);
            }

            if (currentGameType === 'chaturanga') initChaturangaGame();
            else initTaablaGame();

            if (typeof playSound === 'function') playSound('success');
        });
    }

    /* --------------------------------------------------------------------------
       Educational Data
       -------------------------------------------------------------------------- */
    const maharashtraMaterialsData = {
        chaturanga: {
            badge: "EPIC MILITARY HERITAGE",
            title: "Chaturanga (चतुरंग)",
            sub: "चतुरंग - चतुरंगी सैन्य व्यवस्था",
            intro: "Chaturanga represents the 4-fold division of ancient Indian armies: Infantry, Cavalry, Elephants, and Chariots. Documented in the Mahabharata and Manasollasa.",
            materials: [
                { icon: "🐘", name: "Leaping Elephants (Gaja)", sub: "हत्ती दल", desc: "Elephants move 2 squares diagonally, leaping over any intervening piece on the Ashtapada grid." },
                { icon: "📜", name: "Counselor (Mantri)", sub: "मंत्री दल", desc: "The wise advisor moves 1 square diagonally to direct army formations." },
                { icon: "🪵", name: "Uncheckered Ashtapada Board", sub: "अष्टपद पट", desc: "Crafted from teakwood or stone with an 8x8 uncheckered grid." }
            ]
        },
        taabla: {
            badge: "MARATHA VILLAGE CRAFTSMANSHIP",
            title: "Taabla (ताब्ला)",
            sub: "ताब्ला - पारंपारिक चौकटी खेळ",
            intro: "Taabla is played on concentric square boards etched into village stone verandas or carved in teakwood.",
            materials: [
                { icon: "🪵", name: "Teakwood Concentric Grid", sub: "लाकडी पट", desc: "3 nested squares with 24 intersection points connected by orthogonal lines." },
                { icon: "⚪", name: "9 White & Red Markers", sub: "गोट्या", desc: "Polished river pebbles or brass tokens representing opposing forces." },
                { icon: "⚡", name: "Mill Capture Rule", sub: "ताब्ला जुळवणी", desc: "Aligning 3 pieces in a row creates a Mill, granting the right to capture an enemy piece." }
            ]
        }
    };

    function openMaterialsModal(gameType) {
        currentGameType = gameType;
        const data = maharashtraMaterialsData[gameType];
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

    if (btnLaunchChaturanga) btnLaunchChaturanga.addEventListener('click', () => openMaterialsModal('chaturanga'));
    if (btnLaunchTaabla) btnLaunchTaabla.addEventListener('click', () => openMaterialsModal('taabla'));
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
    const maharashtraTutorialSteps = {
        chaturanga: [
            { title: "Step 1: The Ashtapada 8x8 Board", content: "Chaturanga is played on an 8x8 grid. You command the Gold Army at the bottom row." },
            { title: "Step 2: Elephant Leaping Power (🐘)", content: "The Elephant (Gaja) moves exactly 2 squares diagonally, leaping over any piece in its path!" },
            { title: "Step 3: Army Ranks", content: "Raja (King), Mantri (Counselor), Ratha (Chariot), Ashwa (Horse), and Padati (Foot Soldiers) battle for supremacy." },
            { title: "Step 4: Checkmate Victory", content: "Checkmate the enemy Raja to win the match (+1500 PTS)!" }
        ],
        taabla: [
            { title: "Step 1: Placement Phase", content: "Players take turns placing 9 pieces onto the 24 node intersections." },
            { title: "Step 2: Forming a Mill (3-in-a-Row)", content: "Aligning 3 of your pieces along a grid line forms a Mill! (+300 PTS)" },
            { title: "Step 3: Capture Enemy Piece", content: "Forming a Mill allows you to immediately remove one opponent piece from the board." },
            { title: "Step 4: Victory Condition", content: "Reduce the opponent to fewer than 3 pieces to win the match (+1500 PTS)!" }
        ]
    };

    function showScreen(screen) {
        if (regionBriefingCard) regionBriefingCard.style.display = 'none';
        if (chaturangaGameScreen) chaturangaGameScreen.style.display = 'none';
        if (taablaGameScreen) taablaGameScreen.style.display = 'none';
        if (victoryModal) victoryModal.style.display = 'none';
        closeTutorial();

        if (screen === 'briefing' && regionBriefingCard) regionBriefingCard.style.display = 'flex';
        else if (screen === 'chaturanga' && chaturangaGameScreen) chaturangaGameScreen.style.display = 'flex';
        else if (screen === 'taabla' && taablaGameScreen) taablaGameScreen.style.display = 'flex';
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
        const steps = maharashtraTutorialSteps[currentGameType];
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
            const steps = maharashtraTutorialSteps[currentGameType];
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

    document.getElementById('btnChaturangaTutorial')?.addEventListener('click', () => startInteractiveTutorial('chaturanga'));
    document.getElementById('btnTaablaTutorial')?.addEventListener('click', () => startInteractiveTutorial('taabla'));

    /* ==========================================================================
       1. GAME 1: CHATURANGA (8x8 Ancient Precursor to Chess)
       ========================================================================== */
    const chaturangaBoardEl = document.getElementById('chaturangaBoard');
    const chaturangaStatusEl = document.getElementById('chaturangaStatus');
    const chaturangaAiBadgeEl = document.getElementById('chaturangaAiBadge');

    let chBoard = Array(64).fill(null);
    let chTurn = 'w'; // 'w' = Player 1 (Gold/White), 'b' = Player 2 / AI (Dark)
    let selectedChSquare = null;
    let chValidMovesForSelected = [];

    const CH_PIECES = {
        'wR': '♚', 'wM': '📜', 'wE': '🐘', 'wH': '🐴', 'wC': '🏹', 'wP': '⚔️',
        'bR': '🏿♚', 'bM': '🏿📜', 'bE': '🏿🐘', 'bH': '🏿🐴', 'bC': '🏿🏹', 'bP': '🏿⚔️'
    };

    const PIECE_VALUES = {
        'P': 100, 'M': 200, 'E': 250, 'H': 320, 'C': 500, 'R': 10000
    };

    function initChaturangaGame() {
        chBoard = Array(64).fill(null);
        // Black pieces (top row 0..7)
        chBoard[0] = 'bC'; chBoard[1] = 'bH'; chBoard[2] = 'bE'; chBoard[3] = 'bM';
        chBoard[4] = 'bR'; chBoard[5] = 'bE'; chBoard[6] = 'bH'; chBoard[7] = 'bC';
        for (let i = 8; i < 16; i++) chBoard[i] = 'bP';

        // White pieces (bottom row 56..63)
        chBoard[56] = 'wC'; chBoard[57] = 'wH'; chBoard[58] = 'wE'; chBoard[59] = 'wM';
        chBoard[60] = 'wR'; chBoard[61] = 'wE'; chBoard[62] = 'wH'; chBoard[63] = 'wC';
        for (let i = 48; i < 56; i++) chBoard[i] = 'wP';

        chTurn = 'w';
        selectedChSquare = null;
        chValidMovesForSelected = [];

        if (chaturangaAiBadgeEl) chaturangaAiBadgeEl.textContent = `${currentMatchMode === 'ai' ? `AI (${currentAiDifficulty.toUpperCase()})` : 'FRIEND'}`;
        renderChaturangaBoard();
    }

    function getAncientLegalMoves(board, index, color) {
        const piece = board[index];
        if (!piece || !piece.startsWith(color)) return [];

        const type = piece.charAt(1);
        const r = Math.floor(index / 8), c = index % 8;
        const moves = [];

        const addMoveIfValid = (nr, nc) => {
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const targetIdx = nr * 8 + nc;
                const targetPiece = board[targetIdx];
                if (!targetPiece || !targetPiece.startsWith(color)) {
                    moves.push(targetIdx);
                }
            }
        };

        if (type === 'P') { // Padati (Infantry / Pawn)
            const forwardDir = color === 'w' ? -1 : 1;
            // 1-step forward move (must be empty)
            const fr = r + forwardDir, fc = c;
            if (fr >= 0 && fr < 8 && !board[fr * 8 + fc]) {
                moves.push(fr * 8 + fc);
            }
            // Diagonal forward capture (must contain enemy piece)
            for (let dc of [-1, 1]) {
                const cr = r + forwardDir, cc = c + dc;
                if (cr >= 0 && cr < 8 && cc >= 0 && cc < 8) {
                    const target = board[cr * 8 + cc];
                    if (target && !target.startsWith(color)) {
                        moves.push(cr * 8 + cc);
                    }
                }
            }
        } else if (type === 'H') { // Ashwa (Cavalry / Knight) - L shaped jump
            const knightOffsets = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (let [dr, dc] of knightOffsets) addMoveIfValid(r + dr, c + dc);
        } else if (type === 'E') { // Gaja (Elephant) - Exactly 2 squares diagonally, jumping over pieces
            const elephantOffsets = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
            for (let [dr, dc] of elephantOffsets) addMoveIfValid(r + dr, c + dc);
        } else if (type === 'C') { // Ratha (Chariot / Boat) - Orthogonal ray slider
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (let [dr, dc] of dirs) {
                let step = 1;
                while (true) {
                    const nr = r + dr * step, nc = c + dc * step;
                    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                    const tidx = nr * 8 + nc;
                    const tp = board[tidx];
                    if (!tp) {
                        moves.push(tidx);
                    } else {
                        if (!tp.startsWith(color)) moves.push(tidx); // Capture
                        break;
                    }
                    step++;
                }
            }
        } else if (type === 'M') { // Mantri (Counselor) - 1 square diagonally
            const mantriOffsets = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            for (let [dr, dc] of mantriOffsets) addMoveIfValid(r + dr, c + dc);
        } else if (type === 'R') { // Raja (King) - 1 square any direction
            const kingOffsets = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            for (let [dr, dc] of kingOffsets) addMoveIfValid(r + dr, c + dc);
        }

        return moves;
    }

    function isKingInCheck(board, color) {
        const kingPiece = color + 'R';
        const kingIdx = board.findIndex(p => p === kingPiece);
        if (kingIdx === -1) return false;

        const enemyColor = color === 'w' ? 'b' : 'w';
        for (let i = 0; i < 64; i++) {
            if (board[i] && board[i].startsWith(enemyColor)) {
                const enemyMoves = getAncientLegalMoves(board, i, enemyColor);
                if (enemyMoves.includes(kingIdx)) return true;
            }
        }
        return false;
    }

    function getSafeLegalMoves(board, index, color) {
        const rawMoves = getAncientLegalMoves(board, index, color);
        const safeMoves = [];

        for (let toIdx of rawMoves) {
            // Simulate move
            const simBoard = [...board];
            simBoard[toIdx] = simBoard[index];
            simBoard[index] = null;
            if (!isKingInCheck(simBoard, color)) {
                safeMoves.push(toIdx);
            }
        }
        return safeMoves;
    }

    function renderChaturangaBoard() {
        if (!chaturangaBoardEl) return;
        chaturangaBoardEl.innerHTML = '';

        const inCheck = isKingInCheck(chBoard, chTurn);

        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isLight = (row + col) % 2 === 0;

            const isTarget = chValidMovesForSelected.includes(i);
            const isSelected = selectedChSquare === i;

            const cell = document.createElement('div');
            cell.className = `ch-cell ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isTarget ? 'highlight-target' : ''}`;
            
            const piece = chBoard[i];
            if (piece) {
                cell.textContent = CH_PIECES[piece] || piece;
                cell.style.color = piece.startsWith('w') ? '#ffd700' : '#ff5252';
            }

            cell.addEventListener('click', () => handleChaturangaSquareClick(i));
            chaturangaBoardEl.appendChild(cell);
        }

        const activeName = chTurn === 'w' ? player1Name : player2Name;
        if (inCheck) {
            chaturangaStatusEl.textContent = `⚠️ CHECK! ${activeName.toUpperCase()}'s Raja is under threat!`;
            chaturangaStatusEl.style.color = '#ff4444';
        } else {
            chaturangaStatusEl.textContent = `${activeName.toUpperCase()}'S TURN: SELECT A PIECE TO MOVE`;
            chaturangaStatusEl.style.color = 'var(--text-ivory)';
        }
    }

    function handleChaturangaSquareClick(index) {
        const piece = chBoard[index];

        if (selectedChSquare === null) {
            if (piece && piece.startsWith(chTurn)) {
                if (chTurn === 'b' && currentMatchMode === 'ai') return;
                selectedChSquare = index;
                chValidMovesForSelected = getSafeLegalMoves(chBoard, index, chTurn);
                renderChaturangaBoard();
            }
        } else {
            if (selectedChSquare === index) {
                selectedChSquare = null;
                chValidMovesForSelected = [];
                renderChaturangaBoard();
            } else if (chValidMovesForSelected.includes(index)) {
                executeChaturangaMove(selectedChSquare, index);
            } else if (piece && piece.startsWith(chTurn)) {
                selectedChSquare = index;
                chValidMovesForSelected = getSafeLegalMoves(chBoard, index, chTurn);
                renderChaturangaBoard();
            }
        }
    }

    function executeChaturangaMove(fromIdx, toIdx) {
        const piece = chBoard[fromIdx];
        const target = chBoard[toIdx];

        chBoard[toIdx] = piece;
        chBoard[fromIdx] = null;
        selectedChSquare = null;
        chValidMovesForSelected = [];
        matchMovesCount++;

        if (target) {
            const val = PIECE_VALUES[target.charAt(1)] || 100;
            if (chTurn === 'w') {
                addPlayerPoints(val, `Captured ${target}`);
                playSound('success');
            } else {
                playSound('error');
            }
        } else {
            playSound('pickup');
        }

        // Check if next player is checkmated or Raja captured
        const nextColor = chTurn === 'w' ? 'b' : 'w';
        let nextHasMoves = false;
        for (let i = 0; i < 64; i++) {
            if (chBoard[i] && chBoard[i].startsWith(nextColor)) {
                const moves = getSafeLegalMoves(chBoard, i, nextColor);
                if (moves.length > 0) { nextHasMoves = true; break; }
            }
        }

        if (!nextHasMoves || target === 'bR' || target === 'wR') {
            const duration = Math.round((Date.now() - matchStartTime) / 1000);
            const winner = chTurn === 'w' ? player1Name : player2Name;
            renderChaturangaBoard();

            if (chTurn === 'w') {
                const bounty = 2000;
                addPlayerPoints(bounty, 'Checkmate Victory Bounty');
                logPostMortem('Chaturanga', player1Name, duration, matchMovesCount, 95);
                openVictoryModal(`${player1Name.toUpperCase()} WON CHATURANGA!`, "The enemy Raja has been checkmated in ancient warfare!", bounty);
            } else {
                logPostMortem('Chaturanga', player2Name, duration, matchMovesCount, 72);
                chaturangaStatusEl.textContent = `Checkmate! ${player2Name} claimed ancient victory!`;
                if (currentMatchMode === 'friend') {
                    openVictoryModal(`${player2Name.toUpperCase()} WON!`, "Checkmate achieved!", 1000);
                }
            }
            return;
        }

        chTurn = nextColor;
        renderChaturangaBoard();

        if (chTurn === 'b' && currentMatchMode === 'ai') {
            setTimeout(handleAiChaturangaTurn, currentAiDifficulty === 'easy' ? 600 : (currentAiDifficulty === 'medium' ? 450 : 300));
        }
    }

    // Minimax Heuristic Evaluation for Chaturanga
    function evaluateChaturangaBoard(board) {
        let score = 0;
        for (let i = 0; i < 64; i++) {
            const p = board[i];
            if (!p) continue;
            const val = PIECE_VALUES[p.charAt(1)] || 100;
            const r = Math.floor(i / 8), c = i % 8;
            let posBonus = 0;
            if (r >= 2 && r <= 5 && c >= 2 && c <= 5) posBonus += 15; // Center dominance

            if (p.startsWith('b')) score += (val + posBonus);
            else score -= (val + posBonus);
        }
        return score;
    }

    function minimaxChaturanga(board, depth, isMaximizing, alpha, beta) {
        if (depth === 0) return evaluateChaturangaBoard(board);

        const color = isMaximizing ? 'b' : 'w';
        const allMoves = [];

        for (let i = 0; i < 64; i++) {
            if (board[i] && board[i].startsWith(color)) {
                const moves = getSafeLegalMoves(board, i, color);
                for (let to of moves) allMoves.push({ from: i, to });
            }
        }

        if (allMoves.length === 0) {
            return isMaximizing ? -99999 : 99999;
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let m of allMoves) {
                const nextBoard = [...board];
                nextBoard[m.to] = nextBoard[m.from];
                nextBoard[m.from] = null;
                const evalVal = minimaxChaturanga(nextBoard, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalVal);
                alpha = Math.max(alpha, evalVal);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let m of allMoves) {
                const nextBoard = [...board];
                nextBoard[m.to] = nextBoard[m.from];
                nextBoard[m.from] = null;
                const evalVal = minimaxChaturanga(nextBoard, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalVal);
                beta = Math.min(beta, evalVal);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function handleAiChaturangaTurn() {
        const allLegalMoves = [];
        for (let i = 0; i < 64; i++) {
            if (chBoard[i] && chBoard[i].startsWith('b')) {
                const moves = getSafeLegalMoves(chBoard, i, 'b');
                for (let to of moves) allLegalMoves.push({ from: i, to });
            }
        }

        if (allLegalMoves.length === 0) return;

        let chosenMove = allLegalMoves[0];

        if (currentAiDifficulty === 'easy') {
            // Easy Mode: Random valid move without checking consequences
            chosenMove = allLegalMoves[Math.floor(Math.random() * allLegalMoves.length)];
        } else if (currentAiDifficulty === 'medium') {
            // Medium Mode: Prioritize immediate captures with highest value
            let bestCaptureVal = -1;
            for (let m of allLegalMoves) {
                const target = chBoard[m.to];
                if (target && target.startsWith('w')) {
                    const val = PIECE_VALUES[target.charAt(1)] || 100;
                    if (val > bestCaptureVal) {
                        bestCaptureVal = val;
                        chosenMove = m;
                    }
                }
            }
        } else {
            // Hard Mode: 3-Ply Minimax with alpha-beta pruning
            let bestScore = -Infinity;
            for (let m of allLegalMoves) {
                const nextBoard = [...chBoard];
                nextBoard[m.to] = nextBoard[m.from];
                nextBoard[m.from] = null;
                const score = minimaxChaturanga(nextBoard, 3, false, -Infinity, Infinity);
                if (score > bestScore) {
                    bestScore = score;
                    chosenMove = m;
                }
            }
        }

        executeChaturangaMove(chosenMove.from, chosenMove.to);
    }

    document.getElementById('btnResetChaturanga')?.addEventListener('click', initChaturangaGame);

    /* ==========================================================================
       2. GAME 2: TAABLA (24-Node Mill Alignment Game with Mill Protection Rules)
       ========================================================================== */
    const taablaBoardEl = document.getElementById('taablaBoard');
    const taablaStatusEl = document.getElementById('taablaStatus');

    const TAABLA_NODES = [
        { x: 20, y: 20 }, { x: 180, y: 20 }, { x: 340, y: 20 },
        { x: 70, y: 70 }, { x: 180, y: 70 }, { x: 290, y: 70 },
        { x: 120, y: 120 }, { x: 180, y: 120 }, { x: 240, y: 120 },
        { x: 20, y: 180 }, { x: 70, y: 180 }, { x: 120, y: 180 },
        { x: 240, y: 180 }, { x: 290, y: 180 }, { x: 340, y: 180 },
        { x: 120, y: 240 }, { x: 180, y: 240 }, { x: 240, y: 240 },
        { x: 70, y: 290 }, { x: 180, y: 290 }, { x: 290, y: 290 },
        { x: 20, y: 340 }, { x: 180, y: 340 }, { x: 340, y: 340 }
    ];

    const TAABLA_LINES = [
        // Outer square
        [0, 1, 2], [2, 14, 23], [21, 22, 23], [0, 9, 21],
        // Middle square
        [3, 4, 5], [5, 13, 20], [18, 19, 20], [3, 10, 18],
        // Inner square
        [6, 7, 8], [8, 12, 17], [15, 16, 17], [6, 11, 15],
        // Cross connections
        [1, 4, 7], [9, 10, 11], [12, 13, 14], [16, 19, 22]
    ];

    const TAABLA_ADJACENCY = {
        0: [1, 9], 1: [0, 2, 4], 2: [1, 14],
        3: [4, 10], 4: [1, 3, 5, 7], 5: [4, 13],
        6: [7, 11], 7: [4, 6, 8], 8: [7, 12],
        9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15],
        12: [8, 13, 17], 13: [5, 12, 14, 20], 14: [2, 13, 23],
        15: [11, 16], 16: [15, 17, 19], 17: [12, 16],
        18: [10, 19], 19: [16, 18, 20, 22], 20: [13, 19],
        21: [9, 22], 22: [19, 21, 23], 23: [14, 22]
    };

    let taablaState = Array(24).fill(null);
    let tRedPlaced = 0;
    let tBluePlaced = 0;
    let tTurn = 'red'; // 'red' = Player 1, 'blue' = Player 2 / AI
    let selectedTaablaNode = null;
    let tCaptureMode = false; // When a mill is formed, waiting for removal of enemy piece

    function initTaablaGame() {
        taablaState = Array(24).fill(null);
        tRedPlaced = 0;
        tBluePlaced = 0;
        tTurn = 'red';
        selectedTaablaNode = null;
        tCaptureMode = false;
        renderTaablaBoard();
    }

    function isNodeInActiveMill(board, index, color) {
        return TAABLA_LINES.some(line => line.includes(index) && line.every(node => board[node] === color));
    }

    function renderTaablaBoard() {
        if (!taablaBoardEl) return;
        taablaBoardEl.innerHTML = '';

        TAABLA_NODES.forEach((pos, idx) => {
            const node = document.createElement('div');
            const isSelected = selectedTaablaNode === idx;
            node.className = `taabla-node ${isSelected ? 'selected' : ''}`;
            node.style.left = `${pos.x}px`;
            node.style.top = `${pos.y}px`;

            if (taablaState[idx] === 'red') {
                node.innerHTML = `<div class="t-pawn-red"></div>`;
            } else if (taablaState[idx] === 'blue') {
                node.innerHTML = `<div class="t-pawn-blue"></div>`;
            }

            node.addEventListener('click', () => handleTaablaClick(idx));
            taablaBoardEl.appendChild(node);
        });

        if (tCaptureMode) {
            const activeName = tTurn === 'red' ? player1Name : player2Name;
            taablaStatusEl.textContent = `⚔️ MILL FORMED! ${activeName} select an enemy piece to remove!`;
            taablaStatusEl.style.color = '#ffd700';
        } else if (tRedPlaced < 9 || tBluePlaced < 9) {
            const activeName = tTurn === 'red' ? player1Name : player2Name;
            taablaStatusEl.textContent = `Placement Phase: ${activeName}'s turn to place piece (${tTurn === 'red' ? tRedPlaced : tBluePlaced}/9)`;
            taablaStatusEl.style.color = 'var(--text-ivory)';
        } else {
            const activeName = tTurn === 'red' ? player1Name : player2Name;
            taablaStatusEl.textContent = `Movement Phase: ${activeName}'s turn to slide along lines!`;
            taablaStatusEl.style.color = 'var(--text-ivory)';
        }
    }

    function handleTaablaClick(index) {
        if (tCaptureMode) {
            // Remove opponent piece
            const enemyColor = tTurn === 'red' ? 'blue' : 'red';
            if (taablaState[index] === enemyColor) {
                // Restriction: Cannot remove piece in active mill unless all enemy pieces are in mills
                const allInMills = taablaState.every((c, i) => c !== enemyColor || isNodeInActiveMill(taablaState, i, enemyColor));
                if (!isNodeInActiveMill(taablaState, index, enemyColor) || allInMills) {
                    taablaState[index] = null;
                    tCaptureMode = false;
                    if (tTurn === 'red') {
                        addPlayerPoints(300, 'Mill Strike Capture');
                        playSound('success');
                    } else {
                        playSound('error');
                    }
                    tTurn = tTurn === 'red' ? 'blue' : 'red';
                    renderTaablaBoard();
                    checkTaablaWin();
                    if (tTurn === 'blue' && currentMatchMode === 'ai') {
                        setTimeout(handleAiTaablaTurn, 500);
                    }
                } else {
                    taablaStatusEl.textContent = `⚠️ Protected by Mill! You cannot remove a piece in an active mill unless no other piece exists.`;
                    playSound('error');
                }
            }
            return;
        }

        if (tRedPlaced < 9 || tBluePlaced < 9) {
            // Placement phase
            if (tTurn === 'red' || currentMatchMode === 'friend') {
                if (taablaState[index] === null) {
                    taablaState[index] = tTurn;
                    if (tTurn === 'red') tRedPlaced++; else tBluePlaced++;
                    matchMovesCount++;
                    playSound('pickup');

                    // Check if mill formed
                    if (isNodeInActiveMill(taablaState, index, tTurn)) {
                        tCaptureMode = true;
                        renderTaablaBoard();
                        return;
                    }

                    tTurn = tTurn === 'red' ? 'blue' : 'red';
                    renderTaablaBoard();

                    if (tTurn === 'blue' && currentMatchMode === 'ai') {
                        setTimeout(handleAiTaablaTurn, 500);
                    }
                }
            }
        } else {
            // Movement phase
            if (tTurn === 'red' || currentMatchMode === 'friend') {
                if (taablaState[index] === tTurn) {
                    selectedTaablaNode = index;
                    renderTaablaBoard();
                } else if (selectedTaablaNode !== null && taablaState[index] === null && (TAABLA_ADJACENCY[selectedTaablaNode] || []).includes(index)) {
                    taablaState[index] = tTurn;
                    taablaState[selectedTaablaNode] = null;
                    selectedTaablaNode = null;
                    matchMovesCount++;
                    playSound('pickup');

                    // Check if mill formed
                    if (isNodeInActiveMill(taablaState, index, tTurn)) {
                        tCaptureMode = true;
                        renderTaablaBoard();
                        return;
                    }

                    tTurn = tTurn === 'red' ? 'blue' : 'red';
                    renderTaablaBoard();
                    checkTaablaWin();

                    if (tTurn === 'blue' && currentMatchMode === 'ai') {
                        setTimeout(handleAiTaablaTurn, 500);
                    }
                }
            }
        }
    }

    function handleAiTaablaTurn() {
        if (currentMatchMode === 'friend' || tTurn !== 'blue') return;

        if (tCaptureMode) {
            // AI removes a player piece
            const playerIndices = [];
            taablaState.forEach((c, i) => { if (c === 'red') playerIndices.push(i); });
            const validRemovals = playerIndices.filter(i => !isNodeInActiveMill(taablaState, i, 'red'));
            const target = validRemovals.length > 0 ? validRemovals[0] : playerIndices[0];

            if (target !== undefined) {
                taablaState[target] = null;
                tCaptureMode = false;
                playSound('error');
                tTurn = 'red';
                renderTaablaBoard();
                checkTaablaWin();
            }
            return;
        }

        if (tRedPlaced < 9 || tBluePlaced < 9) {
            // AI Placement
            const emptyIndices = [];
            taablaState.forEach((v, i) => { if (v === null) emptyIndices.push(i); });

            if (emptyIndices.length === 0) return;

            let chosenIndex = emptyIndices[0];

            if (currentAiDifficulty === 'easy') {
                chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            } else if (currentAiDifficulty === 'medium') {
                // Check if can complete own mill or block player mill
                let millMove = emptyIndices.find(i => {
                    const sim = [...taablaState]; sim[i] = 'blue';
                    return isNodeInActiveMill(sim, i, 'blue');
                });
                let blockMove = emptyIndices.find(i => {
                    const sim = [...taablaState]; sim[i] = 'red';
                    return isNodeInActiveMill(sim, i, 'red');
                });
                chosenIndex = millMove || blockMove || emptyIndices[0];
            } else {
                // Hard AI: Complete mill > Block player mill > Build strategic 2-in-a-row intersection
                let millMove = emptyIndices.find(i => {
                    const sim = [...taablaState]; sim[i] = 'blue';
                    return isNodeInActiveMill(sim, i, 'blue');
                });
                let blockMove = emptyIndices.find(i => {
                    const sim = [...taablaState]; sim[i] = 'red';
                    return isNodeInActiveMill(sim, i, 'red');
                });
                chosenIndex = millMove || blockMove || emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            }

            taablaState[chosenIndex] = 'blue';
            tBluePlaced++;
            playSound('pickup');

            if (isNodeInActiveMill(taablaState, chosenIndex, 'blue')) {
                tCaptureMode = true;
                renderTaablaBoard();
                setTimeout(handleAiTaablaTurn, 600);
                return;
            }

            tTurn = 'red';
            renderTaablaBoard();
        } else {
            // AI Movement Phase
            const aiPieces = [];
            taablaState.forEach((c, i) => { if (c === 'blue') aiPieces.push(i); });

            const validMoves = [];
            for (let from of aiPieces) {
                const adj = TAABLA_ADJACENCY[from] || [];
                for (let to of adj) {
                    if (taablaState[to] === null) validMoves.push({ from, to });
                }
            }

            if (validMoves.length === 0) {
                checkTaablaWin();
                return;
            }

            let chosenMove = validMoves[0];

            if (currentAiDifficulty === 'easy') {
                chosenMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            } else {
                // Find mill move
                let millMove = validMoves.find(m => {
                    const sim = [...taablaState]; sim[m.to] = 'blue'; sim[m.from] = null;
                    return isNodeInActiveMill(sim, m.to, 'blue');
                });
                chosenMove = millMove || validMoves[0];
            }

            taablaState[chosenMove.to] = 'blue';
            taablaState[chosenMove.from] = null;
            playSound('pickup');

            if (isNodeInActiveMill(taablaState, chosenMove.to, 'blue')) {
                tCaptureMode = true;
                renderTaablaBoard();
                setTimeout(handleAiTaablaTurn, 600);
                return;
            }

            tTurn = 'red';
            renderTaablaBoard();
            checkTaablaWin();
        }
    }

    function checkTaablaWin() {
        if (tRedPlaced >= 9 && tBluePlaced >= 9) {
            const redCount = taablaState.filter(c => c === 'red').length;
            const blueCount = taablaState.filter(c => c === 'blue').length;

            if (blueCount < 3) {
                const duration = Math.round((Date.now() - matchStartTime) / 1000);
                const bounty = 2000;
                addPlayerPoints(bounty, 'Taabla Mill Master Victory');
                logPostMortem('Taabla', player1Name, duration, matchMovesCount, 95);
                openVictoryModal(`${player1Name.toUpperCase()} IS TAABLA MASTER!`, "Stripped enemy below 3 pieces!", bounty);
            } else if (redCount < 3) {
                const duration = Math.round((Date.now() - matchStartTime) / 1000);
                logPostMortem('Taabla', player2Name, duration, matchMovesCount, 70);
                taablaStatusEl.textContent = `${player2Name} won Taabla by eliminating your pieces!`;
                if (currentMatchMode === 'friend') {
                    openVictoryModal(`${player2Name.toUpperCase()} WON!`, "Reduced opponent below 3 pieces!", 1000);
                }
            }
        }
    }

    document.getElementById('btnResetTaabla')?.addEventListener('click', initTaablaGame);

});
