<?php

require_once '../config/database.php';
require_once '../config/admin_auth.php';

header('Content-Type: application/json');

$query = mysqli_query(
    $conn,
    "SELECT
        k.nama_paslon,
        COUNT(v.id_vote) AS total
     FROM kandidat k
     LEFT JOIN votes v
        ON k.id_kandidat = v.id_kandidat
     GROUP BY k.id_kandidat"
);

$results = [];

while ($row = mysqli_fetch_assoc($query)) {
    $results[] = $row;
}

echo json_encode($results);