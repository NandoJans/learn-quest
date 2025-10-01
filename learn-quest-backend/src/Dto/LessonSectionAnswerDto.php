<?php

namespace App\Dto;

class LessonSectionAnswerDto extends Dto
{
    public function __construct(
        public ?int $id = null,
        public ?int $userId = null,
        public ?int $lessonSectionId = null,
        public ?string $answer = null,
        public ?bool $isCorrect = null,
        public ?string $createdAt = null,
    ) {
    }
}
