// Real photos from Primestar's own farm and store (added to /public),
// used for visual identity across the site. These are Primestar's actual
// premises, seed stock and branded gear — not stock photography.

export const IMAGES = {
  heroFarmField: "/potatoesonfarm.jpeg", // rows of potato plants on the farm
  potatoFieldRows: "/potatoesonfarm2.jpeg", // potato rows with farm buildings in the background
  seedlingCloseup: "/potatocrop.jpeg", // young potato seedling emerging from the soil
  handsWithPotatoes: "/potatologo.jpeg", // inspecting a seed potato's eyes/sprouts
  freshPotatoesPile: "/potatoseeds1.jpeg", // sprouted seed potatoes ready for planting
  seedPotatoesGrass: "/potatoseeds2.jpeg", // seed potatoes with visible sprouts
  seedSortingScale: "/potatoseeds3.jpeg", // seed potatoes laid out for sorting/chitting
  storeBags: "/potatoseedsatstore.jpeg", // bagged seed at the Primestar store
  teamBranding: "/primestar-team-reflector.jpeg", // Primestar-branded field gear
  logo: "/primestar-logo.png", // cropped wordmark from the branded gear
} as const;

const SECTION_IMAGES: Record<string, string> = {
  "getting-started": IMAGES.seedlingCloseup,
  "crop-management": IMAGES.potatoFieldRows,
  "pests-diseases": IMAGES.seedlingCloseup,
  "harvest-post-harvest": IMAGES.freshPotatoesPile,
};

/** Fallback featured image for a Farming Guide article, by section. */
export function getSectionImage(section: string): string {
  return SECTION_IMAGES[section] ?? IMAGES.heroFarmField;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "Potato Farming": IMAGES.heroFarmField,
  Seeds: IMAGES.freshPotatoesPile,
  "Crop Management": IMAGES.potatoFieldRows,
  "Pest & Disease": IMAGES.seedlingCloseup,
  Harvesting: IMAGES.seedSortingScale,
  "Farmer Tips": IMAGES.handsWithPotatoes,
  "Market Information": IMAGES.storeBags,
};

/** Fallback featured image for a blog post, by category. */
export function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] ?? IMAGES.heroFarmField;
}
