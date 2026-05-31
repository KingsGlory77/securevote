// Sistem Notifikasi Toast Kustom Global
window.showNotification = function(message, type = 'info') {
    const existing = document.getElementById('sv-custom-toast');
    if (existing) {
        existing.remove();
    }
    
    if (!document.getElementById('sv-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'sv-toast-styles';
        style.innerHTML = `
            .sv-toast-container {
                position: fixed;
                top: 25px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                z-index: 100020;
                max-width: 440px;
                width: 90%;
                background: #1e293b;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 14px;
                padding: 1.1rem 1.4rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                gap: 14px;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
                opacity: 0;
                color: #f1f5f9;
                font-family: 'Outfit', sans-serif;
            }
            .sv-toast-container.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            .sv-toast-icon {
                font-size: 24px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
            }
            .sv-toast-msg {
                font-size: 14px;
                font-weight: 500;
                flex-grow: 1;
                line-height: 1.4;
            }
            .sv-toast-close {
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
                font-size: 18px;
                background: none;
                border: none;
                color: #94a3b8;
                padding: 0;
                line-height: 1;
            }
            .sv-toast-close:hover {
                opacity: 1;
                color: #ffffff;
            }
            .sv-toast-success { border-left: 4px solid #10b981; }
            .sv-toast-error { border-left: 4px solid #ef4444; }
            .sv-toast-info { border-left: 4px solid #3b82f6; }
        `;
        document.head.appendChild(style);
    }
    
    let icon = 'ℹ️';
    let typeClass = 'sv-toast-info';
    if (type === 'success') {
        icon = '✅';
        typeClass = 'sv-toast-success';
    } else if (type === 'error' || type === 'danger') {
        icon = '❌';
        typeClass = 'sv-toast-error';
    }
    
    const toast = document.createElement('div');
    toast.id = 'sv-custom-toast';
    toast.className = `sv-toast-container ${typeClass}`;
    toast.innerHTML = `
        <div class="sv-toast-icon">${icon}</div>
        <div class="sv-toast-msg">${message}</div>
        <button class="sv-toast-close" onclick="this.parentElement.classList.remove('show'); setTimeout(()=>this.parentElement.remove(), 300);">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 50);
    
    const autoCloseTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('loginRole') ? document.getElementById('loginRole').value : 'user';

        try {
            const response = await fetch(
                '../api/login.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        role
                    })
                }
            );

            const result = await response.json();

            if (result.status) {
                if (result.require_2fa) {
                    // Tampilkan mock email notification toast
                    const toast = document.getElementById('mockEmailToast');
                    const mockOtpValue = document.getElementById('mockOtpValue');
                    if (toast && mockOtpValue) {
                        mockOtpValue.innerText = result.otp_code;
                        toast.classList.add('show');
                    }
                    
                    // Transisi ke form OTP
                    document.getElementById('loginCardBody').classList.add('d-none');
                    document.getElementById('otpCardBody').classList.remove('d-none');
                    
                    // Fokus ke input OTP pertama
                    const otpInputs = document.querySelectorAll('.otp-input');
                    if (otpInputs.length > 0) {
                        otpInputs[0].focus();
                    }
                } else {
                    // Redirect langsung jika tidak memerlukan 2fa (admin / fallback)
                    if (result.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error during login:', error);
            showNotification('Terjadi kesalahan sistem saat mencoba masuk.', 'error');
        }
    });
}

// Navigasi fokus otomatis untuk input OTP 6-digit
const otpInputs = document.querySelectorAll('.otp-input');
if (otpInputs.length > 0) {
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
}

// Handler untuk form verifikasi OTP 2FA
const otpForm = document.getElementById('otpForm');
if (otpForm) {
    otpForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        let otpCode = '';
        otpInputs.forEach(input => {
            otpCode += input.value;
        });

        try {
            const response = await fetch('../api/verify_2fa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp_code: otpCode })
            });

            const result = await response.json();

            if (result.status) {
                const toast = document.getElementById('mockEmailToast');
                if (toast) toast.classList.remove('show');

                if (result.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
            showNotification('Terjadi kesalahan saat memverifikasi kode OTP.', 'error');
        }
    });
}

// Handler untuk tombol Batal di form OTP
const backToLoginBtn = document.getElementById('backToLoginBtn');
if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
        otpInputs.forEach(input => input.value = '');

        const toast = document.getElementById('mockEmailToast');
        if (toast) toast.classList.remove('show');

        document.getElementById('otpCardBody').classList.add('d-none');
        document.getElementById('loginCardBody').classList.remove('d-none');
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('registerRole') ? document.getElementById('registerRole').value : 'user';

        try {
            const response = await fetch(
                '../api/register.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        role
                    })
                }
            );

            const result = await response.json();

            if (result.status) {
                showNotification('Registrasi berhasil! Silakan masuk.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            showNotification('Terjadi kesalahan sistem saat mendaftar.', 'error');
        }
    });
}

// Fungsi untuk menyuntikkan CSS Modal & Overlay secara dinamis
function injectLogoutStyles() {
    if (document.getElementById('sv-logout-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'sv-logout-styles';
    style.innerHTML = `
        /* Custom Modal Backdrop dengan blur */
        .sv-overlay-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .sv-overlay-backdrop.active {
            opacity: 1;
        }
        /* Card Modal Konfirmasi */
        .sv-modal-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem 2rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .sv-overlay-backdrop.active .sv-modal-card {
            transform: scale(1);
        }
        /* Fullscreen Success Overlay */
        .sv-success-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0f172a;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.4s ease;
            color: white;
        }
        .sv-success-overlay.active {
            opacity: 1;
        }
        .sv-success-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            padding: 3rem 2rem;
            max-width: 440px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: scale(0.95);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sv-success-overlay.active .sv-success-card {
            transform: scale(1);
        }
        /* Animasi SVG */
        .sv-icon-pulse {
            animation: sv-pulse 2s infinite;
        }
        .sv-scale-up {
            animation: sv-scale-up-anim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes sv-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes sv-scale-up-anim {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Fungsi untuk menampilkan Modal Konfirmasi Keluar
function showLogoutConfirmation(onConfirm) {
    injectLogoutStyles();
    
    const backdrop = document.createElement('div');
    backdrop.className = 'sv-overlay-backdrop';
    
    backdrop.innerHTML = `
        <div class="sv-modal-card">
            <div class="text-danger mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="sv-icon-pulse">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </div>
            <h4 class="fw-bold mb-2 text-dark" style="font-family: 'Segoe UI', sans-serif;">Konfirmasi Keluar</h4>
            <p class="text-muted mb-4" style="font-size: 15px;">Apakah Anda yakin ingin keluar dari sistem e-voting SecureVote?</p>
            <div class="d-flex justify-content-center gap-3">
                <button type="button" id="sv-cancel-btn" class="btn btn-light px-4 py-2 border" style="border-radius: 10px; font-weight: 500;">Batal</button>
                <button type="button" id="sv-confirm-btn" class="btn btn-danger px-4 py-2" style="border-radius: 10px; font-weight: 500;">Keluar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(backdrop);
    
    setTimeout(() => backdrop.classList.add('active'), 10);
    
    const closeBtn = backdrop.querySelector('#sv-cancel-btn');
    const dismissModal = () => {
        backdrop.classList.remove('active');
        setTimeout(() => backdrop.remove(), 300);
    };
    closeBtn.addEventListener('click', dismissModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) dismissModal();
    });
    
    const confirmBtn = backdrop.querySelector('#sv-confirm-btn');
    confirmBtn.addEventListener('click', () => {
        backdrop.classList.remove('active');
        setTimeout(() => {
            backdrop.remove();
            onConfirm();
        }, 300);
    });
}

// Fungsi untuk menampilkan Fullscreen Success Overlay
function showSuccessOverlay(title, message, callback) {
    injectLogoutStyles();
    
    const overlay = document.createElement('div');
    overlay.className = 'sv-success-overlay';
    
    overlay.innerHTML = `
        <div class="sv-success-card">
            <div class="text-success mb-4 sv-scale-up">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="fw-bold mb-3">${title}</h3>
            <p class="text-secondary mb-4" style="font-size: 15px; line-height: 1.6;">${message}</p>
            <div class="spinner-border text-primary spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);
    
    setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            callback();
        }, 400);
    }, 2000);
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        showLogoutConfirmation(async () => {
            try {
                const response = await fetch('../api/logout.php');
                const result = await response.json();
                if (result.status) {
                    showSuccessOverlay('Logout Berhasil', result.message || 'Anda telah keluar secara aman dari sistem.', () => {
                        window.location.href = 'login.html';
                    });
                } else {
                    showNotification('Gagal logout: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                showNotification('Terjadi kesalahan saat logout.', 'error');
            }
        });
    });
}

const finishBtn = document.getElementById('finishBtn');
if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        showSuccessOverlay(
            'Voting Selesai!', 
            'Terima kasih telah berpartisipasi dalam SecureVote! Pilihan Anda telah aman tercatat di dalam Blockchain.', 
            async () => {
                try {
                    await fetch('../api/logout.php');
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error during session completion:', error);
                    window.location.href = 'login.html';
                }
            }
        );
    });
}

// Expose visual overlays to window scope
window.showSuccessOverlay = showSuccessOverlay;
window.showLogoutConfirmation = showLogoutConfirmation;