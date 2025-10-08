<?php

namespace App\Entity;

use App\Repository\LessonSectionAnswerRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\UX\Turbo\Attribute\Broadcast;

#[ORM\Entity(repositoryClass: LessonSectionAnswerRepository::class)]
#[Broadcast]
class LessonSectionAnswer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'lessonSectionAnswers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?LessonSection $lessonSection = null;

    #[ORM\ManyToOne(inversedBy: 'lessonSectionAnswers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?LessonRegistration $lessonRegistration = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $answer = null;

    #[ORM\Column(nullable: true)]
    private ?bool $initialCorrect = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isCorrect = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLessonSection(): ?LessonSection
    {
        return $this->lessonSection;
    }

    public function setLessonSection(?LessonSection $lessonSection): static
    {
        $this->lessonSection = $lessonSection;

        return $this;
    }

    public function getLessonRegistration(): ?LessonRegistration
    {
        return $this->lessonRegistration;
    }

    public function setLessonRegistration(?LessonRegistration $lessonRegistration): static
    {
        $this->lessonRegistration = $lessonRegistration;

        return $this;
    }

    public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(?string $answer): static
    {
        $this->answer = $answer;

        return $this;
    }

    public function isInitialCorrect(): ?bool
    {
        return $this->initialCorrect;
    }

    public function getInitialCorrect(): ?bool
    {
        return $this->initialCorrect;
    }

    public function setInitialCorrect(bool $initialCorrect): static
    {
        $this->initialCorrect = $initialCorrect;

        return $this;
    }

    public function isCorrect(): ?bool
    {
        return $this->isCorrect;
    }

    public function getIsCorrect(): ?bool
    {
        return $this->isCorrect;
    }

    public function setIsCorrect(?bool $isCorrect): static
    {
        $this->isCorrect = $isCorrect;

        return $this;
    }
}
