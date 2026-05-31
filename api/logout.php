<?php

session_start();

session_destroy();

echo json_encode([
    'status'  => true,
    'message' => 'Logout berhasil'
]);