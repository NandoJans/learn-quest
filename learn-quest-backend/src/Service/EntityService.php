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

    /**
     * Map an entity to a DTO by matching DTO constructor params.
     * Provide $map when names differ or for relations (e.g. ['lessonId' => 'lesson.id']).
     *
     * @param object $entity Doctrine entity
     * @param class-string $dtoClass DTO FQCN
     * @param array<string, string|callable> $map  dtoParam => 'path.like.this' | callable($entity): mixed
     */
    public function mapEntityToDto(object $entity, string $dtoClass, array $map = []): object
    {
        if (!class_exists($dtoClass)) {
            throw new \InvalidArgumentException(sprintf('DTO class "%s" does not exist.', $dtoClass));
        }
        $refl = new \ReflectionClass($dtoClass);
        $ctor = $refl->getConstructor();
        if (!$ctor) {
            // DTO without ctor: just return new DTO and set public props if you want
            return $refl->newInstance();
        }

        $args = [];
        foreach ($ctor->getParameters() as $param) {
            $name = $param->getName();

            // 1) explicit map (callable or dot-path)
            if (array_key_exists($name, $map)) {
                $mapped = $map[$name];
                $value = is_callable($mapped) ? $mapped($entity) : $this->getByPath($entity, (string) $mapped);
                $args[] = $this->normalizeValue($value);
                continue;
            }

            // 2) exact getter (getX / isX)
            $value = $this->readViaGuess($entity, $name);
            if ($value !== null) {
                $args[] = $this->normalizeValue($value);
                continue;
            }

            // 3) special-case: fooId -> entity->getFoo()->getId()
            if (str_ends_with($name, 'Id')) {
                $rel = substr($name, 0, -2); // drop 'Id'
                $relObj = $this->readViaGuess($entity, $rel);
                if ($relObj && method_exists($relObj, 'getId')) {
                    $args[] = $this->normalizeValue($relObj->getId());
                    continue;
                }
            }

            // 4) default to null/param default
            $args[] = $param->isDefaultValueAvailable() ? $param->getDefaultValue() : null;
        }

        return $refl->newInstance(...$args);
    }

    /**
     * Optionally map a DTO (or array) back into an entity.
     * Use $map for relations (e.g. ['lesson' => fn($v) => $this->em->getRepository(Lesson::class)->find($v)])
     *
     * @param array<string, mixed>|object $dto
     * @param object $entity
     * @param array<string, string|callable> $map entityProp => dtoPath|callable($dto):mixed
     */
    public function mapDtoToEntity(array|object $dto, object $entity, array $map = []): object
    {
        $dtoArr = is_array($dto) ? $dto : $this->objectToArray($dto);

        foreach ($map as $entityProp => $src) {
            $value = is_callable($src) ? $src($dto) : $this->getFromArrayByPath($dtoArr, (string) $src);
            $setter = 'set' . ucfirst($entityProp);
            if (method_exists($entity, $setter)) {
                $entity->$setter($value);
            }
        }

        // naive: assign matching keys -> setters if not covered by map
        foreach ($dtoArr as $k => $v) {
            $setter = 'set' . ucfirst($k);
            if (method_exists($entity, $setter) && !array_key_exists($k, $map)) {
                $entity->$setter($v);
            }
        }

        return $entity;
    }

    // ---------------- helpers ----------------

    private function readViaGuess(object $obj, string $name): mixed
    {
        $getter = 'get' . ucfirst($name);
        if (method_exists($obj, $getter)) return $obj->$getter();

        $isser = 'is' . ucfirst($name);
        if (method_exists($obj, $isser)) return $obj->$isser();

        return null;
    }

    /** Resolve dot-path like 'lesson.id' by chaining getters */
    private function getByPath(object $entity, string $path): mixed
    {
        $parts = explode('.', $path);
        $current = $entity;
        foreach ($parts as $p) {
            if (!is_object($current)) return null;
            $current = $this->readViaGuess($current, $p);
            if ($current === null) return null;
        }
        return $current;
    }

    /** Format dates and related entities safely */
    private function normalizeValue(mixed $v): mixed
    {
        if ($v instanceof \DateTimeInterface) {
            return $v->format(\DateTimeInterface::ATOM);
        }
        if (is_object($v) && method_exists($v, 'getId')) {
            return $v->getId();
        }
        return $v;
    }

    private function objectToArray(object $o): array
    {
        // crude: expose public props if any, else use getters
        $arr = [];
        foreach ((new \ReflectionClass($o))->getProperties(\ReflectionProperty::IS_PUBLIC) as $prop) {
            $arr[$prop->getName()] = $prop->getValue($o);
        }
        if ($arr) return $arr;

        // fallback: getters to array
        $ref = new \ReflectionClass($o);
        foreach ($ref->getMethods(\ReflectionMethod::IS_PUBLIC) as $m) {
            if (str_starts_with($m->getName(), 'get') && $m->getNumberOfRequiredParameters() === 0) {
                $key = lcfirst(substr($m->getName(), 3));
                $arr[$key] = $o->{$m->getName()}();
            }
        }
        return $arr;
    }

    public function getFormFieldNames(string $formTypeClass): array
    {
        $form = $this->formFactory->create($formTypeClass);
        $fieldNames = [];
        foreach ($form->all() as $childName => $child) {
            if (in_array($childName, self::FIELD_SKIP, true)) continue;
            if ($child->getConfig()->getType()->getInnerType() instanceof CollectionType) continue;
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