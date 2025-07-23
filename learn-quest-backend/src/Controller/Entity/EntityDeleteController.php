<?php

namespace App\Controller\Entity;

use App\Service\EntityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EntityDeleteController extends AbstractController
{
    public function __construct(
        private EntityService $entityService,
    ) {}

    #[Route('/admin/{entity}/delete/{id}', name: 'app_entity_delete')]
    public function index(string $entity, int $id, EntityManagerInterface $em): Response
    {
        $class = $this->entityService->getEntityClass($entity);
        $object = $em->getRepository($class)->find($id);

        if ($object) {
            $em->remove($object);
            $em->flush();
        }

        return $this->redirectToRoute('app_entity_list', ['entity' => $entity]);
    }
}
