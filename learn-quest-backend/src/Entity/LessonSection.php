<?php

namespace App\Entity;

use App\Repository\LessonSectionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $moduleSlug = null;

    #[ORM\Column(nullable: true)]
    private ?array $moduleConfig = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $questionPrompt = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $questionType = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $questionExplanation = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $correctAnswer = null;

    /**
     * @var Collection<int, LessonSectionAnswer>
     */
    #[ORM\OneToMany(targetEntity: LessonSectionAnswer::class, mappedBy: 'lessonSection', orphanRemoval: true)]
    private Collection $lessonSectionAnswers;

    /**
     * @var Collection<int, QuestionOption>
     */
    #[ORM\OneToMany(targetEntity: QuestionOption::class, mappedBy: 'lessonSection', orphanRemoval: true, cascade: ['persist', 'remove'])]
    #[ORM\OrderBy(['position' => 'ASC'])]
    private Collection $questionOptions;

    public function __construct()
    {
        $this->lessonSectionAnswers = new ArrayCollection();
        $this->questionOptions = new ArrayCollection();
    }

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

    public function getModuleSlug(): ?string
    {
        return $this->moduleSlug;
    }

    public function setModuleSlug(?string $moduleSlug): static
    {
        $this->moduleSlug = $moduleSlug;

        return $this;
    }

    public function getModuleConfig(): ?array
    {
        return $this->moduleConfig;
    }

    public function setModuleConfig(?array $moduleConfig): static
    {
        $this->moduleConfig = $moduleConfig;

        return $this;
    }

    /**
     * @return Collection<int, LessonSectionAnswer>
     */
    public function getLessonSectionAnswers(): Collection
    {
        return $this->lessonSectionAnswers;
    }

    public function addLessonSectionAnswer(LessonSectionAnswer $lessonSectionAnswer): static
    {
        if (!$this->lessonSectionAnswers->contains($lessonSectionAnswer)) {
            $this->lessonSectionAnswers->add($lessonSectionAnswer);
            $lessonSectionAnswer->setLessonSection($this);
        }

        return $this;
    }

    public function removeLessonSectionAnswer(LessonSectionAnswer $lessonSectionAnswer): static
    {
        if ($this->lessonSectionAnswers->removeElement($lessonSectionAnswer)) {
            // set the owning side to null (unless already changed)
            if ($lessonSectionAnswer->getLessonSection() === $this) {
                $lessonSectionAnswer->setLessonSection(null);
            }
        }

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

    public function getQuestionType(): ?string
    {
        return $this->questionType;
    }

    public function setQuestionType(?string $questionType): static
    {
        $this->questionType = $questionType;

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

    public function getCorrectAnswer(): ?string
    {
        return $this->correctAnswer;
    }

    public function setCorrectAnswer(?string $correctAnswer): static
    {
        $this->correctAnswer = $correctAnswer;

        return $this;
    }

    /**
     * @return Collection<int, QuestionOption>
     */
    public function getQuestionOptions(): Collection
    {
        return $this->questionOptions;
    }

    public function addQuestionOption(QuestionOption $questionOption): static
    {
        if (!$this->questionOptions->contains($questionOption)) {
            $this->questionOptions->add($questionOption);
            $questionOption->setLessonSection($this);
        }

        return $this;
    }

    public function removeQuestionOption(QuestionOption $questionOption): static
    {
        if ($this->questionOptions->removeElement($questionOption)) {
            // set the owning side to null (unless already changed)
            if ($questionOption->getLessonSection() === $this) {
                $questionOption->setLessonSection(null);
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        return $this->id ?? '';
    }
}
