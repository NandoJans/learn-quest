<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $username = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    /**
     * @var Collection<int, CourseRegistration>
     */
    #[ORM\OneToMany(targetEntity: CourseRegistration::class, mappedBy: 'userId', orphanRemoval: true)]
    private Collection $courseRegistrations;

    public function __construct()
    {
        $this->courseRegistrations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
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
            $courseRegistration->setUser($this);
        }

        return $this;
    }

    public function removeCourseRegistration(CourseRegistration $courseRegistration): static
    {
        if ($this->courseRegistrations->removeElement($courseRegistration)) {
            // set the owning side to null (unless already changed)
            if ($courseRegistration->getUser() === $this) {
                $courseRegistration->setUser(null);
            }
        }

        return $this;
    }

    /**
     * Convenience: get all Course entities the user is enrolled in
     * @return Collection<int, Course>
     */
    public function getCourses(): Collection
    {
        return $this->courseRegistrations
            ->map(fn(CourseRegistration $r) => $r->getCourse())
            ->filter(fn($c) => $c instanceof Course);
    }
}
