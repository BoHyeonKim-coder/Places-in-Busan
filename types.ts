
export type Language = 'en' | 'ko' | 'ja' | 'zh' | 'ru' | 'fr' | 'ar' | 'he' | 'fa';

export interface StoryContent {
  location: string;
  emotion: string;
  history: string;
  contentType: string;
  contentTitle: string;
  targetAudience: string;
  plot: string;
  effect: string;
  consolationMessage: string;
  posterSlogan: string; // Nano Banana style concise slogan
  visualPrompt: string; // Prompt for the image generator
}

export interface NearbyPlace {
  name: string;
  category: string; // e.g., "Korean BBQ", "Hotel", "Park"
  description: string;
  price?: string; // For accommodations or tickets (e.g. "approx 50,000 KRW")
  url?: string; // Website or Google Maps URL
}

export interface NearbyInfo {
  restaurants: NearbyPlace[];
  accommodations: NearbyPlace[];
  attractions: NearbyPlace[];
}

export interface DietaryPlaces {
  vegan: NearbyPlace[];
  halal: NearbyPlace[];
  kosher: NearbyPlace[];
}

export interface GeneratedResult {
  textData: StoryContent;
  imageUrl?: string; // The artistic poster
  watercolorImageUrl?: string; // The watercolor painting
  landscapeImageUrl?: string; // The realistic scenery photo
  nearbyInfo?: NearbyInfo; // Nearby places info
  dietaryPlaces?: DietaryPlaces; // Special dietary info
}

export type LoadingState = 'idle' | 'researching' | 'planning' | 'designing' | 'scouting' | 'complete' | 'error' | 'dietary-loading';
