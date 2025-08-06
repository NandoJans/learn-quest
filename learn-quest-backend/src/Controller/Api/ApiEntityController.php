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
        $class = $this->entityService->getEntityClass($entity);
        $repo = $this->doctrine->getRepository($class);
        $filters = $request->query->all(); // e.g. ['course' => 1]
        $items = $filters
            ? $repo->findBy($filters)
            : $repo->findAll();

        $dtoClass = $this->entityService->getEntityDtoClass($entity);

        $dtos = array_map(function ($item) use ($dtoClass) {
            $dto = $this->entityService->getDtoInstance($item, $dtoClass);
            $this->handleDtoAssociations($dto, $item);
            return $dto;
        }, $items);

        return $this->json($dtos);
    }

    private function handleDtoAssociations(mixed $dto, mixed $item): void
    {
        if (method_exists($dto, 'extraData')) {
            $dto->extraData($this->entityService, $this->doctrine);
        }
    }
}
