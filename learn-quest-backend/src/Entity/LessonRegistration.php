<?php

namespace App\Entity;

use App\Repository\LessonRegistrationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\UX\Turbo\Attribute\Broadcast;

#[ORM\Entity(repositoryClass: LessonRegistrationRepository::class)]
#[Broadcast]
class LessonRegistration
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'lessonRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Lesson $lesson = null;

    #[ORM\ManyToOne(inversedBy: 'lessonRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'lessonRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?CourseRegistration $courseRegistration = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLesson(): ?Lesson
    {
        return $this->lesson;
    }

    public function setLesson(?Lesson $lesson): static
    {
        $this->lesson = $lesson;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCourseRegistration(): ?CourseRegistration
    {
        return $this->courseRegistration;
    }

    public function getCourseRegistrationId(): ?int
    {
        return $this->courseRegistration?->getId();
    }

    public function setCourseRegistration(?CourseRegistration $courseRegistration): static
    {
        $this->courseRegistration = $courseRegistration;

        return $this;
    }
}
