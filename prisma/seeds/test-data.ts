import { PrismaClient, UserRole, LawFirmType, OfferType, SubscriptionPackage } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createRandomLawFirm, createRandomUser } from './generators'
import { faker } from '@faker-js/faker'

const USERS_TO_CREATE = 12;

export async function seedTestData(prisma: PrismaClient) {
  console.log(`Seeding ${USERS_TO_CREATE} test users (law firms and clients)...`);

  const allVoivodeships = await prisma.voivodeship.findMany();
  const allCategories = await prisma.category.findMany();

  for (let i = 0; i < USERS_TO_CREATE; i++) {
    try {
      const role = faker.helpers.arrayElement([UserRole.LAW_FIRM, UserRole.CLIENT]);

      // 1. Stwórz użytkownika
      const randomUser = createRandomUser(prisma, role);
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.upsert({
        where: { email: randomUser.email },
        update: {},
        create: {
          ...randomUser,
          password: hashedPassword,
        },
      });
      console.log(`✓ User: ${user.email} (${user.role})`);

      if (role === UserRole.LAW_FIRM) {
        // 2. Znajdź losowe województwo
        const randomVoivodeship = faker.helpers.arrayElement(allVoivodeships);

        // 3. Stwórz slug
        const randomLawFirmData = createRandomLawFirm(prisma);
        const slug = `${randomLawFirmData.nazwa.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${faker.string.alphanumeric(5)}`;

        // 4. Stwórz kancelarię
        const lawFirm = await prisma.lawFirm.create({
          data: {
            ...randomLawFirmData,
            userId: user.id,
            slug,
            voivodeshipId: randomVoivodeship.id,
          },
        });
        console.log(`  ✓ Law Firm: ${lawFirm.nazwa}`);

        // 5. Dodaj losowe województwa działania
        const numberOfVoivodeships = faker.number.int({ min: 1, max: 5 });
        const selectedVoivodeships = faker.helpers.arrayElements(allVoivodeships, numberOfVoivodeships);

        for (const voiv of selectedVoivodeships) {
          await prisma.lawFirmVoivodeship.create({
            data: {
              lawFirmId: lawFirm.id,
              voivodeshipId: voiv.id,
            },
          });
        }
        console.log(`  ✓ Voivodeships: ${selectedVoivodeships.length}`);

        // 6. Dodaj losowe kategorie
        const numberOfCategories = faker.number.int({ min: 1, max: 8 });
        const selectedCategories = faker.helpers.arrayElements(allCategories, numberOfCategories);

        for (const category of selectedCategories) {
          await prisma.lawFirmCategory.create({
            data: {
              lawFirmId: lawFirm.id,
              categoryId: category.id,
            },
          });
        }
        console.log(`  ✓ Categories: ${selectedCategories.length}`);
      } else {
        // Stwórz klienta
        await prisma.client.create({
          data: {
            userId: user.id,
            imie: user.name ? user.name.split(' ')[0] : '',
            nazwisko: user.name ? user.name.split(' ').slice(1).join(' ') : '',
            telefon: faker.phone.number()
          }
        });
        console.log(`  ✓ Client profile created for: ${user.email}`)
      }

      console.log('---');
    } catch (error) {
      console.error(`Error seeding user:`, error);
    }
  }

  console.log('Test data seeded successfully!');
}
