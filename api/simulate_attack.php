<?php

require_once '../config/database.php';
require_once '../config/admin_auth.php';

header('Content-Type: application/json');

// Ambil blok pertama untuk dimanipulasi
$query = mysqli_query(
    $conn,
    "SELECT *
     FROM blockchain
     ORDER BY id_block ASC
     LIMIT 1"
);

$block = mysqli_fetch_assoc($query);

if (!$block) {
    echo json_encode([
        'status'  => false,
        'message' => 'Belum ada data blockchain untuk dimanipulasi'
    ]);
    exit();
}

$backupFile = '../config/temp_attack.json';

if (file_exists($backupFile)) {
    echo json_encode([
        'status'  => false,
        'message' => 'Simulasi serangan sudah aktif. Silakan pulihkan database terlebih dahulu.'
    ]);
    exit();
}

$idBlock = (int)$block['id_block'];
$originalHash = $block['current_hash'];

// Simpan data asli ke file cadangan sementara
$backup = [
    'id_block'      => $idBlock,
    'original_hash' => $originalHash
];

$writeSuccess = @file_put_contents(
    $backupFile,
    json_encode($backup)
);


if ($writeSuccess === false) {
    echo json_encode([
        'status'  => false,
        'message' => 'Gagal mensimulasikan serangan: Tidak dapat menulis file cadangan ke config/temp_attack.json. Periksa izin folder.'
    ]);
    exit();
}

// Ubah current_hash menjadi hash palsu untuk merusak rantai
$tamperedHash = hash('sha256', 'attacked_at_' . time());

$stmt = mysqli_prepare(
    $conn,
    "UPDATE blockchain
     SET current_hash = ?
     WHERE id_block = ?"
);

if (!$stmt) {
    echo json_encode([
        'status'  => false,
        'message' => 'Gagal mensimulasikan serangan: Gagal mempersiapkan statement SQL. ' . mysqli_error($conn)
    ]);
    exit();
}

mysqli_stmt_bind_param(
    $stmt,
    "si",
    $tamperedHash,
    $idBlock
);

$success = mysqli_stmt_execute($stmt);
$stmtError = mysqli_stmt_error($stmt);
mysqli_stmt_close($stmt);

if ($success) {
    echo json_encode([
        'status'  => true,
        'message' => 'Simulasi serangan berhasil! Blok #' . $idBlock . ' telah dimanipulasi'
    ]);
} else {
    echo json_encode([
        'status'  => false,
        'message' => 'Gagal mensimulasikan serangan: ' . $stmtError
    ]);
}

