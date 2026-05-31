<?php

require_once '../config/database.php';

$username = 'admin';
$password = password_hash('admin123', PASSWORD_DEFAULT);

$stmt = mysqli_prepare(
    $conn,
    "SELECT id_admin
     FROM admins
     WHERE username = ?"
);

mysqli_stmt_bind_param(
    $stmt,
    "s",
    $username
);

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$adminExists = mysqli_num_rows($result) > 0;
mysqli_stmt_close($stmt);

if ($adminExists) {
    // Update password jika admin sudah ada
    $stmt = mysqli_prepare(
        $conn,
        "UPDATE admins
         SET password = ?
         WHERE username = ?"
    );
    mysqli_stmt_bind_param(
        $stmt,
        "ss",
        $password,
        $username
    );
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    echo "User 'admin' sudah ada di database, password telah diperbarui. Password: admin123\n";
} else {
    // Insert user admin baru
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO admins (username, password)
         VALUES (?, ?)"
    );
    mysqli_stmt_bind_param(
        $stmt,
        "ss",
        $username,
        $password
    );
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    
    echo "User admin baru berhasil dibuat. Username: admin | Password: admin123\n";
}
