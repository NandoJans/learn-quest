<?php
namespace App\Util;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\Inflector\Inflector;
use Doctrine\Inflector\InflectorFactory;
use DateTimeImmutable;
use DateTimeInterface;
use ReflectionMethod;
use ReflectionNamedType;
use ReflectionUnionType;

final class AutoDtoMapper
{
    private Inflector $inflector;

    public function __construct(private EntityManagerInterface $em)
    {
        $this->inflector = InflectorFactory::create()->build();
    }

    public function map(array|object $dto, object $entity, bool $setNulls = false): object
    {
        $data = is_array($dto) ? $dto : $this->objectToArray($dto);
        $meta = $this->em->getClassMetadata(get_class($entity));

        // 1) scalar fields
        foreach ($meta->getFieldNames() as $field) {
            if (!array_key_exists($field, $data)) continue;
            $value = $data[$field];
            if ($value === null && !$setNulls) continue;

            $setter = 'set' . ucfirst($field);
            if (!method_exists($entity, $setter)) continue;

            $type = $meta->getTypeOfField($field); // doctrine DBAL type
            $entity->$setter($this->coerceScalarByDoctrineType($type, $this->coerceBySetterType($entity, $setter, $value)));
        }

        // 2) associations
        foreach ($meta->associationMappings as $assoc) {
            /** @var array{fieldName:string,targetEntity:string,type:int} $assoc */
            $field = $assoc['fieldName'];
            $target = $assoc['targetEntity'];
            $type = $assoc['type'];

            if ($type & ClassMetadata::TO_ONE) {
                $val = $this->extractToOneValue($data, $field);
                if ($val === null && !$setNulls) continue;

                $setter = 'set' . ucfirst($field);
                if (!method_exists($entity, $setter)) continue;

                if (is_object($val) && $val instanceof $target) {
                    $entity->$setter($val);
                } elseif ($val === null) {
                    $entity->$setter(null);
                } else {
                    $id = $this->normalizeId($val);
                    if ($id !== null) {
                        $ref = $this->em->getReference($target, $id);
                        $entity->$setter($ref);
                    }
                }
            } else { // TO_MANY
                $vals = $this->extractToManyValues($data, $field);
                if ($vals === null) continue; // absent -> leave as-is

                $getter  = 'get' . ucfirst($field);
                $adder   = 'add' . $this->inflector->singularize(ucfirst($field));
                $remover = 'remove' . $this->inflector->singularize(ucfirst($field));
                if (!method_exists($entity, $getter) || !method_exists($entity, $adder) || !method_exists($entity, $remover)) {
                    // If your API uses a custom mutator (e.g. setTagsFromIds), add a special case here.
                    continue;
                }

                $incomingIds = [];
                foreach ((array)$vals as $v) {
                    $id = $this->normalizeId($v);
                    if ($id !== null) $incomingIds[] = $id;
                }
                $incomingIds = array_values(array_unique($incomingIds));

                $current = $entity->$getter(); // Doctrine Collection
                $currentById = [];
                foreach ($current as $obj) {
                    if (method_exists($obj, 'getId')) {
                        $currentById[$obj->getId()] = $obj;
                    }
                }

                // removals
                foreach ($currentById as $id => $obj) {
                    if (!in_array($id, $incomingIds, true)) {
                        $entity->$remover($obj);
                    }
                }
                // additions
                foreach ($incomingIds as $id) {
                    if (!array_key_exists($id, $currentById)) {
                        $entity->$adder($this->em->getReference($target, $id));
                    }
                }
            }
        }

        return $entity;
    }

    // ---------- helpers ----------

    private function extractToOneValue(array $data, string $field): mixed
    {
        // Accept several shapes
        $candidates = [
            $field,
            $field . 'Id',
            $field . '_id',
        ];

        foreach ($candidates as $key) {
            if (array_key_exists($key, $data)) return $data[$key];
        }

        // nested { field: { id: X } } or path field.id
        if (isset($data[$field]) && is_array($data[$field]) && array_key_exists('id', $data[$field])) {
            return $data[$field]['id'];
        }

        if (isset($data[$field . '.id'])) {
            return $data[$field . '.id'];
        }

        return null;
    }

    private function extractToManyValues(array $data, string $field): ?array
    {
        if (array_key_exists($field, $data) && is_array($data[$field])) {
            return $data[$field];
        }
        // tagsIds / tags_ids
        foreach ([$field . 'Ids', $field . '_ids'] as $key) {
            if (array_key_exists($key, $data) && is_array($data[$key])) {
                return $data[$key];
            }
        }
        return null;
    }

    private function normalizeId(mixed $v): int|string|null
    {
        if ($v === null || $v === '') return null;

        // already numeric id
        if (is_int($v)) return $v;
        if (is_string($v) && is_numeric($v)) return (int)$v;

        // object with getId()
        if (is_object($v) && method_exists($v, 'getId')) {
            return $v->getId();
        }

        // array/object with 'id'
        if (is_array($v) && array_key_exists('id', $v)) {
            return $this->normalizeId($v['id']);
        }

        // IRI or URL ending with /{id}
        if (is_string($v)) {
            if (preg_match('~/(\d+|[A-Za-z0-9\-_:]+)$~', $v, $m)) {
                $last = $m[1];
                return is_numeric($last) ? (int)$last : $last;
            }
        }

        return null;
    }

    private function coerceScalarByDoctrineType(?string $dbalType, mixed $value): mixed
    {
        switch ($dbalType) {
            case 'integer':
            case 'smallint':
            case 'bigint':   return is_numeric($value) ? (int)$value : $value;
            case 'float':
            case 'decimal':  return is_numeric($value) ? (float)$value : $value;
            case 'boolean':  return is_string($value) ? in_array(strtolower($value), ['1','true','yes','y'], true) : (bool)$value;
            case 'datetime_immutable':
            case 'datetime':
            case 'date':
                if (is_string($value)) {
                    try { return new DateTimeImmutable($value); } catch (\Throwable) { return $value; }
                }
                return $value;
            default:
                return $value;
        }
    }

    private function coerceBySetterType(object $entity, string $setter, mixed $value): mixed
    {
        // Also look at setter parameter type (covers DateTimeInterface, etc.)
        try {
            $rm = new ReflectionMethod($entity, $setter);
            $params = $rm->getParameters();
            if (!$params) return $value;
            $t = $params[0]->getType();
            if (!$t) return $value;

            $names = [];
            if ($t instanceof ReflectionUnionType) {
                foreach ($t->getTypes() as $pt) {
                    if ($pt instanceof ReflectionNamedType) $names[] = $pt->getName();
                }
            } elseif ($t instanceof ReflectionNamedType) {
                $names[] = $t->getName();
            }

            foreach ($names as $name) {
                if ($name === 'int')    return is_numeric($value) ? (int)$value : $value;
                if ($name === 'float')  return is_numeric($value) ? (float)$value : $value;
                if ($name === 'bool')   return is_string($value) ? in_array(strtolower($value), ['1','true','yes','y'], true) : (bool)$value;
                if ($name === 'string') return is_scalar($value) ? (string)$value : $value;

                if (class_exists($name)) {
                    if (is_a($name, DateTimeInterface::class, true) && is_string($value)) {
                        try { return new DateTimeImmutable($value); } catch (\Throwable) { return $value; }
                    }
                }
            }
        } catch (\ReflectionException) {}

        return $value;
    }

    private function objectToArray(object $o): array
    {
        // Use reflection to extract public properties and getter methods
        $result = get_object_vars($o);

        $ref = new \ReflectionObject($o);
        foreach ($ref->getMethods(\ReflectionMethod::IS_PUBLIC) as $method) {
            $name = $method->getName();
            if (
                $method->getNumberOfRequiredParameters() === 0 &&
                (
                    (str_starts_with($name, 'get') && strlen($name) > 3) ||
                    (str_starts_with($name, 'is') && strlen($name) > 2)
                )
            ) {
                // Convert method name to property-like key
                $prop = lcfirst(preg_replace('/^(get|is)/', '', $name));
                if (!array_key_exists($prop, $result)) {
                    $result[$prop] = $method->invoke($o);
                }
            }
        }
        return $result;
    }
}
