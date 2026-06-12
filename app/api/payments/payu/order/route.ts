import { auth } from "@/lib/auth"
import { payuClient } from "@/lib/payu"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { orderId } = body

        if (!orderId) {
            return Response.json({ error: "Order ID is required" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                lawFirm: {
                    include: {
                        user: true
                    }
                }
            }
        })

        if (!order) {
            return Response.json({ error: "Order not found" }, { status: 404 })
        }

        // Check if user owns the order
        // Assuming lawFirm.userId matches session.user.id
        // Or check if user is admin?
        // For now, strict check:
        if (order.lawFirm.userId !== session.user.id) {
            // Allow admin?
            if (session.user.role !== 'ADMIN') {
                return Response.json({ error: "Forbidden" }, { status: 403 })
            }
        }

        if (order.statusPlatnosci === 'ZAPLACONE') {
            return Response.json({ error: "Order already paid" }, { status: 400 })
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
        const notifyUrl = `${appUrl}/api/payments/payu/notify`
        const continueUrl = `${appUrl}/panel-eksperta/checkout/success?orderId=${order.id}`

        // Amount in grosz
        const totalAmount = Math.round(order.kwota * 100).toString()

        const description = order.orderType === 'POINTS'
            ? `Zakup punktów: ${order.pakietPunktow || 'Pakiet'}`
            : `Subskrypcja: ${order.subscriptionPlanId || 'Plan'}`

        const products = [
            {
                name: description,
                unitPrice: totalAmount,
                quantity: "1"
            }
        ]

        // Get client IP
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1"

        const payuResponse = await payuClient.createOrder({
            notifyUrl,
            customerIp: ip,
            merchantPosId: process.env.PAYU_POS_ID || "",
            description: description,
            currencyCode: "PLN",
            totalAmount: totalAmount,
            extOrderId: order.id, // Use our Order ID as external ID
            buyer: {
                email: order.law.Firm.user?.email || order.lawFirm.user.email,
                firstName: order.lawFirm.imieKontakt,
                lastName: order.lawFirm.nazwiskoKontakt,
                language: "pl"
            },
            products,
            continueUrl
        })

        // Update order with PayU Order ID
        await prisma.order.update({
            where: { id: order.id },
            data: {
                transactionId: payuResponse.orderId,
                metodaPlatnosci: 'PAYU'
            }
        })

        return Response.json({ redirectUrl: payuResponse.redirectUri })

    } catch (error) {
        console.error("PayU Order Init Error:", error)
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to initiate payment" },
            { status: 500 }
        )
    }
}
