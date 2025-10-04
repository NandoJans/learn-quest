<?php

namespace App\Dto;

class QuestionOptionDto
{
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
        public ?string $correctAnswer = null
    ) {
    }
}