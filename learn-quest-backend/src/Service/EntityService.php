<?php

namespace App\Service;

use App\Dto\Dto;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormFactoryInterface;

class EntityService
{
    const FIELD_SKIP = ['submit', 'password', 'csrf_token'];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory,
    )
    {
    }

    public function getEntityClass(string $entity): string
    {
        $class = 'App\\Entity\\' . ucfirst($entity);
        if (!class_exists($class)) {
            throw new \InvalidArgumentException(sprintf('Entity "%s" does not exist.', $entity));
        }
        return $class;
    }

    public function getEntityTypeClass(string $entity): string
    {
        $type = ucfirst($entity) . 'Type';
        $class = 'App\\Form\\Type\\' . $type;
        if (!class_exists($class)) {
            throw new \InvalidArgumentException(sprintf('Form type "%s" does not exist.', $type));
        }
        return $class;
    }

    public function getEntityDtoClass(string $entity): string
    {
        $dto = ucfirst($entity) . 'Dto';
        $class = 'App\\Dto\\' . $dto;
        if (!class_exists($class)) {
            throw new \InvalidArgumentException(sprintf('DTO class "%s" does not exist.', $dto));
        }
        return $class;
    }

    public function getDtoInstance(mixed $item, string $class): mixed
    {
        if (!str_ends_with($class, 'Dto')) {
            throw new \InvalidArgumentException(sprintf('Class "%s" is not a DTO class. It should end with "Dto".', $class));
        }

        // Match the dto constructor signature
        try {
            $dtoReflection = new \ReflectionClass($class);
        } catch (\ReflectionException $e) {
            throw new \RuntimeException(sprintf('Could not reflect DTO class "%s": %s', $class, $e->getMessage()));
        }

        $constructor = $dtoReflection->getConstructor();
        if (!$constructor) {
            throw new \RuntimeException(sprintf('DTO class "%s" does not have a constructor.', $class));
        }



        $params = $constructor->getParameters();
        $args = [];
        foreach ($params as $param) {
            $paramName = $param->getName();
            if (property_exists($item, $paramName)) {
                $getMethod = 'get' . ucfirst($paramName);
                $args[] = $item->$getMethod();
            } else {
                throw new \RuntimeException(sprintf('Property "%s" does not exist in entity "%s".', $paramName, get_class($item)));
            }
        }

        return new $class(...$args);
    }

    public function getFormFieldNames(string $formTypeClass): array
    {
        $form = $this->formFactory->create($formTypeClass);
        $fieldNames = [];

        foreach ($form->all() as $childName => $child) {
            // Skip fields like 'submit', 'password', 'csrf_token'
            if (in_array($childName, self::FIELD_SKIP, true)) {
                continue;
            }
            // Skip collection fields
            if ($child->getConfig()->getType()->getInnerType() instanceof CollectionType) {
                continue;
            }
            $fieldNames[] = $childName;
        }

        return $fieldNames;
    }

    public function getEntityFields(string $entityClass): array
    {
        $metadata = $this->em->getClassMetadata($entityClass);

        return $metadata->getFieldNames();
    }
}