<?php

namespace App\Controller\Api;

use App\Dto\LessonSectionDto;
use App\Entity\Lesson;
use App\Entity\LessonSection;
use App\Entity\QuestionOption;
use App\Entity\LessonRegistration;
use App\Entity\LessonSectionAnswer;
use App\Service\EntityService;
use App\Service\PayloadValidatorService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/lesson_section')]
final class ApiLessonSectionController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry $doctrine,
        private readonly EntityService $entityService,
        private readonly PayloadValidatorService $payloadValidator
    ) {}

    #[Route('/index', name: 'app_api_lesson_section_index', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        [$q, $errors] = $this->payloadValidator->validateQuery($request, $this->payloadValidator->schemaLessonSectionIndexQuery());
        if ($errors) return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);

        $lessonId = (int)$q['lessonId'];
        $orderBy  = $q['orderBy'] ?? 'position';
        $order    = strtoupper($q['order'] ?? 'ASC');

        $repo = $this->doctrine->getRepository(LessonSection::class);
        $qb = $repo->createQueryBuilder('s')
            ->andWhere('s.lesson = :lessonId')
            ->setParameter('lessonId', $lessonId)
            ->orderBy("s.$orderBy", $order);

        $sections = $qb->getQuery()->getResult();

        $dtos = array_map(
            fn (LessonSection $s) => $this->mapSectionToDto($s),
            $sections
        );

        // Optionally include given answers for a specific lesson registration
        if (!empty($q['lessonRegistrationId'])) {
            $registrationId = (int)$q['lessonRegistrationId'];
            // Build map sectionId => answer string
            $answersRepo = $this->doctrine->getRepository(\App\Entity\LessonSectionAnswer::class);
            $answers = $answersRepo->createQueryBuilder('a')
                ->andWhere('a.lessonRegistration = :regId')
                ->setParameter('regId', $registrationId)
                ->andWhere('a.lessonSection IN (:sections)')
                ->setParameter('sections', array_map(fn($s) => $s->getId(), $sections))
                ->getQuery()->getResult();
            $bySection = [];
            foreach ($answers as $ans) {
                $bySection[$ans->getLessonSection()->getId()] = $ans->getAnswer();
            }
            foreach ($dtos as $dto) {
                if (isset($bySection[$dto->id])) {
                    $dto->givenAnswer = $bySection[$dto->id];
                }
            }
        }

        return $this->json($dtos);
    }

    #[Route('/{id}', name: 'app_api_lesson_section_get', methods: ['GET'])]
    public function getOne(int $id): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        $section = $this->doctrine->getRepository(LessonSection::class)->find($id);
        if (!$section) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        $dto = $this->mapSectionToDto($section);
        return $this->json($dto);
    }

    #[Route('/create', name: 'app_api_lesson_section_create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER']);

        [$data, $parseErrors] = $this->payloadValidator->parseJson($request);
        if ($parseErrors) return $this->json(['errors' => $parseErrors], Response::HTTP_BAD_REQUEST);

        [$data, $errors] = $this->payloadValidator->validate($data, $this->payloadValidator->schemaLessonSectionCreate());
        if ($errors) return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);

        $lesson = $this->doctrine->getRepository(Lesson::class)->find((int)$data['lessonId']);
        if (!$lesson) return $this->json(['error' => 'Lesson not found'], Response::HTTP_NOT_FOUND);

        // Default position -> last + 1
        if (!array_key_exists('position', $data) || $data['position'] === null) {
            $repo = $this->doctrine->getRepository(LessonSection::class);
            $max = (int)($repo->createQueryBuilder('s')
                ->select('MAX(s.position)')
                ->andWhere('s.lesson = :lessonId')
                ->setParameter('lessonId', $lesson->getId())
                ->getQuery()->getSingleScalarResult() ?? 0);
            $data['position'] = $max + 1;
        }

        $section = new LessonSection();
        $this->entityService->mapDtoToEntity($data, $section, [
            'lesson' => fn(array $dto) => $lesson,
        ]);

        // Handle questionOptions if present
        if (isset($data['questionOptions']) && is_array($data['questionOptions'])) {
            $this->updateQuestionOptions($section, $data['questionOptions']);
        }

        $em = $this->doctrine->getManager();
        $em->persist($section);
        $em->flush();

        $dto = $this->mapSectionToDto($section);
        return $this->json($dto, Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'app_api_lesson_section_update', methods: ['PUT'])]
    public function update(int $id, Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER']);

        [$data, $parseErrors] = $this->payloadValidator->parseJson($request);
        if ($parseErrors) return $this->json(['errors' => $parseErrors], Response::HTTP_BAD_REQUEST);

        [$data, $errors] = $this->payloadValidator->validate($data, $this->payloadValidator->schemaLessonSectionUpdate());
        if ($errors) return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);

        $section = $this->doctrine->getRepository(LessonSection::class)->find($id);
        if (!$section) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        // optional move across lessons
        $lessonOverride = null;
        if (isset($data['lessonId'])) {
            $lessonOverride = $this->doctrine->getRepository(Lesson::class)->find((int)$data['lessonId']);
            if (!$lessonOverride) return $this->json(['error' => 'Lesson not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityService->mapDtoToEntity($data, $section, [
            'lesson' => fn(array $dto) => $lessonOverride ?: $section->getLesson(),
        ]);

        // Handle questionOptions if present
        if (isset($data['questionOptions']) && is_array($data['questionOptions'])) {
            $this->updateQuestionOptions($section, $data['questionOptions']);
        }

        $this->doctrine->getManager()->flush();

        $dto = $this->mapSectionToDto($section);
        return $this->json($dto);
    }

    #[Route('/{id}', name: 'app_api_lesson_section_delete', methods: ['DELETE'])]
    public function delete(int $id): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER']);

        $section = $this->doctrine->getRepository(LessonSection::class)->find($id);
        if (!$section) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        $em = $this->doctrine->getManager();
        $em->remove($section);
        $em->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/reorder', name: 'app_api_lesson_section_reorder', methods: ['PUT'])]
    public function reorder(Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER']);

        [$data, $parseErrors] = $this->payloadValidator->parseJson($request);
        if ($parseErrors) return $this->json(['errors' => $parseErrors], Response::HTTP_BAD_REQUEST);

        [$data, $errors] = $this->payloadValidator->validate($data, $this->payloadValidator->schemaLessonSectionReorder());
        if ($errors) return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);

        $lessonId = (int)$data['lessonId'];
        $orders   = $data['orders'];

        $repo = $this->doctrine->getRepository(LessonSection::class);
        $em = $this->doctrine->getManager();

        $existing = $repo->createQueryBuilder('s')
            ->andWhere('s.lesson = :lessonId')
            ->setParameter('lessonId', $lessonId)
            ->getQuery()->getResult();

        $byId = [];
        foreach ($existing as $s) {
            $byId[$s->getId()] = $s;
        }

        $updated = 0;
        foreach ($orders as $item) {
            $id = (int)$item['id'];
            $pos = (int)$item['position'];
            if (!isset($byId[$id])) {
                return $this->json(['error' => "Section $id does not belong to lesson $lessonId"], Response::HTTP_BAD_REQUEST);
            }
            $byId[$id]->setPosition($pos);
            $updated++;
        }

        $em->flush();
        return $this->json(['lessonId' => $lessonId, 'updated' => $updated]);
    }

    #[Route('/{id}/check_answer', name: 'app_api_lesson_section_check_answer', methods: ['POST'])]
    public function checkAnswer(int $id, Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        $section = $this->doctrine->getRepository(LessonSection::class)->find($id);
        if (!$section) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $answer = $data['answer'] ?? null;
        $registrationId = isset($data['lessonRegistrationId']) ? (int)$data['lessonRegistrationId'] : null;
        $correctAnswer = $section->getCorrectAnswer();
        $questionType = $section->getQuestionType();

        $isCorrect = false;
        if ($correctAnswer !== null && $answer !== null) {
            $isCorrect = $this->compareAnswers($questionType, $answer, $correctAnswer);
        }

        // Persist/Update the user's answer if a lesson registration is provided
        if ($registrationId) {
            $em = $this->doctrine->getManager();
            $registration = $this->doctrine->getRepository(LessonRegistration::class)->find($registrationId);
            if (!$registration) {
                return $this->json(['error' => 'Lesson registration not found'], Response::HTTP_NOT_FOUND);
            }
            // Upsert existing answer
            $repo = $this->doctrine->getRepository(LessonSectionAnswer::class);
            $existing = $repo->findOneBy([
                'lessonRegistration' => $registration,
                'lessonSection' => $section,
            ]);

            $toStore = is_array($answer) ? json_encode($answer) : (isset($answer) ? (string)$answer : null);

            if ($existing) {
                $existing->setAnswer($toStore);
            } else {
                $lsa = new LessonSectionAnswer();
                $lsa->setLessonRegistration($registration);
                $lsa->setLessonSection($section);
                $lsa->setAnswer($toStore);
                $em->persist($lsa);
            }
            $em->flush();
        }

        return $this->json(['correct' => $isCorrect]);
    }

    private function compareAnswers(?string $questionType, mixed $given, string $correct): bool
    {
        $qt = strtolower((string)$questionType);
        // Try to parse correct as JSON for list types
        $parsedCorrect = null;
        $correctTrim = trim($correct);
        if (in_array($qt, ['checkbox'])) {
            $parsedCorrect = json_decode($correctTrim, true);
            if (!is_array($parsedCorrect)) {
                // Fallback: comma-separated values
                $parsedCorrect = array_values(array_filter(array_map(fn($s) => trim((string)$s), explode(',', $correctTrim)), fn($s) => $s !== ''));
            }
            $givenArr = $given;
            if (!is_array($givenArr)) {
                // Allow single string like "1,2"
                $givenArr = array_values(array_filter(array_map(fn($s) => trim((string)$s), explode(',', (string)$given)), fn($s) => $s !== ''));
            }
            // Compare as sets of strings
            $normalize = function(array $arr): array {
                return array_values(array_unique(array_map(fn($v) => (string)$v, $arr)));
            };
            $a = $normalize($parsedCorrect);
            $b = $normalize($givenArr);
            sort($a);
            sort($b);
            return $a === $b;
        }

        if ($qt === 'number') {
            return (float)$given == (float)$correctTrim; // loose compare for numeric
        }

        // radio/text default: case-insensitive trim compare, also allow numeric equality
        $g = trim(is_array($given) ? implode(',', $given) : (string)$given);
        if (is_numeric($g) && is_numeric($correctTrim)) {
            return (float)$g == (float)$correctTrim;
        }
        return mb_strtolower($g) === mb_strtolower($correctTrim);
    }

    /** Utility: allow any of the given roles */
    private function denyAccessUnlessGrantedAny(array $roles): void
    {
        foreach ($roles as $role) {
            if ($this->isGranted($role)) return;
        }
        $this->denyAccessUnlessGranted($roles[0]); // will throw 403
    }

    /** Helper: update question options collection */
    private function updateQuestionOptions(LessonSection $section, array $optionsData): void
    {
        $em = $this->doctrine->getManager();
        
        // Remove existing options
        foreach ($section->getQuestionOptions() as $option) {
            $em->remove($option);
        }
        $section->getQuestionOptions()->clear();
        
        // Add new options
        foreach ($optionsData as $optData) {
            $option = new QuestionOption();
            $option->setOptionText($optData['optionText'] ?? '');
            $option->setPosition($optData['position'] ?? 0);
            $section->addQuestionOption($option);
        }
    }

    /** Helper: map section to DTO with question options */
    private function mapSectionToDto(LessonSection $section): LessonSectionDto
    {
        $dto = $this->entityService->mapEntityToDto($section, LessonSectionDto::class, ['lessonId' => 'lesson.id']);
        
        // Manually add question options
        $options = [];
        foreach ($section->getQuestionOptions() as $option) {
            $options[] = [
                'id' => $option->getId(),
                'lessonSectionId' => $option->getLessonSection()?->getId(),
                'lessonId' => $section->getLesson()?->getId(),
                'optionText' => $option->getOptionText(),
                'position' => $option->getPosition(),
            ];
        }
        $dto->questionOptions = $options;
        
        return $dto;
    }
}
