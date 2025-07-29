<?php

namespace App\Entity;

use App\Repository\CourseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\UX\Turbo\Attribute\Broadcast;

#[ORM\Entity(repositoryClass: CourseRepository::class)]
#[Broadcast]
class Course
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $code = null;

    #[ORM\Column(length: 4095, nullable: true)]
    private ?string $description = null;

    #[ORM\OneToMany(targetEntity: Lesson::class, mappedBy: 'course', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private ?Collection $lessons;

    /**
     * @var Collection<int, CourseRegistration>
     */
    #[ORM\OneToMany(targetEntity: CourseRegistration::class, mappedBy: 'CourseId', orphanRemoval: true)]
    private Collection $courseRegistrations;

    public function __construct()
    {
        $this->lessons = new ArrayCollection();
        $this->courseRegistrations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getLessons(): Collection
    {
        return $this->lessons;
    }

    public function addLesson(Lesson $lesson): static
    {
        if (!$this->lessons->contains($lesson)) {
            $this->lessons[] = $lesson;
            $lesson->setCourse($this);
        }

        return $this;
    }

    public function removeLesson(Lesson $lesson): static
    {
        if ($this->lessons->removeElement($lesson)) {
            // set the owning side to null (unless already changed)
            if ($lesson->getCourse() === $this) {
                $lesson->setCourse(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, CourseRegistration>
     */
    public function getCourseRegistrations(): Collection
    {
        return $this->courseRegistrations;
    }

    public function addCourseRegistration(CourseRegistration $courseRegistration): static
    {
        if (!$this->courseRegistrations->contains($courseRegistration)) {
            $this->courseRegistrations->add($courseRegistration);
            $courseRegistration->setCourseId($this);
        }

        return $this;
    }

    public function removeCourseRegistration(CourseRegistration $courseRegistration): static
    {
        if ($this->courseRegistrations->removeElement($courseRegistration)) {
            // set the owning side to null (unless already changed)
            if ($courseRegistration->getCourseId() === $this) {
                $courseRegistration->setCourseId(null);
            }
        }

        return $this;
    }
}
