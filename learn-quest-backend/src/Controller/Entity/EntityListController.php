<?php

namespace App\Controller\Entity;

use App\Entity\User;
use App\Form\Type\UserType;
use App\Service\EntityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

final class EntityListController extends AbstractController
{
    public function __construct(
        private ManagerRegistry $doctrine,
        private EntityService $entityService,
    ) {}

    #[Route(path: '/admin/{entity}', name: 'app_entity_list', requirements: ['entity' => '[A-Za-z]+'], methods: ['GET'])]
    public function list(string $entity): Response
    {
        $class = $this->entityService->getEntityClass($entity);

        $type = $this->entityService->getEntityTypeClass($entity);

        // The existence of the form type class is already validated by EntityService::getEntityTypeClass().

        $fields = $this->entityService->getFormFieldNames($type);

        $repo  = $this->doctrine->getRepository($class);
        $items = $repo->findAll();

        return $this->render('entity/list.html.twig', [
            'entityName' => $entity,
            'fields'     => $fields,
            'items'      => $items,
        ]);
    }
}
