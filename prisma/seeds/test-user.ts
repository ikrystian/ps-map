import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedTestUser(prisma: PrismaClient) {
    console.log("Seeding test user...")

    const hashedPassword = await bcrypt.hash("Password123", 10)

    // Create Law Firm
    const lawFirmUser = await prisma.user.create({
        data: {
            email: "test-law-firm@ps-dev.com.pl",
            name: "Test Law Firm",
            password: hashedPassword,
            role: UserRole.LAW_FIRM,
            emailVerified: new Date(),
        },
    })

    const voivodeship = await prisma.voivodeship.findFirst();
    if (voivodeship) {
        // Dane kontaktowe/adresowe należą do użytkownika
        await prisma.user.update({
            where: { id: lawFirmUser.id },
            data: {
                imie: "John",
                nazwisko: "Doe",
                numerTelefonu: "123456789",
                adres: "Test Address",
                kodPocztowy: "00-000",
                miasto: "Test City",
                voivodeshipId: voivodeship.id,
            },
        })

        await prisma.lawFirm.create({
            data: {
                userId: lawFirmUser.id,
                nazwa: "Test Law Firm",
                slug: "test-law-firm",
                nip: "1234567890",
                typ: "SPOLKA_ZOO",
                typOferty: "WSZYSTKIE",
                nazwa: "Test Law Firm LLC"
            },
        })
    }


    // Create Client
    const clientUser = await prisma.user.create({
        data: {
            email: "test-client@ps-dev.com.pl",
            name: "Test Client",
            password: hashedPassword,
            role: UserRole.CLIENT,
            emailVerified: new Date(),
        },
    })

    await prisma.client.create({
        data: {
            userId: clientUser.id,
            imie: "Test",
            nazwisko: "Client",
        }
    })


    console.log("✓ Test user seeded successfully!")
}
