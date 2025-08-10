<?php

namespace App\Dto;

use App\Service\EntityService;
use Symfony\Bridge\Doctrine\ManagerRegistry;

class CourseRegistrationDto extends Dto
{
    private ?CourseDto $course = null;

    public function __construct(
        public ?int $id = null,
        public ?int $courseId = null,
        public ?int $userId = null,
    )
    {
    }

    public function extraData(EntityService $entityService, ManagerRegistry $doctrine): void
    {
        // This method should add course data
        if ($this->id) {
            $course = $doctrine->getRepository($entityService->getEntityClass('course'))->find($this->courseId);
            $this->course = $entityService->mapEntityToDto($course, CourseDto::class);
        }
    }
}