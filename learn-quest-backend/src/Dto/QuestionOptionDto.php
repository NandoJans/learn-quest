<?php

namespace App\Dto;

class QuestionOptionDto extends Dto
{
    public function __construct(
        public ?int $id = null,
        public ?int $lessonSectionId = null,
        public ?string $optionText = null,
        public ?int $position = null,
    ) {
    }
}
