/* ==========================================================================
   GAME OF BHARATH — SHARED AUTHENTICATION & ROLE-BASED ACCESS CONTROLLER
   Credentials:
     - Player: username 'player', password 'player'
     - Admin:  username 'admin',  password 'admin'
   ========================================================================== */

const BharathAuth = (() => {
    const SESSION_KEY   = 'bharath_session';
    const VALID_ACCOUNTS = {
        player: { password: 'player', role: 'player', defaultRedirect: 'map.html' },
        admin:  { password: 'admin',  role: 'admin',  defaultRedirect: 'admin.html' }
    };

    function getSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (session && session.authenticated === true && session.username && VALID_ACCOUNTS[session.username]) {
                return session;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function isLoggedIn() {
        return getSession() !== null;
    }

    function isAdmin() {
        const session = getSession();
        return session !== null && session.role === 'admin';
    }

    function getRole() {
        const session = getSession();
        return session ? session.role : null;
    }

    function getUsername() {
        const session = getSession();
        return session ? session.username : null;
    }

    function login(username, password) {
        const userClean = (username || '').trim().toLowerCase();
        const passClean = (password || '').trim();

        if (VALID_ACCOUNTS[userClean] && VALID_ACCOUNTS[userClean].password === passClean) {
            const account = VALID_ACCOUNTS[userClean];
            const sessionData = {
                authenticated: true,
                username: userClean,
                role: account.role,
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            return {
                success: true,
                username: userClean,
                role: account.role,
                redirect: account.defaultRedirect
            };
        }
        return { success: false };
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    }

    /**
     * Standard guard for player and game pages.
     * If not logged in, redirects immediately to login portal.
     */
    function guardPage() {
        if (!isLoggedIn()) {
            window.location.replace('index.html');
        }
    }

    /**
     * Strict Admin guard for admin.html.
     * Completely gates the dashboard to authenticated 'admin' role.
     */
    function guardAdminPage() {
        if (!isAdmin()) {
            window.location.replace('index.html');
        }
    }

    return {
        isLoggedIn,
        isAdmin,
        getRole,
        getUsername,
        login,
        logout,
        guardPage,
        guardAdminPage
    };
})();
