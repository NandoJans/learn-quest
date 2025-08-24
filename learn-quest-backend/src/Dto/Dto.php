<?php

namespace App\Dto;

use App\Service\EntityService;
use Symfony\Bridge\Doctrine\ManagerRegistry;

abstract class Dto
{
    public function extraData(EntityService $entityService, ManagerRegistry $doctrine): void
    {

    }

    public function fromArray(array $data, EntityService $entityService, ManagerRegistry $doctrine): void
    {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->{$key} = $value;
            }
        }
        $this->extraData($entityService, $doctrine);
    }
}