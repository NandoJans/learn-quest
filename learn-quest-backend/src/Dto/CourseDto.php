<?php

namespace App\Dto;

class CourseDto extends Dto
{
    public function __construct(
        public ?int $id = null,
        public ?string $code = null,
        public ?string $name = null,
        public ?string $description = null,
        public ?string $faIcon = null,
        public ?string $primaryColor = null,
        public ?int $userId = null,
    )
    {
    }
}