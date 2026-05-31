<?php

class Block
{
    public $previousHash;
    public $dataHash;
    public $currentHash;
    public $timestamp;

    public function __construct(
        $previousHash,
        $dataHash
    )
    {
        $this->previousHash =
        $previousHash;

        $this->dataHash =
        $dataHash;

        $this->timestamp =
        time();

        $this->currentHash =
        hash(
            'sha256',
            $previousHash .
            $dataHash .
            $this->timestamp
        );
    }
}