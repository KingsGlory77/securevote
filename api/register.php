<?php

require_once '../config/database.php';

header('Content-Type: application/json');

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$username = trim($data['username']);
$password = password_hash(
    $data['password'],
    PASSWORD_DEFAULT
);

$role = isset($data['role']) ? trim($data['role']) : 'user';

if ($role === 'admin') {
    $stmt = mysqli_prepare($conn, "SELECT id_admin FROM admins WHERE username = ?");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $checkResult = mysqli_stmt_get_result($stmt);
    $adminExists = mysqli_num_rows($checkResult) > 0;
    mysqli_stmt_close($stmt);

    if ($adminExists) {
        echo json_encode([
            'status'  => false,
            'message' => 'Username admin sudah digunakan'
        ]);
        exit();
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO admins (username, password) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "ss", $username, $password);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    echo json_encode([
        'status'  => true,
        'message' => 'Registrasi admin berhasil'
    ]);
    exit();
} else {
    $stmt = mysqli_prepare($conn, "SELECT id_user FROM users WHERE username = ?");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $checkResult = mysqli_stmt_get_result($stmt);
    $userExists = mysqli_num_rows($checkResult) > 0;
    mysqli_stmt_close($stmt);

    if ($userExists) {
        echo json_encode([
            'status'  => false,
            'message' => 'Username sudah digunakan'
        ]);
        exit();
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO users (username, password) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt, "ss", $username, $password);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    echo json_encode([
        'status'  => true,
        'message' => 'Registrasi berhasil'
    ]);
    exit();
}