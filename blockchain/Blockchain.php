<?php

require_once 'Block.php';

class Blockchain
{
    public static function createBlock(
        $previousHash,
        $data
    )
    {
        $dataHash =
        hash(
            'sha256',
            $data
        );

        return new Block(
            $previousHash,
            $dataHash
        );
    }
}