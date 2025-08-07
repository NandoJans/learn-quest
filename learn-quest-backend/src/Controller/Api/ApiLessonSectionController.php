<?php

namespace App\Controller\Api;

use App\Entity\Lesson;
use App\Entity\LessonSection;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/lesson_section', methods: ['POST', 'GET'])]
final class ApiLessonSectionController extends AbstractController
{
    public function __construct(private readonly ManagerRegistry $doctrine)
    {
    }

    #[Route('/create', name: 'app_api_lesson_section_create', methods: ['POST'])]
    public function create(Request $request): Response
    {
        if (!$this->isGranted('ROLE_ADMIN') && !$this->isGranted('ROLE_TEACHER')) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON body'], Response::HTTP_BAD_REQUEST);
        }

        $lessonId = (int) ($data['lessonId'] ?? 0);
        $type = $data['type'] ?? null;
        $content = $data['content'] ?? null;
        $position = (int) ($data['position'] ?? 0);

        if (!$lessonId || !$type) {
            return $this->json(['error' => 'lessonId and type are required'], Response::HTTP_BAD_REQUEST);
        }

        $lesson = $this->doctrine->getRepository(Lesson::class)->find($lessonId);
        if (!$lesson) {
            return $this->json(['error' => 'Lesson not found'], Response::HTTP_NOT_FOUND);
        }

        $section = new LessonSection();
        $section->setLesson($lesson);
        $section->setType($type);
        $section->setContent($content);
        $section->setPosition($position);

        $em = $this->doctrine->getManager();
        $em->persist($section);
        $em->flush();

        return $this->json([
            'id' => $section->getId(),
            'lessonId' => $section->getLessonId(),
            'type' => $section->getType(),
            'content' => $section->getContent(),
            'position' => $section->getPosition(),
        ], Response::HTTP_CREATED);
    }
}
