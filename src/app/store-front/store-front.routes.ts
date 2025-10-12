import { Routes } from "@angular/router";
import { StoreFrontLayoutComponent } from "./layouts/store-front-layout/store-front-layout.component";
import { HomeComponent } from "./pages/home/home.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ProductComponent, ProductsComponent } from "./pages/product";
import { RecipeComponent } from "./pages/recipe/recipe.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { ProfileComponent } from "../auth/pages/profile/profile.component";

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'product/:idSlug', component: ProductComponent },
      { path: 'recipe', component: RecipeComponent},
      { path: 'contact', component: ContactComponent },
      { path: '**', component: NotFoundComponent}
    ]
  }
]

export default storeFrontRoutes;
