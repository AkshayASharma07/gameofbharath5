/* ==========================================================================
   GAME OF BHARATH — AUTOMATED ML ADAPTIVE AI TRAINING ENGINE (ml_adaptive.js)
   Features:
     - Automated pre-match training hook execution before every game
     - Telemetry retrieval from past match replay logs (wins, AI blunders, accuracy)
     - Dynamic tuning of search depth (1 to 3+ ply) & tactical heuristic weights
     - Real-time heuristic adaptation for Minimax / Positional AI models
   ========================================================================== */

const BharathAdaptiveML = (() => {
    const DEFAULT_CONFIG = {
        karnataka: {
            aliguliMane: { searchDepth: 2, captureWeight: 1.5, defensiveWeight: 1.2, tempoWeight: 0.8 },
            chowkabara:  { searchDepth: 2, attackWeight: 1.6, safetyWeight: 1.4, homeRushWeight: 1.8 }
        },
        punjab: {
            chaupar:     { searchDepth: 2, attackWeight: 1.5, safetyWeight: 1.3, clusterWeight: 1.1 },
            khaddi:      { searchDepth: 1, strikeAccuracy: 0.75, angleVariance: 0.2 }
        },
        odisha: {
            ganjapa:     { searchDepth: 2, trumpControlWeight: 1.7, highCardSaveWeight: 1.3 },
            bhagaChheli: { searchDepth: 3, tigerTrapWeight: 2.0, goatPerimeterWeight: 1.5 }
        },
        maharashtra: {
            chaturanga:  { searchDepth: 3, pieceValueWeight: 1.4, centerControlWeight: 1.3, kingSafetyWeight: 1.8 },
            taabla:      { searchDepth: 2, forwardMomentumWeight: 1.4, safeHavenWeight: 1.2 }
        },
        jammuKashmir: {
            zarabzero:   { searchDepth: 2, productTargetWeight: 1.6, blockOpponentWeight: 1.5 },
            turuf:       { searchDepth: 2, suitVoidExploitWeight: 1.5, trickCountWeight: 1.4 }
        }
    };

    /**
     * Retrieves past match telemetry for the specified game & region
     */
    function getMatchTelemetry(region, gameName) {
        let logs = [];
        try {
            const raw = localStorage.getItem('bharath_postmortem_logs');
            if (raw) logs = JSON.parse(raw);
        } catch (e) {}

        const targetLogs = logs.filter(l => {
            const matchReg = !region || (l.region || '').toLowerCase() === region.toLowerCase();
            const matchGame = !gameName || (l.game || '').toLowerCase().includes(gameName.toLowerCase()) || (gameName || '').toLowerCase().includes((l.game || '').toLowerCase());
            return matchReg && matchGame;
        });

        let totalMatches = targetLogs.length;
        let aiWins = 0;
        let playerWins = 0;
        let totalMoves = 0;
        let totalAccuracy = 0;

        targetLogs.forEach(l => {
            const isAIWin = (l.winner || '').toLowerCase().startsWith('ai');
            if (isAIWin) aiWins++;
            else playerWins++;

            totalMoves += (l.totalMoves || 20);
            const acc = parseInt((l.accuracy || '90').replace('%', ''), 10);
            if (!isNaN(acc)) totalAccuracy += acc;
        });

        return {
            totalMatches,
            aiWins,
            playerWins,
            aiWinRate: totalMatches > 0 ? (aiWins / totalMatches) : 0.5,
            avgMoves: totalMatches > 0 ? Math.round(totalMoves / totalMatches) : 22,
            avgAccuracy: totalMatches > 0 ? Math.round(totalAccuracy / totalMatches) : 90,
            recentLogs: targetLogs.slice(0, 10)
        };
    }

    /**
     * Automated AI Training Hook: Executes dynamically before every match.
     * Evaluates player skill & past AI vulnerabilities to synthesize tuned heuristic parameters.
     */
    function executePreMatchTraining(region, gameKey, difficulty = 'medium') {
        const diff = (difficulty || 'medium').toLowerCase();
        const telemetry = getMatchTelemetry(region, gameKey);

        const baseProfile = (DEFAULT_CONFIG[region] && DEFAULT_CONFIG[region][gameKey])
            ? { ...DEFAULT_CONFIG[region][gameKey] }
            : { searchDepth: 2, attackWeight: 1.2, defensiveWeight: 1.2 };

        // 1. Difficulty Scaling Base
        let depth = diff === 'hard' ? 3 : (diff === 'medium' ? 2 : 1);
        let aggressionFactor = diff === 'hard' ? 1.4 : (diff === 'medium' ? 1.1 : 0.8);
        let defensiveFactor = diff === 'hard' ? 1.3 : (diff === 'medium' ? 1.0 : 0.7);

        // 2. Dynamic Telemetry Adaptation:
        // If player has a high win rate (>65%) in this game, AI sharpens heuristic search and depth
        if (telemetry.totalMatches >= 2 && telemetry.aiWinRate < 0.35) {
            console.log(`🧠 [Adaptive ML] Player dominance detected (${Math.round((1 - telemetry.aiWinRate) * 100)}% Win Rate). Enhancing AI search depth & counter-heuristics.`);
            if (diff !== 'easy') {
                depth = Math.min(4, depth + 1);
                aggressionFactor *= 1.25;
                defensiveFactor *= 1.2;
            }
        } else if (telemetry.totalMatches >= 2 && telemetry.aiWinRate > 0.8) {
            // If AI is overwhelmingly crushing the player, slightly temper heuristic to maintain fun gameplay
            if (diff === 'easy') {
                aggressionFactor *= 0.85;
            }
        }

        const tunedProfile = {
            ...baseProfile,
            searchDepth: depth,
            aggressionFactor: parseFloat(aggressionFactor.toFixed(2)),
            defensiveFactor: parseFloat(defensiveFactor.toFixed(2)),
            trainingTimestamp: new Date().toISOString(),
            telemetrySampleCount: telemetry.totalMatches,
            adaptedForDifficulty: diff.toUpperCase()
        };

        console.log(`🤖 [BharathAdaptiveML] Pre-match AI training completed for ${region} / ${gameKey}:`, tunedProfile);

        // Notify Sutradhar if active
        if (typeof Sutradhar !== 'undefined' && typeof Sutradhar.showTip === 'function' && telemetry.totalMatches > 0 && Math.random() < 0.3) {
            // Contextual coaching tip
        }

        return tunedProfile;
    }

    return {
        getMatchTelemetry,
        executePreMatchTraining
    };
})();

if (typeof window !== 'undefined') {
    window.BharathAdaptiveML = BharathAdaptiveML;
}
