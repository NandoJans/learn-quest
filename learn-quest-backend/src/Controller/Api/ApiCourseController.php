<?php

namespace App\Controller\Api;

use App\Dto\CourseDto;
use App\Entity\Course;
use App\Entity\CourseRegistration;
use App\Entity\User;
use App\Service\EntityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/course', methods: ['POST', 'GET'])]
final class ApiCourseController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry $doctrine,
        private readonly EntityService $entityService,
    )
    {
    }

    #[Route('/enroll', name: 'app_api_course', methods: ['POST'])]
    public function enroll(Request $request): Response
    {
        $requestBody = json_decode($request->getContent(), true);

        if (!$requestBody) {
            return $this->json(
                [
                    'error' => 'Invalid JSON body',
                ],
                Response::HTTP_BAD_REQUEST
            );
        }

        $courseId = (int) $requestBody['courseId'];
        $userId = (int) $requestBody['userId'];

        if (!$courseId || !$userId) {
            return $this->json(
                [
                    'error' => 'Course ID and User ID are required',
                ],
                Response::HTTP_BAD_REQUEST
            );
        }

        $course = $this->doctrine->getRepository(Course::class)->find($courseId);
        $user = $this->doctrine->getRepository(User::class)->find($userId);

        if (!$course) {
            return $this->json(
                [
                    'error' => 'Course not found',
                ],
                Response::HTTP_NOT_FOUND
            );
        }

        if (!$user) {
            return $this->json(
                [
                    'error' => 'User not found',
                ],
                Response::HTTP_NOT_FOUND
            );
        }

        $courseRegister = new CourseRegistration();
        $courseRegister->setCourse($course);
        $courseRegister->setUser($user);

        $em = $this->doctrine->getManager();
        $em->persist($courseRegister);
        $em->flush();

        return $this->json(
            [
                'message' => 'Course enrollment successful',
            ],
            Response::HTTP_OK
        );
    }

    #[Route('/enrollments/{userId}', name: 'app_api_course_enrollments', methods: ['GET'])]
    public function getEnrollments(int $userId): JsonResponse
    {
        $user = $this->doctrine->getRepository(User::class)->find($userId);

        if (!$user) {
            return $this->json(
                [
                    'error' => 'User not found',
                ],
                Response::HTTP_NOT_FOUND
            );
        }

        $courses = $user->getRegisteredCourses();

        $courseDtos = array_map(function ($course) {
            $this->entityService->mapEntityToDto($course, CourseDto::class);
        }, $courses->toArray());

        return $this->json($courseDtos, Response::HTTP_OK);
    }
}
