<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\RouterInterface;

#[Route('/admin', name: 'admin_')]
final class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'dashboard')]
    public function index(RouterInterface $router): Response
    {
        $apiUrls = $router->getRouteCollection()->all();
        $apiUrls = array_filter($apiUrls, function ($route) {
            // Filter routes that start with 'api_' and are not the dashboard route
            return str_starts_with($route->getPath(), '/api');
        });
        return $this->render('admin/dashboard/index.html.twig', [
            'controller_name' => 'Admin/DashboardController',
            'api_routes' => array_map(
                fn($route) => [
                    'name' => $route->getDefault('_route'),
                    'path' => $route->getPath(),
                    'methods' => $route->getMethods(),
                ],
                $apiUrls
            ),
        ]);
    }
}
