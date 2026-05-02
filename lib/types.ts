export interface Item {
  id: string;
  name: string;
  description: string;
  price: number; // 0 = free
  available: boolean;
}

export interface Photo {
  id: string;
  url: string;
  itemIds: string[];
}

export interface Settings {
  pickupSlots: string[];
}

export interface Request {
  id: string;
  itemId: string; // "all" for I want it all
  itemName: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  pickupSlot?: string;
  question?: string;
  createdAt: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}
