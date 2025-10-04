<?php

namespace App\Service\Api;

use App\Service\EntityService;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\Mapping\ClassMetadata;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Encapsulates dynamic filtering and query building for the generic entity index endpoint.
 */
final readonly class EntityIndexService
{
    public function __construct(
        private ManagerRegistry $doctrine,
        private EntityService   $entityService,
    ) {
    }

    /**
     * Fetch a list of entities of the given $entity type filtered by $filters.
     *
     * Filter keys can be deep using underscore-separated paths (case-insensitive),
     * e.g. "registrations_user" or "lesson_section_id". Last segment may be
     * either a scalar field or an association (in which case we filter by its id).
     *
     * @param string $entity  Entity short name, e.g. "lessonSection" (maps to App\Entity\LessonSection)
     * @param array<string, mixed> $filters
     * @return array<int, object>
     */
    public function fetch(string $entity, array $filters): array
    {
        $class = $this->entityService->getEntityClass($entity);
        $em = $this->doctrine->getManagerForClass($class);
        $repo = $em->getRepository($class);
        $qb = $repo->createQueryBuilder('e');
        $rootMeta = $em->getClassMetadata($class);

        $aliasIdx = 0;
        $aliases = ['' => 'e'];

        foreach ($filters as $key => $value) {
            $this->applyFilter((string) $key, $value, $qb, $em, $rootMeta, $aliasIdx, $aliases);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Apply a single filter key/value to the query builder.
     * The key can represent a deep path using underscores.
     */
    private function applyFilter(string $key, mixed $value, QueryBuilder $qb, ObjectManager $em, ClassMetadata $rootMeta, int &$aliasIdx, array &$aliases): void
    {
        $parts = $this->normalizeParts($key);
        $parentAlias = 'e';
        $currentMeta = $rootMeta;
        $path = [];

        $count = count($parts);
        for ($i = 0; $i < $count; $i++) {
            $part = $parts[$i];
            $isLast = $i === $count - 1;
            $path[] = $part;
            $pathKey = implode('_', $path);

            if ($i > 0) {
                $prev = $parts[$i - 1];
                $currentMeta = $this->targetMetaForPrev($em, $currentMeta, $prev, $key);
            }

            if ($isLast) {
                $this->applyLastSegment($qb, $currentMeta, $parentAlias, $part, $i, $value, $aliasIdx);
                return;
            }

            $this->ensureAssociation($currentMeta, $part, $key);
            $parentAlias = $this->joinOnce($qb, $parentAlias, $part, $pathKey, $aliases, $aliasIdx);
        }
    }

    /** Normalize and lcfirst each key segment. */
    private function normalizeParts(string $key): array
    {
        return array_map(static fn($p) => lcfirst($p), explode('_', $key));
    }

    /** Resolve target metadata for previous association, or throw if invalid. */
    private function targetMetaForPrev(ObjectManager $em, ClassMetadata $currentMeta, string $prev, string $fullKey): ClassMetadata
    {
        if (!$currentMeta->hasAssociation($prev)) {
            throw new NotFoundHttpException(sprintf('Cannot join non-association "%s" in "%s"', $prev, $fullKey));
        }
        $targetClass = $currentMeta->getAssociationTargetClass($prev);
        return $em->getClassMetadata($targetClass);
    }

    /** Apply filter for the last path segment: field equality or association id. */
    private function applyLastSegment(QueryBuilder $qb, ClassMetadata $currentMeta, string $parentAlias, string $segment, int $index, mixed $value, int &$aliasIdx): void
    {
        if ($currentMeta->hasField($segment)) {
            $param = "f_$index";
            $qb->andWhere(sprintf('%s.%s = :%s', $parentAlias, $segment, $param))
               ->setParameter($param, $value);
            return;
        }

        if ($currentMeta->hasAssociation($segment)) {
            $alias = 'a' . (++$aliasIdx);
            $qb->leftJoin("$parentAlias.$segment", $alias);
            $param = "f_$index";
            $qb->andWhere("$alias.id = :$param")
               ->setParameter($param, $value);
            return;
        }

        throw new NotFoundHttpException(sprintf('Unknown filter "%s"', $segment));
    }

    /** Ensure the given segment is an association for intermediate path. */
    private function ensureAssociation(ClassMetadata $meta, string $part, string $fullKey): void
    {
        if ($meta->hasAssociation($part)) {
            return;
        }
        throw new NotFoundHttpException(sprintf('Cannot join non-association "%s" in "%s"', $part, $fullKey));
    }

    /** Join association once per path key and return the alias to use as parent. */
    private function joinOnce(QueryBuilder $qb, string $parentAlias, string $part, string $pathKey, array &$aliases, int &$aliasIdx): string
    {
        if (!isset($aliases[$pathKey])) {
            $aliases[$pathKey] = 'a' . (++$aliasIdx);
            $qb->leftJoin(sprintf('%s.%s', $parentAlias, $part), $aliases[$pathKey]);
        }
        return $aliases[$pathKey];
    }
}
