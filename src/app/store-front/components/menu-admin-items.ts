import { MenuItem } from "./interfaces/menu-item.interface";

export const MENU_ADMIN_ITEMS : MenuItem[] = [
  { label: 'Inicio', route: '/', adminOnly: true },
  { label: 'Dashboard', route: '/admin/dashboard', adminOnly: true },
  { label: 'Productos', route: '/admin/products', adminOnly: true },
  { label: 'Recetas', route: '/admin/recipes', adminOnly: true },
  { label: 'Contacto', route: '/admin/contacts', adminOnly: true },
  { label: 'Usuarios', route: '/admin/users', adminOnly: true },
];
