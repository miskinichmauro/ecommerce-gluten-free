import { Routes } from "@angular/router";
import { StoreFrontLayoutComponent } from "./layouts/store-front-layout/store-front-layout.component";
import { HomeComponent } from "./pages/home/home.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ProductComponent, ProductsComponent } from "./pages/product";
import { RecipeComponent } from "./pages/recipe/recipe.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { TermsConditions } from "@store-front/pages/terms-conditions/terms-conditions";
import { PrivacyPolicies } from "@store-front/pages/privacy-policies/privacy-policies";
import { IsAuthenticated } from "@auth/guards/is-authenticated.guard";

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
      /** Default **/
      {
        path: '',
        title: 'E-commerce Gluten Free',
        component: HomeComponent
      },
      {
        path: 'products',
        title: 'Productos',
        component: ProductsComponent
      },
      {
        path: 'product/:slug',
        title: 'Producto',
        component: ProductComponent
      },
      {
        path: 'recipe',
        title: 'Recetas',
        component: RecipeComponent
      },
      {
        path: 'contact',
        title: 'Contacto',
        component: ContactComponent
      },
      {
        path: 'terms-conditions',
        title: 'Términos y condiciones',
        component: TermsConditions
      },
      {
        path: 'privacy-policies',
        title: 'Política de privacidad',
        component: PrivacyPolicies
      },

      /** User **/
      {
        path: 'user',
        canMatch: [IsAuthenticated],
        loadChildren: () => import('./pages/user/user-routes')
      },

      /** Not found **/
      {
        path: '**',
        component: NotFoundComponent
      },
    ]
  }
]

export default storeFrontRoutes;
