
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function backup() {
  console.log('Starting backup...');
  
  const backupDir = path.join(process.cwd(), 'backups');
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (e) {}

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  const data: Record<string, object[]> = {};

  // Backup all models
  console.log('Backing up Users...');
  data.users = await prisma.user.findMany();
  data.accounts = await prisma.account.findMany();
  data.sessions = await prisma.session.findMany();
  data.verificationTokens = await prisma.verificationToken.findMany();
  
  console.log('Backing up Content...');
  data.heroSlides = await prisma.heroSlide.findMany();
  data.menuItems = await prisma.menuItem.findMany();
  data.shows = await prisma.show.findMany();
  data.castMembers = await prisma.castMember.findMany();
  data.showPhotos = await prisma.showPhoto.findMany();
  data.volunteerApplications = await prisma.volunteerApplication.findMany();
  
  console.log('Backing up Auditions...');
  data.auditions = await prisma.audition.findMany();
  data.auditionSlots = await prisma.auditionSlot.findMany();
  data.auditionAttendees = await prisma.auditionAttendee.findMany();
  
  console.log('Backing up News & Pages...');
  data.newsPosts = await prisma.newsPost.findMany();
  data.contactSubmissions = await prisma.contactSubmission.findMany();
  data.siteSettings = await prisma.siteSettings.findMany();
  data.fundraisers = await prisma.fundraiser.findMany();
  data.fundraiserEvents = await prisma.fundraiserEvent.findMany();
  data.pages = await prisma.page.findMany();
  data.membershipApplications = await prisma.membershipApplication.findMany();

  await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
  console.log(`Backup completed successfully to ${backupFile}`);
}

backup()
  .catch((e) => {
    console.error('Backup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
