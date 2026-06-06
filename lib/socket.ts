export function getIO(): any {
  return null
}

export function setIO(io: any) {
  // no-op
}

export function initSocket(httpServer: any) {
  return null
}

export async function emitNewMessage(conversationId: string, message: any) {
  // no-op
}

export async function emitMessageRead(conversationId: string, messageIds: string[]) {
  // no-op
}

export async function emitConversationUpdate(userId: string, type: string) {
  // no-op
}

export async function emitNewNotification(userId: string, notification: any) {
  // no-op
}
