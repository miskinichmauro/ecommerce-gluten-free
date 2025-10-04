import { Routes } from "@angular/router";
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
import { IsAdmin } from "../auth/guards/is-admin.guard";
import { ProductsAdminComponent } from "./pages/products/products-admin/products-admin.component";
import { ProductAdminComponent } from "./pages/products/product-admin/product-admin.component";

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
