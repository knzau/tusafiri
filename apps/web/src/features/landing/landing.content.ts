export const landingContent = {
  introLabel: 'Map-first trip planner',
  headline: 'Plan a trip on a map. Share it as one page.',
  description: 'Collect places, shape them into days, and send friends a single link.',
  demoAction: 'Open the demo trip',
  demoNote: 'No account needed',
  signIn: 'Sign in with Google',
  tripsAction: 'Your trips',
  productName: 'Tusafiri',
  tripName: 'Lisbon',
  tripMeta: '3 days · 2 travelers · ≈ €75 each',
  tripLink: 'See the whole trip',
  demoTag: 'Demo trip',
} as const;

export const howItWorks = [
  { number: '01', label: 'Collect places from anywhere' },
  { number: '02', label: 'Shape them into days' },
  { number: '03', label: 'Share one page' },
] as const;

export const daySummary = [
  { day: 1, label: '3 stops', dot: '/landing/dot-day-1.svg' },
  { day: 2, label: '2 stops', dot: '/landing/dot-day-2.svg' },
  { day: 3, label: '1 stop', dot: '/landing/dot-day-3.svg' },
] as const;

export const numberedPins = [
  { id: 'day-1-stop-1', day: 1, label: '1', left: 464, top: 138 },
  { id: 'day-1-stop-2', day: 1, label: '2', left: 512, top: 74 },
  { id: 'day-1-stop-3', day: 1, label: '3', left: 536, top: 210 },
  { id: 'day-2-stop-1', day: 2, label: '1', left: 296, top: 282 },
  { id: 'day-2-stop-2', day: 2, label: '2', left: 200, top: 314 },
  { id: 'day-3-stop-1', day: 3, label: '1', left: 40, top: 282 },
] as const;

export const ideaPins = [
  { id: 'idea-alfama', left: 121, top: 315 },
  { id: 'idea-belem', left: 9, top: 331 },
] as const;
