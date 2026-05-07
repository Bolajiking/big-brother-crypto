import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create cameras from existing db.json data
  const cameras = [
    {
      name: 'Kitchen',
      playbackId: '32b49rq29siaxjlf',
      streamId: '32b47c8b-56c3-4a31-984f-be8d090bcb21',
      description: 'Kitchen area camera',
      isActive: true,
    },
    {
      name: 'Garden',
      playbackId: '72c29f0j1c70dlig',
      streamId: '72c2312d-d214-4f3f-abf5-8ef1f2dd53dc',
      description: 'Garden area camera',
      isActive: true,
    },
    {
      name: 'Lounge',
      playbackId: '6fd1lveinnzmgcao',
      streamId: '6fd1adb0-653e-4ec9-9618-e79a1bd4c650',
      description: 'Lounge area camera',
      isActive: true,
    },
    {
      name: 'Pool',
      playbackId: '5fccqgu53l9ihfvl',
      streamId: '5fccc719-b682-41c3-86b3-152c4156be0a',
      description: 'Pool area camera',
      isActive: true,
    },
    {
      name: 'Garage',
      playbackId: '0984i2pnvzyw33mf',
      streamId: '0984fe62-7578-4e95-b6d0-b3653cde13cc',
      description: 'Garage area camera',
      isActive: true,
    },
    {
      name: 'Bedroom',
      playbackId: 'f475d1g7kwzux65j',
      streamId: 'f4750b12-b3c7-4d57-a888-4abed546b41e',
      description: 'Bedroom area camera',
      isActive: true,
    },
    {
      name: 'Office',
      playbackId: '8a2b3c4d5e6f7g8h9',
      streamId: '8a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
      description: 'Office area camera',
      isActive: true,
    },
    {
      name: 'Entrance',
      playbackId: '9z8y7x6w5v4u3t2s1',
      streamId: '9z8y7x6w-5v4u-3t2s-1r0q-p9o8n7m6l5k4',
      description: 'Main entrance camera',
      isActive: true,
    },
  ];

  console.log('Creating cameras...');
  for (const camera of cameras) {
    await prisma.camera.upsert({
      where: { id: camera.streamId },
      update: camera,
      create: {
        id: camera.streamId,
        ...camera,
      },
    });
  }
  console.log(`Created ${cameras.length} cameras`);

  // Create a demo season
  console.log('Creating demo season...');
  const season = await prisma.season.upsert({
    where: { id: 'season-1' },
    update: {},
    create: {
      id: 'season-1',
      name: 'Season 1',
      description: 'The first season of Big Brother Crypto',
      startDate: new Date('2026-01-15'),
      isActive: true,
      prizePool: 100000000, // ₦100,000,000
    },
  });
  console.log(`Created season: ${season.name}`);

  // Create demo contestants
  console.log('Creating demo contestants...');
  const contestants = [
    {
      id: 'contestant-1',
      name: 'Kachi Okonkwo',
      nickname: 'Kachi',
      bio: 'A software developer from Lagos with a passion for crypto and gaming.',
      age: 28,
      occupation: 'Software Developer',
      state: 'Lagos',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-2',
      name: 'Amara Chukwu',
      nickname: 'Amara',
      bio: 'A fashion designer who dreams of building a global brand.',
      age: 25,
      occupation: 'Fashion Designer',
      state: 'Anambra',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-3',
      name: 'Emeka Udeh',
      nickname: 'Emeka',
      bio: 'A fitness trainer and motivational speaker.',
      age: 30,
      occupation: 'Fitness Trainer',
      state: 'Enugu',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-4',
      name: 'Zainab Mohammed',
      nickname: 'Zee',
      bio: 'A medical doctor passionate about public health.',
      age: 27,
      occupation: 'Medical Doctor',
      state: 'Kano',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-5',
      name: 'Chinedu Eze',
      nickname: 'Nedu',
      bio: 'A crypto trader and blockchain enthusiast.',
      age: 26,
      occupation: 'Crypto Trader',
      state: 'Imo',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-6',
      name: 'Folake Adeyemi',
      nickname: 'Folake',
      bio: 'An actress and content creator.',
      age: 24,
      occupation: 'Actress',
      state: 'Oyo',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-7',
      name: 'Uche Nnamdi',
      nickname: 'Uche',
      bio: 'A musician and producer making waves in Afrobeats.',
      age: 29,
      occupation: 'Musician',
      state: 'Rivers',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-8',
      name: 'Adaeze Obi',
      nickname: 'Ada',
      bio: 'A lawyer turned entrepreneur.',
      age: 31,
      occupation: 'Entrepreneur',
      state: 'Delta',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-9',
      name: 'Sade Adebayo',
      nickname: 'Sade',
      bio: 'A dancer and creator from Akure with a loyal online fanbase.',
      age: 24,
      occupation: 'Dancer',
      state: 'Ondo',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-10',
      name: 'Musa Bello',
      nickname: 'Musa',
      bio: 'A community organizer and gamer who knows how to read a room.',
      age: 30,
      occupation: 'Community Organizer',
      state: 'Kano',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-11',
      name: 'Ife Osagie',
      nickname: 'Ife',
      bio: 'A food creator from Benin who turns every kitchen moment into theatre.',
      age: 23,
      occupation: 'Food Creator',
      state: 'Edo',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-12',
      name: 'Dara Williams',
      nickname: 'Dara',
      bio: 'A podcaster and storyteller with a gift for stirring conversation.',
      age: 26,
      occupation: 'Podcaster',
      state: 'Lagos',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-13',
      name: 'Efe Oghene',
      nickname: 'Efe',
      bio: 'A fitness coach from Warri bringing discipline and drama.',
      age: 27,
      occupation: 'Fitness Coach',
      state: 'Delta',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-14',
      name: 'Lola Bankole',
      nickname: 'Lola',
      bio: 'A beauty founder with sharp instincts and sharper confessionals.',
      age: 22,
      occupation: 'Beauty Entrepreneur',
      state: 'Ogun',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-15',
      name: 'Korede Yusuf',
      nickname: 'Korede',
      bio: 'A comedian from Ilorin who makes every room feel like prime time.',
      age: 28,
      occupation: 'Comedian',
      state: 'Kwara',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
    {
      id: 'contestant-16',
      name: 'Nneka Eze',
      nickname: 'Nneka',
      bio: 'A fashion stylist from Owerri with calm strategy and loud fits.',
      age: 25,
      occupation: 'Fashion Stylist',
      state: 'Imo',
      status: 'ACTIVE' as const,
      seasonId: season.id,
    },
  ];

  for (const contestant of contestants) {
    await prisma.contestant.upsert({
      where: { id: contestant.id },
      update: contestant,
      create: contestant,
    });
  }
  console.log(`Created ${contestants.length} contestants`);

  // Create a demo prediction market
  console.log('Creating demo prediction market...');
  const market = await prisma.market.upsert({
    where: { id: 'market-1' },
    update: {},
    create: {
      id: 'market-1',
      title: 'Who will be evicted in Week 1?',
      description: 'Predict which housemate will be the first to leave the Big Brother house.',
      type: 'ELIMINATION',
      status: 'OPEN',
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      seasonId: season.id,
    },
  });

  // Create market options for each contestant
  console.log('Creating market options...');
  for (const contestant of contestants) {
    await prisma.marketOption.upsert({
      where: { id: `option-${contestant.id}` },
      update: {},
      create: {
        id: `option-${contestant.id}`,
        label: contestant.nickname || contestant.name,
        currentOdds: 6.25, // 16 housemates = 6.25% each
        marketId: market.id,
        contestantId: contestant.id,
      },
    });
  }
  console.log(`Created ${contestants.length} market options`);

  // Create a voting window
  console.log('Creating voting window...');
  await prisma.votingWindow.upsert({
    where: { id: 'voting-1' },
    update: {},
    create: {
      id: 'voting-1',
      title: 'Week 1 Eviction Vote',
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      isActive: true,
      seasonId: season.id,
    },
  });

  // Mark some contestants as nominated
  console.log('Nominating contestants...');
  await prisma.contestant.updateMany({
    where: {
      id: { in: ['contestant-3', 'contestant-5', 'contestant-7'] },
    },
    data: { isNominated: true },
  });

  // Set Head of House
  await prisma.contestant.update({
    where: { id: 'contestant-1' },
    data: { isHoH: true, hasImmunity: true },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
