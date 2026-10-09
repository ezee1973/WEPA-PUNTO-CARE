/**
 * Real Puerto Rico hospitals for the nurse gig search. Hospital names, towns and photos are real;
 * every gig, pay figure, start date and package below is fictional demo data.
 * Photos: hospital websites or Wikimedia Commons (credited in `photoCredit`).
 */
const IMGS = import.meta.glob<{ url: string }>("../assets/hospitals/*.asset.json", { eager: true, import: "default" });
const img = (k: string) => IMGS[`../assets/hospitals/${k}.jpg.asset.json`]?.url ?? "";

export type PRHospital = {
  id: string; name: string; town: string; region: string; beds?: number;
  pitch: string; area: string; areaHighlights: string[]; image: string; photoCredit: string;
};

const W = "Wikimedia Commons";
export const PR_HOSPITALS: PRHospital[] = [
  { id: "auxilio", name: "Hospital Auxilio Mutuo", town: "San Juan (Hato Rey)", region: "San Juan metro", beds: 600, image: img("auxilio-mutuo"), photoCredit: `${W} · CC BY-SA 3.0`,
    pitch: "“El Gran Hospital de Puerto Rico” — a 140-year-old tertiary center with transplant, oncology and cardiac programs.", area: "Live minutes from Old San Juan's blue cobblestones and Condado's beaches.", areaHighlights: ["Old San Juan", "Condado beach", "Santurce food scene"] },
  { id: "pavia", name: "Hospital Pavia Santurce", town: "San Juan (Santurce)", region: "San Juan metro", image: img("pavia-santurce"), photoCredit: "hospitalpaviapr.com",
    pitch: "One of the island's most complete cardiovascular centers and the first in PR certified for TAVI.", area: "Santurce is street art, La Placita nights and a 10-minute ride to Ocean Park.", areaHighlights: ["La Placita", "Ocean Park", "Calle Cerra murals"] },
  { id: "ashford", name: "Ashford Presbyterian Community Hospital", town: "San Juan (Condado)", region: "San Juan metro", image: img("ashford"), photoCredit: `${W} · Public domain (historic postcard)`,
    pitch: "A Condado landmark since 1904, caring for San Juan from steps off the beach.", area: "Walk to the Condado lagoon, paddleboard at sunrise, dinner on Ashford Avenue.", areaHighlights: ["Condado Lagoon", "Ashford Avenue", "Paddleboarding"] },
  { id: "professional", name: "Professional Hospital Guaynabo", town: "Guaynabo", region: "San Juan metro", image: img("professional-guaynabo"), photoCredit: `${W} · CC BY-SA 4.0`,
    pitch: "A modern surgical and specialty hospital in the metro's calm hills.", area: "Quiet suburb living with San Juan's beaches and nightlife 15 minutes away.", areaHighlights: ["Metro convenience", "Hillside views", "Easy airport access"] },
  { id: "ruiz-arnau", name: "Hospital Universitario Dr. Ramón Ruiz Arnau", town: "Bayamón", region: "San Juan metro", image: img("ruiz-arnau"), photoCredit: `${W} · CC BY-SA 4.0`,
    pitch: "A university teaching hospital serving one of PR's largest cities.", area: "Bayamón's chicharrón trail, Parque de las Ciencias and the metro's west side.", areaHighlights: ["Teaching hospital", "Chicharrón trail", "Science park"] },
  { id: "doctors-manati", name: "Doctors' Center Hospital Manatí", town: "Manatí", region: "North coast", image: img("doctors-manati"), photoCredit: "doctorscenterhospital.com",
    pitch: "Flagship of the Doctors' Center network, a high-volume north-coast referral hospital.", area: "Mar Chiquita's hidden cove and the Atlantic-facing beaches of the north coast.", areaHighlights: ["Mar Chiquita", "Los Tubos beach", "Karst caves"] },
  { id: "menonita-caguas", name: "Hospital Menonita Caguas", town: "Caguas", region: "Central east", beds: 240, image: img("menonita-caguas"), photoCredit: "sistemamenonita.com",
    pitch: "240 beds with NICU, pediatric ICU and family-centered LDR suites.", area: "The 'Criollo Valley' — botanical gardens, mountain lechoneras and El Yunque within reach.", areaHighlights: ["Botanical garden", "Ruta del Lechón", "El Yunque day trips"] },
  { id: "ryder", name: "Ryder Memorial Hospital", town: "Humacao", region: "East coast", image: img("ryder"), photoCredit: `${W} · Public domain (U.S. Navy)`,
    pitch: "A nonprofit community hospital serving the east coast since 1914.", area: "Palmas del Mar marina, Humacao nature reserve and ferries toward Vieques.", areaHighlights: ["Palmas del Mar", "Nature reserve", "East-coast beaches"] },
  { id: "vieques", name: "Susana Centeno Family Health Center", town: "Vieques", region: "Vieques & Culebra", image: img("vieques"), photoCredit: `${W} · CC BY-SA 4.0`,
    pitch: "The island municipality's only health center — small team, huge impact.", area: "Wild horses, empty beaches and the brightest bioluminescent bay on Earth.", areaHighlights: ["Mosquito Bay", "Wild horses", "Sun Bay"] },
  { id: "damas", name: "Hospital Damas", town: "Ponce", region: "Ponce & the south", beds: 331, image: img("hospital-damas"), photoCredit: `${W} · CC BY-SA 2.0`,
    pitch: "A 331-bed teaching hospital founded in 1863 — one of the oldest on the island.", area: "Ponce, 'La Perla del Sur': firehouse museum, La Guancha boardwalk and Caja de Muertos.", areaHighlights: ["La Guancha", "Parque de Bombas", "Caja de Muertos"] },
  { id: "san-lucas", name: "Centro Médico Episcopal San Lucas", town: "Ponce", region: "Ponce & the south", image: img("san-lucas-ponce"), photoCredit: `${W} · CC BY-SA 2.0`,
    pitch: "Southern Puerto Rico's tertiary referral center with trauma and cardiac care.", area: "Warm, dry Caribbean coast with Hacienda Buena Vista coffee tours above the city.", areaHighlights: ["Coffee haciendas", "Southern sun", "Museo de Arte de Ponce"] },
  { id: "san-lucas-metro", name: "Hospital Episcopal San Lucas Metro", town: "Guaynabo", region: "San Juan metro", image: img("san-lucas-metro"), photoCredit: "sanlucaspr.org",
    pitch: "The San Lucas system's metro campus, with surgical and specialty programs.", area: "Metro living with quick hops to Old San Juan and Piñones.", areaHighlights: ["Piñones kiosks", "Old San Juan", "Metro dining"] },
  { id: "dr-pila", name: "Hospital Metropolitano Dr. Pila", town: "Ponce", region: "Ponce & the south", image: img("dr-pila"), photoCredit: `${W} · CC BY-SA 2.0`,
    pitch: "A long-standing Ponce community hospital on Avenida Las Américas.", area: "Easy access to Ponce's historic plaza and the beaches of Guánica.", areaHighlights: ["Plaza Las Delicias", "Guánica dry forest", "Gilligan's Island"] },
  { id: "san-cristobal", name: "Hospital San Cristóbal", town: "Ponce (Coto Laurel)", region: "Ponce & the south", image: img("san-cristobal"), photoCredit: `${W} · CC BY-SA 2.0`,
    pitch: "A growing hospital on Ponce's east side, close to the mountain towns.", area: "Gateway to Jayuya's mountains and the southern Ruta Panorámica.", areaHighlights: ["Ruta Panorámica", "Mountain towns", "Toro Negro forest"] },
  { id: "tito-mattei", name: "Hospital Dr. Tito Mattei", town: "Yauco", region: "Southwest", image: img("tito-mattei"), photoCredit: `${W} · CC BY-SA 3.0`,
    pitch: "Serving Yauco, the 'Coffee Town', and the southwest corridor.", area: "Colorful Yauco murals, coffee farms and Guánica's turquoise cays.", areaHighlights: ["Yauco coffee", "Yaucromatic murals", "Guánica cays"] },
  { id: "metro-cabo-rojo", name: "Hospital Metropolitano de Cabo Rojo", town: "Cabo Rojo", region: "West coast", image: img("metro-cabo-rojo"), photoCredit: `${W} · CC BY-SA 3.0`,
    pitch: "A friendly community hospital at the island's sunset corner.", area: "Playa Buyé, Boquerón seafood and the cliffs of Los Morrillos lighthouse.", areaHighlights: ["Playa Buyé", "Boquerón", "Los Morrillos"] },
  { id: "concepcion", name: "Hospital de la Concepción", town: "San Germán", region: "West coast", image: img("concepcion"), photoCredit: "hospitaldelaconcepcion.com",
    pitch: "The oldest hospital in Puerto Rico — five centuries of care, with a modern campus.", area: "San Germán's colonial plazas, cool hills and west-coast beaches 20 minutes away.", areaHighlights: ["Colonial San Germán", "Lajas valley", "La Parguera bio-bay"] },
  { id: "bella-vista", name: "Hospital Bella Vista", town: "Mayagüez", region: "West coast", image: img("bella-vista"), photoCredit: "bvhpr.org",
    pitch: "Joint Commission accredited, with da Vinci robotic surgery and PET-CT.", area: "Hilltop views over Mayagüez bay, Rincón surf and Desecheo diving nearby.", areaHighlights: ["Rincón surf", "Mayagüez bay", "Desecheo diving"] },
  { id: "buen-samaritano", name: "Hospital Buen Samaritano", town: "Aguadilla", region: "West coast", image: img("buen-samaritano"), photoCredit: "hbspr.org",
    pitch: "Northwest Puerto Rico's community hospital, serving Aguadilla and Isabela.", area: "Crash Boat beach, Isabela's surf breaks and Gozalandia waterfalls.", areaHighlights: ["Crash Boat", "Jobos surf", "Gozalandia falls"] },
  { id: "castaner", name: "Hospital General Castañer", town: "Lares / Castañer", region: "Central mountains", image: img("castaner"), photoCredit: `${W} · Public domain`,
    pitch: "A rural mountain hospital that is the lifeline for coffee country communities.", area: "Misty coffee haciendas, river pools and the quietest nights on the island.", areaHighlights: ["Coffee country", "River pools", "Mountain stillness"] },
];

export type PRGig = {
  id: string; hospitalId: string; title: string; specialty: string; pay: number; duration: number; shift: string; start: string;
  match: number; description: string; benefits: string[]; service?: boolean; serviceFocus?: string;
};

export const PR_GIGS: PRGig[] = [
  { id: "auxilio-icu", hospitalId: "auxilio", title: "Transplant ICU in the capital", specialty: "ICU / Critical Care", pay: 1850, duration: 13, shift: "3 × 12 nights", start: "Nov 17", match: 94, description: "High-acuity transplant and cardiac ICU work, then sunset walks on the Paseo de la Princesa.", benefits: ["Condado apartment", "Round-trip flight", "Old San Juan food tour"] },
  { id: "pavia-cvicu", hospitalId: "pavia", title: "Cardiac step-down in Santurce", specialty: "ICU / Critical Care", pay: 1780, duration: 8, shift: "3 × 12 days", start: "Dec 1", match: 90, description: "Join one of the island's busiest cardiac programs and live in its most creative neighborhood.", benefits: ["Ocean Park studio", "Bike + beach gear", "Salsa class pass"] },
  { id: "ashford-er", hospitalId: "ashford", title: "ER steps from Condado beach", specialty: "Emergency Room", pay: 1820, duration: 13, shift: "3 × 12 rotating", start: "Nov 24", match: 88, description: "A busy urban ER with a beach on the other side of the street.", benefits: ["Walk-to-work condo", "Paddleboard rental", "Airport pickup"] },
  { id: "professional-or", hospitalId: "professional", title: "OR nurse, metro hills", specialty: "Operating Room", pay: 1760, duration: 8, shift: "4 × 10 days", start: "Jan 5", match: 79, description: "A modern surgical suite with weekends free for the coast.", benefits: ["Furnished townhouse", "Car rental", "El Yunque hike"] },
  { id: "ruizarnau-medsurg", hospitalId: "ruiz-arnau", title: "Teaching-hospital Med-Surg", specialty: "Med-Surg", pay: 1650, duration: 13, shift: "3 × 12 days", start: "Dec 8", match: 82, description: "Precept residents' patients and learn island medicine from the inside.", benefits: ["Bayamón apartment", "Flight + car", "Lechonera Sundays"] },
  { id: "doctors-er", hospitalId: "doctors-manati", title: "North-coast ER, Atlantic views", specialty: "Emergency Room", pay: 1700, duration: 13, shift: "3 × 12 nights", start: "Nov 17", match: 91, description: "High-volume emergency care with Mar Chiquita on your days off.", benefits: ["Beach house share", "Car + gas card", "Cave tour"] },
  { id: "menonita-nicu", hospitalId: "menonita-caguas", title: "NICU in the Criollo Valley", specialty: "NICU", pay: 1720, duration: 13, shift: "3 × 12 days", start: "Jan 12", match: 87, description: "Family-centered neonatal care in a modern 240-bed hospital.", benefits: ["Mountain-view casita", "Childcare credit", "El Yunque weekend"] },
  { id: "ryder-tele", hospitalId: "ryder", title: "Telemetry on the east coast", specialty: "Telemetry", pay: 1600, duration: 8, shift: "3 × 12 days", start: "Dec 1", match: 80, description: "A tight-knit community hospital near Palmas del Mar's marina.", benefits: ["Marina condo", "Snorkel trip", "Kayak rental"] },
  { id: "vieques-er", hospitalId: "vieques", title: "Island ER on Vieques", specialty: "Emergency Room", pay: 1650, duration: 4, shift: "7 on / 7 off", start: "Dec 15", match: 86, description: "Small-team emergency care on an island with no traffic lights and a glowing bay.", benefits: ["Beach cottage", "Ferry + flights", "Bio-bay kayak night"] },
  { id: "damas-ld", hospitalId: "damas", title: "Labor & Delivery in La Perla del Sur", specialty: "Labor & Delivery", pay: 1680, duration: 13, shift: "3 × 12 rotating", start: "Nov 24", match: 85, description: "Deliver in a historic teaching hospital, then catch the La Guancha breeze.", benefits: ["Historic-district loft", "Caja de Muertos boat day", "Car"] },
  { id: "sanlucas-trauma", hospitalId: "san-lucas", title: "Southern trauma ICU", specialty: "ICU / Critical Care", pay: 1790, duration: 13, shift: "3 × 12 nights", start: "Dec 8", match: 92, description: "Southern PR's referral center for trauma and cardiac care.", benefits: ["Hacienda coffee tour", "Furnished apartment", "Flight + car"] },
  { id: "sanlucasmetro-onc", hospitalId: "san-lucas-metro", title: "Oncology infusion, metro", specialty: "Oncology", pay: 1640, duration: 8, shift: "4 × 10 days", start: "Jan 5", match: 76, description: "Weekday schedule, long weekends to explore.", benefits: ["Studio apartment", "Piñones bike tour", "Gym pass"] },
  { id: "pila-medsurg", hospitalId: "dr-pila", title: "Med-Surg near Ponce plaza", specialty: "Med-Surg", pay: 1580, duration: 8, shift: "3 × 12 days", start: "Dec 1", match: 78, description: "A friendly community floor with Guánica beaches 30 minutes west.", benefits: ["Casa near the plaza", "Car", "Gilligan's Island ferry"] },
  { id: "sancristobal-er", hospitalId: "san-cristobal", title: "ER at the foot of the mountains", specialty: "Emergency Room", pay: 1620, duration: 13, shift: "3 × 12 rotating", start: "Jan 19", match: 83, description: "Emergency care on Ponce's east side with the Ruta Panorámica above you.", benefits: ["Mountain cabin", "Jeep rental", "Toro Negro hike"] },
  { id: "titomattei-medsurg", hospitalId: "tito-mattei", title: "Coffee Town Med-Surg", specialty: "Med-Surg", pay: 1550, duration: 8, shift: "3 × 12 days", start: "Dec 8", match: 74, description: "Small-town nursing in the heart of Puerto Rico's coffee country.", benefits: ["Coffee-farm stay", "Car", "Guánica cay boat"] },
  { id: "cabo-rojo-er", hospitalId: "metro-cabo-rojo", title: "Sunset-corner ER", specialty: "Emergency Room", pay: 1600, duration: 13, shift: "3 × 12 nights", start: "Nov 24", match: 84, description: "Community emergency care, Playa Buyé every morning after nights.", benefits: ["Boquerón beach apartment", "Snorkel gear", "Seafood passport"] },
  { id: "concepcion-ped", hospitalId: "concepcion", title: "Pediatrics at PR's oldest hospital", specialty: "Pediatrics", pay: 1600, duration: 13, shift: "3 × 12 days", start: "Jan 5", match: 81, description: "Care for families in historic San Germán on a palm-lined modern campus.", benefits: ["Colonial casa", "La Parguera bio-bay", "Car"] },
  { id: "bellavista-or", hospitalId: "bella-vista", title: "Robotic OR above Mayagüez bay", specialty: "Operating Room", pay: 1700, duration: 8, shift: "4 × 10 days", start: "Dec 15", match: 80, description: "da Vinci robotic surgery by day, Rincón surf at golden hour.", benefits: ["Rincón surf shack", "Surf lessons", "Car"] },
  { id: "buensam-tele", hospitalId: "buen-samaritano", title: "Telemetry on the surf coast", specialty: "Telemetry", pay: 1580, duration: 13, shift: "3 × 12 nights", start: "Dec 1", match: 82, description: "Northwest community care with Crash Boat and Jobos within minutes.", benefits: ["Isabela beach studio", "Board rental", "Gozalandia trip"] },
  { id: "castaner-er", hospitalId: "castaner", title: "Rural mountain ER", specialty: "Emergency Room", pay: 1500, duration: 8, shift: "3 × 12 rotating", start: "Jan 12", match: 77, description: "Be the difference for coffee-country families in a mountain hospital.", benefits: ["Hacienda guesthouse", "4×4 rental", "River pool days"] },
  // Small service subset: unpaid, community-focused. Faith-based or secular.
  { id: "castaner-service", hospitalId: "castaner", title: "Mountain community health weeks", specialty: "Community Health", pay: 0, duration: 2, shift: "Mobile clinics, 5 days/wk", start: "Feb 2", match: 88, service: true, serviceFocus: "Rural outreach · faith-based partner welcome",
    description: "Join mobile clinics visiting coffee-country barrios: blood-pressure screenings, diabetes teaching and home visits with local promotoras.", benefits: ["Host-family or hacienda stay", "Meals with the community", "Ground transport"] },
  { id: "vieques-service", hospitalId: "vieques", title: "Island health teaching rotation", specialty: "Community Health", pay: 0, duration: 2, shift: "Clinic + schools, 4 days/wk", start: "Mar 2", match: 84, service: true, serviceFocus: "Knowledge exchange · secular",
    description: "Bring skills back to an underserved island: CPR classes in schools, chronic-care teaching and support for the local health team.", benefits: ["Shared guesthouse", "Ferry covered", "One bio-bay night"] },
];
