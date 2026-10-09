import { useEffect, useState } from "react";

import elenaPhoto from "@/assets/community/portraits/elena-rivera.jpg";
import marcusPhoto from "@/assets/community/portraits/marcus-bell.jpg";
import mayaPhoto from "@/assets/community/portraits/maya-thompson.jpg";
import jordanPhoto from "@/assets/community/portraits/jordan-lee.jpg";
import anaPhoto from "@/assets/community/portraits/ana-delgado.jpg";
import kevinPhoto from "@/assets/community/portraits/kevin-oneil.jpg";

export type CommunityNurse = {
  id: string;
  name: string;
  specialty: string;
  home: string;
  location: string;
  photo: string;
  bio: string;
  tags: string[];
  openToBuddy: boolean;
};

export type NurseStory = {
  id: string;
  nurseId: string;
  hospital: string;
  location: string;
  assignment: string;
  rating: number;
  quote: string;
  story: string;
  highlights: string[];
  type: "Metro" | "Coastal" | "Rural" | "Family" | "Service";
};

export type CommunityPost = {
  id: string;
  nurseId: string;
  group: string;
  text: string;
  time: string;
  likes: number;
  replies: number;
};

export type CommunityGroup = {
  id: string;
  name: string;
  description: string;
  members: number;
  tag: string;
};

export type ExperienceReview = {
  hospital: string;
  location: string;
  assignment: string;
  ratings: Record<"team" | "onboarding" | "workload" | "housing" | "island" | "community", number>;
  highlight: string;
  advice: string;
  recommend: boolean;
  returnAgain: boolean;
  status: "draft" | "published";
  testimonialApproved: boolean;
};

export type CommunityState = {
  joinedGroups: string[];
  connections: string[];
  likedPosts: string[];
  openToBuddy: boolean;
  team: string[];
  review: ExperienceReview | null;
};

export const COMMUNITY_NURSES: CommunityNurse[] = [
  { id: "elena", name: "Elena Rivera", specialty: "Emergency Room", home: "Orlando, FL", location: "Dorado", photo: elenaPhoto, bio: "ED nurse, mom, beach-morning person. Here with my spouse and son.", tags: ["Family travel", "Beach", "4 weeks"], openToBuddy: true },
  { id: "marcus", name: "Marcus Bell", specialty: "Emergency Room", home: "Atlanta, GA", location: "San Juan", photo: marcusPhoto, bio: "Food explorer and ER night-shifter looking for an Old San Juan crew.", tags: ["Food", "Night shift", "Culture"], openToBuddy: true },
  { id: "maya", name: "Maya Thompson", specialty: "ICU / Critical Care", home: "Austin, TX", location: "Utuado", photo: mayaPhoto, bio: "First island assignment. Coffee farms, hikes, and a quieter off-day pace.", tags: ["First timer", "Hiking", "Coffee"], openToBuddy: true },
  { id: "jordan", name: "Jordan Lee", specialty: "Med-Surg", home: "Denver, CO", location: "Mayagüez", photo: jordanPhoto, bio: "Solo traveler learning to surf and always up for a post-shift meal.", tags: ["Solo", "Surf", "8 weeks"], openToBuddy: true },
  { id: "ana", name: "Ana Delgado", specialty: "Med-Surg", home: "Miami, FL", location: "San Juan", photo: anaPhoto, bio: "Bilingual nurse traveling with my daughter and happy to help newcomers settle in.", tags: ["Bilingual", "Family travel", "Wellness"], openToBuddy: false },
  { id: "kevin", name: "Kevin O’Neil", specialty: "Operating Room", home: "Boston, MA", location: "Ponce", photo: kevinPhoto, bio: "OR nurse, golfer, and weekend road-trip planner traveling with my spouse.", tags: ["Couples", "Golf", "South coast"], openToBuddy: true },
];

export const STORIES: NurseStory[] = [
  { id: "s1", nurseId: "elena", hospital: "Hospital Wilma N. Vázquez", location: "Dorado", assignment: "Emergency Room · 4 weeks", rating: 5, quote: "I came nervous about moving my whole family. By week two, we had a beach routine and people who knew our names.", story: "The hospital team made the clinical transition clear, while the family group helped us solve the everyday things—school questions, groceries, and which beaches were calmest for our son. The villa and rental car made the shorter local-pay assignment work for us.", highlights: ["Supportive ER team", "Family-friendly housing", "Dorado beach days"], type: "Family" },
  { id: "s2", nurseId: "maya", hospital: "Hospital Metropolitano de la Montaña", location: "Utuado", assignment: "ICU / Critical Care · 13 weeks", rating: 5, quote: "The mountains slowed me down in the best way—and the community made sure I never felt like I arrived alone.", story: "I was a shy solo traveler, so I joined the mountain cohort before flying. Our coffee-farm meetups gave me an instant circle, and the local team taught me as much about community care as I brought with me.", highlights: ["Mountain cohort", "Coffee-country weekends", "Close clinical team"], type: "Rural" },
  { id: "s3", nurseId: "jordan", hospital: "Mayagüez Medical Center", location: "Mayagüez", assignment: "Med-Surg · 8 weeks", rating: 4, quote: "I found my surf crew before I found my apartment keys. That changed the whole assignment.", story: "The west-coast group paired travelers arriving the same week. We shared rides, took beginner surf lessons, and had people to debrief with after long shifts. The work stayed demanding, but the assignment felt full.", highlights: ["Arrival-week crew", "Surf lessons", "West-coast sunsets"], type: "Coastal" },
  { id: "s4", nurseId: "ana", hospital: "Hospital Auxilio Mutuo", location: "San Juan", assignment: "Med-Surg · 13 weeks", rating: 5, quote: "San Juan gave me serious hospital experience without asking my daughter and me to put life on pause.", story: "The bilingual environment helped me move quickly, and the family network filled our calendar without pressure. We could walk to dinner, meet other nurses at the lagoon, or take a quiet weekend when we needed it.", highlights: ["Bilingual team", "Walkable city life", "Parent network"], type: "Metro" },
  { id: "s5", nurseId: "marcus", hospital: "Ashford Presbyterian Community Hospital", location: "San Juan", assignment: "Emergency Room · 8 weeks", rating: 4, quote: "The pay was local. The life outside the hospital was anything but ordinary.", story: "I knew the tradeoff before arriving. What made it work was having housing handled, a community chat for night-shifters, and experiences I would never have organized alone—from a food walk to a bio-bay weekend.", highlights: ["Night-shift group", "Housing handled", "Island experiences"], type: "Metro" },
  { id: "s6", nurseId: "kevin", hospital: "Centro de Salud de Vieques", location: "Vieques", assignment: "Community service · 2 weeks", rating: 5, quote: "This was not a vacation disguised as service. It was useful work, shared humbly with people who knew their community best.", story: "I joined a short skills-sharing rotation with clear local leadership. Lodging and meals were covered, and our small team supported school CPR sessions and chronic-care teaching. The impact—not compensation—was the reason to go.", highlights: ["Community-led service", "Skills sharing", "Small travel team"], type: "Service" },
];

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  { id: "first-timers", name: "First island assignment", description: "Questions, arrival plans, and low-pressure introductions for first-time Puerto Rico travelers.", members: 84, tag: "New travelers" },
  { id: "solo-buddies", name: "Solo, not alone", description: "Buddy matching and small plans for shy or solo travelers who want company without a packed social calendar.", members: 63, tag: "Travel buddies" },
  { id: "west-coast", name: "West coast shift crew", description: "Mayagüez, Aguadilla, Rincón, and Isabela travelers planning surf, food, and shared rides.", members: 47, tag: "Region" },
  { id: "families", name: "Island families", description: "Parents and partners sharing family housing, school, childcare, and calm-weekend ideas.", members: 38, tag: "Family" },
  { id: "mountain-care", name: "Mountain & rural care", description: "Utuado, Lares, Castañer, and service-minded nurses connecting around community care.", members: 29, tag: "Service" },
  { id: "night-shift", name: "Night shift, island time", description: "Breakfast meetups, safe rides, and off-day plans for people sleeping through the afternoon.", members: 56, tag: "Schedule" },
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  { id: "p1", nurseId: "maya", group: "First island assignment", text: "Landing in San Juan on Nov 12, then driving to Utuado. Anyone want to split the drive and stop for coffee? Quiet company is completely welcome.", time: "18 min", likes: 12, replies: 4 },
  { id: "p2", nurseId: "jordan", group: "West coast shift crew", text: "Beginner surf lesson at Jobos Saturday morning—three of us are going and there’s room for two more. No experience needed.", time: "1 hr", likes: 26, replies: 8 },
  { id: "p3", nurseId: "ana", group: "Island families", text: "Sharing our list of kid-friendly beaches and rainy-day spots. Happy to answer questions from anyone bringing family for the first time.", time: "3 hr", likes: 31, replies: 11 },
];

const INITIAL: CommunityState = { joinedGroups: ["first-timers"], connections: [], likedPosts: [], openToBuddy: false, team: [], review: null };
const KEY = "wepa-community-v1";

export function useCommunity() {
  const [state, setState] = useState<CommunityState>(INITIAL);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setState({ ...INITIAL, ...JSON.parse(stored) });
    } catch { /* keep demo defaults */ }
    const sync = (event: StorageEvent) => {
      if (event.key !== KEY) return;
      try {
        setState(event.newValue ? { ...INITIAL, ...JSON.parse(event.newValue) } : INITIAL);
      } catch { /* keep current state */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function update(fn: (current: CommunityState) => CommunityState) {
    setState((current) => {
      const next = fn(current);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }
  return { state, update };
}

export function testimonialVersions(review: ExperienceReview) {
  const base = review.highlight.trim() || `My ${review.assignment} in ${review.location} gave me meaningful work and a real island community.`;
  const advice = review.advice.trim();
  return {
    short: base,
    medium: `${base}${advice ? ` My advice: ${advice}` : ""}`,
    social: `${base} I’d ${review.returnAgain ? "return for another assignment" : "recommend the experience to the right nurse"}. #WEPACare #IslandNurse`,
  };
}