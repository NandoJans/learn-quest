<?php

namespace App\Dto;

class LessonSectionDto extends Dto
{
    public function __construct(
        public ?int $id = null,
        public ?int $lessonId = null,
        public ?string $type = null,
        public ?string $content = null,
        public ?int $position = null,
    ) {
    }
}
