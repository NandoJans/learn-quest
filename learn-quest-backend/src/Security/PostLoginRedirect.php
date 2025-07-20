<?php

namespace App\Security;

use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use function in_array;

class PostLoginRedirect
{
    public function __construct(
        private UrlGeneratorInterface $urlGenerator,
        private array $roleRouteMap = [
            'ROLE_ADMIN'   => 'admin_dashboard',
            'ROLE_MANAGER' => 'manager_overview',
            'ROLE_USER'    => 'app_home',
        ]
    ) {}

    public function getRedirectUrl(UserInterface $user): string
    {
        // get all roles (you could inject RoleHierarchyInterface if you need hierarchy)
        $roles = $user->getRoles();

        foreach ($this->roleRouteMap as $role => $routeName) {
            if (in_array($role, $roles, true)) {
                return $routeName;
            }
        }

        // fallback if no matched role
        return 'app_home';
    }
}