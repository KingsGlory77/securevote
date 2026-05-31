<?php

require_once '../config/database.php';
require_once '../config/admin_auth.php';

header('Content-Type: application/json');

$backupFile = '../config/temp_attack.json';

if (!file_exists($backupFile)) {
    echo json_encode([
        'status'  => false,
        'message' => 'Tidak ada manipulasi data yang perlu dipulihkan'
    ]);
    exit();
}

$backup = json_decode(
    file_get_contents($backupFile),
    true
);

$idBlock = (int)$backup['id_block'];
$originalHash = $backup['original_hash'];

// Pulihkan hash asli ke database
$stmt = mysqli_prepare(
    $conn,
    "UPDATE blockchain
     SET current_hash = ?
     WHERE id_block = ?"
);

if (!$stmt) {
    echo json_encode([
        'status'  => false,
        'message' => 'Gagal memulihkan database: Gagal mempersiapkan statement SQL. ' . mysqli_error($conn)
    ]);
    exit();
}

mysqli_stmt_bind_param(
    $stmt,
    "si",
    $originalHash,
    $idBlock
);

$success = mysqli_stmt_execute($stmt);
$stmtError = mysqli_stmt_error($stmt);
mysqli_stmt_close($stmt);

if ($success) {
    // Hapus file cadangan sementara
    @unlink($backupFile);
    
    echo json_encode([
        'status'  => true,
        'message' => 'Database berhasil dipulihkan! Blockchain kembali valid'
    ]);
} else {
    echo json_encode([
        'status'  => false,
        'message' => 'Gagal memulihkan database: ' . $stmtError
    ]);
}

