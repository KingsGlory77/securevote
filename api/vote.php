<?php

require_once '../config/database.php';
require_once '../config/user_auth.php';
require_once '../blockchain/Blockchain.php';

header('Content-Type: application/json');

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$idUser = $_SESSION['id_user'];
$idKandidat = $data['id_kandidat'];

/*
|--------------------------------------------------------------------------
| Cek apakah user sudah voting
|--------------------------------------------------------------------------
*/

$stmt = mysqli_prepare($conn, "SELECT has_voted FROM users WHERE id_user = ?");
mysqli_stmt_bind_param($stmt, "i", $idUser);
mysqli_stmt_execute($stmt);
$checkUser = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($checkUser);
mysqli_stmt_close($stmt);

if ($user['has_voted']) {

    echo json_encode([
        'status'  => false,
        'message' => 'Anda sudah melakukan voting'
    ]);

    exit();
}

/*
|--------------------------------------------------------------------------
| Ambil block terakhir
|--------------------------------------------------------------------------
*/

$lastBlockQuery = mysqli_query(
    $conn,
    "SELECT *
     FROM blockchain
     ORDER BY id_block DESC
     LIMIT 1"
);

$lastBlock = mysqli_fetch_assoc($lastBlockQuery);

$previousHash = $lastBlock
    ? $lastBlock['current_hash']
    : '000000';

/*
|--------------------------------------------------------------------------
| Generate blockchain block
|--------------------------------------------------------------------------
*/

$voteData = $idUser .
    '-' .
    $idKandidat .
    '-' .
    time();

$block = Blockchain::createBlock(
    $previousHash,
    $voteData
);

/*
|--------------------------------------------------------------------------
| Simpan vote
|--------------------------------------------------------------------------
*/

$stmt = mysqli_prepare($conn, "INSERT INTO votes (id_user, id_kandidat, vote_hash) VALUES (?, ?, ?)");
mysqli_stmt_bind_param($stmt, "iis", $idUser, $idKandidat, $block->dataHash);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

/*
|--------------------------------------------------------------------------
| Simpan blockchain
|--------------------------------------------------------------------------
*/

$stmt = mysqli_prepare($conn, "INSERT INTO blockchain (previous_hash, current_hash, data_hash) VALUES (?, ?, ?)");
mysqli_stmt_bind_param($stmt, "sss", $block->previousHash, $block->currentHash, $block->dataHash);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

/*
|--------------------------------------------------------------------------
| Update status user
|--------------------------------------------------------------------------
*/

$stmt = mysqli_prepare($conn, "UPDATE users SET has_voted = 1 WHERE id_user = ?");
mysqli_stmt_bind_param($stmt, "i", $idUser);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

echo json_encode([
    'status'  => true,
    'message' => 'Voting berhasil'
]);