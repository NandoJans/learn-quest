<?php

namespace App\Controller\Api;

use App\Dto\Dto;
use App\Service\EntityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ApiEntityController extends AbstractController
{
    public function __construct(
        private ManagerRegistry $doctrine,
        private EntityService $entityService
    )
    {
    }

    #[Route('/api/{entity}/index', name: 'api_course_index', methods: ['GET'])]
    public function index(string $entity, Request $request): Response
    {
        $class     = $this->entityService->getEntityClass($entity);
        $filters   = $request->query->all();  // e.g. ['registrations.user' => 42]
        $em        = $this->doctrine->getManagerForClass($class);
        $repo      = $em->getRepository($class);
        $rootMeta      = $em->getClassMetadata($class);
        $currentMeta = $rootMeta;
        $qb        = $repo->createQueryBuilder('e');
        $aliasIdx  = 0;
        $aliases   = ['' => 'e']; // track which alias corresponds to which path

        foreach ($filters as $key => $value) {
            $parts = explode('_', $key);
            $parentAlias = 'e';
            $path        = [];

            foreach ($parts as $i => $part) {
                // allow case-insensitive filter keys by normalising the
                // segment to match the property name convention used in the
                // entities (camelCase with a lowercase first letter)
                $part = lcfirst($part);

                $isLast = $i === count($parts) - 1;
                $path[] = $part;
                $pathKey = implode('_', $path);

                // determine metadata for this level
                if ($i === 0) {
                    // first segment, $meta already holds metadata for $class
                    $currentMeta = $rootMeta;
                } else {
                    // get the target class name of the previous association
                    $targetClass = $currentMeta->getAssociationTargetClass($parts[$i-1]);
                    // now fetch metadata for that class
                    $currentMeta = $em->getClassMetadata($targetClass);
                }

                if ($isLast) {
                    if ($currentMeta->hasField($part)) {
                        // scalar field on $parentAlias
                        $qb->andWhere(sprintf('%s.%s = :f_%s', $parentAlias, $part, $i))
                            ->setParameter("f_$i", $value);
                    } elseif ($currentMeta->hasAssociation($part)) {
                        // association on last segment ⇒ join then filter its id
                        $alias = 'a' . (++$aliasIdx);
                        $qb->leftJoin("$parentAlias.$part", $alias);
                        $qb->andWhere("$alias.id = :f_$i")
                            ->setParameter("f_$i", $value);
                    } else {
                        throw $this->createNotFoundException("Unknown filter \"$key\"");
                    }
                } else {
                    // non-last ⇒ must be an association
                    if (!$currentMeta->hasAssociation($part)) {
                        throw $this->createNotFoundException("Cannot join non-association \"$part\" in \"$key\"");
                    }
                    // only join once per pathKey
                    if (!isset($aliases[$pathKey])) {
                        $aliases[$pathKey] = 'a' . (++$aliasIdx);
                        $qb->leftJoin(
                            sprintf('%s.%s', $parentAlias, $part),
                            $aliases[$pathKey]
                        );
                    }
                    $parentAlias = $aliases[$pathKey];
                }
            }
        }

        $items = $qb->getQuery()->getResult();

        // map to DTOs as before…
        $dtoClass = $this->entityService->getEntityDtoClass($entity);
        $dtos     = array_map(fn($item) => $this->entityService->getDtoInstance($item, $dtoClass), $items);

        return $this->json($dtos);
    }

}
