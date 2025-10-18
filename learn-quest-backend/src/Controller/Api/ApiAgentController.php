<?php

namespace App\Controller\Api;

use App\Service\AgentService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/agent')]
final class ApiAgentController extends AbstractController
{
    #[Route('/load_chat/{}', name: 'api_agent_load_chat')]
    public function index(): Response
    {
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/Api/ApiAgentController.php',
        ]);
    }

    #[Route('/request/{message}', name: 'api_agent_request', methods: ['GET'])]
    public function request(string $message, AgentService $agentService): Response
    {
        $agentService->createLesson($message);

        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/Api/ApiAgentController.php',
        ]);
    }
}
