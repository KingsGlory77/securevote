<?php

require_once 'session.php';

if(
!isset($_SESSION['id_user'])
||
$_SESSION['role']
!=
'user'
){
http_response_code(403);
exit();
}