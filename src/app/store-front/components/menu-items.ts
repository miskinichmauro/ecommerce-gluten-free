import { MenuItem } from "./interfaces/menu-item.interface";

export const MENU_ITEMS : MenuItem[] = [
  { label: 'Inicio', route: '/', adminOnly: false },
  { label: 'Productos', route: '/products', adminOnly: false },
  { label: 'Recetas', route: '/recipe', adminOnly: false },
  { label: 'Contacto', route: '/contact', adminOnly: false },
  { label: 'Panel Administrativo', route: '/admin', adminOnly: true },
];
