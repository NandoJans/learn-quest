<?php

namespace App\Dto;

use App\Entity\QuestionOption;
use App\Service\EntityService;
use Doctrine\ORM\PersistentCollection;
use Symfony\Bridge\Doctrine\ManagerRegistry;

class LessonSectionAnswerDto extends Dto
{
    public function __construct(
        public ?int $id = null,
        public ?int $lessonSectionId = null,
        public ?string $answer = null,
        public ?bool $initialCorrect = null,
        public ?bool $isCorrect = null,
    ) {
    }
}
