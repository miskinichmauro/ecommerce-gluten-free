import { MenuItem } from "./interfaces/menu-item.interface";

export const MENU_ADMIN_ITEMS : MenuItem[] = [
  { label: 'Inicio', routerLink: '/', adminOnly: true },
  { label: 'Dashboard', routerLink: '/admin/dashboard', adminOnly: true },
  { label: 'Productos', routerLink: '/admin/products', adminOnly: true },
  { label: 'Categorías', routerLink: '/admin/categories', adminOnly: true },
  { label: 'Tags', routerLink: '/admin/tags', adminOnly: true },
  { label: 'Recetas', routerLink: '/admin/recipes', adminOnly: true },
  { label: 'Contacto', routerLink: '/admin/contacts', adminOnly: true },
  { label: 'Usuarios', routerLink: '/admin/users', adminOnly: true },
];
