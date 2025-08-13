<?php

namespace App\Controller\Api;

use App\Service\ModuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/module', name: 'app_api_module_index')]
final class ApiModuleController extends AbstractController
{

    public function __construct(
        private readonly ModuleService $moduleService
    )
    {
    }

    #[Route('/config/{moduleName}', name: 'app_api_module_config', methods: ['GET'])]
    public function getBaseConfig(string $moduleName): JsonResponse {
        // Get the configuration from the json file
        $baseConfig = $this->moduleService->getBaseConfig($moduleName);

        return $this->json($baseConfig, Response::HTTP_OK, [], [
            'groups' => ['module_config']
        ]);
    }
}
