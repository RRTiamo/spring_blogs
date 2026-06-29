export interface LoveEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  mood: string;
  visibility: "public" | "hidden" | "private";
  cover: string;
  content: string;
  longitude?: number;
  latitude?: number;
}

export interface BucketItem {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
  cover?: string;
  thoughts?: string;
  category: "travel" | "food" | "daily" | "adventure";
}

export interface TimeCapsule {
  id: string;
  sender: string;
  receiver: string;
  writeDate: string;
  openDate: string;
  title: string;
  content: string;
  bypassCode?: string;
  prompt?: string;
}

export interface LoveStats {
  startDate: string;
  citiesCount: number;
  flightDistance: number;
  movieCount: number;
  mealCount: number;
}
