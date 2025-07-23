<?php

namespace App\Controller\Entity;

use App\Service\EntityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EntityEditController extends AbstractController
{
    public function __construct(
        private EntityService $entityService,
    ) {}

    #[Route('/admin/{entity}/{id}/edit', name: 'app_entity_edit')]
    public function index(
        Request $request,
        EntityManagerInterface $em,
        string $entity,
        int $id
    ): Response
    {
        $class = $this->entityService->getEntityClass($entity);
        $type = $this->entityService->getEntityTypeClass($entity);

        $object = $em->getRepository($class)->find($id);

        if (!$object) {
            throw $this->createNotFoundException("Entity not found");
        }

        $form = $this->createForm($type, $object);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->flush();

            return $this->redirectToRoute('app_entity_list', ['entity' => $entity]);
        }

        return $this->render('entity/form.html.twig', [
            'form' => $form->createView(),
            'entity_name' => $entity,
            'list_route' => 'app_entity_list',
            'list_route_params' => ['entity' => $entity],
            'is_edit' => true, // this is an edit form
        ]);
    }
}
