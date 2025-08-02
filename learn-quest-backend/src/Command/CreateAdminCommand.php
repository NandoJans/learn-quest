<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Add a short description for your command',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
        private readonly EntityManagerInterface $em,
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('username', InputArgument::REQUIRED, 'Username')
            ->addArgument('password', InputArgument::REQUIRED, 'Password')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $username = $input->getArgument('username');
        $plain = $input->getArgument('password');

        // Check if the user already exists
        $user = $this->em->getRepository(User::class)->findOneBy(['username' => $username]);

        if ($user) {
            $output->writeln("<warning>User with username '$username' already exists.</warning>");
            // Ask if the user wants to overwrite
            $io = $this->getHelper('question');
            $question = new ConfirmationQuestion(
                "<question>Do you want to overwrite the existing user? (yes/no)</question> ",
                false
            );
            if (!$io->ask($input, $output, $question)) {
                $output->writeln("<info>Operation cancelled.</info>");
                return Command::SUCCESS;
            } else {
                $output->writeln("<info>Overwriting user '$username'.</info>");
            }
        } else {
            $user = new User();
            $user->setUsername($username);
            $user->setRoles(['ROLE_ADMIN']);
        }

        $user->setPassword($this->hasher->hashPassword($user, $plain));

        $this->em->persist($user);
        $this->em->flush();

        $output->writeln("Admin user <info>$username</info> created.");
        return Command::SUCCESS;
    }
}
