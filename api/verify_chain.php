<?php

require_once '../config/database.php';
require_once '../blockchain/VerifyChain.php';

header('Content-Type: application/json');

$query = mysqli_query(
    $conn,
    "SELECT *
     FROM blockchain
     ORDER BY id_block ASC"
);

$blocks = [];

while ($row = mysqli_fetch_assoc($query)) {
    $blocks[] = $row;
}

$isValid = VerifyChain::verify($blocks);

echo json_encode([
    'status' => $isValid,
    'total_blocks' => count($blocks)
]);