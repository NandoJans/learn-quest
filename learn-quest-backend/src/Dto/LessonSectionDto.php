<?php

namespace App\Dto;

use App\Entity\QuestionOption;
use App\Service\EntityService;
use Doctrine\ORM\PersistentCollection;
use Symfony\Bridge\Doctrine\ManagerRegistry;

class LessonSectionDto extends Dto
{
    public array $questionOptions = [];
    public ?string $givenAnswer = null; // Answer of current registration (if provided via query)

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
    ) {
    }

    public function extraData(EntityService $entityService, ManagerRegistry $doctrine): void
    {
        if (
            $this->type === 'question' &&
            ($this->questionType === 'radio' || $this->questionType === 'checkbox')
        ) {
            $questionOptions = $doctrine->getRepository(QuestionOption::class)->findBy([
                'lessonSection' => $this->id
            ]);

            $this->questionOptions = $entityService->mapEntityArrayToDtoArray(
                $questionOptions,
                QuestionOptionDto::class,
                [
                    'lessonId' => function ($option) {
                        // derive lesson id via the section relation to avoid needing QuestionOption->lesson FK
                        return $option->getLessonSection()?->getLesson()?->getId();
                    },
                ]
            );
        }
    }
}
