import { Routes } from "@angular/router";
import { IsAdmin } from "@auth/guards/is-admin.guard";
import { AdminDashboardLayoutComponent } from "@admin-dashboard/layouts/admin-dashboard-layout/admin-dashboard-layout.component";
import { ContactAdminComponent } from "@admin-dashboard/pages/contacts/contact-admin/contact-admin.component";
import { ContactsAdminComponent } from "@admin-dashboard/pages/contacts/contacts-admin/contacts-admin.component";
import { ProductAdminComponent } from "@admin-dashboard/pages/products/product-admin/product-admin.component";
import { ProductsAdminComponent } from "@admin-dashboard/pages/products/products-admin/products-admin.component";
import { RecipeAdminComponent } from "@admin-dashboard/pages/recipes/recipe-admin/recipe-admin.component";
import { RecipesAdminComponent } from "@admin-dashboard/pages/recipes/recipes-admin/recipes-admin.component";
import { UserAdminComponent } from "@admin-dashboard/pages/users/users/user-admin/user-admin.component";
import { UsersAdminComponent } from "@admin-dashboard/pages/users/users/users-admin/users-admin.component";
import { RolesAdminComponent } from "@admin-dashboard/pages/users/roles/roles-admin/roles-admin.component";
import { RoleAdminComponent } from "@admin-dashboard/pages/users/roles/role-admin/role-admin.component";



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
        path: 'users',
        title: 'Usuarios',
        component: UsersAdminComponent
      },
      {
        path: 'users/:id',
        title: 'Usuario',
        component: UserAdminComponent
      },
      {
        path: 'roles',
        title: 'Roles',
        component: RolesAdminComponent
      },
      {
        path: 'roles/:id',
        title: 'Rol',
        component: RoleAdminComponent
      },
      {
        path: '**',
        redirectTo: 'products'
      }
    ]
  }
];

export default AdminDashboardRoutes;
