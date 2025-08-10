<?php

namespace App\Controller\Api;

use App\Dto\LessonSectionDto;
use App\Entity\Lesson;
use App\Entity\LessonSection;
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
            fn (LessonSection $s) => $this->entityService->mapEntityToDto($s, LessonSectionDto::class, ['lessonId' => 'lesson.id']),
            $sections
        );

        return $this->json($dtos);
    }

    #[Route('/{id}', name: 'app_api_lesson_section_get', methods: ['GET'])]
    public function getOne(int $id): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        $section = $this->doctrine->getRepository(LessonSection::class)->find($id);
        if (!$section) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        $dto = $this->entityService->mapEntityToDto($section, LessonSectionDto::class, ['lessonId' => 'lesson.id']);
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

        $em = $this->doctrine->getManager();
        $em->persist($section);
        $em->flush();

        $dto = $this->entityService->mapEntityToDto($section, LessonSectionDto::class, ['lessonId' => 'lesson.id']);
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

        $this->doctrine->getManager()->flush();

        $dto = $this->entityService->mapEntityToDto($section, LessonSectionDto::class, ['lessonId' => 'lesson.id']);
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

    /** Utility: allow any of the given roles */
    private function denyAccessUnlessGrantedAny(array $roles): void
    {
        foreach ($roles as $role) {
            if ($this->isGranted($role)) return;
        }
        $this->denyAccessUnlessGranted($roles[0]); // will throw 403
    }
}
