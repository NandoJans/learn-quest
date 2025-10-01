<?php

namespace App\Controller\Api;

use App\Dto\QuestionOptionDto;
use App\Entity\QuestionOption;
use App\Service\EntityService;
use App\Service\PayloadValidatorService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/question_option')]
final class ApiQuestionOptionController extends AbstractController
{
    public function __construct(
        private readonly ManagerRegistry $doctrine,
        private readonly EntityService $entityService,
        private readonly PayloadValidatorService $payloadValidator
    ) {}

    #[Route('/index', name: 'app_api_question_option_index', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGrantedAny(['ROLE_ADMIN','ROLE_TEACHER','ROLE_STUDENT']);

        [$q, $errors] = $this->payloadValidator->validateQuery($request, $this->payloadValidator->schemaQuestionOptionIndexQuery());
        if ($errors) return $this->json(['errors' => $errors], Response::HTTP_BAD_REQUEST);

        $lessonSectionId = (int)$q['lessonSectionId'];
        $orderBy  = $q['orderBy'] ?? 'position';
        $order    = strtoupper($q['order'] ?? 'ASC');

        $repo = $this->doctrine->getRepository(QuestionOption::class);
        $qb = $repo->createQueryBuilder('o')
            ->andWhere('o.lessonSection = :lessonSectionId')
            ->setParameter('lessonSectionId', $lessonSectionId)
            ->orderBy("o.$orderBy", $order);

        $options = $qb->getQuery()->getResult();

        $dtos = array_map(
            fn (QuestionOption $o) => $this->entityService->mapEntityToDto($o, QuestionOptionDto::class, ['lessonSectionId' => 'lessonSection.id']),
            $options
        );

        return $this->json($dtos);
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
