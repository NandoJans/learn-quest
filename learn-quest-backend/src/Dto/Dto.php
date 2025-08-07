<?php

namespace App\Dto;

use App\Service\EntityService;
use Symfony\Bridge\Doctrine\ManagerRegistry;

abstract class Dto
{
    public function extraData(EntityService $entityService, ManagerRegistry $doctrine): void
    {

    }
}