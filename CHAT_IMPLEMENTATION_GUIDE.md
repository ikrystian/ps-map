# Chat Component - Comprehensive Implementation Guide

## 📋 Overview

This guide documents the implementation of advanced chat features for the Prosta Sprawa messaging system. The goal is to create a fully-featured Messenger-style chat with encryption, real-time features, and comprehensive user controls.

---

## ✅ Completed Work

### 1. Database Schema Updates (`/prosta-sprawa/prisma/schema.prisma`)

#### Enhanced `Conversation` Model
- **Archiving per user**: `isArchivedByClient`, `archivedByClientAt`, `isArchivedByLawFirm`, `archivedByLawFirmAt`
- **Soft delete per user**: `isDeletedByClient`, `deletedByClientAt`, `isDeletedByLawFirm`, `deletedByLawFirmAt`
- **Relation**: Added `typingIndicators` relation

#### Enhanced `ChatMessage` Model
- **Encryption**: `content` (encrypted), `contentIv` (initialization vector)
- **Attachments**: `attachments` (JSON array for PDF files)
- **Message status**: `status` enum (SENDING, SENT, DELIVERED, READ, ERROR)
- **Timestamps**: `deliveredAt`, `readAt`

#### New `MessageStatus` Enum
```prisma
enum MessageStatus {
  SENDING       // Wysyłanie (tymczasowy status)
  SENT          // Wysłano
  DELIVERED     // Dostarczono (zapisano w bazie)
  READ          // Przeczytano
  ERROR         // Błąd wysyłania
}
```

#### New `UserBlock` Model
- Tracks blocked users
- Fields: `blockerId`, `blockedId`, `createdAt`
- Unique constraint on `[blockerId, blockedId]`

#### New `UserOnlineStatus` Model
- Tracks user online/offline status
- Fields: `userId`, `isOnline`, `lastSeen`, `updatedAt`
- Unique on `userId`

#### New `TypingIndicator` Model
- Tracks who is currently typing
- Fields: `conversationId`, `userId`, `isTyping`, `createdAt`, `updatedAt`
- Unique on `[conversationId, userId]`

### 2. Utility Libraries Created

#### `/prosta-sprawa/lib/encryption.ts`
**AES-256-CBC encryption for message content**
- `encryptMessage(text)` - Encrypts message content, returns `{encrypted, iv}`
- `decryptMessage(encrypted, iv)` - Decrypts message content
- `testEncryption()` - Tests encryption/decryption functionality
- Uses `ENCRYPTION_KEY` environment variable (must be set!)

#### `/prosta-sprawa/lib/time-utils.ts`
**Smart timestamp formatting in Polish**
- `formatSmartTimestamp(date)` - "przed chwilą", "X min temu", etc.
- `formatMessageTimestamp(date)` - For message display
- `formatMessageDateHeader(date)` - For date headers ("Dziś", "Wczoraj")
- `formatLastSeen(date)` - For user online status

#### `/prosta-sprawa/lib/hooks/use-debounce.ts`
**Performance optimization hooks**
- `useDebounce(value, delay)` - Debounces a value
- `useDebouncedCallback(callback, delay)` - Debounces a callback function
- `useThrottledCallback(callback, limit)` - Throttles a callback function

#### `/prosta-sprawa/lib/hooks/use-chat-hooks.ts`
**Chat-specific React hooks**
- `useNotificationSound()` - Plays notification sounds
  - Returns: `{playSound, soundEnabled, toggleSound}`
- `useOnlineStatus()` - Tracks and updates user online/offline status
  - Updates status every 30 seconds
  - Sets offline on tab close/hide
- `useTypingIndicator(conversationId)` - Manages typing indicators
  - Returns: `{isTyping, otherUserTyping, notifyTyping, stopTyping}`
- `useLazyLoadMessages(conversationId)` - Lazy loads messages
  - Loads 30 messages initially, 20 per subsequent load
  - Returns: `{messages, hasMore, isLoading, loadMore, setMessages, reset}`

### 3. Components Created

#### `/prosta-sprawa/components/messages/UserInfoDialog.tsx`
**User information popup dialog**
- Displays user avatar (120x120px)
- Shows email, registration date, role, location
- Displays user description
- Shows online/offline status with last seen time
- **Block/Unblock functionality**
- Fetches data from `/api/users/[id]/info`
- Calls `/api/users/[id]/block` and `/api/users/[id]/unblock`

---

## 🚧 Pending Implementation

### Phase 1: API Routes (Critical)

Create the following API endpoints:

#### 1. Online Status API
**`/prosta-sprawa/app/api/users/online-status/route.ts`**
```typescript
POST - Update user's online/offline status
GET - Get online status of specific user(s)
```

#### 2. Typing Indicator API
**`/prosta-sprawa/app/api/conversations/[id]/typing/route.ts`**
```typescript
POST - Update typing status
GET - Get typing status in conversation
```

#### 3. User Info API
**`/prosta-sprawa/app/api/users/[id]/info/route.ts`**
```typescript
GET - Get detailed user information
```

#### 4. User Blocking API
**`/prosta-sprawa/app/api/users/[id]/block/route.ts`**
```typescript
POST - Block a user
```

**`/prosta-sprawa/app/api/users/[id]/unblock/route.ts`**
```typescript
POST - Unblock a user
```

**`/prosta-sprawa/app/api/users/blocked/route.ts`**
```typescript
GET - Get list of blocked users
```

#### 5. Conversation Archive API
**`/prosta-sprawa/app/api/conversations/[id]/archive/route.ts`**
```typescript
PATCH - Archive/unarchive conversation
```

#### 6. Conversation Delete API
**`/prosta-sprawa/app/api/conversations/[id]/delete/route.ts`**
```typescript
PATCH - Soft delete conversation
POST - Restore deleted conversation
```

#### 7. File Upload API (PDF Attachments)
**`/prosta-sprawa/app/api/upload/chat-attachment/route.ts`**
```typescript
POST - Upload PDF attachment (max 5MB)
```

#### 8. Update Messages API for Lazy Loading
**Modify `/prosta-sprawa/app/api/conversations/[id]/messages/route.ts`**
- Add `limit` and `offset` query parameters
- Return messages with encryption/decryption
- Update message status to DELIVERED when fetched

### Phase 2: Component Updates

#### 1. Update `ChatArea.tsx`
Add the following features:
- ✅ Use `useLazyLoadMessages` hook for infinite scroll
- ✅ Implement typing indicator with `useTypingIndicator`
- ✅ Add notification sound with `useNotificationSound`
- ✅ Show message status indicators (✓, ✓✓, error icon)
- ✅ Encrypt messages before sending
- ✅ Decrypt messages when displaying
- ✅ Add PDF attachment upload button
- ✅ Show attachment previews
- ✅ Add emoji picker
- ✅ Implement Shift+Enter for new line (already done)
- ✅ Add user info button in header (opens UserInfoDialog)
- ✅ Check if user is blocked before sending messages
- ✅ Use smart timestamps from `time-utils`
- ✅ Add smooth animations with Framer Motion

#### 2. Update `ConversationList.tsx`
Add the following features:
- ✅ Create 3 tabs: "Konwersacje", "Archiwum", "Usunięte"
- ✅ Filter conversations based on active tab
- ✅ Add archive/unarchive button per conversation
- ✅ Add delete/restore button per conversation
- ✅ Show online status indicator next to avatars
- ✅ Show typing indicator ("pisze..." text)
- ✅ Add animations for list items

#### 3. Create New Components

##### `/prosta-sprawa/components/messages/EmojiPicker.tsx`
Use `emoji-picker-react` library:
```bash
npm install emoji-picker-react
```

##### `/prosta-sprawa/components/messages/AttachmentUpload.tsx`
- File input for PDF only
- Validation: max 5MB, PDF type only
- Preview before sending
- Upload progress indicator

##### `/prosta-sprawa/components/messages/MessageStatusIndicator.tsx`
Status icons:
- ⏳ SENDING - spinner
- ✓ SENT - single checkmark
- ✓✓ DELIVERED - double checkmark
- 👁️ READ - double checkmark (blue/colored)
- ⚠️ ERROR - error icon with retry option

##### `/prosta-sprawa/components/messages/TypingIndicator.tsx`
Animated "..." dots when user is typing

### Phase 3: Additional Features

#### 1. Notification Sound
Create or add notification sound file:
- `/prosta-sprawa/public/sounds/notification.mp3`
- Free sound from Notification Sounds or similar

#### 2. Environment Variables
Add to `.env`:
```env
# Chat encryption key (32 bytes as hex string)
ENCRYPTION_KEY=your-64-character-hex-string-here
```

Generate key with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Package Dependencies
Install required packages:
```bash
cd prosta-sprawa
npm install emoji-picker-react framer-motion
```

### Phase 4: Database Migration

Run the following commands to apply schema changes:
```bash
cd prosta-sprawa
npm install
npm run db:push
npm run db:generate
```

Or if using migrations:
```bash
npx prisma migrate dev --name add-chat-features
```

---

## 📝 Implementation Checklist

### Database & Setup
- [ ] Run `npm install` to ensure all packages are installed
- [ ] Add `ENCRYPTION_KEY` to `.env` file
- [ ] Run `npm run db:push` to apply schema changes
- [ ] Run `npm run db:generate` to update Prisma client
- [ ] Install `emoji-picker-react` and `framer-motion`

### API Routes (Priority Order)
- [ ] Create online status API (`/api/users/online-status`)
- [ ] Create typing indicator API (`/api/conversations/[id]/typing`)
- [ ] Create user info API (`/api/users/[id]/info`)
- [ ] Create block/unblock APIs (`/api/users/[id]/block`, `/api/users/[id]/unblock`)
- [ ] Create blocked users list API (`/api/users/blocked`)
- [ ] Create archive API (`/api/conversations/[id]/archive`)
- [ ] Create delete/restore API (`/api/conversations/[id]/delete`)
- [ ] Create attachment upload API (`/api/upload/chat-attachment`)
- [ ] Update messages API for lazy loading with encryption

### Component Updates
- [ ] Update `ChatArea.tsx` with all new features
- [ ] Update `ConversationList.tsx` with tabs and status indicators
- [ ] Create `EmojiPicker.tsx` component
- [ ] Create `AttachmentUpload.tsx` component
- [ ] Create `MessageStatusIndicator.tsx` component
- [ ] Create `TypingIndicator.tsx` component

### Assets & Configuration
- [ ] Add notification sound to `/public/sounds/notification.mp3`
- [ ] Test encryption/decryption functionality
- [ ] Test all new features end-to-end

---

## 🔧 Implementation Examples

### Example: Online Status API

**`/prosta-sprawa/app/api/users/online-status/route.ts`**
```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isOnline } = body

    // Upsert online status
    await prisma.userOnlineStatus.upsert({
      where: { userId: session.user.id },
      update: {
        isOnline,
        lastSeen: new Date(),
      },
      create: {
        userId: session.user.id,
        isOnline,
        lastSeen: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating online status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const status = await prisma.userOnlineStatus.findUnique({
      where: { userId },
    })

    return NextResponse.json(status || { isOnline: false, lastSeen: null })
  } catch (error) {
    console.error("Error fetching online status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Example: Typing Indicator API

**`/prosta-sprawa/app/api/conversations/[id]/typing/route.ts`**
```typescript
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isTyping } = body

    await prisma.typingIndicator.upsert({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId: session.user.id,
        },
      },
      update: {
        isTyping,
        updatedAt: new Date(),
      },
      create: {
        conversationId: params.id,
        userId: session.user.id,
        isTyping,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating typing indicator:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get typing indicator for other user in conversation
    const indicator = await prisma.typingIndicator.findFirst({
      where: {
        conversationId: params.id,
        userId: { not: session.user.id },
        isTyping: true,
        // Only consider "typing" if updated in last 5 seconds
        updatedAt: {
          gte: new Date(Date.now() - 5000),
        },
      },
    })

    return NextResponse.json({ isTyping: !!indicator })
  } catch (error) {
    console.error("Error fetching typing indicator:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Example: Using Encryption in Messages API

**Update `/prosta-sprawa/app/api/conversations/[id]/messages/route.ts`**

```typescript
import { encryptMessage, decryptMessage } from "@/lib/encryption"

// In POST handler (sending message):
const { encrypted, iv } = encryptMessage(content)

const message = await prisma.chatMessage.create({
  data: {
    conversationId: params.id,
    senderId: session.user.id,
    content: encrypted,
    contentIv: iv,
    status: "DELIVERED",
    deliveredAt: new Date(),
  },
  include: {
    sender: {
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
      },
    },
  },
})

// Decrypt before returning
const decryptedMessage = {
  ...message,
  content: decryptMessage(message.content, message.contentIv!),
}

// In GET handler (fetching messages):
const messages = await prisma.chatMessage.findMany({
  where: { conversationId: params.id },
  include: { sender: true },
  orderBy: { createdAt: "asc" },
  take: limit,
  skip: offset,
})

// Decrypt all messages
const decryptedMessages = messages.map((msg) => ({
  ...msg,
  content: msg.contentIv ? decryptMessage(msg.content, msg.contentIv) : msg.content,
}))
```

---

## 🎨 UI/UX Enhancements

### Animations with Framer Motion

```typescript
import { motion, AnimatePresence } from "framer-motion"

// Fade in animation
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
>
  {content}
</motion.div>

// List item animation
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.05 }}
>
  {item}
</motion.div>
```

### Message Status Icons

```typescript
const statusIcons = {
  SENDING: <Loader2 className="h-3 w-3 animate-spin" />,
  SENT: <Check className="h-3 w-3" />,
  DELIVERED: <CheckCheck className="h-3 w-3" />,
  READ: <CheckCheck className="h-3 w-3 text-blue-500" />,
  ERROR: <AlertCircle className="h-3 w-3 text-red-500" />,
}
```

---

## 🧪 Testing Checklist

### Encryption
- [ ] Test encryption/decryption with various message lengths
- [ ] Test with special characters and emojis
- [ ] Verify encrypted data is not readable in database

### Online Status
- [ ] Test status updates when user logs in/out
- [ ] Test status updates when tab is closed
- [ ] Test status display in conversation list

### Typing Indicator
- [ ] Test typing indicator appears when user types
- [ ] Test typing indicator disappears after 3 seconds
- [ ] Test debouncing works correctly

### Lazy Loading
- [ ] Test initial load of 30 messages
- [ ] Test loading more with scroll to top
- [ ] Test scroll position maintained when loading older messages

### Blocking
- [ ] Test blocking prevents message sending
- [ ] Test unblocking restores messaging
- [ ] Test blocked users list

### Archive/Delete
- [ ] Test archiving moves conversation to Archive tab
- [ ] Test deleting moves conversation to Deleted tab
- [ ] Test restoring from archive/deleted

### Attachments
- [ ] Test PDF upload (under 5MB)
- [ ] Test rejection of non-PDF files
- [ ] Test rejection of files over 5MB
- [ ] Test attachment preview
- [ ] Test attachment download

---

## 📚 Resources

- **Emoji Picker**: https://www.npmjs.com/package/emoji-picker-react
- **Framer Motion**: https://www.framer.com/motion/
- **Crypto (Node.js)**: https://nodejs.org/api/crypto.html
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🆘 Troubleshooting

### Issue: Encryption errors
**Solution**: Ensure `ENCRYPTION_KEY` is set in `.env` and is exactly 64 hex characters (32 bytes)

### Issue: Messages not decrypting
**Solution**: Check that `contentIv` is being saved and retrieved correctly

### Issue: Typing indicator not working
**Solution**: Verify polling interval is set correctly (2 seconds) and check network tab for API calls

### Issue: Online status not updating
**Solution**: Check that status update interval is running (30 seconds) and beforeunload handler is attached

---

## 📝 Notes

- Remember to test all features thoroughly before deployment
- Consider implementing WebSockets for real-time updates in production (currently using polling)
- Monitor database performance with encryption overhead
- Set up proper error logging for encryption failures
- Consider adding rate limiting to typing indicator API

---

**Status**: Schema and utilities completed. API routes and component updates pending.

**Next Steps**:
1. Apply database schema changes
2. Create API routes
3. Update components
4. Test all features
5. Deploy

Good luck with the implementation! 🚀
