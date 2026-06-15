import { faker } from '@faker-js/faker';
import { ClientType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createRandomClientB2B, createRandomClientUserContact, createRandomLawFirm, createRandomLawFirmUserContact, createRandomUser } from './generators';

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
      const hashedPassword = await bcrypt.hash('Password123', 10);
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

        // 4. Uzupełnij dane kontaktowe/adresowe na koncie użytkownika
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...createRandomLawFirmUserContact(),
            voivodeshipId: randomVoivodeship.id,
          },
        });

        // 5. Stwórz eksperta
        const lawFirm = await prisma.lawFirm.create({
          data: {
            ...randomLawFirmData,
            userId: user.id,
            slug,
          },
        });
        console.log(`  ✓ Law Firm: ${lawFirm.nazwaFirmy}`);

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
        // Stwórz klienta (indywidualnego lub biznesowego)
        const isB2B = faker.number.int({ min: 1, max: 100 }) <= 40; // 40% B2B, 60% INDIVIDUAL
        const randomVoivodeship = faker.helpers.arrayElement(allVoivodeships);

        // Telefon i adres klienta należą do użytkownika (model User)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...createRandomClientUserContact(),
            voivodeshipId: randomVoivodeship.id,
          },
        });

        if (isB2B) {
          const clientData = createRandomClientB2B();
          await prisma.client.create({
            data: {
              ...clientData,
              userId: user.id,
              zgodaRegulamin: true,
              zgodaNewsletter: faker.datatype.boolean(),
              zgodaMarketing: faker.datatype.boolean(),
            }
          });
          console.log(`  ✓ B2B Client profile created for: ${user.email} (${clientData.nazwaFirmy})`)
        } else {
          await prisma.client.create({
            data: {
              userId: user.id,
              clientType: ClientType.INDIVIDUAL,
              imie: user.name ? user.name.split(' ')[0] : faker.person.firstName(),
              nazwisko: user.name ? user.name.split(' ').slice(1).join(' ') : faker.person.lastName(),
              zgodaRegulamin: true,
              zgodaNewsletter: faker.datatype.boolean(),
              zgodaMarketing: faker.datatype.boolean(),
            }
          });
          console.log(`  ✓ Individual Client profile created for: ${user.email}`)
        }
      }

      console.log('---');
    } catch (error) {
      console.error(`Error seeding user:`, error);
    }
  }

  console.log('Test data seeded successfully!');
}
