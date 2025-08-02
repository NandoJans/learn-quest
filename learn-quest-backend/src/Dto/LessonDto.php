<?php

namespace App\Dto;

class LessonDto
{
    public function __construct(
        public ?int $id = null,
        public ?int $courseId = null,
        public ?string $code = null,
        public ?string $name = null,
        public ?string $description = null,
        public ?string $faIcon = null,
        public ?string $primaryColor = null,
    )
    {
    }
}