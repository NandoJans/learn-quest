<?php

namespace App\Controller\Entity;

use App\Entity\User;
use App\Service\EntityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EntityCreateController extends AbstractController
{
    public function __construct(
        private EntityService $entityService,
    )
    {
    }

    #[Route('/admin/{entity}/create', name: 'app_entity_create')]
    public function index(Request $request, EntityManagerInterface $em, string $entity): Response
    {
        $class = $this->entityService->getEntityClass($entity);
        $type = $this->entityService->getEntityTypeClass($entity);

        $instance = new $class();
        $form = $this->createForm($type, $instance);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($instance);
            $em->flush();

            return $this->redirectToRoute('app_entity_list', [
                'entity' => $entity,
            ]);
        }

        return $this->render('entity/form.html.twig', [
            'form' => $form->createView(),
            'entity_name' => $entity, // or any entity name
            'list_route' => 'app_entity_list', // route to go back to the listing
            'list_route_params' => [
                'entity' => $entity,
            ],
            'is_edit' => false, // this is a create form
        ]);
    }
}
