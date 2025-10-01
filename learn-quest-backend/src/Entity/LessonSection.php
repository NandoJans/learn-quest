<?php

namespace App\Entity;

use App\Repository\LessonSectionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\UX\Turbo\Attribute\Broadcast;

#[ORM\Entity(repositoryClass: LessonSectionRepository::class)]
#[Broadcast]
class LessonSection
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Lesson::class, inversedBy: 'sections')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Lesson $lesson = null;

    #[ORM\Column(length: 50)]
    private ?string $type = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $content = null;

    #[ORM\Column]
    private int $position = 0;

    // Question fields
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $questionPrompt = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $questionInputType = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $questionAnswers = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $questionCorrectAnswer = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $questionExplanation = null;

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
    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

        return $this;
    }

    public function getQuestionPrompt(): ?string
    {
        return $this->questionPrompt;
    }

    public function setQuestionPrompt(?string $questionPrompt): static
    {
        $this->questionPrompt = $questionPrompt;

        return $this;
    }

    public function getQuestionInputType(): ?string
    {
        return $this->questionInputType;
    }

    public function setQuestionInputType(?string $questionInputType): static
    {
        $this->questionInputType = $questionInputType;

        return $this;
    }

    public function getQuestionAnswers(): ?array
    {
        return $this->questionAnswers;
    }

    public function setQuestionAnswers(?array $questionAnswers): static
    {
        $this->questionAnswers = $questionAnswers;

        return $this;
    }

    public function getQuestionCorrectAnswer(): ?string
    {
        return $this->questionCorrectAnswer;
    }

    public function setQuestionCorrectAnswer(?string $questionCorrectAnswer): static
    {
        $this->questionCorrectAnswer = $questionCorrectAnswer;

        return $this;
    }

    public function getQuestionExplanation(): ?string
    {
        return $this->questionExplanation;
    }

    public function setQuestionExplanation(?string $questionExplanation): static
    {
        $this->questionExplanation = $questionExplanation;

        return $this;
    }
}
