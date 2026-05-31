<?php

require_once 'session.php';

if(
!isset($_SESSION['id_admin'])
||
$_SESSION['role']
!=
'admin'
){
http_response_code(403);
exit();
}