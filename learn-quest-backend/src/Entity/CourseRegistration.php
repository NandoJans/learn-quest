<?php

namespace App\Entity;

use App\Repository\CourseRegistrationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
    private ?Course $course = null;

    #[ORM\Column(nullable: true)]
    private ?int $courseId = null;

    #[ORM\ManyToOne(inversedBy: 'courseRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(nullable: true)]
    private ?int $userId = null;

    /**
     * @var Collection<int, LessonRegistration>
     */
    #[ORM\OneToMany(targetEntity: LessonRegistration::class, mappedBy: 'CourseRegistration', orphanRemoval: true)]
    private Collection $lessonRegistrations;

    public function __construct()
    {
        $this->lessonRegistrations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCourse(): ?Course
    {
        return $this->course;
    }

    public function setCourse(?Course $course): static
    {
        $this->course = $course;

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

    public function getCourseId(): ?int
    {
        return $this->courseId;
    }

    public function setCourseId(?int $courseId): static
    {
        $this->courseId = $courseId;

        return $this;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function setUserId(?int $userId): static
    {
        $this->userId = $userId;

        return $this;
    }

    /**
     * @return Collection<int, LessonRegistration>
     */
    public function getLessonRegistrations(): Collection
    {
        return $this->lessonRegistrations;
    }

    public function addLessonRegistration(LessonRegistration $lessonRegistration): static
    {
        if (!$this->lessonRegistrations->contains($lessonRegistration)) {
            $this->lessonRegistrations->add($lessonRegistration);
            $lessonRegistration->setCourseRegistration($this);
        }

        return $this;
    }

    public function removeLessonRegistration(LessonRegistration $lessonRegistration): static
    {
        if ($this->lessonRegistrations->removeElement($lessonRegistration)) {
            // set the owning side to null (unless already changed)
            if ($lessonRegistration->getCourseRegistration() === $this) {
                $lessonRegistration->setCourseRegistration(null);
            }
        }

        return $this;
    }
}
