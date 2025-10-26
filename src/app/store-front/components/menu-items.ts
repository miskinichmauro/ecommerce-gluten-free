import { MenuItem } from "./interfaces/menu-item.interface";

export const MENU_ITEMS : MenuItem[] = [
  { label: 'Inicio', routerLink: '/', adminOnly: false },
  { label: 'Productos', routerLink: '/products', adminOnly: false },
  { label: 'Recetas', routerLink: '/recipe', adminOnly: false },
  { label: 'Contacto', routerLink: '/contact', adminOnly: false },
  { label: 'Panel Administrativo', routerLink: '/admin', adminOnly: true },
];
