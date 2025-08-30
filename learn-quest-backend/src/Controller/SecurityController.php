<?php

namespace App\Controller;

use App\Security\PostLoginRedirect;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    public function __construct(
        private readonly PostLoginRedirect $postLoginRedirect
    )
    {
    }

    #[Route(path: ['/login', '/'], name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        if ($user = $this->getUser()) {
            $routeName = $this->postLoginRedirect->getRedirectUrl($user);

            return $this->redirectToRoute($routeName);
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        // The logout path is handled by Symfony's security system, so this method can be empty.
        // It is required to have this method to handle the logout route.
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
