import { Routes } from "@angular/router";
import { User } from "@store-front/pages/user/user/user";
import { UserBillings } from "@store-front/users/components/user-billings/user-billings";
import { UserDirections } from "@store-front/users/components/user-directions/user-directions";
import { UserProfile } from "@store-front/users/components/user-profile/user-profile";
import { UserRecipes } from "@store-front/users/components/user-recipes/user-recipes";

export const userRoutes: Routes = [
  {
    path: '',
    component: User,
      children: [
        {
          path: 'profile',
          component: UserProfile
        },
        {
          path: 'directions',
          component: UserDirections
        },
        {
          path: 'billing',
          component: UserBillings
        },
        {
          path: 'recipes',
          component: UserRecipes
        },
        {
          path: '**',
          redirectTo: 'profile'
        }
      ]
    }
];

export default userRoutes;
