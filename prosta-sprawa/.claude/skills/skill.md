# SKILL.md - Automated Build & Health Checks

> Automated workflows and health checks for Prosta Sprawa development with Claude

**Last Updated:** 2025-11-16
**Repository:** ps-map
**Application:** `/prosta-sprawa/`

---

## Overview

This document defines automated skills and checks that Claude should perform to ensure the application remains in a healthy, buildable state at all times.

**Core Principle:** The application MUST always build successfully with `npm run dev`. Any changes that break the build MUST be fixed immediately before proceeding with other tasks.

---

## Pre-Task Checks

### 1. Build Verification

**Before making ANY code changes, verify the build works:**

```bash
cd /home/user/ps-map/prosta-sprawa
npm run dev
```

**Expected Outcome:**
- Build completes without errors
- Server starts on port 3000
- No TypeScript compilation errors
- No module resolution errors

**If Build Fails:**
1. Read the error output carefully
2. Identify the root cause
3. Fix the error immediately
4. Re-run build to verify fix
5. Only proceed with original task after build passes

---

## Post-Change Checks

### 2. Mandatory Build After Changes

**After EVERY code change, verify the build still works:**

```bash
# Kill existing dev server (Ctrl+C)
npm run dev
```

**What to Check:**
- ✅ No TypeScript errors
- ✅ No ESLint errors (warnings are OK)
- ✅ No missing module errors
- ✅ No Prisma schema errors
- ✅ Server starts successfully

**If Build Breaks:**
1. **STOP immediately** - do not continue with other changes
2. Revert last change OR fix the breaking change
3. Verify build works again
4. Document what broke and how it was fixed

---

## Common Build Errors & Auto-Fixes

### Error 1: TypeScript Type Errors

**Symptoms:**
```
Type 'X' is not assignable to type 'Y'
Property 'foo' does not exist on type 'Bar'
```

**Auto-Fix Strategy:**
1. Check if types need to be imported
2. Verify Prisma client is up to date: `npm run db:generate`
3. Check `types/next-auth.d.ts` for auth type extensions
4. Add proper type annotations
5. Use type assertions only as last resort

**Example Fix:**
```typescript
// Bad - causes type error
const user = await prisma.user.findUnique({ where: { id } })
const name = user.name // Error: user might be null

// Good - proper null check
const user = await prisma.user.findUnique({ where: { id } })
if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 })
}
const name = user.name // OK
```

### Error 2: Module Not Found

**Symptoms:**
```
Module not found: Can't resolve '@/components/...'
Module not found: Can't resolve '@prisma/client'
```

**Auto-Fix Strategy:**
1. Verify file exists at the path
2. Check for typos in import path
3. Ensure `@/` alias is used for absolute imports
4. Regenerate Prisma client if missing:
```bash
npm run db:generate
```

### Error 3: Prisma Schema Errors

**Symptoms:**
```
Error: Schema parsing error
Error: Unknown field
Prisma Client not initialized
```

**Auto-Fix Strategy:**
```bash
# 1. Validate schema
cd prosta-sprawa
npx prisma validate

# 2. Push schema changes
npm run db:push

# 3. Regenerate client
npm run db:generate

# 4. Restart dev server
npm run dev
```

### Error 4: Missing Environment Variables

**Symptoms:**
```
Error: NEXTAUTH_URL is not defined
Error: DATABASE_URL is not defined
```

**Auto-Fix Strategy:**
1. Check if `.env` file exists in `/prosta-sprawa/`
2. Verify required variables:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generated-secret-key"
```
3. Create `.env` if missing (copy from `.env.example` if available)

### Error 5: Port Already in Use

**Symptoms:**
```
Error: Port 3000 is already in use
```

**Auto-Fix Strategy:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use alternative port
PORT=3001 npm run dev
```

### Error 6: Client Component Errors

**Symptoms:**
```
Error: useState can only be used in Client Components
Error: useEffect can only be used in Client Components
```

**Auto-Fix Strategy:**
1. Add `"use client"` directive at top of file:
```typescript
"use client"

import { useState } from "react"

export function Component() {
  const [state, setState] = useState(false)
  // ...
}
```

2. Only add to components that need client features (hooks, events, browser APIs)

### Error 7: Import/Export Errors

**Symptoms:**
```
Error: Fast Refresh had to perform a full reload
Error: ... is not exported from ...
```

**Auto-Fix Strategy:**
1. Verify named exports match imports:
```typescript
// component.tsx
export function MyComponent() {} // Named export

// using-component.tsx
import { MyComponent } from "@/components/component" // Named import

// OR use default export
export default function MyComponent() {} // Default export
import MyComponent from "@/components/component" // Default import
```

---

## Automated Health Checks

### Database Health Check

**Run periodically or after schema changes:**

```bash
cd prosta-sprawa

# 1. Validate schema
npx prisma validate

# 2. Check if migrations needed
npx prisma migrate status

# 3. Verify database connection
npx prisma db pull --force
```

**Expected:** Schema is valid, database is accessible

### TypeScript Health Check

**Check for type errors without running dev server:**

```bash
cd prosta-sprawa
npx tsc --noEmit
```

**Expected:** No errors (0 errors found)

### Prisma Client Sync Check

**Ensure Prisma client matches schema:**

```bash
cd prosta-sprawa

# Regenerate if schema changed
npm run db:generate

# Push schema if database out of sync
npm run db:push
```

---

## Automated Workflows

### Workflow 1: After Schema Changes

**Trigger:** Any edit to `prisma/schema.prisma`

**Automated Steps:**
```bash
cd prosta-sprawa

# 1. Validate schema
npx prisma validate

# 2. Format schema
npx prisma format

# 3. Push to database
npm run db:push

# 4. Generate Prisma client
npm run db:generate

# 5. Verify build
npm run dev
```

### Workflow 2: After Installing Dependencies

**Trigger:** Any `npm install` command

**Automated Steps:**
```bash
cd prosta-sprawa

# 1. Clear cache
rm -rf .next

# 2. Regenerate Prisma client (might need new version)
npm run db:generate

# 3. Verify build
npm run dev
```

### Workflow 3: Before Committing

**Trigger:** Before running `git commit`

**Automated Steps:**
```bash
cd prosta-sprawa

# 1. Run type check
npx tsc --noEmit

# 2. Run linter
npm run lint

# 3. Test build
npm run build

# 4. Verify production build works
npm run start
```

### Workflow 4: After Creating New API Route

**Trigger:** New file in `app/api/*/route.ts`

**Automated Checks:**
1. Verify auth import: `import { auth } from "@/auth"`
2. Verify prisma import: `import { prisma } from "@/lib/prisma"`
3. Check error handling: try-catch block present
4. Verify return types: NextResponse used
5. Test endpoint manually or with curl

**Template Validation:**
```typescript
// Required structure for all API routes
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Route logic...

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Workflow 5: After Creating New Component

**Trigger:** New file in `components/`

**Automated Checks:**
1. Verify `"use client"` directive if needed
2. Check imports use `@/` alias
3. Verify TypeScript types defined
4. Check for proper error boundaries
5. Verify component exports correctly

---

## Build Monitoring

### Continuous Build Verification

**During Active Development:**

Keep dev server running in background and monitor for:
- Hot reload errors
- Fast refresh failures
- Runtime errors in browser console
- Network errors in network tab

**If Hot Reload Fails:**
1. Check terminal for error messages
2. Fix the error immediately
3. Hard refresh browser (Cmd/Ctrl + Shift + R)
4. If issues persist, restart dev server

### Performance Monitoring

**Watch for:**
- Build time > 10 seconds (investigate slow imports)
- Hot reload time > 2 seconds (check for circular dependencies)
- Memory usage > 1GB (check for memory leaks)

---

## Error Recovery Procedures

### Nuclear Option: Complete Reset

**When multiple errors compound and build is broken:**

```bash
cd prosta-sprawa

# 1. Kill all node processes
pkill -f node

# 2. Remove build artifacts
rm -rf .next
rm -rf node_modules
rm -rf prisma/dev.db

# 3. Reinstall dependencies
npm install

# 4. Recreate database
npm run db:push
npm run db:generate
npm run db:seed

# 5. Start fresh
npm run dev
```

**⚠️ WARNING:** Only use in development. Never in production.

### Prisma Client Issues

**If Prisma client becomes corrupted:**

```bash
cd prosta-sprawa

# 1. Remove generated client
rm -rf node_modules/@prisma/client
rm -rf node_modules/.prisma

# 2. Regenerate
npm run db:generate

# 3. Verify
npm run dev
```

### TypeScript Cache Issues

**If TypeScript shows phantom errors:**

```bash
cd prosta-sprawa

# 1. Remove TypeScript cache
rm -rf .next
rm tsconfig.tsbuildinfo

# 2. Restart dev server
npm run dev

# 3. Restart IDE/editor
```

---

## Best Practices for Claude

### 1. **Always Build First**
- Before making changes, ensure current code builds
- Establishes known-good baseline

### 2. **Incremental Changes**
- Make small, testable changes
- Build after each logical change
- Don't batch multiple risky changes

### 3. **Immediate Error Fixing**
- Fix build errors before continuing
- Don't accumulate technical debt
- Don't leave broken builds

### 4. **Verbose Logging**
- Log what you're doing
- Log errors with full context
- Log successful fixes

### 5. **Test in Browser**
- Build success ≠ runtime success
- Verify functionality in browser
- Check console for runtime errors

### 6. **Database Awareness**
- Schema changes need `db:push` and `db:generate`
- Always verify Prisma client is current
- Check for migration conflicts

### 7. **Session Management**
- Verify auth works after changes
- Test protected routes
- Check role-based access

---

## Automated Testing (Future)

### Unit Tests (When Implemented)

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### E2E Tests (When Implemented)

```bash
npm run e2e           # Run E2E tests
npm run e2e:headed    # Run with browser visible
```

---

## Troubleshooting Decision Tree

```
Build fails?
├─ TypeScript error?
│  ├─ Missing import? → Add import
│  ├─ Type mismatch? → Fix types
│  └─ Prisma types? → npm run db:generate
│
├─ Module not found?
│  ├─ Wrong path? → Fix import path
│  ├─ Missing file? → Create file
│  └─ Missing package? → npm install <package>
│
├─ Prisma error?
│  ├─ Schema invalid? → Fix schema.prisma
│  ├─ Client outdated? → npm run db:generate
│  └─ DB out of sync? → npm run db:push
│
├─ Runtime error?
│  ├─ Client/Server mismatch? → Add "use client"
│  ├─ Null reference? → Add null check
│  └─ Auth error? → Check session handling
│
└─ Unknown error?
   ├─ Clear cache → rm -rf .next
   ├─ Reinstall deps → rm -rf node_modules && npm install
   └─ Nuclear reset → See Error Recovery section
```

---

## Quick Command Reference

### Essential Commands (Memorize These)

```bash
# Build & Run
npm run dev              # Start development (MOST IMPORTANT)
npm run build           # Production build
npm run start           # Production server

# Database
npm run db:push         # Push schema to database
npm run db:generate     # Regenerate Prisma client
npm run db:studio       # Open database GUI

# Checks
npx tsc --noEmit       # Type check without build
npm run lint           # Lint check
npx prisma validate    # Validate schema

# Emergency
pkill -f node          # Kill all Node processes
rm -rf .next           # Clear build cache
```

---

## Success Criteria

### Green Build Checklist

Before considering any task complete:

- [x] `npm run dev` builds without errors
- [x] No TypeScript errors (`npx tsc --noEmit`)
- [x] No console errors in browser
- [x] Hot reload works correctly
- [x] Changed functionality tested manually
- [x] Database schema in sync (if changed)
- [x] Auth still works (if auth-related changes)
- [x] No orphaned files or unused imports
- [x] Code follows existing patterns
- [x] Polish language preserved in UI

---

## Integration with Git Workflow

### Pre-Commit Verification

Before committing:
```bash
# 1. Ensure build works
npm run dev

# 2. Type check
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Test build
npm run build
```

Only commit if all pass.

### Pre-Push Verification

Before pushing to remote:
```bash
# Full production build
npm run build
npm run start

# Verify in browser at http://localhost:3000
```

---

## Monitoring & Alerts

### What to Watch For

**During Development:**
- ⚠️ Build time increasing → Investigate dependencies
- ⚠️ Memory usage growing → Check for leaks
- ⚠️ Frequent hot reload failures → Fix immediately
- ⚠️ Console warnings accumulating → Clean up

**Red Flags (STOP IMMEDIATELY):**
- 🔴 Build fails after change
- 🔴 TypeScript errors appear
- 🔴 Prisma client out of sync
- 🔴 Auth stops working
- 🔴 Database connection lost

---

## Claude's Automated Response Patterns

### Pattern 1: After Every Code Change

```
1. Save file
2. Check terminal for build errors
3. If error: Fix immediately
4. If success: Continue
```

### Pattern 2: When Build Fails

```
1. Read error carefully
2. Identify root cause
3. Apply fix from "Common Errors" section
4. Verify fix works
5. Document what broke
```

### Pattern 3: Before Marking Task Complete

```
1. Run npm run dev
2. Test in browser
3. Check console
4. Verify database if applicable
5. Confirm no regressions
```

---

## Additional Automated Checks

### Code Quality Checks

**Before committing:**
1. Remove all `console.log` statements (except intentional logging)
2. Remove commented-out code
3. Remove unused imports
4. Format code consistently
5. Check for hardcoded values that should be env vars

### Security Checks

**For sensitive changes:**
1. Verify no secrets in code
2. Check .env not committed
3. Verify API routes have auth
4. Check for SQL injection vulnerabilities
5. Verify XSS protection on user inputs

### Performance Checks

**For new features:**
1. Check for N+1 queries
2. Verify indexes exist for queried fields
3. Check for unnecessary re-renders
4. Verify images optimized
5. Check bundle size didn't balloon

---

## Summary

**Golden Rule:** The application MUST build successfully at all times. Any change that breaks the build must be fixed immediately before proceeding.

**Core Skills:**
1. Always verify build before and after changes
2. Fix errors immediately when they appear
3. Use automated workflows for common tasks
4. Follow established patterns and conventions
5. Test thoroughly before considering task complete

**Remember:** A green build is not optional—it's mandatory.

---

**End of SKILL.md**

This file should be referenced for all automated checks and build verification workflows.