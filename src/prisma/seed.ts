import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tone mapping functions (matching your ToneMapper)
function mapFormality(score: number): string {
  if (score <= 0.1) return "extremely casual";
  if (score <= 0.2) return "very casual";
  if (score <= 0.3) return "casual";
  if (score <= 0.4) return "slightly casual";
  if (score <= 0.5) return "neutral";
  if (score <= 0.6) return "slightly formal";
  if (score <= 0.7) return "formal";
  if (score <= 0.8) return "very formal";
  if (score <= 0.9) return "highly formal";
  return "extremely formal";
}

function mapWarmth(score: number): string {
  if (score <= 0.1) return "cold and impersonal";
  if (score <= 0.2) return "very professional and direct";
  if (score <= 0.3) return "professional and direct";
  if (score <= 0.4) return "business-focused";
  if (score <= 0.5) return "neutral";
  if (score <= 0.6) return "friendly";
  if (score <= 0.7) return "warm and personal";
  if (score <= 0.8) return "very warm and personal";
  if (score <= 0.9) return "highly warm and relationship-focused";
  return "extremely warm and relationship-focused";
}

function mapDirectness(score: number): string {
  if (score <= 0.1) return "extremely indirect and suggestive";
  if (score <= 0.2) return "very indirect and suggestive";
  if (score <= 0.3) return "indirect and suggestive";
  if (score <= 0.4) return "soft approach";
  if (score <= 0.5) return "balanced";
  if (score <= 0.6) return "direct";
  if (score <= 0.7) return "very direct";
  if (score <= 0.8) return "highly direct";
  if (score <= 0.9) return "extremely direct";
  return "very direct and straightforward";
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing TOV configs
  await prisma.tOVConfig.deleteMany();
  console.log("🧹 Cleared existing TOV configs");

  // Generate TOV configs for all combinations
  const tovConfigs = [];

  // Generate configs for each 0.1 increment from 0.1 to 1.0
  for (let tov = 0.1; tov <= 1.0; tov += 0.1) {
    const roundedTov = Math.round(tov * 10) / 10; // Ensure precision

    const config = {
      tov: roundedTov,
      formality: mapFormality(roundedTov),
      warmth: mapWarmth(roundedTov),
      directness: mapDirectness(roundedTov),
    };

    tovConfigs.push(config);
  }

  // Create all TOV configs
  const createdConfigs = await prisma.tOVConfig.createMany({
    data: tovConfigs,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${createdConfigs.count} TOV configs`);

  // Display some examples
  const sampleConfigs = await prisma.tOVConfig.findMany({
    take: 5,
    orderBy: { tov: "asc" },
  });

  console.log("\n📋 Sample TOV Configs:");
  sampleConfigs.forEach((config) => {
    console.log(
      `  TOV ${config.tov}: ${config.formality} | ${config.warmth} | ${config.directness}`
    );
  });

  console.log("\n🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
