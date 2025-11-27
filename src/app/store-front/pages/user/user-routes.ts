import { Routes } from "@angular/router";
import { User } from "@store-front/pages/user/user/user";
import { UserBillings } from "@store-front/users/components/user-billings/user-billings";
import { UserDirections } from "@store-front/users/components/user-directions/user-directions";
import { UserDirectionsNew } from "@store-front/users/components/user-directions-new/user-directions-new";
import { UserBillingsNew } from "@store-front/users/components/user-billings-new/user-billings-new";
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
          path: 'directions/new',
          component: UserDirectionsNew
        },
        {
          path: 'directions',
          component: UserDirections
        },
        {
          path: 'billing/new',
          component: UserBillingsNew
        },
        {
          path: 'billing',
          component: UserBillings
        },
        {
          path: 'orders',
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
