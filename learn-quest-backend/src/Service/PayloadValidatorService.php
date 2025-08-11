<?php

namespace App\Service;


use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

readonly class PayloadValidatorService
{
    public function __construct(private ValidatorInterface $validator) {}

    /**
     * Decode JSON request body to array.
     * Returns [array $data, array $errors]
     */
    public function parseJson(Request $request): array
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return [[], ['body' => ['Invalid JSON body']]];
        }
        return [$data, []];
    }

    /**
     * Validate data against given constraint.
     * Returns array [normalizedData, errors] where errors is array<string, string[]>
     */
    public function validate(array $data, Assert\Collection $schema): array
    {
        $violations = $this->validator->validate($data, $schema);

        if (count($violations) === 0) {
            // Return normalized data (Collection handles defaults via 'allowExtraFields' etc.)
            return [$data, []];
        }

        $errors = [];
        foreach ($violations as $v) {
            $path = (string) $v->getPropertyPath(); // e.g. [lessonId]
            $key = trim($path, '[]') ?: 'body';
            $errors[$key][] = $v->getMessage();
        }
        return [$data, $errors];
    }

    /**
     * Standard collection schemas for LessonSection use-cases.
     * You can expose more factories or keep these private and wrap with methods.
     */

    public function schemaLessonSectionCreate(): Assert\Collection
    {
        return new Assert\Collection([
            'fields' => [
                'lessonId' => [new Assert\NotBlank(), new Assert\Type('integer'), new Assert\GreaterThan(0)],
                'type'     => [new Assert\NotBlank(), new Assert\Choice(['text', 'widget', 'question'])],
                'content'  => [new Assert\Optional([new Assert\Type('string')])],
                'position' => [new Assert\Optional([new Assert\Type('integer'), new Assert\GreaterThanOrEqual(0)])],
            ],
            'allowMissingFields' => true,  // position/content may be omitted
            'allowExtraFields'   => true,  // ignore unknowns to stay forward-compatible
        ]);
    }

    public function schemaLessonSectionUpdate(): Assert\Collection
    {
        // All optional, but if present must be valid.
        return new Assert\Collection([
            'fields' => [
                'lessonId' => [new Assert\Optional([new Assert\Type('integer'), new Assert\GreaterThan(0)])],
                'type'     => [new Assert\Optional([new Assert\Choice(['text', 'widget', 'question'])])],
                'content'  => [new Assert\Optional([new Assert\Type('string')])],
                'position' => [new Assert\Optional([new Assert\Type('integer'), new Assert\GreaterThanOrEqual(0)])],
            ],
            'allowMissingFields' => true,
            'allowExtraFields'   => true,
        ]);
    }

    public function schemaLessonSectionReorder(): Assert\Collection
    {
        return new Assert\Collection([
            'fields' => [
                'lessonId' => [new Assert\NotBlank(), new Assert\Type('integer'), new Assert\GreaterThan(0)],
                'orders'   => [
                    new Assert\NotBlank(),
                    new Assert\Type('array'),
                    new Assert\Count(['min' => 1]),
                    new Assert\All([
                        new Assert\Collection([
                            'fields' => [
                                'id'       => [new Assert\NotBlank(), new Assert\Type('integer'), new Assert\GreaterThan(0)],
                                'position' => [new Assert\NotBlank(), new Assert\Type('integer'), new Assert\GreaterThanOrEqual(0)],
                            ],
                            'allowMissingFields' => false,
                            'allowExtraFields'   => false,
                        ])
                    ])
                ],
            ],
            'allowMissingFields' => false,
            'allowExtraFields'   => true,
        ]);
    }

    public function schemaLessonSectionIndexQuery(): Assert\Collection
    {
        return new Assert\Collection([
            'fields' => [
                'lessonId' => [new Assert\NotBlank(), new Assert\Type('digit')],
                'orderBy'  => [new Assert\Optional([new Assert\Choice(['position', 'createdAt', 'updatedAt'])])],
                'order'    => [new Assert\Optional([new Assert\Choice(['asc', 'desc', 'ASC', 'DESC'])])],
            ],
            'allowMissingFields' => true,
            'allowExtraFields'   => true,
        ]);
    }

    /**
     * Validate query params with a schema.
     */
    public function validateQuery(Request $request, Assert\Collection $schema): array
    {
        $query = $request->query->all();
        return $this->validate($query, $schema);
    }
}