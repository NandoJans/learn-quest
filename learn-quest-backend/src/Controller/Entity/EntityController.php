<?php

namespace App\Controller\Entity;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EntityController extends AbstractController
{
    #[Route('/entity', name: 'app_entity')]
    public function index(): Response
    {
        return $this->render('entity/index.html.twig', [
            'controller_name' => 'EntityController',
        ]);
    }
}
