<?php

namespace App\Controller\Api;

use App\Service\EntityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
    public function index(string $entity): Response
    {
        $class = $this->entityService->getEntityClass($entity);
        $repo = $this->doctrine->getRepository($class);
        $items = $repo->findAll();
        $dtoClass = $this->entityService->getEntityDtoClass($entity);
        if (!class_exists($dtoClass)) {
            throw new \RuntimeException(sprintf('DTO class "%s" does not exist.', $dtoClass));
        }

        $dtos = array_map(function ($item) use ($dtoClass) {
            // Match the dto constructor signature
            try {
                $dtoReflection = new \ReflectionClass($dtoClass);
            } catch (\ReflectionException $e) {
                throw new \RuntimeException(sprintf('Could not reflect DTO class "%s": %s', $dtoClass, $e->getMessage()));
            }

            $constructor = $dtoReflection->getConstructor();
            if (!$constructor) {
                throw new \RuntimeException(sprintf('DTO class "%s" does not have a constructor.', $dtoClass));
            }

            $params = $constructor->getParameters();
            $args = [];
            foreach ($params as $param) {
                $paramName = $param->getName();
                if (property_exists($item, $paramName)) {
                    $getMethod = 'get' . ucfirst($paramName);
                    $args[] = $item->$getMethod();
                } else {
                    throw new \RuntimeException(sprintf('Property "%s" does not exist in entity "%s".', $paramName, get_class($item)));
                }
            }

            return new $dtoClass(...$args);
        }, $items);

        return $this->json($dtos);
    }
}
