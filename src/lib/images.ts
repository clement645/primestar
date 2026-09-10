// Stock farm/potato photography used for visual identity across the site
// (royalty-free, Unsplash License — free for commercial use, no
// attribution required). These are generic agricultural imagery for mood
// and are never captioned as depicting Primestar's own premises.

function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${width}&auto=format&fit=crop`;
}

export const IMAGES = {
  heroFarmField: unsplash("photo-1586249149466-ab4d39822001", 2000), // green Kenyan farmland
  potatoFieldRows: unsplash("photo-1741003188234-1d031351168c", 2000), // rows of potato plants
  handsWithPotatoes: unsplash("photo-1561635741-c416a5193b6e", 1400), // freshly harvested potatoes in hand
  freshPotatoesPile: unsplash("photo-1675501344642-92d35d90fe51", 1600), // dug potatoes with soil
  aerialGreenField: unsplash("photo-1714588419516-8c266d291dc7", 2000), // aerial farmland with dirt road
} as const;
