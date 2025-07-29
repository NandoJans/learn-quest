<?php

namespace App\Entity;

use App\Repository\CourseRegistrationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\UX\Turbo\Attribute\Broadcast;

#[ORM\Entity(repositoryClass: CourseRegistrationRepository::class)]
#[Broadcast]
class CourseRegistration
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'courseRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Course $CourseId = null;

    #[ORM\ManyToOne(inversedBy: 'courseRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $userId = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCourseId(): ?Course
    {
        return $this->CourseId;
    }

    public function setCourseId(?Course $CourseId): static
    {
        $this->CourseId = $CourseId;

        return $this;
    }

    public function getUserId(): ?User
    {
        return $this->userId;
    }

    public function setUserId(?User $userId): static
    {
        $this->userId = $userId;

        return $this;
    }
}
