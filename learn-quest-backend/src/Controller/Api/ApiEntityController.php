<?php

namespace App\Controller\Api;

use App\Entity\LessonSection;
use App\Entity\QuestionOption;
use App\Service\EntityService;
use App\Service\Api\EntityIndexService;
use App\Util\AutoDtoMapper;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ApiEntityController extends AbstractController
{
    public function __construct(
        private ManagerRegistry $doctrine,
        private EntityService $entityService,
        private AutoDtoMapper $autoDtoMapper,
        private EntityIndexService $entityIndexService,
    )
    {
    }

    #[Route('/api/{entity}/index', name: 'api_course_index', methods: ['GET'], requirements: ['entity' => '[A-Za-z][A-Za-z0-9]*'])]
    public function index(string $entity, Request $request): Response
    {
        $filters = $request->query->all();
        $items = $this->entityIndexService->fetch($entity, $filters);

        $dtoClass = $this->entityService->getEntityDtoClass($entity);
        $dtos = array_map(fn($item) => $this->entityService->mapEntityToDto($item, $dtoClass), $items);

        return $this->json($dtos);
    }

    #[Route('/api/{entity}/create', name: 'api_course_create', methods: ['POST'], requirements: ['entity' => '[A-Za-z][A-Za-z0-9]*'])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $entity = $request->attributes->get('entity');
        $class  = $this->entityService->getEntityClass($entity);

        $instance = new $class();
        $dtoClass = $this->entityService->getEntityDtoClass($entity);
        $dto      = new $dtoClass();
        $dto->fromArray($data, $this->entityService, $this->doctrine);
        $instance = $this->autoDtoMapper->map($dto, $instance, true);

        // Handle nested relations for specific entities
        if ($instance instanceof LessonSection && isset($data['questionOptions']) && is_array($data['questionOptions'])) {
            $this->syncQuestionOptions($instance, $data['questionOptions']);
        }

        $em = $this->doctrine->getManagerForClass($class);
        $em->persist($instance);
        $em->flush(); // id is now set

        // Return only what the frontend needs to switch to "update" mode:
        return $this->json(['id' => $instance->getId()], Response::HTTP_CREATED);
    }

    #[Route('/api/{entity}/{id}', name: 'api_entity_update', methods: ['PUT'], requirements: ['entity' => '[A-Za-z][A-Za-z0-9]*'])]
    public function update(string $entity, int $id, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $class  = $this->entityService->getEntityClass($entity);
        $em     = $this->doctrine->getManagerForClass($class);
        $repo   = $em->getRepository($class);
        $item   = $repo->find($id);
        if (!$item) {
            return $this->json(['error' => 'Not found'], Response::HTTP_NOT_FOUND);
        }

        $dtoClass = $this->entityService->getEntityDtoClass($entity);
        $dto      = new $dtoClass();
        $dto->fromArray($data, $this->entityService, $this->doctrine);
        $item     = $this->autoDtoMapper->map($dto, $item, false);

        if ($item instanceof LessonSection && isset($data['questionOptions']) && is_array($data['questionOptions'])) {
            $this->syncQuestionOptions($item, $data['questionOptions']);
        }

        $em->persist($item);
        $em->flush();

        return $this->json(['status' => 'ok']);
    }

    #[Route('/api/{entity}/{id}', name: 'api_entity_delete', methods: ['DELETE'], requirements: ['entity' => '[A-Za-z][A-Za-z0-9]*'])]
    public function delete(string $entity, int $id): Response
    {
        $class  = $this->entityService->getEntityClass($entity);
        $em     = $this->doctrine->getManagerForClass($class);
        $repo   = $em->getRepository($class);
        $item   = $repo->find($id);
        if (!$item) {
            return $this->json(['error' => 'Not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($item);
        $em->flush();

        return $this->json(['status' => 'ok', 'message' => 'Entity deleted successfully']);
    }

    private function syncQuestionOptions(LessonSection $section, array $optionsData): void
    {
        $em = $this->doctrine->getManagerForClass(LessonSection::class);

        // Remove existing
        foreach ($section->getQuestionOptions() as $existing) {
            $em->remove($existing);
        }
        $section->getQuestionOptions()->clear();

        // Add new
        foreach ($optionsData as $opt) {
            $option = new QuestionOption();
            $option->setOptionText($opt['optionText'] ?? '');
            $option->setPosition(isset($opt['position']) ? (int)$opt['position'] : 0);
            $section->addQuestionOption($option);
        }
    }
}
