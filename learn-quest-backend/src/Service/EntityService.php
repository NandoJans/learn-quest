<?php

namespace App\Service;

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
        $class = 'App\\Entity\\' . ucfirst(strtolower($entity));
        if (!class_exists($class)) {
            throw new \InvalidArgumentException(sprintf('Entity "%s" does not exist.', $entity));
        }
        return $class;
    }

    public function getEntityTypeClass(string $entity): string
    {
        $type = ucfirst(strtolower($entity)) . 'Type';
        $class = 'App\\Form\\Type\\' . $type;
        if (!class_exists($class)) {
            throw new \InvalidArgumentException(sprintf('Form type "%s" does not exist.', $type));
        }
        return $class;
    }

    public function getEntityDtoClass(string $entity): string
    {
        $dto = ucfirst(strtolower($entity)) . 'Dto';
        $class = 'App\\Dto\\' . $dto;
        if (!class_exists($class)) {
            throw new \InvalidArgumentException(sprintf('DTO class "%s" does not exist.', $dto));
        }
        return $class;
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