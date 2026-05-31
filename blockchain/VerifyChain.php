<?php

class VerifyChain
{
    public static function verify(
        $blocks
    )
    {
        for(
            $i = 1;
            $i < count($blocks);
            $i++
        ){

            if(
                $blocks[$i]['previous_hash']
                !=
                $blocks[$i-1]['current_hash']
            ){
                return false;
            }

        }

        return true;
    }
}