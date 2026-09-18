/* ==========================================================================
   ADMIN DASHBOARD & ML POST-MORTEM ANALYTICS CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const kpiTotalMatchesEl  = document.getElementById('kpiTotalMatches');
    const kpiWinRateEl       = document.getElementById('kpiWinRate');
    const kpiAvgAccuracyEl   = document.getElementById('kpiAvgAccuracy');
    const kpiTopRegionEl     = document.getElementById('kpiTopRegion');
    const logsTableBodyEl    = document.getElementById('logsTableBody');
    const btnExportLogs      = document.getElementById('btnExportLogs');
    const btnClearLogs       = document.getElementById('btnClearLogs');
    const logSearchInput     = document.getElementById('logSearchInput');
    const logFilterRegion    = document.getElementById('logFilterRegion');
    const logFilterWinner    = document.getElementById('logFilterWinner');
    const postMortemPanel    = document.getElementById('postMortemPanel');
    const postMortemContent  = document.getElementById('postMortemContent');
    const btnClosePostMortem = document.getElementById('btnClosePostMortem');

    // ── ML Analysis Engine (Client & Python Backend Integration) ───────────
    async function fetchPythonMLAnalysis(log) {
        try {
            const payload = {
                gameType: log.game || log.gameType,
                region: log.region,
                winner: log.winner,
                aiDifficulty: log.difficulty || 'MEDIUM',
                totalMoves: log.totalMoves || 20,
                durationSeconds: log.durationSeconds || 120,
                playerCaptures: log.playerCaptures || (log.winner && !log.winner.toLowerCase().startsWith('ai') ? 8 : 3),
                aiCaptures: log.aiCaptures || (log.winner && log.winner.toLowerCase().startsWith('ai') ? 8 : 3),
                boardStateHistory: log.boardStateHistory || []
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);

            const res = await fetch('http://localhost:8000/api/analyze-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                return data;
            }
        } catch (e) {
            // Python server not running or network error -> fallback to local dynamic generator
        }
        return null;
    }

    function generateMLAnalysis(log) {
        const isPlayerWin = log.winner && !log.winner.toLowerCase().startsWith('ai');
        const diff = (log.difficulty || 'EASY').toUpperCase();
        const moves = log.totalMoves || 0;
        const dur = log.durationSeconds || 0;
        const region = log.region || '';
        const game = log.game || '';

        const winReasons = {
            EASY:   ['Dominated early board positioning', 'Consistent seed distribution', 'AI conceded on multiple turns'],
            MEDIUM: ['Exploited capture chains efficiently', 'Maintained positional advantage', 'Tactical mid-game switches'],
            HARD:   ['Outmaneuvered minimax heuristic', 'Superior capture sequencing', 'Maintained multi-pit control']
        };
        const aiReasons = {
            EASY:   ['AI random move variance proved effective', 'Player missed capture window'],
            MEDIUM: ['AI detected capture chain at critical phase', 'Player defensive positioning failed'],
            HARD:   ['AI minimax depth search overwhelmed player', 'Hard AI maintained state-action superiority']
        };
        const tips = {
            EASY:   ['Practice counting seeds before sowing', 'Focus on emptying near-storehouse pits first'],
            MEDIUM: ['Anticipate AI capture 2 moves ahead', 'Diversify pit selections to deny easy captures'],
            HARD:   ['Study AI capture pattern before committing', 'Prioritize defensive plays when behind on seeds']
        };

        const selectedWinReasons = isPlayerWin ? (winReasons[diff] || winReasons.EASY) : (aiReasons[diff] || aiReasons.EASY);
        const selectedTips = tips[diff] || tips.EASY;
        const movesPerMin = dur > 0 ? ((moves / dur) * 60).toFixed(1) : '—';
        const efficiencyScore = Math.min(100, Math.round(60 + (moves * 1.5) - (dur * 0.08)));

        return {
            isPlayerWin,
            diff,
            selectedWinReasons,
            selectedTips,
            movesPerMin,
            efficiencyScore,
            region,
            game
        };
    }

    async function showPostMortemPanel(log) {
        if (!postMortemPanel || !postMortemContent) return;

        postMortemPanel.style.display = 'block';
        postMortemPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Try Python ML backend first for dynamic algorithmic generation
        const pythonAnalysis = await fetchPythonMLAnalysis(log);

        if (pythonAnalysis) {
            const isWin = pythonAnalysis.isPlayerWin;
            const outcomeColor = isWin ? '#6ee7b7' : '#ff7a7a';
            const m = pythonAnalysis.metrics || {};
            const telemetry = pythonAnalysis.aiModelTelemetry || {};

            postMortemContent.innerHTML = `
                <!-- Block 1: Outcome & Archetype Summary -->
                <div style="background:rgba(40,20,55,0.85); border:1px solid rgba(230,198,112,0.35); border-radius:12px; padding:18px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:6px;">MATCH OUTCOME & ARCHETYPE</div>
                            <div style="font-size:1.4rem; font-weight:700; color:${outcomeColor}; margin-bottom:6px;">${pythonAnalysis.headline}</div>
                        </div>
                        <span style="font-size:0.75rem; background:rgba(0,255,136,0.15); color:#00ff88; border:1px solid #00ff88; border-radius:20px; padding:4px 10px; font-weight:600;">PYTHON ML BACKEND v${telemetry.analyzerVersion || '3.4'}</span>
                    </div>
                    <div style="font-size:0.85rem; color:#ccc; margin-top:8px; line-height:1.6;">
                        Archetype: <strong style="color:#ffd700;">${pythonAnalysis.tacticalArchetype || 'Dynamic Strategist'}</strong> &nbsp;|&nbsp;
                        Mode: <strong>AI (${pythonAnalysis.aiDifficulty})</strong><br>
                        Duration: <strong>${pythonAnalysis.durationSeconds}s</strong> &nbsp;|&nbsp; 
                        Total Moves: <strong>${pythonAnalysis.totalMoves}</strong> &nbsp;|&nbsp; 
                        Inflection Point: <strong>Turn #${m.inflectionMoveNumber || '—'}</strong>
                    </div>
                </div>

                <!-- Block 2: Dynamic Organic Narrative Log -->
                <div style="background:rgba(40,20,55,0.85); border:1px solid rgba(230,198,112,0.35); border-radius:12px; padding:18px;">
                    <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:10px;">
                        🧠 DYNAMIC POST-MORTEM NARRATIVE (ALGORITHMIC SYNTHESIS)
                    </div>
                    <div style="font-size:0.88rem; line-height:1.8; color:#e6edf3; white-space:pre-line; background:rgba(15,5,25,0.6); padding:14px; border-radius:8px; border-left:3px solid #ffd700;">
                        ${pythonAnalysis.narrativeLog}
                    </div>
                </div>

                <!-- Block 3: Key Tactical Breakdown -->
                <div style="background:rgba(40,20,55,0.85); border:1px solid rgba(230,198,112,0.35); border-radius:12px; padding:18px;">
                    <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:10px;">
                        🔍 REAL-TIME STATE-ACTION BREAKDOWN
                    </div>
                    <ul style="margin:0; padding-left:20px; line-height:1.9; color:#c9d1d9; font-size:0.86rem;">
                        ${pythonAnalysis.keyTacticalPoints.map(pt => `<li>${pt}</li>`).join('')}
                    </ul>
                </div>

                <!-- Block 4: Mathematical Metrics & Model Telemetry -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px;">
                    <div style="background:rgba(40,20,55,0.85); border:1px solid rgba(230,198,112,0.35); border-radius:12px; padding:16px;">
                        <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:1.2px; color:var(--text-muted); margin-bottom:6px;">⚡ MOVE-TO-CAPTURE EFFICIENCY</div>
                        <div style="font-size:1.8rem; font-weight:700; color:#ffd700;">${m.moveToCaptureEfficiency || '—'}</div>
                        <div style="font-size:0.75rem; color:#aaa; margin-top:4px;">Positioning Score: <strong style="color:#00ff88;">${m.tacticalPositioningScore || '—'}</strong></div>
                        <div style="font-size:0.75rem; color:#aaa;">Tempo Pressure Index: <strong style="color:#6ee7b7;">${m.tempoPressureIndex || '—'}</strong></div>
                    </div>
                    <div style="background:rgba(40,20,55,0.85); border:1px solid rgba(230,198,112,0.35); border-radius:12px; padding:16px;">
                        <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:1.2px; color:var(--text-muted); margin-bottom:6px;">🤖 AI HEURISTIC MODEL</div>
                        <div style="font-size:1.8rem; font-weight:700; color:#ff7a7a;">${m.aiExploitationRate || '—'}</div>
                        <div style="font-size:0.75rem; color:#aaa; margin-top:4px;">Search Depth: <strong style="color:#fff;">${telemetry.searchDepth || 1} ply</strong></div>
                        <div style="font-size:0.75rem; color:#aaa;">Architecture: <strong style="color:#ffd700;">${telemetry.engineArchitecture || 'Q-Heuristic'}</strong></div>
                    </div>
                </div>

                <!-- Block 5: Tactical Recommendations -->
                <div style="background:rgba(40,20,55,0.85); border:1px solid rgba(230,198,112,0.35); border-radius:12px; padding:18px;">
                    <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:10px;">💡 TACTICAL IMPROVEMENT RECOMMENDATIONS</div>
                    <ul style="margin:0; padding-left:20px; line-height:1.9; color:#c9d1d9; font-size:0.86rem;">
                        ${pythonAnalysis.tacticalRecommendations.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
            `;
            return;
        }

        // Fallback to local generator if Python server is not connected
        const ml = generateMLAnalysis(log);
        const outcomeColor = ml.isPlayerWin ? '#6ee7b7' : '#ff7a7a';
        const outcomeLabel = ml.isPlayerWin ? '🏆 PLAYER VICTORY' : '⚔ AI VICTORY';

        postMortemContent.innerHTML = `
            <!-- Block 1: Outcome Summary -->
            <div style="background:rgba(40,20,55,0.8); border:1px solid rgba(230,198,112,0.25); border-radius:12px; padding:16px;">
                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:8px;">MATCH OUTCOME</div>
                <div style="font-size:1.3rem; font-weight:700; color:${outcomeColor}; margin-bottom:6px;">${outcomeLabel}</div>
                <div style="font-size:0.82rem; color:#aaa;">
                    <span style="color:#ffd700;">${log.game}</span> &nbsp;|&nbsp; ${log.region}<br>
                    Mode: <strong>${(log.mode || 'AI').toUpperCase()}</strong> &nbsp;|&nbsp; AI: <strong>${ml.diff}</strong><br>
                    Duration: <strong>${log.durationSeconds}s</strong> &nbsp;|&nbsp; Moves: <strong>${log.totalMoves}</strong><br>
                    Moves/min: <strong>${ml.movesPerMin}</strong>
                </div>
            </div>

            <!-- Block 2: Reason Analysis -->
            <div style="background:rgba(40,20,55,0.8); border:1px solid rgba(230,198,112,0.25); border-radius:12px; padding:16px;">
                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:8px;">
                    ${ml.isPlayerWin ? '🎯 PLAYER VICTORY ANALYSIS' : '🤖 AI VICTORY ANALYSIS'}
                </div>
                <ul style="margin:0; padding-left:18px; line-height:1.8;">
                    ${ml.selectedWinReasons.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>

            <!-- Block 3: ML Efficiency Metrics -->
            <div style="background:rgba(40,20,55,0.8); border:1px solid rgba(230,198,112,0.25); border-radius:12px; padding:16px;">
                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:8px;">⚡ ML EFFICIENCY SCORE</div>
                <div style="font-size:2rem; font-weight:700; color:#ffd700;">${ml.efficiencyScore}<span style="font-size:0.9rem; color:#aaa;">/100</span></div>
                <div style="background:rgba(0,0,0,0.3); border-radius:6px; height:8px; margin-top:8px; overflow:hidden;">
                    <div style="width:${ml.efficiencyScore}%; background: linear-gradient(90deg, #ffd700, #00ff88); height:100%; border-radius:6px; transition:width 1s;"></div>
                </div>
                <div style="font-size:0.78rem; color:#aaa; margin-top:8px;">Logged Accuracy: <strong style="color:#00ff88;">${log.accuracy}</strong></div>
            </div>

            <!-- Block 4: Tactical Tips -->
            <div style="background:rgba(40,20,55,0.8); border:1px solid rgba(230,198,112,0.25); border-radius:12px; padding:16px;">
                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1.5px; color:var(--text-muted); margin-bottom:8px;">💡 TACTICAL IMPROVEMENT TIPS</div>
                <ul style="margin:0; padding-left:18px; line-height:1.8; color:#c9d1d9;">
                    ${ml.selectedTips.map(t => `<li>${t}</li>`).join('')}
                </ul>
                <div style="margin-top:10px; font-size:0.75rem; color:#666;">
                    Generated by Bharath ML Engine (Local Fallback) • Difficulty: ${ml.diff}
                </div>
            </div>
        `;
    }

    if (btnClosePostMortem) {
        btnClosePostMortem.addEventListener('click', () => {
            if (postMortemPanel) postMortemPanel.style.display = 'none';
        });
    }

    // ── Data Layer ─────────────────────────────────────────────────────────
    function getLogs() {
        const stored = localStorage.getItem('bharath_postmortem_logs');
        if (!stored) {
            const sampleLogs = [
                { id: 'KA-' + (Date.now() - 80000),  region: 'Karnataka',       game: 'Aliguli Mane',  winner: 'Player 1',   mode: 'ai', difficulty: 'EASY',   durationSeconds: 132, totalMoves: 22, accuracy: '94%', timestamp: new Date(Date.now() - 80000).toISOString() },
                { id: 'KA-' + (Date.now() - 210000), region: 'Karnataka',       game: 'Chowkabara',   winner: 'AI (HARD)',  mode: 'ai', difficulty: 'HARD',   durationSeconds: 290, totalMoves: 38, accuracy: '87%', timestamp: new Date(Date.now() - 210000).toISOString() },
                { id: 'PB-' + (Date.now() - 370000), region: 'Punjab',          game: 'Chaupar',       winner: 'Player 1',   mode: 'ai', difficulty: 'MEDIUM', durationSeconds: 178, totalMoves: 27, accuracy: '91%', timestamp: new Date(Date.now() - 370000).toISOString() },
                { id: 'PB-' + (Date.now() - 500000), region: 'Punjab',          game: 'Khaddi Khadda', winner: 'AI (EASY)', mode: 'ai', difficulty: 'EASY',   durationSeconds: 98,  totalMoves: 15, accuracy: '89%', timestamp: new Date(Date.now() - 500000).toISOString() },
                { id: 'OD-' + (Date.now() - 120000), region: 'Odisha',          game: 'Ganjapa',       winner: 'Warrior 1',  mode: 'ai', difficulty: 'EASY',   durationSeconds: 145, totalMoves: 18, accuracy: '94%', timestamp: new Date(Date.now() - 120000).toISOString() },
                { id: 'OD-' + (Date.now() - 360000), region: 'Odisha',          game: 'Bhaga Chheli',  winner: 'Warrior 1',  mode: 'ai', difficulty: 'MEDIUM', durationSeconds: 210, totalMoves: 26, accuracy: '96%', timestamp: new Date(Date.now() - 360000).toISOString() },
                { id: 'MH-' + (Date.now() - 720000), region: 'Maharashtra',     game: 'Chaturanga',    winner: 'Commander 1',mode: 'ai', difficulty: 'HARD',   durationSeconds: 320, totalMoves: 42, accuracy: '91%', timestamp: new Date(Date.now() - 720000).toISOString() },
                { id: 'JK-' + (Date.now() - 1200000),region: 'Jammu & Kashmir', game: 'Turuf',         winner: 'Climber 1',  mode: 'ai', difficulty: 'EASY',   durationSeconds: 165, totalMoves: 14, accuracy: '92%', timestamp: new Date(Date.now() - 1200000).toISOString() }
            ];
            localStorage.setItem('bharath_postmortem_logs', JSON.stringify(sampleLogs));
            return sampleLogs;
        }
        return JSON.parse(stored);
    }

    // ── Filtering ───────────────────────────────────────────────────────────
    function getFilteredLogs() {
        const allLogs = getLogs();
        const search  = (logSearchInput  ? logSearchInput.value.trim().toLowerCase()  : '');
        const region  = (logFilterRegion ? logFilterRegion.value  : '');
        const outcome = (logFilterWinner ? logFilterWinner.value  : '');

        return allLogs.filter(log => {
            const matchSearch = !search ||
                (log.id        || '').toLowerCase().includes(search) ||
                (log.region    || '').toLowerCase().includes(search) ||
                (log.game      || '').toLowerCase().includes(search) ||
                (log.winner    || '').toLowerCase().includes(search);
            const matchRegion  = !region  || log.region === region;
            const matchOutcome = !outcome ||
                (outcome === 'ai'     && (log.winner || '').toLowerCase().startsWith('ai')) ||
                (outcome === 'player' && !(log.winner || '').toLowerCase().startsWith('ai'));
            return matchSearch && matchRegion && matchOutcome;
        });
    }

    // ── Render ──────────────────────────────────────────────────────────────
    function renderDashboard() {
        const allLogs      = getLogs();
        const filteredLogs = getFilteredLogs();
        if (!logsTableBodyEl) return;

        logsTableBodyEl.innerHTML = '';
        let p1Wins = 0;
        let regionCounts = {};
        let totalAccuracy = 0;
        let accCount = 0;

        allLogs.forEach(log => {
            if (log.winner && !log.winner.toLowerCase().startsWith('ai')) p1Wins++;
            regionCounts[log.region] = (regionCounts[log.region] || 0) + 1;
            const accNum = parseInt((log.accuracy || '0').replace('%', ''));
            if (!isNaN(accNum)) { totalAccuracy += accNum; accCount++; }
        });

        filteredLogs.forEach(log => {
            const isPlayerWin = log.winner && !log.winner.toLowerCase().startsWith('ai');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family: var(--font-title); color: #ffd700;">${log.id}</td>
                <td><span class="game-tag">${log.region}</span></td>
                <td><strong>${log.game}</strong></td>
                <td style="color: ${isPlayerWin ? '#6ee7b7' : '#ff9999'};">${log.winner}</td>
                <td>${(log.mode || 'AI').toUpperCase()}</td>
                <td>${log.difficulty}</td>
                <td>${log.durationSeconds}s</td>
                <td>${log.totalMoves}</td>
                <td style="color: #00ff88; font-weight:700;">${log.accuracy}</td>
                <td style="font-size: 0.76rem; color: #aaa;">${new Date(log.timestamp).toLocaleString()}</td>
                <td><button class="btn-pm-view nav-btn" data-id="${log.id}" style="font-size:0.72rem; padding:4px 10px;">🔬 VIEW</button></td>
            `;
            logsTableBodyEl.appendChild(tr);
        });

        // Wire post-mortem buttons
        document.querySelectorAll('.btn-pm-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const id  = btn.dataset.id;
                const log = getLogs().find(l => l.id === id);
                if (log) showPostMortemPanel(log);
            });
        });

        // KPIs from all logs
        const total = allLogs.length;
        if (kpiTotalMatchesEl) kpiTotalMatchesEl.textContent = total.toString();
        if (kpiWinRateEl)      kpiWinRateEl.textContent      = total > 0 ? `${Math.round((p1Wins / total) * 100)}%` : '0%';
        if (kpiAvgAccuracyEl)  kpiAvgAccuracyEl.textContent  = accCount > 0 ? `${(totalAccuracy / accCount).toFixed(1)}%` : '—';

        let topReg = 'Odisha', maxC = 0;
        Object.keys(regionCounts).forEach(r => {
            if (regionCounts[r] > maxC) { maxC = regionCounts[r]; topReg = r; }
        });
        if (kpiTopRegionEl) kpiTopRegionEl.textContent = topReg;
    }

    // ── Live Search / Filter ────────────────────────────────────────────────
    if (logSearchInput)  logSearchInput.addEventListener('input',  renderDashboard);
    if (logFilterRegion) logFilterRegion.addEventListener('change', renderDashboard);
    if (logFilterWinner) logFilterWinner.addEventListener('change', renderDashboard);

    // ── Export ──────────────────────────────────────────────────────────────
    if (btnExportLogs) {
        btnExportLogs.addEventListener('click', () => {
            const logs = getLogs();
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
            const a = document.createElement('a');
            a.setAttribute('href', dataStr);
            a.setAttribute('download', `bharath_ml_postmortem_${Date.now()}.json`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }

    // ── Clear Logs Modal & Firestore Batch Deletion ──────────
    const clearLogsModal     = document.getElementById('clearLogsModal');
    const btnCancelClearLogs = document.getElementById('btnCancelClearLogs');
    const btnConfirmClearLogs= document.getElementById('btnConfirmClearLogs');

    function openClearModal() {
        if (clearLogsModal) clearLogsModal.style.display = 'flex';
    }

    function closeClearModal() {
        if (clearLogsModal) clearLogsModal.style.display = 'none';
    }

    if (btnClearLogs) {
        btnClearLogs.addEventListener('click', openClearModal);
    }

    if (btnCancelClearLogs) {
        btnCancelClearLogs.addEventListener('click', closeClearModal);
    }

    if (clearLogsModal) {
        clearLogsModal.addEventListener('click', (e) => {
            if (e.target === clearLogsModal) closeClearModal();
        });
    }

    if (btnConfirmClearLogs) {
        btnConfirmClearLogs.addEventListener('click', async () => {
            btnConfirmClearLogs.disabled = true;
            btnConfirmClearLogs.textContent = 'PURGING...';

            // 1. Execute Firestore batch deletion if online
            if (typeof BharathFirebase !== 'undefined' && typeof BharathFirebase.batchDeleteLogs === 'function') {
                await BharathFirebase.batchDeleteLogs('match_logs');
            }

            // 2. Wipe LocalStorage match telemetry logs
            localStorage.removeItem('bharath_postmortem_logs');

            if (postMortemPanel) postMortemPanel.style.display = 'none';
            renderDashboard();

            btnConfirmClearLogs.disabled = false;
            btnConfirmClearLogs.textContent = 'YES, PURGE LOGS';
            closeClearModal();
        });
    }

    renderDashboard();
});
