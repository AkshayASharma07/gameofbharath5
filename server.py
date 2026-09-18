"""
================================================================================
Game of Bharath - ML Post-Mortem & Player State API Server (server.py)
================================================================================
Provides REST API for:
  1. ML Post-Mortem Analytics Engine (/api/analyze-match)
  2. Hierarchical Player State & Points API (/api/player/{username}, /api/points)
  3. Reset Scores Endpoint (/api/player/{username}/reset)
  4. Regional Leaderboards (/api/leaderboard/{state})
================================================================================
"""

import sys
import os
import json

# Ensure UTF-8 output encoding in Windows console environments
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from ml_analyzer import analyze_match, start_server

# ── Data Store Helper for Hierarchical Player State ──
STATE_POINTS_FILE = os.path.join(os.path.dirname(__file__), 'state_points.json')

PLAYABLE_STATES = ['karnataka', 'punjab', 'odisha', 'maharashtra', 'jammuKashmir']

def normalize_state_key(s):
    if not s:
        return 'karnataka'
    s_clean = s.strip()
    if s_clean.lower() in ('jk', 'j&k', 'jammukashmir', 'jammu & kashmir'):
        return 'jammuKashmir'
    return s_clean.lower()

def load_db():
    if os.path.exists(STATE_POINTS_FILE):
        try:
            with open(STATE_POINTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"players": {}}

def save_db(data):
    try:
        with open(STATE_POINTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("[DB] Failed to save state_points.json:", e)

def get_or_create_player(db, username):
    players = db.setdefault("players", {})
    if username not in players:
        players[username] = {
            "username": username,
            "language": "en",
            "points": {s: 0 for s in PLAYABLE_STATES},
            "totalPoints": 0
        }
    return players[username]

def recalc_total(player):
    total = 0
    for s in PLAYABLE_STATES:
        total += int(player.get("points", {}).get(s, 0))
    player["totalPoints"] = total
    return total

# Priority 1: Flask
try:
    from flask import Flask, request, jsonify, make_response
    try:
        from flask_cors import CORS
        has_flask_cors = True
    except ImportError:
        has_flask_cors = False

    app = Flask(__name__)
    if has_flask_cors:
        CORS(app)
    else:
        @app.after_request
        def add_cors_headers(response):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response

    @app.route("/", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Game of Bharath State & ML API (Flask)",
            "version": "4.0.0"
        }), 200

    @app.route("/api/analyze-match", methods=["POST", "OPTIONS"])
    @app.route("/analyze", methods=["POST", "OPTIONS"])
    def post_analyze():
        if request.method == "OPTIONS":
            resp = make_response()
            resp.headers["Access-Control-Allow-Origin"] = "*"
            resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
            return resp, 200

        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid or missing JSON payload"}), 400
        try:
            report = analyze_match(data)
            return jsonify(report), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/api/player/<username>", methods=["GET", "POST"])
    def player_document(username):
        db = load_db()
        player = get_or_create_player(db, username)
        if request.method == "POST":
            payload = request.get_json(force=True, silent=True) or {}
            if "points" in payload and isinstance(payload["points"], dict):
                for k, v in payload["points"].items():
                    norm_k = normalize_state_key(k)
                    if norm_k in PLAYABLE_STATES:
                        player["points"][norm_k] = int(v)
            if "language" in payload:
                player["language"] = str(payload["language"])
            recalc_total(player)
            save_db(db)
        return jsonify(player), 200

    @app.route("/api/player/<username>/reset", methods=["POST"])
    def player_reset(username):
        db = load_db()
        player = get_or_create_player(db, username)
        player["points"] = {s: 0 for s in PLAYABLE_STATES}
        player["totalPoints"] = 0
        save_db(db)
        return jsonify({"message": f"Scores reset to 0 for {username}", "player": player}), 200

    @app.route("/api/points", methods=["GET", "POST"])
    def handle_points():
        db = load_db()
        if request.method == "GET":
            username = request.args.get("username", "player")
            state = normalize_state_key(request.args.get("state", "karnataka"))
            player = get_or_create_player(db, username)
            return jsonify({
                "username": username,
                "state": state,
                "points": player["points"].get(state, 0),
                "totalPoints": player["totalPoints"]
            }), 200

        payload = request.get_json(force=True, silent=True) or {}
        username = payload.get("username", "player")
        state = normalize_state_key(payload.get("state", "karnataka"))
        points = int(payload.get("points", 0))
        reason = payload.get("reason", "")

        player = get_or_create_player(db, username)
        if state in PLAYABLE_STATES and points > 0:
            player["points"][state] = player["points"].get(state, 0) + points
            recalc_total(player)
            save_db(db)

        return jsonify({
            "username": username,
            "state": state,
            "state_points": player["points"].get(state, 0),
            "total_points": player["totalPoints"],
            "reason": reason
        }), 200

    @app.route("/api/leaderboard/<state>", methods=["GET"])
    def leaderboard(state):
        norm_state = normalize_state_key(state)
        db = load_db()
        board = []
        for uname, pdata in db.get("players", {}).items():
            pts = pdata.get("points", {}).get(norm_state, 0)
            board.append({"username": uname, "points": pts})
        board.sort(key=lambda x: x["points"], reverse=True)
        return jsonify({"state": norm_state, "leaderboard": board[:10]}), 200

    def run(port: int = 8000):
        print(f"🚀 Starting Flask Server on http://127.0.0.1:{port} ...")
        app.run(host="0.0.0.0", port=port, debug=False)

except ImportError:
    # Priority 2: FastAPI
    try:
        from fastapi import FastAPI, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        import uvicorn

        fastapi_app = FastAPI(
            title="Game of Bharath State & ML API (FastAPI)",
            version="4.0.0"
        )
        fastapi_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @fastapi_app.get("/")
        @fastapi_app.get("/api/health")
        @fastapi_app.get("/health")
        def fastapi_health():
            return {
                "status": "healthy",
                "service": "Game of Bharath State & ML API (FastAPI)",
                "version": "4.0.0"
            }

        @fastapi_app.post("/api/analyze-match")
        @fastapi_app.post("/analyze")
        def fastapi_analyze(payload: dict):
            try:
                return analyze_match(payload)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @fastapi_app.get("/api/player/{username}")
        def fastapi_get_player(username: str):
            db = load_db()
            return get_or_create_player(db, username)

        @fastapi_app.post("/api/player/{username}")
        def fastapi_set_player(username: str, payload: dict):
            db = load_db()
            player = get_or_create_player(db, username)
            if "points" in payload and isinstance(payload["points"], dict):
                for k, v in payload["points"].items():
                    norm_k = normalize_state_key(k)
                    if norm_k in PLAYABLE_STATES:
                        player["points"][norm_k] = int(v)
            if "language" in payload:
                player["language"] = str(payload["language"])
            recalc_total(player)
            save_db(db)
            return player

        @fastapi_app.post("/api/player/{username}/reset")
        def fastapi_reset_player(username: str):
            db = load_db()
            player = get_or_create_player(db, username)
            player["points"] = {s: 0 for s in PLAYABLE_STATES}
            player["totalPoints"] = 0
            save_db(db)
            return {"message": f"Scores reset to 0 for {username}", "player": player}

        @fastapi_app.get("/api/points")
        async def get_points(username: str = "player", state: str = "karnataka"):
            norm_state = normalize_state_key(state)
            db = load_db()
            player = get_or_create_player(db, username)
            return {
                "username": username,
                "state": norm_state,
                "points": player["points"].get(norm_state, 0),
                "totalPoints": player["totalPoints"]
            }

        @fastapi_app.post("/api/points")
        async def post_points(payload: dict):
            username = payload.get("username", "player")
            state = normalize_state_key(payload.get("state", "karnataka"))
            points = int(payload.get("points", 0))
            reason = payload.get("reason", "")
            db = load_db()
            player = get_or_create_player(db, username)
            if state in PLAYABLE_STATES and points > 0:
                player["points"][state] = player["points"].get(state, 0) + points
                recalc_total(player)
                save_db(db)
            return {
                "username": username,
                "state": state,
                "state_points": player["points"].get(state, 0),
                "total_points": player["totalPoints"],
                "reason": reason
            }

        @fastapi_app.get("/api/leaderboard/{state}")
        async def get_leaderboard(state: str, top: int = 10):
            norm_state = normalize_state_key(state)
            db = load_db()
            board = []
            for uname, pdata in db.get("players", {}).items():
                pts = pdata.get("points", {}).get(norm_state, 0)
                board.append({"username": uname, "points": pts})
            board.sort(key=lambda x: x["points"], reverse=True)
            return {"state": norm_state, "leaderboard": board[:top]}

        def run(port: int = 8000):
            print(f"🚀 Starting FastAPI Server with Uvicorn on http://127.0.0.1:{port} ...")
            uvicorn.run(fastapi_app, host="0.0.0.0", port=port)

    except ImportError:
        def run(port: int = 8000):
            print("ℹ️ Flask/FastAPI not detected. Launching built-in zero-dependency HTTP server...")
            start_server(port=port)

if __name__ == "__main__":
    p = 8000
    if len(sys.argv) > 1:
        try:
            p = int(sys.argv[1])
        except ValueError:
            pass
    run(port=p)
