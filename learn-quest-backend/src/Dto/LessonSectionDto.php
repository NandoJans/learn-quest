<?php

namespace App\Dto;

use App\Entity\QuestionOption;
use App\Service\EntityService;
use Doctrine\ORM\PersistentCollection;
use Symfony\Bridge\Doctrine\ManagerRegistry;

class LessonSectionDto extends Dto
{
    public array $questionOptions = [];

    public function __construct(
        public ?int $id = null,
        public ?int $lessonId = null,
        public ?string $type = null,
        public ?string $content = null,
        public ?int $position = null,
        public ?string $moduleSlug = null,
        public mixed $moduleConfig = null,
        public ?string $questionPrompt = null,
        public ?string $questionType = null,
        public ?string $questionExplanation = null,
        public ?string $correctAnswer = null,
    ) {
    }

    public function extraData(EntityService $entityService, ManagerRegistry $doctrine): void
    {
        if (
            $this->type === 'question' &&
            $this->questionType === 'radio' || 'checkbox'
        ) {
            $questionOptions = $doctrine->getRepository(QuestionOption::class)->findBy([
                'lessonSection' => $this->id
            ]);

            $this->questionOptions = $entityService->mapEntityArrayToDtoArray(
                $questionOptions,
                QuestionOptionDto::class
            );
        }
    }
}
