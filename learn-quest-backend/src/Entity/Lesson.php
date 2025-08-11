<?php

namespace App\Entity;

use App\Repository\LessonRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\UX\Turbo\Attribute\Broadcast;

#[ORM\Entity(repositoryClass: LessonRepository::class)]
#[Broadcast]
class Lesson
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $code = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private ?int $courseId = null;

    #[ORM\ManyToOne(targetEntity: Course::class, inversedBy: 'lessons')]
    private ?Course $course = null;

    #[ORM\Column(length: 255)]
    private ?string $primaryColor = null;

    #[ORM\Column(length: 255)]
    private ?string $faIcon = null;

    /**
     * @var Collection<int, LessonSection>
     */
    #[ORM\OneToMany(targetEntity: LessonSection::class, mappedBy: 'lesson', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $sections;

    public function __construct()
    {
        $this->sections = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

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

    public function getCourseId(): ?int
    {
        return $this->courseId;
    }

    public function setCourseId(int $courseId): static
    {
        $this->courseId = $courseId;

        return $this;
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

    public function getPrimaryColor(): ?string
    {
        return $this->primaryColor;
    }

    public function setPrimaryColor(string $primaryColor): static
    {
        // Validate hex color code format
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $primaryColor)) {
            throw new \InvalidArgumentException('Invalid primary color format. Expected a hex color code (e.g., #FFFFFF).');
        }
        $this->primaryColor = $primaryColor;

        return $this;
    }

    public function getFaIcon(): ?string
    {
        return $this->faIcon;
    }

    public function setFaIcon(string $faIcon): static
    {
        $this->faIcon = $faIcon;

        return $this;
    }

    /**
     * @return Collection<int, LessonSection>
     */
    public function getSections(): Collection
    {
        return $this->sections;
    }

    public function addSection(LessonSection $section): static
    {
        if (!$this->sections->contains($section)) {
            $this->sections->add($section);
            $section->setLesson($this);
        }

        return $this;
    }

    public function removeSection(LessonSection $section): static
    {
        if ($this->sections->removeElement($section)) {
            if ($section->getLesson() === $this) {
                $section->setLesson(null);
            }
        }

        return $this;
    }
}
