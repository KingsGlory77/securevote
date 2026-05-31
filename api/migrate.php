<?php

require_once '../config/database.php';

header('Content-Type: application/json');

$queries = [
    "ALTER TABLE users ADD COLUMN login_attempts INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN locked_until DATETIME DEFAULT NULL"
];

$results = [];
foreach ($queries as $query) {
    if (strpos($query, 'login_attempts') !== false) {
        $check = mysqli_query($conn, "SHOW COLUMNS FROM users LIKE 'login_attempts'");
        if (mysqli_num_rows($check) > 0) {
            $results[] = "Column 'login_attempts' already exists";
            continue;
        }
    }
    if (strpos($query, 'locked_until') !== false) {
        $check = mysqli_query($conn, "SHOW COLUMNS FROM users LIKE 'locked_until'");
        if (mysqli_num_rows($check) > 0) {
            $results[] = "Column 'locked_until' already exists";
            continue;
        }
    }
    
    $res = mysqli_query($conn, $query);
    if ($res) {
        $results[] = "Success: " . $query;
    } else {
        $results[] = "Failed: " . $query . " - Error: " . mysqli_error($conn);
    }
}

echo json_encode([
    'status'  => true,
    'results' => $results
]);
