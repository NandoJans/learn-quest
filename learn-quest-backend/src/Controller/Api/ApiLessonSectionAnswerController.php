<?php

namespace App\Controller\Api;

use App\Dto\LessonSectionAnswerDto;
use App\Entity\LessonSection;
use App\Entity\LessonSectionAnswer;
use App\Entity\User;
use App\Service\EntityService;
use App\Service\PayloadValidatorService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/lesson_section_answer')]
final class ApiLessonSectionAnswerController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry $doctrine,
        private readonly EntityService $entityService,
        private readonly PayloadValidatorService $payloadValidator
    ) {}

    #[Route('/submit', name: 'app_api_lesson_section_answer_submit', methods: ['POST'])]
    public function submit(Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        [$data, $parseErrors] = $this->payloadValidator->parseJson($request);
        if ($parseErrors) return $this->json(['errors' => $parseErrors], Response::HTTP_BAD_REQUEST);

        [$data, $errors] = $this->payloadValidator->validate($data, $this->payloadValidator->schemaLessonSectionAnswerCreate());
        if ($errors) return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);

        $lessonSection = $this->doctrine->getRepository(LessonSection::class)->find((int)$data['lessonSectionId']);
        if (!$lessonSection) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        if ($lessonSection->getType() !== 'question') {
            return $this->json(['error' => 'This section is not a question'], Response::HTTP_BAD_REQUEST);
        }

        /** @var User $user */
        $user = $this->getUser();

        // Check if answer already exists for this user and section
        $existingAnswer = $this->doctrine->getRepository(LessonSectionAnswer::class)
            ->findOneBy(['user' => $user, 'lessonSection' => $lessonSection]);

        $answer = $existingAnswer ?? new LessonSectionAnswer();
        $answer->setUser($user);
        $answer->setLessonSection($lessonSection);
        $answer->setAnswer($data['answer']);
        
        // Check if answer is correct
        $isCorrect = $this->checkAnswer($lessonSection, $data['answer']);
        $answer->setIsCorrect($isCorrect);

        $em = $this->doctrine->getManager();
        if (!$existingAnswer) {
            $em->persist($answer);
        }
        $em->flush();

        $dto = $this->entityService->mapEntityToDto($answer, LessonSectionAnswerDto::class, [
            'userId' => 'user.id',
            'lessonSectionId' => 'lessonSection.id',
            'createdAt' => fn($e) => $e->getCreatedAt()->format('Y-m-d H:i:s')
        ]);

        // Include explanation and correct answer if needed
        $response = [
            'answer' => $dto,
            'isCorrect' => $isCorrect,
        ];

        if (!$isCorrect || $request->query->get('showExplanation') === 'true') {
            $response['explanation'] = $lessonSection->getQuestionExplanation();
            if (!$isCorrect) {
                $response['correctAnswer'] = $lessonSection->getQuestionCorrectAnswer();
            }
        }

        return $this->json($response, $existingAnswer ? Response::HTTP_OK : Response::HTTP_CREATED);
    }

    #[Route('/section/{lessonSectionId}', name: 'app_api_lesson_section_answer_get', methods: ['GET'])]
    public function getUserAnswer(int $lessonSectionId): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        $lessonSection = $this->doctrine->getRepository(LessonSection::class)->find($lessonSectionId);
        if (!$lessonSection) return $this->json(['error' => 'Lesson section not found'], Response::HTTP_NOT_FOUND);

        /** @var User $user */
        $user = $this->getUser();

        $answer = $this->doctrine->getRepository(LessonSectionAnswer::class)
            ->findOneBy(['user' => $user, 'lessonSection' => $lessonSection]);

        if (!$answer) {
            return $this->json(null);
        }

        $dto = $this->entityService->mapEntityToDto($answer, LessonSectionAnswerDto::class, [
            'userId' => 'user.id',
            'lessonSectionId' => 'lessonSection.id',
            'createdAt' => fn($e) => $e->getCreatedAt()->format('Y-m-d H:i:s')
        ]);

        return $this->json($dto);
    }

    private function checkAnswer(LessonSection $section, string $userAnswer): bool
    {
        $correctAnswer = $section->getQuestionCorrectAnswer();
        $inputType = $section->getQuestionInputType();

        if ($inputType === 'checkbox') {
            // For checkbox, answer is stored as JSON array
            $userAnswers = json_decode($userAnswer, true);
            $correctAnswers = json_decode($correctAnswer, true);
            
            if (!is_array($userAnswers) || !is_array($correctAnswers)) {
                return false;
            }
            
            sort($userAnswers);
            sort($correctAnswers);
            
            return $userAnswers === $correctAnswers;
        } elseif ($inputType === 'number') {
            // For numbers, compare as floats
            return abs(floatval($userAnswer) - floatval($correctAnswer)) < 0.0001;
        } else {
            // For text and radio, direct comparison
            return trim($userAnswer) === trim($correctAnswer);
        }
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
