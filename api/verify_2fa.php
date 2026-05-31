<?php

require_once '../config/database.php';
session_start();

header('Content-Type: application/json');

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$otpInput = trim($data['otp_code']);

if ((!isset($_SESSION['temp_id_user']) && !isset($_SESSION['temp_id_admin'])) || !isset($_SESSION['otp_code'])) {
    echo json_encode([
        'status'  => false,
        'message' => 'Sesi tidak valid. Silakan login kembali.'
    ]);
    exit();
}

// Cek apakah OTP kedalwarsa
if (time() > $_SESSION['otp_expires']) {
    echo json_encode([
        'status'  => false,
        'message' => 'Kode OTP telah kedalwarsa. Silakan login kembali.'
    ]);
    exit();
}

// Validasi kecocokan kode OTP
if ($otpInput === (string)$_SESSION['otp_code']) {
    $tempRole = $_SESSION['temp_role'];
    
    if ($tempRole === 'admin') {
        $idAdmin = $_SESSION['temp_id_admin'];
        // Tarik data admin untuk login penuh
        $stmt = mysqli_prepare($conn, "SELECT * FROM admins WHERE id_admin = ?");
        mysqli_stmt_bind_param($stmt, "i", $idAdmin);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $admin = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        if ($admin) {
            // Regenerasi session ID untuk keamanan
            session_regenerate_id(true);
            $_SESSION['id_admin']  = $admin['id_admin'];
            $_SESSION['username']  = $admin['username'];
            $_SESSION['role']      = 'admin';
            
            // Bersihkan data session sementara
            unset($_SESSION['temp_id_admin']);
            unset($_SESSION['temp_role']);
            unset($_SESSION['otp_code']);
            unset($_SESSION['otp_expires']);

            echo json_encode([
                'status'  => true,
                'role'    => 'admin',
                'message' => 'Verifikasi berhasil, login berhasil'
            ]);
            exit();
        } else {
            echo json_encode([
                'status'  => false,
                'message' => 'Admin tidak ditemukan.'
            ]);
            exit();
        }
    } else {
        $idUser = $_SESSION['temp_id_user'];
        // Tarik data user untuk login penuh
        $stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE id_user = ?");
        mysqli_stmt_bind_param($stmt, "i", $idUser);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $user = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        if ($user) {
            // Regenerasi session ID untuk keamanan
            session_regenerate_id(true);
            $_SESSION['id_user']   = $user['id_user'];
            $_SESSION['username']  = $user['username'];
            $_SESSION['role']      = 'user';
            
            // Bersihkan data session sementara
            unset($_SESSION['temp_id_user']);
            unset($_SESSION['temp_role']);
            unset($_SESSION['otp_code']);
            unset($_SESSION['otp_expires']);

            echo json_encode([
                'status'  => true,
                'role'   => 'user',
                'message' => 'Verifikasi berhasil, login berhasil'
            ]);
            exit();
        } else {
            echo json_encode([
                'status'  => false,
                'message' => 'Pengguna tidak ditemukan.'
            ]);
            exit();
        }
    }
} else {
    echo json_encode([
        'status'  => false,
        'message' => 'Kode OTP salah. Silakan coba kembali.'
    ]);
    exit();
}
