<?php

namespace App\Service;

use Firebase\JWT\JWT;

class MercureTokenService
{
    private string $jwtSecret;

    public function __construct(string $jwtSecret)
    {
        $this->jwtSecret = $jwtSecret;
    }

    public function generateToken(): string
    {
        $payload = [
            'mercure' => [
                'publish' => ['*'],
            ],
        ];

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }
}