export interface TravelPreferences {
  destination: string;
  duration: number;
  budget: string;
  interests: string[];
  restrictions: string;
  verifiedPlaces?: string;
  verifiedRules?: string;
}

export interface BudgetCategory {
  category: string;
  percentage: number;
  amountEst: string;
  description: string;
}

export interface DayTimelineItem {
  dayNumber: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface ItineraryResult {
  markdownItinerary: string;
  budgetDistribution: BudgetCategory[];
  daysTimeline: DayTimelineItem[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  type?: "feedback" | "greeting" | "notification";
  timestamp: Date;
}
