import "dotenv/config";
import { db as prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');

  // 1. Create categories
  const catInternational = await prisma.category.upsert({
    where: { name: 'International' },
    update: {},
    create: { name: 'International' },
  });

  const catNational = await prisma.category.upsert({
    where: { name: 'National' },
    update: {},
    create: { name: 'National' },
  });

  const catProvincial = await prisma.category.upsert({
    where: { name: 'Provincial' },
    update: {},
    create: { name: 'Provincial' },
  });

  const catDistrict = await prisma.category.upsert({
    where: { name: 'District' },
    update: {},
    create: { name: 'District' },
  });

  // 2. Create writers/users
  const defaultPassword = await bcrypt.hash('password123', 10);

  const author1 = await prisma.user.upsert({
    where: { email: 'author1@slnews.local' },
    update: {},
    create: {
      email: 'author1@slnews.local',
      name: 'Aminata Conteh',
      password: defaultPassword,
      role: 'WRITER',
    },
  });

  const author2 = await prisma.user.upsert({
    where: { email: 'editorial@slnews.local' },
    update: {},
    create: {
      email: 'editorial@slnews.local',
      name: 'SLNews Editorial',
      password: defaultPassword,
      role: 'EDITOR',
    },
  });

  // 3. Create articles
  const article1 = await prisma.article.create({
    data: {
      title: "Global Summit Addresses Climate Action in Developing Nations",
      summary: "World leaders gathered to discuss new funding mechanisms for climate resilience in West Africa.",
      content: "Full article content goes here. The summit focused heavily on how developing nations, particularly in West Africa, can access new funds designed to help them adapt to the realities of climate change. Representatives from over 40 nations were present, agreeing on a framework that will see billions distributed over the next decade.",
      imageUrl: "https://images.unsplash.com/photo-1611273426858-450d873bc32b?auto=format&fit=crop&q=80&w=800",
      published: true,
      status: "PUBLISHED",
      authorId: author2.id,
      categories: {
        connect: [{ id: catInternational.id }]
      },
      publishedAt: new Date(),
    }
  });

  const article2 = await prisma.article.create({
    data: {
      title: "New Solar Grid Project Launched in Bo District",
      summary: "A major renewable energy initiative aims to provide 24/7 power to over 50,000 households.",
      content: "Full article content goes here. The Bo District has officially launched its newest solar grid project, marking a major milestone in rural electrification. Funded by international partners and local government, the grid aims to reach 50,000 homes by the end of the year, bringing consistent electricity to communities that have historically relied on generators.",
      imageUrl: "https://images.unsplash.com/photo-1509391366360-120098939cde?auto=format&fit=crop&q=80&w=800",
      published: true,
      status: "PUBLISHED",
      district: "Bo",
      province: "Southern Province",
      authorId: author1.id,
      categories: {
        connect: [{ id: catDistrict.id }]
      },
      publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
    }
  });

  const article3 = await prisma.article.create({
    data: {
      title: "National Assembly Passes New Tech Hub Legislation",
      summary: "Freetown is set to become a major technology hub following the passing of new tax incentives for startups.",
      content: "Full article content goes here. In a unanimous vote, the National Assembly has passed the Tech Hub Act of 2026. The legislation provides sweeping tax incentives for technology startups operating within Freetown and other designated zones, aiming to attract foreign investment and foster local innovation. The move is expected to create over 10,000 jobs in the next five years.",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
      published: true,
      status: "PUBLISHED",
      authorId: author2.id,
      categories: {
        connect: [{ id: catNational.id }]
      },
      publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
    }
  });

  // 4. Seed market prices
  const marketPrices = [
    { commodity: "Rice", market: "Freetown Central", price: 850, trend: "up", trendPct: 2.5, trendPeriod: "this week" },
    { commodity: "Rice", market: "Bo Market", price: 880, trend: "up", trendPct: 3.0, trendPeriod: "this week" },
    { commodity: "Rice", market: "Makeni Hub", price: 895, trend: "up", trendPct: 2.8, trendPeriod: "this month" },
    { commodity: "Rice", market: "Kenema", price: 910, trend: "up", trendPct: 1.5, trendPeriod: "this month" },
    { commodity: "Petrol", market: "Freetown Central", price: 30, trend: "stable", trendPct: 0, trendPeriod: "this week" },
    { commodity: "Palm Oil", market: "Freetown Central", price: 220, trend: "down", trendPct: -1.2, trendPeriod: "this week" },
    { commodity: "Cement", market: "Freetown Central", price: 185, trend: "up", trendPct: 5.0, trendPeriod: "this month" },
  ];

  for (const mp of marketPrices) {
    await prisma.marketPrice.upsert({
      where: { commodity_market: { commodity: mp.commodity, market: mp.market } },
      update: { price: mp.price, trend: mp.trend, trendPct: mp.trendPct, trendPeriod: mp.trendPeriod },
      create: mp,
    });
  }

  // 5. Seed announcements
  const announcements = [
    {
      title: "National Clean-Up Day Announcement",
      body: "Please be reminded that this Saturday is the mandatory national clean-up day. All citizens are required to stay home and participate in community cleaning from 7:00 AM to 12:00 PM. Vehicles without special passes will be restricted.",
      category: "Government",
      icon: "campaign",
      organization: "Ministry of Health & Sanitation",
      location: "Nationwide (Focus: Western Area)",
      dateLabel: "Today, 08:00 AM",
      urgency: "urgent",
    },
    {
      title: "Free Health Screening & Malaria Testing",
      body: "Free health screenings, including rapid malaria tests and nutritional assessments for children under 5, will be conducted this Friday. Please bring your health cards if available.",
      category: "NGO Announcement",
      icon: "local_hospital",
      organization: "Doctors Without Borders (MSF)",
      location: "Pujehun Government Hospital",
      dateLabel: "Yesterday",
      urgency: null,
    },
    {
      title: "Annual Agricultural Trade Fair",
      body: "Join local farmers and vendors for the annual trade fair showcasing the best of local produce, new farming technologies, and community networking. Entry is free for all attendees.",
      category: "Local Event",
      icon: "event",
      organization: "Bo District Council",
      location: "Bo Coronation Field",
      dateLabel: "Oct 12",
      urgency: null,
    },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
