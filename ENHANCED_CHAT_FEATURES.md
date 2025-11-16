# Enhanced Chat System - Complete Feature Implementation

## 📋 Overview

This document describes the complete implementation of all advanced chat features for the Prosta Sprawa messaging system.

## ✅ Implemented Features

### 1. **Active Users Tracking** 👥
- **Database**: `UserOnlineStatus` model tracks online status and last seen timestamp
- **API**: `/api/users/online` (POST/GET)
  - POST: Update user's online status
  - GET: Check another user's online status
- **UI**: Green dot indicator on avatar when user is online
- **Behavior**:
  - Status updates every 60 seconds
  - User considered offline if last seen > 5 minutes ago
  - Displays "Online" or "Last seen X time ago" in chat header

### 2. **Typing Indicator** ⌨️
- **Database**: `TypingIndicator` model
- **API**: `/api/conversations/typing` (POST/GET)
  - POST: Update typing status
  - GET: Check if other user is typing
- **UI**: Animated dots with "{User} pisze..." message
- **Behavior**:
  - Activates when user starts typing
  - Auto-clears after 3 seconds of inactivity
  - Checks every 2 seconds for updates
  - Only shows indicators from last 10 seconds

### 3. **Notification Sounds** 🔔
- **File**: `/public/sounds/notification.mp3`
- **Trigger**: New message received
- **Implementation**: HTML5 Audio API
- **Note**: Currently placeholder - replace with actual audio file

### 4. **AES-256-CBC Encryption** 🔒
- **Utility**: `/lib/encryption.ts`
- **Algorithm**: AES-256-CBC with random IV
- **Features**:
  - `encryptMessage()`: Encrypts text before saving to database
  - `decryptMessage()`: Decrypts when reading from database
  - Each message has unique initialization vector (IV)
- **Database Fields**:
  - `content`: Encrypted message
  - `contentIv`: Initialization vector for decryption
- **Automatic**: All messages encrypted on send, decrypted on fetch

### 5. **Conversation Management** 💬

#### ✅ Create New Conversations
- **API**: `POST /api/conversations`
- **Body**: `{ lawFirmUserId: string }`
- **Returns**: New or existing conversation

#### ✅ List with Last Message Preview
- **API**: `GET /api/conversations?filter={active|archived|deleted}`
- **Features**:
  - Shows last message (decrypted)
  - Unread message count
  - Timestamps with smart formatting
  - Other user info and avatar

#### ✅ Search Conversations
- **UI**: Search bar in conversation list
- **Filters**: Real-time search by user name
- **Case-insensitive matching**

#### ✅ Sort by Last Activity
- **Order**: DESC by `lastMessageAt`
- **Updates**: Real-time when new message sent

#### 📦 Archive Conversations
- **API**:
  - `POST /api/conversations/archive` - Archive
  - `DELETE /api/conversations/archive?conversationId={id}` - Unarchive
- **Database**: Per-user archiving (isArchivedByClient/isArchivedByLawFirm)
- **UI**: Archive button in dropdown menu
- **Tab**: "Archiwum" tab in conversation list

#### 🗑️ Soft Delete
- **API**:
  - `POST /api/conversations/delete` - Delete
  - `DELETE /api/conversations/delete?conversationId={id}` - Restore
- **Database**: Per-user deletion (isDeletedByClient/isDeletedByLawFirm)
- **UI**: Delete button in dropdown menu
- **Tab**: "Usunięte" tab in conversation list

#### ♻️ Restore Archived/Deleted
- **UI**: Restore button (↻ icon) on archived/deleted conversations
- **Action**: Moves conversation back to active tab
- **Toast**: Success notification

#### 📑 Three Tabs
1. **Konwersacje** (Active) - Normal conversations
2. **Archiwum** (Archived) - Archived conversations
3. **Usunięte** (Deleted) - Soft-deleted conversations

### 6. **Messages** 💬

#### Sending Messages

##### 📝 Text Messages
- **Component**: Auto-resizing textarea
- **Max Height**: 128px (8 rows)
- **Min Height**: 44px (1 row)
- **Encryption**: Automatic AES-256-CBC

##### 📎 PDF Attachments
- **API**: `POST /api/upload/chat`
- **Validation**:
  - File type: PDF only (`application/pdf`)
  - Max size: 5MB
- **Storage**: `/public/uploads/chat/`
- **Preview**: Shows filename and size before sending
- **Remove**: X button to remove before sending
- **Display**: Download link with PDF icon in message bubble

##### 😊 Emoji Picker
- **Library**: `emoji-picker-react`
- **Trigger**: Smile icon button
- **Position**: Popup above input field
- **Action**: Inserts emoji at cursor position
- **Close**: Auto-closes after selection

##### ⌨️ Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line
- **Auto-blur**: After sending

#### Displaying Messages

##### 💬 Message Bubbles (Messenger Style)
- **Layout**:
  - Own messages: Right side, blue background
  - Other's messages: Left side, gray background
- **Max Width**: 70% of container
- **Border Radius**: 16px (rounded-2xl)
- **Padding**: 16px horizontal, 8px vertical

##### 👤 User Avatars
- **Size**: 32px (8x8)
- **Fallback**: First 2 letters of name
- **Position**: Next to message bubble
- **Own messages**: Right side
- **Other's messages**: Left side

##### ⏰ Smart Timestamps
- **< 2 min**: "przed chwilą"
- **< 60 min**: "X min temu"
- **Today**: "HH:MM"
- **Yesterday**: "wczoraj HH:MM"
- **< 7 days**: Day of week (e.g., "poniedziałek")
- **Older**: Full date (e.g., "15 stycznia")

##### Message Status Icons
- **⏳ SENDING**: Spinning loader
- **✓ SENT**: Single checkmark
- **✓✓ DELIVERED**: Double checkmark (gray)
- **✓✓ READ**: Double checkmark (blue)
- **⚠️ ERROR**: X icon (red) with retry option

### 7. **Lazy Loading** 📜
- **Initial Load**: 30 most recent messages
- **Scroll Up**: Load 20 more messages
- **API**: `GET /api/conversations/{id}/messages?limit=30&offset=0`
- **Scroll Position**: Maintained when loading older messages
- **Auto-scroll**: To bottom on new messages
- **Loading Indicator**: Spinner at top when loading more

### 8. **Attachments** 📄
- **File Type**: PDF only
- **Max Size**: 5MB
- **Upload**: Drag & drop or click to browse
- **Preview**: Shows before sending with filename and size
- **Display**: Download link in message bubble
- **Icon**: Paperclip icon (📎)
- **Action**: Opens in new tab

#### Attachment Features
- **👁️ Preview**: Shows filename, size before sending
- **📎 List**: All attachments in conversation viewable
- **⬇️ Download**: Opens PDF in new browser tab
- **🗑️ Remove**: Delete before sending with X button

### 9. **User Blocking** 🚫

#### Block User
- **API**: `POST /api/users/block`
- **Body**: `{ userId: string }`
- **Database**: `UserBlock` model
- **UI**: Block option in conversation dropdown menu
- **Effect**: Both users cannot send messages

#### Unblock User
- **API**: `DELETE /api/users/block?userId={id}`
- **UI**: Blocked users list (popup)
- **Effect**: Restores messaging capability

#### Blocked List
- **API**: `GET /api/users/block`
- **UI**: Shows all blocked users
- **Action**: Unblock button for each user

#### Two-way Block
- **Validation**: Checks both directions when sending message
- **Error**: "Nie możesz wysłać wiadomości do tego użytkownika"
- **Prevents**: Message sending if either user blocked the other

### 10. **User Information Popup** ℹ️
- **Trigger**: Click on avatar or "Informacje" in menu
- **Content**:
  - Avatar (120x120px)
  - Full name
  - Email address
  - Registration date
  - User description
  - Role (Klient / Kancelaria prawna)
- **Close**: Click outside or X button

### 11. **UI/UX Enhancements** ✨

#### 🎨 Smooth Animations
- **Library**: Framer Motion
- **Animations**:
  - Fade in/out for messages
  - Slide in from bottom for new messages
  - Bounce for typing indicator dots
  - Smooth transitions for tabs

#### 🖱️ Hover Effects
- **Conversations**: Background changes on hover
- **Action Buttons**: Appear on hover (Archive, Delete, Restore)
- **Attachments**: Border highlight on hover

#### 🎯 Active States
- **Selected Conversation**: Gray background highlight
- **Active Tab**: Blue underline indicator
- **Focused Input**: Border color change

#### 🔍 Live Search
- **Real-time**: Filters as you type
- **No debounce**: Instant results
- **Case-insensitive**: Matches partial names

### 12. **Performance Optimizations** ⚡

#### Debouncing
- **Typing Indicator**: 3-second timeout
- **Auto-clear**: Prevents spam to server

#### Lazy Loading
- **Messages**: Load 30 initially, 20 more on scroll
- **Reduces**: Initial load time and memory usage

#### Polling Optimization
- **Conversations**: 30-second interval
- **Typing**: 2-second interval
- **Online Status**: 30-second interval
- **Auto-cleanup**: Intervals cleared on unmount

## 📁 File Structure

### Backend (API Routes)
```
app/api/
├── conversations/
│   ├── route.ts                      # GET/POST conversations (with filter)
│   ├── [id]/
│   │   ├── route.ts                  # GET conversation details
│   │   ├── messages/route.ts         # GET/POST messages (encrypted, lazy loading)
│   │   └── read/route.ts             # PATCH mark as read
│   ├── archive/route.ts              # POST/DELETE archive/unarchive
│   ├── delete/route.ts               # POST/DELETE soft delete/restore
│   └── typing/route.ts               # POST/GET typing indicator
├── users/
│   ├── block/route.ts                # GET/POST/DELETE block users
│   └── online/route.ts               # POST/GET online status
└── upload/
    └── chat/route.ts                 # POST upload PDF attachments
```

### Frontend (Components)
```
components/messages/
├── EnhancedMessengerLayout.tsx       # Main layout with 3-tab support
├── EnhancedConversationList.tsx      # Conversation list with tabs
├── EnhancedChatArea.tsx              # Chat interface with all features
├── ConversationList.tsx              # Legacy (simple version)
├── ChatArea.tsx                      # Legacy (simple version)
└── MessengerLayout.tsx               # Legacy (simple version)
```

### Utilities
```
lib/
├── encryption.ts                     # AES-256-CBC encryption/decryption
├── prisma.ts                         # Prisma client singleton
└── utils.ts                          # cn() and other utilities
```

### Database Models
```
prisma/schema.prisma
├── Conversation                      # Conversations with archive/delete flags
├── ChatMessage                       # Encrypted messages with attachments
├── UserBlock                         # User blocking relationships
├── UserOnlineStatus                  # Online status tracking
└── TypingIndicator                   # Typing indicator state
```

## 🚀 Usage

### For Developers

#### 1. Install Dependencies
```bash
cd prosta-sprawa
npm install
```

Required packages:
- `emoji-picker-react` - Emoji picker
- `framer-motion` - Animations
- `date-fns` - Date formatting

#### 2. Setup Environment
Add to `.env`:
```env
ENCRYPTION_KEY="your-32-character-encryption-key-here"
```

#### 3. Push Database Schema
```bash
npm run db:push
npm run db:generate
```

#### 4. Use Enhanced Components

Replace in your message pages:

**Before:**
```tsx
import { MessengerLayout } from "@/components/messages/MessengerLayout"

export default function MessagesPage() {
  return <MessengerLayout />
}
```

**After:**
```tsx
import { EnhancedMessengerLayout } from "@/components/messages/EnhancedMessengerLayout"

export default function MessagesPage() {
  return <EnhancedMessengerLayout />
}
```

### For Users

#### Sending Messages
1. Select a conversation from the list
2. Type your message in the text area
3. (Optional) Click 📎 to attach a PDF file (max 5MB)
4. (Optional) Click 😊 to add emojis
5. Press **Enter** to send (or **Shift+Enter** for new line)
6. See status: ✓ Sent → ✓✓ Delivered → ✓✓ Read (blue)

#### Managing Conversations
- **Archive**: Click ⋮ → Archive → Moves to "Archiwum" tab
- **Delete**: Click ⋮ → Delete → Moves to "Usunięte" tab
- **Restore**: Click ↻ on archived/deleted conversation
- **Block User**: Click ⋮ → Block → Prevents messaging

#### Viewing Messages
- **Scroll up**: Load older messages (20 at a time)
- **Click avatar**: View user information
- **Download attachment**: Click PDF link in message

## 🔐 Security Features

### Encryption
- **Algorithm**: AES-256-CBC
- **Key**: 32-byte encryption key from environment variable
- **IV**: Unique random 16-byte IV per message
- **Storage**: Both encrypted content and IV stored in database
- **Automatic**: Transparent encryption/decryption

### User Privacy
- **Soft Delete**: Messages remain in database but hidden per user
- **Block Validation**: Server-side check prevents blocked users from messaging
- **Archive Privacy**: Archived status is per-user (not global)

### File Upload Security
- **Type Validation**: Only PDF files accepted
- **Size Limit**: 5MB maximum
- **Unique Filenames**: Timestamp + random string prevents conflicts
- **Secure Storage**: Files stored in `/public/uploads/chat/`

## 🎨 Customization

### Modify Colors
Edit in components:
```tsx
// Primary message bubble (your messages)
className="bg-primary text-primary-foreground"

// Secondary message bubble (other's messages)
className="bg-muted"

// Online indicator
className="bg-green-500"
```

### Adjust Polling Intervals
Edit in `EnhancedChatArea.tsx`:
```tsx
// Online status (default: 30s)
setInterval(checkOnlineStatus, 30000)

// Typing indicator (default: 2s)
setInterval(checkTyping, 2000)

// Conversations refresh (default: 30s)
setInterval(fetchAllConversations, 30000)
```

### Change Lazy Loading Limits
Edit in API route:
```tsx
// Initial load (default: 30)
const limit = parseInt(searchParams.get("limit") || "30")

// Load more (default: 20)
// Change in EnhancedChatArea.tsx offset increment
```

### Custom Notification Sound
Replace `/public/sounds/notification.mp3` with your own audio file.

## 🐛 Troubleshooting

### Encryption Errors
- **Error**: "Failed to decrypt message"
- **Solution**: Check `ENCRYPTION_KEY` in `.env` is correct and 32 characters

### Messages Not Loading
- **Error**: "Error fetching messages"
- **Solution**:
  1. Check database connection
  2. Verify user is authenticated
  3. Check user is participant in conversation

### File Upload Fails
- **Error**: "File is too large"
- **Solution**: File must be < 5MB
- **Error**: "Only PDF files allowed"
- **Solution**: Only upload PDF files

### Online Status Not Updating
- **Issue**: User shows offline when they're online
- **Solution**:
  1. Check `/api/users/online` endpoint is working
  2. Verify 60-second update interval is running
  3. Check browser console for errors

### Typing Indicator Not Showing
- **Issue**: Typing indicator doesn't appear
- **Solution**:
  1. Check typing indicator timeout (should be > 2 seconds)
  2. Verify `/api/conversations/typing` endpoint
  3. Check 2-second polling interval

## 📊 Performance Metrics

### Recommended Limits
- **Messages per conversation**: No hard limit (lazy loading handles performance)
- **Concurrent users**: Scales with server resources
- **Attachment size**: 5MB per file
- **Polling intervals**: 2-30 seconds (configurable)

### Optimization Tips
1. **Database Indexes**: Already added on frequently queried fields
2. **Message Pagination**: Use offset/limit for large conversations
3. **Encryption**: Cached keys for better performance
4. **Polling**: Adjust intervals based on user activity

## 🔄 Migration from Old Chat System

### Step-by-Step Migration
1. **Backup Database**: Always backup before migration
2. **Run Schema Updates**: `npm run db:push`
3. **Test Encryption**: Verify encryption works with test messages
4. **Update Components**: Replace old components with enhanced versions
5. **Monitor Errors**: Check logs for any decryption issues

### Backwards Compatibility
- **Old Messages**: System handles both encrypted and plain text
- **API**: Old endpoints still work, new features optional
- **Components**: Can use both old and new components simultaneously

## 📝 API Reference

### Quick Reference

#### Conversations
- `GET /api/conversations?filter={active|archived|deleted}` - List conversations
- `POST /api/conversations` - Create conversation
- `POST /api/conversations/archive` - Archive conversation
- `DELETE /api/conversations/archive?conversationId={id}` - Unarchive
- `POST /api/conversations/delete` - Soft delete conversation
- `DELETE /api/conversations/delete?conversationId={id}` - Restore
- `POST /api/conversations/typing` - Update typing indicator
- `GET /api/conversations/typing?conversationId={id}` - Check typing
- `PATCH /api/conversations/{id}/read` - Mark as read

#### Messages
- `GET /api/conversations/{id}/messages?limit=30&offset=0` - Get messages (decrypted)
- `POST /api/conversations/{id}/messages` - Send message (auto-encrypted)

#### Users
- `GET /api/users/block` - List blocked users
- `POST /api/users/block` - Block user
- `DELETE /api/users/block?userId={id}` - Unblock user
- `POST /api/users/online` - Update online status
- `GET /api/users/online?userId={id}` - Check online status

#### Uploads
- `POST /api/upload/chat` - Upload PDF attachment

## 🎯 Future Enhancements

### Potential Features
- [ ] WebSocket support for real-time updates (instead of polling)
- [ ] Voice messages
- [ ] Image attachments (in addition to PDFs)
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] Reply to specific messages
- [ ] Message search within conversation
- [ ] Export conversation as PDF
- [ ] Video call integration
- [ ] Read receipts with exact timestamp
- [ ] Message editing (with edit history)
- [ ] Message deletion (soft delete per message)

## 📄 License

This implementation is part of the Prosta Sprawa project.

## 👥 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check console logs for errors
4. Contact development team

---

**Created**: November 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
