<?php

namespace App\Dto;

use App\Entity\Lesson;
use App\Service\EntityService;
use Symfony\Bridge\Doctrine\ManagerRegistry;

class LessonRegistrationDto extends Dto
{
    private ?LessonDto $lesson = null;

    public function __construct(
        public ?int $id = null,
        public ?int $lessonId = null,
        public ?int $courseRegistrationId = null,
        public ?int $userId = null,
    )
    {
    }

    public function extraData(EntityService $entityService, ManagerRegistry $doctrine): void
    {
        // This method should add course data
        if ($this->id) {
            $lesson = $doctrine->getRepository($entityService->getEntityClass('lesson'))->find($this->lessonId);
            $this->lesson = $entityService->mapEntityToDto($lesson, Lesson::class);
        }
    }
}