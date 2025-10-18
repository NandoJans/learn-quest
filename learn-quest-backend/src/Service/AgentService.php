<?php

namespace App\Service;

use OpenAI;
use OpenAI\Client;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AgentService
{
    protected Client $client;
    protected string $apiKey;
    protected string $workflowId;

    public function __construct(
        protected HttpClientInterface $httpClient
    )
    {
        $this->apiKey = getenv('OPEN_AI_API_KEY');
        $this->workflowId = getenv('OPEN_AI_WORKFLOW_ID');
        $this->client = OpenAI::client($this->apiKey);
    }

    public function getCompletion(string $prompt): OpenAI\Responses\Chat\CreateResponse
    {
        return $this->client->chat()->create([
            'model' => 'gpt-5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ]
        ]);
    }

    public function createLesson(string $prompt): OpenAI\Responses\Chat\CreateResponse
    {
        // Call an agent to create a lesson based on the prompt.
        $createResponse = $this->client->chat()->create([
            'model' => 'gpt-5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => "Create a lesson based on the following prompt: " . $prompt]
            ]
        ]);

        return $createResponse;
    }

    public function createSession(string $deviceId): array
    {
        $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chatkit/sessions', [
            'headers' => [
                'Content-Type'  => 'application/json',
                'OpenAI-Beta'   => 'chatkit_beta=v1',
                'Authorization' => 'Bearer ' . $this->apiKey,
            ],
            'json' => [
                'workflow' => [
                    'id' => $this->workflowId,
                ],
                'user' => $deviceId,
            ],
        ]);

        return $response->toArray();
    }


}