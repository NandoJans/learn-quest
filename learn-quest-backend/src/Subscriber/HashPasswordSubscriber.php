<?php

namespace App\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class HashPasswordSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            FormEvents::POST_SUBMIT => 'onPostSubmit',
        ];
    }

    public function onPostSubmit(FormEvent $event): void
    {
        $user = $event->getData();
        $form = $event->getForm();

        // Skip if not a user or if no password field
        if (!method_exists($user, 'setPassword') || !$form->has('password')) {
            return;
        }

        $password = $form->get('password')->getData();

        if (!empty($password)) {
            $hashed = $this->passwordHasher->hashPassword($user, $password);
            $user->setPassword($hashed);
        }
    }
}
