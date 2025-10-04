<?php

namespace App\Repository;

use App\Entity\LessonSection;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LessonSection>
 */
class LessonSectionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LessonSection::class);
    }

    public function findBy(array $criteria, ?array $orderBy = null, ?int $limit = null, ?int $offset = null): array
    {
        $orderBy['position'] = 'ASC';
        return parent::findBy($criteria, $orderBy, $limit, $offset);
    }
}
