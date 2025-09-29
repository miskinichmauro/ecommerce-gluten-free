import { Routes } from "@angular/router";
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
import { ProductAdminComponent } from "./pages/product-admin/product-admin.component";
import { ProductsAdminComponent } from "./pages/products-admin/products-admin.component";
import { IsAdmin } from "../auth/guards/is-admin.guard";

export const AdminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    canMatch: [IsAdmin],
    children: [
      {
        path: 'products',
        component: ProductsAdminComponent
      },
      {
        path: 'product/:id',
        component: ProductAdminComponent
      },
      {
        path: '**',
        redirectTo: 'products'
      }
    ]
  }
];

export default AdminDashboardRoutes;
