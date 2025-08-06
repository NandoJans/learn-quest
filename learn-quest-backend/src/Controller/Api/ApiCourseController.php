<?php

namespace App\Controller\Api;

use App\Entity\Course;
use App\Entity\CourseRegistration;
use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/course', methods: ['POST', 'GET'])]
final class ApiCourseController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry $doctrine,
    )
    {
    }

    #[Route('/enroll', name: 'app_api_course', methods: ['POST'])]
    public function index(Request $request): Response
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
        $courseRegister->setCourseId($course);
        $courseRegister->setUserId($user);

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
}
