import { Routes } from "@angular/router";
import { StoreFrontLayoutComponent } from "./layouts/store-front-layout/store-front-layout.component";
import { HomeComponent } from "./pages/home/home.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { ProductComponent, ProductsComponent } from "./pages/product";
import { RecipeComponent } from "./pages/recipe/recipe.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { UserOptionsComponent } from "./pages/user/user-sidebar-options/user-sidebar-options.component";
import { LoginComponent } from "../auth/pages/login/login.component";
import { CartSidebarComponent } from "@store-front/pages/cart/cart-sidebar/cart-sidebar.component";

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
        path: 'contact',
        title: 'Contacto',
        component: ContactComponent
      },
      {
        path: 'contact',
        title: 'Contacto',
        component: ContactComponent
      },
      {
        path: 'contact',
        title: 'Contacto',
        component: ContactComponent
      },

      /** User **/
      {
        path: 'user',
        loadChildren: () => import('./pages/user/user-routes')
      },

      /** Sidebar **/
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
        path: 'cartSidebar',
        title: 'Mi carrito',
        outlet: 'sidebar',
        component: CartSidebarComponent
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
