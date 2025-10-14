import { Routes } from "@angular/router";
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
import { IsAdmin } from "../auth/guards/is-admin.guard";
import { ProductsAdminComponent } from "./pages/products/products-admin/products-admin.component";
import { ProductAdminComponent } from "./pages/products/product-admin/product-admin.component";
import { RecipesAdminComponent } from "./pages/recipes/recipes-admin/recipes-admin.component";
import { RecipeAdminComponent } from "./pages/recipes/recipe-admin/recipe-admin.component";
import { ContactsAdminComponent } from "./pages/contacts/contacts-admin/contacts-admin.component";
import { ContactAdminComponent } from "./pages/contacts/contact-admin/contact-admin.component";

export const AdminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    canMatch: [IsAdmin],
    children: [
      {
        path: 'products',
        title: 'Productos',
        component: ProductsAdminComponent
      },
      {
        path: 'products/:id',
        title: 'Producto',
        component:
        ProductAdminComponent
      },
      {
        path: 'recipes',
        title: 'Recetas',
        component: RecipesAdminComponent
      },
      {
        path: 'recipes/:id',
        title: 'Receta',
        component: RecipeAdminComponent
      },
      {
        path: 'contacts',
        title: 'Contactos',
        component: ContactsAdminComponent
      },
      {
        path: 'contacts/:id',
        title: 'Contacto',
        component: ContactAdminComponent
      },

      {
        path: '**',
        redirectTo: 'products'
      }
    ]
  }
];

export default AdminDashboardRoutes;
