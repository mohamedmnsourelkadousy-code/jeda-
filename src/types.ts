export interface MenuItem {
  id: string;
  name: string;
  price: number;
  originalPriceText?: string;
  category: string;
  section: string;
  description?: string;
  imageIcon?: string; // name of a Lucide icon
  imageUrl?: string; // base64 or custom CDN image url
  extras?: { name: string; price: number }[];
  accentColor?: string; // Tailwind color for active highlights
}

export interface CartItem {
  id: string; // generated unique id based on itemId + selected extras
  itemId: string;
  name: string;
  basePrice: number;
  price: number; // base + extras
  count: number;
  selectedExtras: { name: string; price: number }[];
  customNotes?: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
  date: string;
}

export interface AlBaladStory {
  id: string;
  title: string;
  text: string;
  imageDescription: string;
  iconName: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userName: string;
  userPhone?: string;
  tableNumber?: string;
  orderMethod: 'dinein' | 'delivery';
  items: CartItem[];
  subtotal: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}
