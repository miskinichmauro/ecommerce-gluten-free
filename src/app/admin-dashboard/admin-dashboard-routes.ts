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
      { path: 'products', component: ProductsAdminComponent },
      { path: 'products/:id', component: ProductAdminComponent },
      { path: 'recipes', component: RecipesAdminComponent },
      { path: 'recipes/:id', component: RecipeAdminComponent },
      { path: 'contacts', component: ContactsAdminComponent },
      { path: 'contacts/:id', component: ContactAdminComponent },

      { path: '**', redirectTo: 'products' }
    ]
  }
];

export default AdminDashboardRoutes;
