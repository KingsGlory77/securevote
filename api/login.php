<?php

require_once '../config/database.php';

session_start();

header('Content-Type: application/json');

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$username = trim($data['username']);
$password = $data['password'];
$role = isset($data['role']) ? trim($data['role']) : 'user';

if ($role === 'admin') {
    // 1. Coba cari di tabel admins
    $stmt = mysqli_prepare($conn, "SELECT * FROM admins WHERE username = ?");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $query = mysqli_stmt_get_result($stmt);
    $admin = mysqli_fetch_assoc($query);
    mysqli_stmt_close($stmt);

    if ($admin) {
        // Cek apakah akun admin sedang terkunci
        $now = date('Y-m-d H:i:s');
        if ($admin['locked_until'] && $admin['locked_until'] > $now) {
            $lockedTime = strtotime($admin['locked_until']) - time();
            $minutes = ceil($lockedTime / 60);
            
            echo json_encode([
                'status'  => false,
                'message' => "Akun Admin Anda terkunci sementara. Silakan coba kembali dalam " . $minutes . " menit."
            ]);
            exit();
        }

        // Verifikasi Password Admin
        if (password_verify($password, $admin['password'])) {
            // Reset login attempts
            $stmtUpdate = mysqli_prepare($conn, "UPDATE admins SET login_attempts = 0, locked_until = NULL WHERE id_admin = ?");
            mysqli_stmt_bind_param($stmtUpdate, "i", $admin['id_admin']);
            mysqli_stmt_execute($stmtUpdate);
            mysqli_stmt_close($stmtUpdate);

            // Generate OTP
            $otp = rand(100000, 999999);
            
            // Simpan ke session sementara
            $_SESSION['temp_id_admin'] = $admin['id_admin'];
            $_SESSION['temp_role']     = 'admin';
            $_SESSION['otp_code']      = $otp;
            $_SESSION['otp_expires']   = time() + 300;

            echo json_encode([
                'status'      => true,
                'require_2fa' => true,
                'otp_code'    => $otp
            ]);
            exit();
        } else {
            // Password salah untuk admin
            $attempts = $admin['login_attempts'] + 1;
            $maxAttempts = 3;

            if ($attempts >= $maxAttempts) {
                $lockedUntil = date('Y-m-d H:i:s', time() + 300);
                $stmtUpdate = mysqli_prepare($conn, "UPDATE admins SET login_attempts = ?, locked_until = ? WHERE id_admin = ?");
                mysqli_stmt_bind_param($stmtUpdate, "isi", $attempts, $lockedUntil, $admin['id_admin']);
                mysqli_stmt_execute($stmtUpdate);
                mysqli_stmt_close($stmtUpdate);

                echo json_encode([
                    'status'  => false,
                    'message' => "Kata sandi salah. Akun Admin Anda dikunci selama 5 menit."
                ]);
                exit();
            } else {
                $stmtUpdate = mysqli_prepare($conn, "UPDATE admins SET login_attempts = ? WHERE id_admin = ?");
                mysqli_stmt_bind_param($stmtUpdate, "ii", $attempts, $admin['id_admin']);
                mysqli_stmt_execute($stmtUpdate);
                mysqli_stmt_close($stmtUpdate);

                $remaining = $maxAttempts - $attempts;
                echo json_encode([
                    'status'  => false,
                    'message' => "Username atau password salah. Sisa percobaan login: " . $remaining
                ]);
                exit();
            }
        }
    } else {
        echo json_encode([
            'status'  => false,
            'message' => "Username atau password salah."
        ]);
        exit();
    }
} else {
    // 2. Coba cari di tabel users
    $stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE username = ?");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $query = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($query);
    mysqli_stmt_close($stmt);

    if ($user) {
        // Cek apakah akun user sedang terkunci
        $now = date('Y-m-d H:i:s');
        if ($user['locked_until'] && $user['locked_until'] > $now) {
            $lockedTime = strtotime($user['locked_until']) - time();
            $minutes = ceil($lockedTime / 60);
            
            echo json_encode([
                'status'  => false,
                'message' => "Akun Anda terkunci sementara. Silakan coba kembali dalam " . $minutes . " menit."
            ]);
            exit();
        }

        // Verifikasi Password User
        if (password_verify($password, $user['password'])) {
            // Reset login attempts
            $stmtUpdate = mysqli_prepare($conn, "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id_user = ?");
            mysqli_stmt_bind_param($stmtUpdate, "i", $user['id_user']);
            mysqli_stmt_execute($stmtUpdate);
            mysqli_stmt_close($stmtUpdate);

            // Generate OTP
            $otp = rand(100000, 999999);
            
            // Simpan ke session sementara
            $_SESSION['temp_id_user'] = $user['id_user'];
            $_SESSION['temp_role']     = 'user';
            $_SESSION['otp_code']      = $otp;
            $_SESSION['otp_expires']   = time() + 300;

            echo json_encode([
                'status'      => true,
                'require_2fa' => true,
                'otp_code'    => $otp
            ]);
            exit();
        } else {
            // Password salah untuk user
            $attempts = $user['login_attempts'] + 1;
            $maxAttempts = 3;

            if ($attempts >= $maxAttempts) {
                $lockedUntil = date('Y-m-d H:i:s', time() + 300);
                $stmtUpdate = mysqli_prepare($conn, "UPDATE users SET login_attempts = ?, locked_until = ? WHERE id_user = ?");
                mysqli_stmt_bind_param($stmtUpdate, "isi", $attempts, $lockedUntil, $user['id_user']);
                mysqli_stmt_execute($stmtUpdate);
                mysqli_stmt_close($stmtUpdate);

                echo json_encode([
                    'status'  => false,
                    'message' => "Kata sandi salah. Akun Anda dikunci selama 5 menit."
                ]);
                exit();
            } else {
                $stmtUpdate = mysqli_prepare($conn, "UPDATE users SET login_attempts = ? WHERE id_user = ?");
                mysqli_stmt_bind_param($stmtUpdate, "ii", $attempts, $user['id_user']);
                mysqli_stmt_execute($stmtUpdate);
                mysqli_stmt_close($stmtUpdate);

                $remaining = $maxAttempts - $attempts;
                echo json_encode([
                    'status'  => false,
                    'message' => "Username atau password salah. Sisa percobaan login: " . $remaining
                ]);
                exit();
            }
        }
    } else {
        echo json_encode([
            'status'  => false,
            'message' => "Username atau password salah."
        ]);
        exit();
    }
}