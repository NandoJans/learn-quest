<?php

namespace App\Entity;

use App\Repository\LessonRegistrationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    /**
     * @var Collection<int, LessonSectionAnswer>
     */
    #[ORM\OneToMany(targetEntity: LessonSectionAnswer::class, mappedBy: 'lessonRegistration', orphanRemoval: true)]
    private Collection $lessonSectionAnswers;

    #[ORM\ManyToOne]
    private ?LessonSection $currentLessonSection = null;

    public function __construct()
    {
        $this->lessonSectionAnswers = new ArrayCollection();
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
            $lessonSectionAnswer->setLessonRegistration($this);
        }

        return $this;
    }

    public function removeLessonSectionAnswer(LessonSectionAnswer $lessonSectionAnswer): static
    {
        if ($this->lessonSectionAnswers->removeElement($lessonSectionAnswer)) {
            // set the owning side to null (unless already changed)
            if ($lessonSectionAnswer->getLessonRegistration() === $this) {
                $lessonSectionAnswer->setLessonRegistration(null);
            }
        }

        return $this;
    }

    public function __toString(): string
    {
        return (string)($this->id ?? '');
    }

    public function getCurrentLessonSection(): ?LessonSection
    {
        return $this->currentLessonSection;
    }

    public function setCurrentLessonSection(?LessonSection $currentLessonSection): static
    {
        $this->currentLessonSection = $currentLessonSection;

        return $this;
    }
}
