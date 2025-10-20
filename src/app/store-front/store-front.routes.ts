import { Routes } from "@angular/router";
import { StoreFrontLayoutComponent } from "./layouts/store-front-layout/store-front-layout.component";
import { HomeComponent } from "./pages/home/home.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ProductComponent, ProductsComponent } from "./pages/product";
import { RecipeComponent } from "./pages/recipe/recipe.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { UserOptionsComponent } from "./pages/user-options/user-options.component";
import { LoginComponent } from "../auth/pages/login/login.component";
import { CartComponent } from "src/app/carts/components/cart/cart.component";

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
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
        path: 'product/:idSlug',
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
        path: '**',
        component: NotFoundComponent
      },
      {
        path: 'userOptions',
        title: 'Opciones de usuario',
        outlet: 'sidebar',
        component: UserOptionsComponent

      },
      {
        path: 'auth/login',
        title: 'Iniciar sesión',
        outlet: 'sidebar',
        component: LoginComponent
      },
      {
        path: 'cart',
        title: 'Carrito',
        outlet: 'sidebar',
        component: CartComponent
      },
    ]
  }
]

export default storeFrontRoutes;
