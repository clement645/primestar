import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Generates a fresh random password each time the seed runs, rather than a
// fixed value baked into source control — a hardcoded seed password is
// fine for a throwaway local database, but this script is also documented
// as the first-deploy bootstrap step for a real production database, where
// a published, predictable password would be a real credential leak.
function randomPassword(): string {
  return crypto.randomBytes(12).toString("base64url");
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const GUIDE_ARTICLES: { section: string; title: string; content: string }[] = [
  // Getting Started
  {
    section: "getting-started",
    title: "How to Start Potato Farming",
    content: `Starting potato farming begins with good planning: choose suitable land, source quality seed, and plan your planting calendar around expected rainfall in your area. New farmers should start with a manageable plot to learn field practices before expanding. Consider soil type, access to water, and market access when planning your first season.\n\nKeep simple farm records from the start — what you planted, when, and what you spent — so you can review and improve each season. If you are unsure where to begin, reach out to Primestar on WhatsApp for guidance on Shangi potato seeds and general planning support.`,
  },
  {
    section: "getting-started",
    title: "Choosing Land for Potato Farming",
    content: `Potatoes generally do best in well-drained, fertile soil with good structure for tuber development. Avoid waterlogged or heavily compacted land, as poor drainage increases the risk of tuber rot and disease.\n\nConsider the field's history — land that has recently grown potatoes or related crops (like tomatoes) may carry higher disease risk, so rotating with non-related crops is a good practice. Access to water for irrigation, and proximity to markets, are also worth factoring into your land choice.`,
  },
  {
    section: "getting-started",
    title: "Choosing Quality Potato Seed",
    content: `Good seed is one of the most important decisions in potato farming. Select seed tubers that are firm, disease-free, and appropriately sized, avoiding seed with soft spots, cuts, or signs of rot.\n\nWhere possible, source seed from a supplier who can explain the seed's origin and handling. Avoid keeping seed from a diseased crop for replanting, as this can carry disease into the next season. Chat with Primestar on WhatsApp for information on Shangi potato seeds.`,
  },
  {
    section: "getting-started",
    title: "Land Preparation",
    content: `Land preparation for potatoes typically involves ploughing and harrowing to break up the soil into a fine, well-aerated seedbed. This supports even emergence and easier root and tuber development.\n\nRemove crop residues and weeds ahead of planting, and level the field where practical to support even water distribution. Preparing land early, ahead of the rains, gives you flexibility on planting dates.`,
  },
  {
    section: "getting-started",
    title: "Potato Planting Guide",
    content: `Plant seed tubers into moist, well-prepared soil at a consistent, moderate depth. Planting too shallow can expose developing tubers to sunlight (greening); planting too deep can delay emergence.\n\nUse consistent spacing (see our Potato Spacing Guide) to support uniform growth and make later field operations like weeding and earthing up easier. Avoid planting into waterlogged soil.`,
  },
  // Crop Management
  {
    section: "crop-management",
    title: "Potato Spacing Guide",
    content: `Consistent row and in-row spacing supports healthy canopy development and even tuber sizing. Spacing needs can vary based on variety, soil fertility, and equipment used for weeding and earthing up.\n\nUse our Farming Calculator to estimate planting positions for your chosen spacing and farm size — this can help you plan seed requirements before the planting season begins.`,
  },
  {
    section: "crop-management",
    title: "Fertilizer Management",
    content: `Potatoes generally require balanced nutrition, particularly around planting and early growth stages. Soil testing, where accessible, is the most reliable way to understand your field's specific needs.\n\nProduct choice and application rates vary by soil type and location, so always follow the approved product label and consider seeking advice from a qualified agricultural officer for your specific field.`,
  },
  {
    section: "crop-management",
    title: "Manure Application",
    content: `Well-decomposed farmyard manure can improve soil structure, water retention, and long-term fertility. It is best incorporated into the soil well ahead of planting to allow it to break down further.\n\nAvoid applying fresh, undecomposed manure close to planting time, as it can encourage disease and attract pests, and may not have released its nutrients yet.`,
  },
  {
    section: "crop-management",
    title: "Weed Management",
    content: `Weeds compete with potato plants for nutrients, water, and light, and can also host pests and diseases. Early weeding — particularly in the first few weeks after emergence — has the biggest impact on crop performance.\n\nCombine hand-weeding or approved herbicide use with earthing up, which helps suppress weeds between rows while also protecting developing tubers.`,
  },
  {
    section: "crop-management",
    title: "Earthing Up",
    content: `Earthing up involves mounding soil around the base of potato plants as they grow. It protects developing tubers from sunlight exposure (which causes greening), supports stronger stems, and helps with weed and water management.\n\nEarthing up is typically carried out in one or two stages as the crop develops, often alongside weeding operations.`,
  },
  {
    section: "crop-management",
    title: "Irrigation and Water Management",
    content: `Potatoes need fairly consistent soil moisture, especially during tuber initiation and bulking stages. Both drought stress and waterlogging can reduce crop performance and quality.\n\nWhere irrigation is available, aim for even, moderate watering rather than infrequent heavy watering. In rain-fed systems, plan planting dates around expected rainfall patterns for your area.`,
  },
  {
    section: "crop-management",
    title: "Crop Monitoring",
    content: `Regular field walks help you catch problems early — pests, disease symptoms, nutrient deficiencies, or water stress are often easier and cheaper to manage when spotted early.\n\nWalk your field at least weekly during the growing season, checking leaves, stems, and soil moisture. Keep simple notes of anything unusual so you can track changes over time.`,
  },
  // Pests and Diseases
  {
    section: "pests-diseases",
    title: "Common Potato Pests",
    content: `Potato crops in Kenya can be affected by pests including aphids, cutworms, and potato tuber moth, among others. Each pest affects the crop differently — some target leaves, others attack stems or tubers.\n\nRegular monitoring is the first line of defence. When treatment is needed, always follow approved product labels and consider seeking advice from a qualified agricultural extension officer.`,
  },
  {
    section: "pests-diseases",
    title: "Common Potato Diseases",
    content: `Early blight and late blight are among the most significant diseases affecting potato crops. Bacterial and viral diseases can also affect potato crops depending on seed quality and field conditions.\n\nGood seed selection, crop rotation, field sanitation, and prompt monitoring all help reduce disease pressure. Seek qualified agricultural advice for diagnosis and treatment decisions.`,
  },
  {
    section: "pests-diseases",
    title: "Early Blight",
    content: `Early blight is a fungal disease that typically appears as dark, concentric-ringed spots on lower, older leaves first, potentially spreading upward as the season progresses.\n\nField sanitation, crop rotation and monitoring are useful management practices. Where chemical control is considered, follow approved product labels and seek qualified agricultural advice for your specific situation.`,
  },
  {
    section: "pests-diseases",
    title: "Late Blight",
    content: `Late blight is a serious fungal-like disease that can spread quickly under cool, humid conditions — it is one of the reasons Primestar's weather tools flag "late blight risk" conditions for registered farmers.\n\nWatch for dark, water-soaked lesions on leaves and stems, especially after periods of high humidity. Prompt field inspection during risk periods is important. Follow approved product labels for any treatment and seek qualified agricultural advice.`,
  },
  {
    section: "pests-diseases",
    title: "Aphids",
    content: `Aphids are small sap-sucking insects that can affect potato plant vigour and may also spread certain viral diseases between plants.\n\nRegular monitoring, especially on the underside of leaves, helps catch infestations early. Natural predators can help manage low-level populations; for larger infestations, follow approved product labels or seek qualified agricultural advice.`,
  },
  {
    section: "pests-diseases",
    title: "Cutworms",
    content: `Cutworms are caterpillars that feed on young plant stems, often at or just below soil level, and can cause significant damage to seedlings.\n\nField sanitation and early monitoring — particularly around emergence — help catch infestations before major damage occurs. Seek qualified agricultural advice for management options appropriate to your area.`,
  },
  {
    section: "pests-diseases",
    title: "Potato Tuber Moth",
    content: `Potato tuber moth larvae can damage both foliage and stored tubers, making field monitoring and good storage hygiene both important for management.\n\nEarthing up to keep tubers well covered with soil, and careful, clean storage practices, both help reduce risk. Seek qualified agricultural advice for significant infestations.`,
  },
  {
    section: "pests-diseases",
    title: "How to Identify Potato Field Problems",
    content: `Not every problem in a potato field is a pest or disease — nutrient deficiencies, water stress, and weather damage can all produce symptoms that look similar at first glance.\n\nLook closely at where symptoms appear (old vs. new leaves, isolated plants vs. whole rows), and consider recent weather and field history. When in doubt, a qualified agricultural officer can help with accurate diagnosis.`,
  },
  {
    section: "pests-diseases",
    title: "Integrated Pest Management",
    content: `Integrated Pest Management (IPM) combines multiple strategies — good seed, crop rotation, field monitoring, natural predators, and targeted chemical use only when needed — rather than relying on any single method.\n\nThis approach can reduce costs and input use over time while helping manage resistance. Always follow approved product labels and seek qualified agricultural advice when planning your pest and disease management strategy.`,
  },
  // Harvest and Post-Harvest
  {
    section: "harvest-post-harvest",
    title: "When to Harvest Potatoes",
    content: `Potatoes are generally ready for harvest once the haulms (above-ground foliage) begin to yellow and die back, which signals the tubers have reached maturity.\n\nHarvesting too early can reduce yield and skin set (making tubers more prone to damage); harvesting too late can increase exposure to pests, disease, and weather damage. Field conditions and variety can affect timing — monitor your crop closely as it approaches maturity.`,
  },
  {
    section: "harvest-post-harvest",
    title: "How to Harvest Potatoes",
    content: `Harvest during dry conditions where possible, as wet soil makes lifting harder and increases the risk of tuber damage and disease. Lift tubers carefully to minimise cuts and bruising, which can shorten storage life.\n\nAllow harvested tubers to dry briefly in shade (not direct sun) before handling and transport, and avoid dropping or throwing tubers during collection.`,
  },
  {
    section: "harvest-post-harvest",
    title: "Potato Sorting",
    content: `Sorting after harvest separates good-quality tubers from damaged, diseased, or undersized ones. This protects storage quality by keeping problem tubers from affecting the rest of the batch.\n\nSort by size and quality, setting aside damaged or diseased tubers for immediate use or disposal rather than storage.`,
  },
  {
    section: "harvest-post-harvest",
    title: "Potato Storage",
    content: `Store potatoes in a cool, dark, well-ventilated space to slow sprouting and reduce spoilage. Light exposure during storage can cause greening, which affects quality.\n\nAvoid storing damaged or diseased tubers alongside healthy ones, and check stored potatoes periodically for early signs of rot or sprouting.`,
  },
  {
    section: "harvest-post-harvest",
    title: "Reducing Post-Harvest Losses",
    content: `Post-harvest losses often come from rough handling, poor sorting, and inadequate storage conditions. Careful harvesting, prompt sorting, and appropriate storage all help reduce losses between the field and the market.\n\nPlanning your harvest and sale timing around market demand can also help reduce the time potatoes spend in storage.`,
  },
  {
    section: "harvest-post-harvest",
    title: "Preparing Potatoes for Market",
    content: `Clean, well-sorted, and appropriately packaged potatoes are generally easier to sell and can support better buyer relationships. Remove excess soil and debris, and grade tubers by size and quality where practical.\n\nMarket prices vary by season and location, so it's worth checking current buyer demand before harvest. Chat with Primestar on WhatsApp if you have questions about preparing your harvest.`,
  },
];

const BLOG_POSTS: {
  title: string;
  category: string;
  excerpt: string;
  content: string;
}[] = [
  {
    title: "5 Tips for a Successful Potato Planting Season",
    category: "Potato Farming",
    excerpt:
      "Simple, practical steps to set your potato crop up for a good start this season.",
    content: `Getting the basics right at planting time makes the rest of the season easier to manage. Here are five practical tips:\n\n1. Start with quality seed — avoid diseased or damaged tubers.\n2. Prepare land early so you are not rushed when the rains begin.\n3. Use consistent spacing to support even growth.\n4. Plan your weeding and earthing up schedule in advance.\n5. Keep simple records so you can review what worked each season.\n\nIf you have questions about Shangi potato seeds, chat with Primestar on WhatsApp any time.`,
  },
  {
    title: "Understanding Shangi Potato Seeds",
    category: "Seeds",
    excerpt: "A closer look at the Shangi variety grown by many Kenyan farmers.",
    content: `Shangi is a potato variety widely grown among Kenyan farmers. Like any variety, getting the best results starts with good seed quality and appropriate field management.\n\nVisit our dedicated Shangi Potato Seeds page for a full guide covering seed selection through to storage, or chat with Primestar on WhatsApp for more information.`,
  },
  {
    title: "Why Earthing Up Matters More Than You Think",
    category: "Crop Management",
    excerpt: "A simple field practice with an outsized impact on tuber quality.",
    content: `Earthing up is one of those practices that's easy to delay — but doing it on time protects developing tubers from sunlight exposure and supports stronger plants.\n\nPlan your earthing up alongside your weeding schedule so the two operations reinforce each other rather than competing for your time.`,
  },
  {
    title: "Spotting Late Blight Early",
    category: "Pest & Disease",
    excerpt: "What to look for during cool, humid weather.",
    content: `Late blight tends to develop quickly under cool, humid conditions. Watch for dark, water-soaked patches on leaves and stems, particularly after periods of high humidity or fog.\n\nRegular field walks during risk periods give you the best chance of catching problems early. Registered farmers on Primestar's platform can also check personalised weather alerts that flag potential late blight risk conditions.`,
  },
  {
    title: "Getting Harvest Timing Right",
    category: "Harvesting",
    excerpt: "How to tell when your potato crop is ready to lift.",
    content: `Watching your crop's haulms (foliage) is one of the simplest ways to judge harvest timing — as they yellow and die back, tubers are typically approaching maturity.\n\nHarvesting at the right time, in dry conditions where possible, helps protect both yield and storage quality.`,
  },
  {
    title: "Simple Record-Keeping for Small-Scale Farmers",
    category: "Farmer Tips",
    excerpt: "Why a basic farm notebook pays off season after season.",
    content: `You don't need complicated software to benefit from record-keeping — a simple notebook tracking what you planted, when, input costs, and what you observed in the field can help you make better decisions next season.\n\nOver time, these records help you spot patterns — like which practices led to a better-looking crop — that are easy to forget otherwise.`,
  },
];

// A general potato crop-care calendar (planting -> harvest), used to build
// each farmer's forward-looking timeline as well as due-notification
// reminders. Timing is general guidance, not a guarantee — variety,
// climate, and field conditions all shift these windows. Rules are
// intentionally stored in the database (admin-configurable) rather than
// hardcoded into UI, per section 64.
const CROP_STAGE_RULES = [
  {
    name: "Emergence Check",
    description: "Confirm even seedling emergence across the field.",
    daysAfterPlanting: 10,
    priority: 2,
    notificationMessage:
      "Your potatoes should be emerging around now. Walk your field to check for even emergence and fill in any obvious gaps.",
  },
  {
    name: "Early Crop Establishment & First Weeding",
    description: "First weeding window while plants are still small.",
    daysAfterPlanting: 18,
    priority: 3,
    notificationMessage:
      "This is a good time for your first weeding — young potato plants compete poorly with weeds for nutrients and water.",
  },
  {
    name: "First Earthing Up",
    description: "First earthing up, typically 3-4 weeks after planting.",
    daysAfterPlanting: 25,
    priority: 4,
    notificationMessage:
      "Your crop is around 3-4 weeks old — a good time for the first earthing up to protect developing tubers from light and support stronger stems.",
  },
  {
    name: "Preventive Fungicide Application Window",
    description: "General window many farmers consider a preventive fungicide spray.",
    daysAfterPlanting: 35,
    priority: 3,
    notificationMessage:
      "Many farmers consider a preventive fungicide application around this stage, especially in humid weather. Check your weather alerts for late blight risk, follow the approved product label, and consult a qualified agricultural officer for your situation.",
  },
  {
    name: "Second Earthing Up",
    description: "Second earthing up pass as the canopy fills in.",
    daysAfterPlanting: 42,
    priority: 3,
    notificationMessage:
      "Consider a second earthing up now, along with any remaining weeding, before the canopy closes and field access gets harder.",
  },
  {
    name: "Mid-Season Pest & Disease Monitoring",
    description: "Canopy closure can hide early symptoms.",
    daysAfterPlanting: 55,
    priority: 3,
    notificationMessage:
      "Canopy closure can hide early pest and disease symptoms — inspect your crop closely this week, especially the lower, older leaves.",
  },
  {
    name: "Second Fungicide / Disease Management Window",
    description: "Higher blight risk window during peak canopy growth.",
    daysAfterPlanting: 65,
    priority: 3,
    notificationMessage:
      "This stage often carries higher late blight pressure. Review current weather alerts, and if disease pressure is high, follow approved product labels and seek qualified agricultural advice on a follow-up fungicide application.",
  },
  {
    name: "Pre-Harvest Monitoring",
    description: "Watch for haulm die-back as the crop approaches maturity.",
    daysAfterPlanting: 80,
    priority: 2,
    notificationMessage:
      "Start watching for haulm (foliage) die-back — this is one of the signs your crop is approaching maturity.",
  },
  {
    name: "Harvest Preparation",
    description: "Begin planning harvest logistics.",
    daysAfterPlanting: 95,
    priority: 4,
    notificationMessage:
      "Your crop may be approaching maturity. Start planning your harvest labour, storage space, and market arrangements.",
  },
];

async function main() {
  console.log("Seeding Primestar database...");

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  await prisma.calculatorSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  await prisma.weatherAlertRuleConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // --- Admin ---
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@primestar.demo" } });
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email} (password left unchanged)`);
  } else {
    const adminPassword = randomPassword();
    const admin = await prisma.user.create({
      data: {
        name: "Primestar Admin",
        email: "admin@primestar.demo",
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: Role.ADMIN,
      },
    });
    console.log(`Admin created: ${admin.email} / ${adminPassword} — SAVE THIS NOW, it is only shown once.`);
  }

  // --- Demo workers ---
  const demoWorkers = [
    { name: "John Kamau", email: "john.kamau@primestar.demo", code: "JOHN01" },
    { name: "Mary Wanjiku", email: "mary.wanjiku@primestar.demo", code: "MARY02" },
    { name: "Peter Mwangi", email: "peter.mwangi@primestar.demo", code: "PETER03" },
  ];

  for (const w of demoWorkers) {
    const existing = await prisma.user.findUnique({ where: { email: w.email } });
    let user = existing;

    if (!existing) {
      const password = randomPassword();
      user = await prisma.user.create({
        data: {
          name: w.name,
          email: w.email,
          passwordHash: await bcrypt.hash(password, 10),
          role: Role.WORKER,
        },
      });
      console.log(`Demo worker created: ${w.name} — ${w.code} / login ${w.email} / ${password} — SAVE THIS NOW, it is only shown once.`);
    } else {
      console.log(`Demo worker already exists: ${w.name} — ${w.code} (password left unchanged)`);
    }

    await prisma.worker.upsert({
      where: { userId: user!.id },
      update: {},
      create: { userId: user!.id, referralCode: w.code },
    });
  }

  // --- Guide articles ---
  for (const [i, article] of GUIDE_ARTICLES.entries()) {
    const slug = slugify(article.title);
    await prisma.guideArticle.upsert({
      where: { slug },
      update: {},
      create: {
        title: article.title,
        slug,
        section: article.section,
        content: article.content,
        excerpt: article.content.split("\n")[0].slice(0, 160),
        readingMinutes: readingMinutes(article.content),
        orderIndex: i,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded ${GUIDE_ARTICLES.length} farming guide articles.`);

  // --- Blog posts ---
  for (const post of BLOG_POSTS) {
    const slug = slugify(post.title);
    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        title: post.title,
        slug,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        readingMinutes: readingMinutes(post.content),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded ${BLOG_POSTS.length} blog posts.`);

  // --- Crop stage rules ---
  for (const rule of CROP_STAGE_RULES) {
    const existing = await prisma.cropStageRule.findFirst({ where: { name: rule.name } });
    if (!existing) {
      await prisma.cropStageRule.create({ data: rule });
    }
  }
  console.log(`Seeded ${CROP_STAGE_RULES.length} crop-stage reminder rules.`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
