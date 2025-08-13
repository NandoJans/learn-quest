<?php

namespace App\Service;

class ModuleService
{
    private string $moduleConfigPath = __DIR__ . '/../../data/module/config/';

    public function getBaseConfig(string $moduleName): array
    {
        $jsonFilePath = $this->moduleConfigPath . $moduleName . '.json';
        if (!file_exists($jsonFilePath)) {
            throw new \RuntimeException("Configuration file for module '$moduleName' does not exist.");
        }
        $jsonContent = file_get_contents($jsonFilePath);
        if ($jsonContent === false) {
            throw new \RuntimeException("Failed to read configuration file for module '$moduleName'.");
        }
        $config = json_decode($jsonContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Invalid JSON in configuration file for module '$moduleName': " . json_last_error_msg());
        }

        return $config;
    }
}