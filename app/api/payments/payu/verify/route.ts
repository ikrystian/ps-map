import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { payuClient } from "@/lib/payu"
import { auth } from "@/lib/auth"

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
                lawFirm: true,
                subscriptionPlan: true
            }
        })

        if (!order) {
            return Response.json({ error: "Order not found" }, { status: 404 })
        }

        // Check if user owns the order
        if (order.lawFirm.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return Response.json({ error: "Forbidden" }, { status: 403 })
        }

        if (order.statusPlatnosci === 'ZAPLACONE') {
            return Response.json({ status: "COMPLETED", message: "Order already paid" })
        }

        if (!order.transactionId) {
            return Response.json({ status: "PENDING", message: "No transaction ID found" })
        }

        // Verify with PayU
        const payuOrder = await payuClient.retrieveOrder(order.transactionId)
        const status = payuOrder.orders?.[0]?.status

        if (status === 'COMPLETED') {
            // Update Order and LawFirm
            await prisma.$transaction(async (tx) => {
                // Update Order
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        statusPlatnosci: 'ZAPLACONE',
                        zaplaconoData: new Date()
                    }
                })

                // Handle Points
                if (order.orderType === 'POINTS') {
                    await tx.lawFirm.update({
                        where: { id: order.lawFirmId },
                        data: {
                            punktySaldo: {
                                increment: order.liczbaPunktow || 0
                            }
                        }
                    })
                }

                // Handle Subscription
                if (order.orderType === 'SUBSCRIPTION' && order.subscriptionPlan) {
                    const now = new Date()
                    let startDate = now
                    if (order.lawFirm.dataPakietuDo && order.lawFirm.dataPakietuDo > now) {
                        startDate = order.lawFirm.dataPakietuDo
                    }

                    const months = order.subscriptionPeriod || 12
                    const endDate = new Date(startDate)
                    endDate.setMonth(endDate.getMonth() + months)

                    await tx.lawFirm.update({
                        where: { id: order.lawFirmId },
                        data: {
                            pakietSubskrypcji: order.subscriptionPlan.typ,
                            dataPakietuOd: startDate,
                            dataPakietuDo: endDate,
                            punktySaldo: {
                                increment: order.subscriptionPlan.punktyGratis || 0
                            }
                        }
                    })
                }

                // Create Notification
                await tx.notification.create({
                    data: {
                        userId: order.lawFirm.userId,
                        typ: "ZMIANA_STATUSU",
                        tytul: "Płatność zakończona pomyślnie",
                        tresc: order.orderType === 'POINTS'
                            ? `Zakup punktów zakończony sukcesem. Dodano ${order.liczbaPunktow} pkt.`
                            : `Subskrypcja ${order.subscriptionPlan?.nazwa} została aktywowana.`,
                        linkUrl: order.orderType === 'POINTS' ? "/panel-kancelarii/punkty" : "/panel-kancelarii/pakiet"
                    }
                })
            })

            return Response.json({ status: "COMPLETED", message: "Order updated successfully" })
        } else if (status === 'CANCELED') {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    statusPlatnosci: 'ANULOWANE'
                }
            })
            return Response.json({ status: "CANCELED", message: "Order canceled" })
        }

        return Response.json({ status: status || "PENDING", message: "Payment pending" })

    } catch (error) {
        console.error("PayU Verify Error:", error)
        return Response.json(
            { error: error instanceof Error ? error.message : "Failed to verify payment" },
            { status: 500 }
        )
    }
}
