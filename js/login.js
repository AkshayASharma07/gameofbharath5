/* ==========================================================================
   LOGIN AUTHENTICATION HANDLER
   Credentials:
     - Player: player / player -> redirects to map.html
     - Admin:  admin / admin   -> redirects to admin.html
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm      = document.getElementById('loginForm');
    const loginCard      = document.getElementById('loginCard');
    const usernameInput  = document.getElementById('username');
    const passwordInput  = document.getElementById('password');
    const errorMessage   = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');

    // If already authenticated, redirect to appropriate landing page
    if (typeof BharathAuth !== 'undefined' && BharathAuth.isLoggedIn()) {
        const dest = BharathAuth.isAdmin() ? 'admin.html' : 'map.html';
        window.location.replace(dest);
        return;
    }

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPass = passwordInput.type === 'password';
            passwordInput.type = isPass ? 'text' : 'password';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof initAudio === 'function') initAudio();

            const userVal = usernameInput.value.trim();
            const passVal = passwordInput.value.trim();

            const authRes = (typeof BharathAuth !== 'undefined') ? BharathAuth.login(userVal, passVal) : null;

            if (authRes && authRes.success) {
                if (typeof playSound === 'function') playSound('success');
                if (loginCard) {
                    loginCard.style.transform = 'scale(0.92) translateY(-20px)';
                    loginCard.style.opacity   = '0';
                }
                const targetUrl = authRes.redirect || (authRes.role === 'admin' ? 'admin.html' : 'map.html');
                setTimeout(() => { window.location.href = targetUrl; }, 400);
            } else {
                if (typeof playSound === 'function') playSound('error');
                if (loginCard) {
                    loginCard.classList.remove('shake');
                    void loginCard.offsetWidth;
                    loginCard.classList.add('shake');
                }
                if (errorMessage) {
                    errorMessage.textContent = 'Invalid credentials. Use player/player or admin/admin.';
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});
