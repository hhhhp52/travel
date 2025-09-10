import raw from './data/itinerary.json';

export type TimelineItem = {
  time: string;
  text: string;
  price?: string; // e.g., €6
  subpoints?: string[];
};

export type DayEntry = {
  id: string;
  date: string;
  label: string; // for sidebar
  location: string;
  weather: string;
  sunrise: string;
  sunset: string;
  wear: string;
  notes?: string;
  timeline?: TimelineItem[];
};

export type ItineraryData = { days: DayEntry[] };

const data = raw as unknown as ItineraryData;

export function getItinerary(): ItineraryData {
  return data;
}
