# Cache Management Guide

This document describes the cache management system for Next.js fetch caching in the Gigsberg application.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [How Next.js Cache Works](#how-nextjs-cache-works)
- [Debugging & Monitoring](#debugging--monitoring)

---

## Overview

The application uses Next.js's built-in fetch cache with custom cache tags for granular control. Cache files are stored in `.next/cache/fetch-cache/` and can be managed via API endpoints.

### Cache Tags Used

Common cache tags in the application:

- `carousel:all` - Homepage carousel/slider data
- `carousel:{domain}` - Domain-specific carousel
- `countries:all` - Countries list
- `currencies:all` - Currencies list
- `states:all` - States list
- `popular-performers:all` - Popular performers
- `performer-events:all:{domain}` - All events for performers on domain
- `home-page-events:{countryId}` - Homepage events by country
- `event-details:{id}:{action}` - Event details cache

---

## API Endpoints

### 1. List All Cache Tags

**GET** `/api/cache/list`

Lists all cached tags and entries.

```bash
curl http://localhost:3000/api/cache/list
```

**Response:**
```json
{
  "success": true,
  "totalEntries": 6,
  "totalTags": 5,
  "tags": [
    "carousel:all",
    "countries:all",
    "currencies:all"
  ],
  "entries": [
    {
      "file": "abc123...",
      "tags": ["countries:all"],
      "revalidate": 2592000
    }
  ]
}
```

---

### 2. View Cache by Tag

**GET** `/api/cache/view/{tag}`

View cached data for a specific tag including file age and staleness.

```bash
curl http://localhost:3000/api/cache/view/countries:all
```

**Response (when found):**
```json
{
  "success": true,
  "tag": "countries:all",
  "file": "abc123...",
  "tags": ["countries:all"],
  "revalidate": 2592000,
  "fileModifiedAt": "2025-12-09T12:00:00.000Z",
  "ageInSeconds": 3600,
  "isStale": false,
  "data": {
    // Decoded cached data
  }
}
```

**Response (when not found):**
```json
{
  "success": false,
  "message": "No cache found with tag: countries:all",
  "availableTags": ["carousel:all", "currencies:all"]
}
```

---

### 3. Invalidate Cache (Mark for Revalidation)

**GET** `/api/invalidate/tag/{tag}`

Marks cache for revalidation using Next.js's `revalidateTag()`. The cache file remains until the next request.

```bash
curl http://localhost:3000/api/invalidate/tag/countries:all
```

**Response:**
```json
{
  "success": true,
  "invalidated": "countries:all",
  "deleted": false,
  "filesDeleted": 0
}
```

---

### 4. Invalidate + Delete Cache

**GET** `/api/invalidate/tag/{tag}?delete=true`

Marks cache for revalidation AND physically deletes the cache file immediately.

```bash
curl "http://localhost:3000/api/invalidate/tag/countries:all?delete=true"
```

**Response:**
```json
{
  "success": true,
  "invalidated": "countries:all",
  "deleted": true,
  "filesDeleted": 1,
  "files": ["abc123..."]
}
```

---

### 5. Delete Cache Only

**GET** `/api/cache/delete/{tag}`

Physically deletes cache files without Next.js revalidation.

```bash
curl http://localhost:3000/api/cache/delete/countries:all
```

**Response:**
```json
{
  "success": true,
  "deleted": "countries:all",
  "filesDeleted": 1,
  "files": ["abc123..."]
}
```

---

### 6. Clear All Cache

**GET** `/api/cache/clear-all`

Deletes ALL cache files at once. Useful for clearing the entire cache during development or deployment.

```bash
curl http://localhost:3000/api/cache/clear-all
```

**Response:**
```json
{
  "success": true,
  "message": "All cache cleared successfully",
  "filesDeleted": 15,
  "tagsCleared": [
    "carousel:all",
    "countries:all",
    "currencies:all",
    "states:all"
  ],
  "totalTags": 4,
  "errors": 0,
  "files": ["abc123...", "def456..."]
}
```

**Response (when no cache exists):**
```json
{
  "success": true,
  "message": "No cache files found to delete",
  "filesDeleted": 0,
  "tagsCleared": [],
  "totalTags": 0
}
```

---

### 7. Clear Cache by Keyword

**GET** `/api/cache/clear-by-keyword/{keyword}`

Deletes all cache files where ANY tag contains the specified keyword (case-insensitive). Useful for clearing related cache entries.

```bash
curl http://localhost:3000/api/cache/clear-by-keyword/paris
```

**Example:** Using keyword "paris" will delete cache entries with tags like:
- `paris-saint-germain`
- `fc-paris`
- `event:paris:123`
- Any other tag containing "paris"

**Response (when matches found):**
```json
{
  "success": true,
  "keyword": "paris",
  "message": "Cleared cache entries containing keyword: \"paris\"",
  "filesDeleted": 5,
  "matchedTags": [
    "event:paris:123",
    "fc-paris",
    "paris-saint-germain"
  ],
  "totalMatchedTags": 3,
  "errors": 0,
  "files": ["abc123...", "def456..."]
}
```

**Response (when no matches):**
```json
{
  "success": false,
  "keyword": "paris",
  "message": "No cache files found containing keyword: \"paris\"",
  "filesDeleted": 0,
  "matchedTags": [],
  "totalMatchedTags": 0
}
```

---

## Usage Examples

### Example 1: Check Current Cache

```bash
# List all cached tags
curl http://localhost:3000/api/cache/list | jq '.tags'

# View specific cache data
curl http://localhost:3000/api/cache/view/carousel:all | jq '{fileModifiedAt, ageInSeconds, isStale}'
```

### Example 2: Standard Invalidation (Next.js Way)

```bash
# Mark cache as stale - file stays until next request
curl http://localhost:3000/api/invalidate/tag/carousel:all

# Visit page that uses carousel - fresh data fetched and cache updated
# Then check cache again - timestamp will be fresh
curl http://localhost:3000/api/cache/view/carousel:all | jq '.fileModifiedAt'
```

### Example 3: Force Delete Cache

```bash
# Delete cache file immediately
curl "http://localhost:3000/api/invalidate/tag/carousel:all?delete=true"

# Verify it's gone
curl http://localhost:3000/api/cache/view/carousel:all
# Response: "No cache found with tag: carousel:all"
```

### Example 4: Batch Invalidation

```bash
# Invalidate multiple caches
for tag in carousel:all countries:all states:all; do
  curl "http://localhost:3000/api/invalidate/tag/$tag?delete=true"
done
```

### Example 5: Clear All Cache

```bash
# Clear all cache files at once
curl http://localhost:3000/api/cache/clear-all

# Verify all cache is gone
curl http://localhost:3000/api/cache/list
# Response: "totalEntries": 0
```

### Example 6: Clear Cache by Keyword

```bash
# Clear all cache entries containing "paris"
curl http://localhost:3000/api/cache/clear-by-keyword/paris

# Response shows all matched tags
# {
#   "matchedTags": ["paris-saint-germain", "fc-paris", "event:paris:123"],
#   "filesDeleted": 5
# }

# List remaining cache to verify
curl http://localhost:3000/api/cache/list | jq '.tags'
```

---

## How Next.js Cache Works

### Important Understanding

**Next.js uses "lazy revalidation"** - cache files are not deleted immediately when invalidated.

```
❌ WRONG: revalidateTag() → Delete cache file
✅ RIGHT: revalidateTag() → Mark for refresh → Next request updates file
```

### The Standard Flow

1. **Call invalidate**: `curl /api/invalidate/tag/countries:all`
   - Marks cache as stale internally in Next.js
   - File still exists on disk

2. **Make a request that uses the data**: Visit a page or API that fetches countries
   - Next.js sees cache is marked for revalidation
   - Fetches fresh data from API
   - **Updates the cache file** with new data + new timestamp

3. **Subsequent requests**: Use the fresh cache until next invalidation

### Why This Design?

- **Resource efficiency**: Don't fetch data that may never be requested again
- **Optimal for SSR**: Cache updates happen naturally during page rendering
- **No wasted API calls**: Only fetch fresh data when someone needs it

### When to Use Each Method

| Method | Use Case |
|--------|----------|
| Standard invalidate | Production - let Next.js handle updates naturally |
| Invalidate + delete | Development - see changes immediately without waiting |
| Delete only | Troubleshooting - remove corrupt cache without triggering revalidation |
| Clear all | Development/Deployment - fresh start by clearing entire cache |
| Clear by keyword | Bulk deletion - clear related cache entries (e.g., all "paris" events) |

---

## Debugging & Monitoring

### Console Logging

The application includes console logging for cache operations:

**Cache invalidation:**
```
🗑️  Invalidating cache for tag: carousel:all at 2025-12-09T12:00:00.000Z
✅ Cache invalidated successfully for tag: carousel:all
🗑️  Also deleting cache files for tag: carousel:all
✅ Deleted cache file: abc123...
✅ Deleted 1 cache file(s)
```

**Cache viewing:**
```
🔍 Looking for cache with tag: carousel:all at 2025-12-09T12:00:00.000Z
✅ Found cache for tag: carousel:all
📊 Cache age: 3600s, Revalidate: 86400s, Stale: false
```

**Data fetching:**
```
🔄 Fetching carousel at: 2025-12-09T12:00:00.000Z
✅ Got 10 slides

🔄 Fetching countries at: 2025-12-09T12:00:00.000Z
✅ Got 250 countries

🔄 Fetching states at: 2025-12-09T12:00:00.000Z
✅ Got 51 states
```

### Monitoring Cache Behavior

**Test if cache is working:**

```bash
# 1. Visit page - should see fetch log
curl http://localhost:3000/

# Console: "🔄 Fetching carousel at: ..."

# 2. Visit again - NO log (cached)
curl http://localhost:3000/

# Console: (no output - using cache)

# 3. Invalidate with delete
curl "http://localhost:3000/api/invalidate/tag/carousel:all?delete=true"

# 4. Visit page - fetch log appears again
curl http://localhost:3000/

# Console: "🔄 Fetching carousel at: ..." (fresh fetch)
```

### Cache Inspector Script

A bash script is available at `/tmp/cache-viewer.sh` for local debugging:

```bash
# List all cache tags
bash /tmp/cache-viewer.sh

# View specific cache data
bash /tmp/cache-viewer.sh "carousel:all"
```

---

## Cache Configuration

Cache durations are defined in `src/constants/cache.ts`:

```typescript
const Cache = {
  HOUR: 3600,        // 1 hour
  DAY: 86400,        // 24 hours
  WEEK: 604800,      // 7 days
  MAX: 2592000,      // 30 days
};
```

### Modifying Cache Tags

To add cache tags to a new API call:

```typescript
import Cache from '@/constants/cache';

export const myApi = {
  async getData() {
    return apiService.get(endpoint, {
      next: {
        revalidate: Cache.DAY,
        tags: ['my-data:all', 'my-data:specific'],
      },
      cache: 'force-cache',
    });
  },
};
```

Then you can invalidate with:
```bash
curl "http://localhost:3000/api/invalidate/tag/my-data:all?delete=true"
```

---

## Troubleshooting

### Cache not invalidating

**Problem**: Called invalidate but still seeing old data.

**Solution**: Use `?delete=true` to force immediate deletion:
```bash
curl "http://localhost:3000/api/invalidate/tag/carousel:all?delete=true"
```

### Cache file not updating

**Problem**: Invalidated cache but file timestamp hasn't changed.

**Solution**: You must visit a page that uses that data to trigger the fetch:
```bash
# 1. Invalidate
curl http://localhost:3000/api/invalidate/tag/countries:all

# 2. Trigger fetch by visiting page that needs countries
curl http://localhost:3000/  # or whatever page loads countries

# 3. Check cache - timestamp should be fresh now
curl http://localhost:3000/api/cache/view/countries:all | jq '.fileModifiedAt'
```

### Can't find cache tag

**Problem**: Don't know what tag to use.

**Solution**: List all available tags:
```bash
curl http://localhost:3000/api/cache/list | jq '.tags'
```

### Cache file is stale but still being used

**Problem**: `isStale: true` but data hasn't refreshed.

**Explanation**: Next.js serves stale cache while revalidating in background. This is called "stale-while-revalidate" and is intentional for better performance.

**Solution**: Use `?delete=true` if you need immediate fresh data:
```bash
curl "http://localhost:3000/api/invalidate/tag/carousel:all?delete=true"
```

---

## Production Deployment

### Recommended Invalidation Strategy

1. **Content updates**: Use standard invalidation (no delete)
   ```bash
   curl https://yoursite.com/api/invalidate/tag/carousel:all
   ```

2. **Emergency fixes**: Use delete for immediate effect
   ```bash
   curl "https://yoursite.com/api/invalidate/tag/carousel:all?delete=true"
   ```

3. **Scheduled refreshes**: Set up cron jobs to invalidate periodically
   ```bash
   # Every hour
   0 * * * * curl https://yoursite.com/api/invalidate/tag/popular-performers:all
   ```

### Security Considerations

**Important**: These cache management endpoints are currently unprotected. For production, you should:

1. Add authentication:
   ```typescript
   export async function GET(request: Request) {
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CACHE_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     // ... rest of code
   }
   ```

2. Or restrict by IP:
   ```typescript
   const allowedIPs = ['127.0.0.1', '::1'];
   const clientIP = request.headers.get('x-forwarded-for');
   if (!allowedIPs.includes(clientIP)) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }
   ```

3. Or remove from production and only use in development

---

## Summary

### Quick Reference

```bash
# List caches
curl /api/cache/list

# View cache
curl /api/cache/view/{tag}

# Invalidate only (Next.js default)
curl /api/invalidate/tag/{tag}

# Invalidate + delete immediately
curl "/api/invalidate/tag/{tag}?delete=true"

# Delete only
curl /api/cache/delete/{tag}

# Clear all cache
curl /api/cache/clear-all

# Clear by keyword (case-insensitive)
curl /api/cache/clear-by-keyword/{keyword}
```

### Key Points

✅ Cache files are stored in `.next/cache/fetch-cache/`
✅ Standard invalidation marks cache stale but keeps file
✅ Use `?delete=true` for immediate deletion
✅ Cache updates happen on next request that needs the data
✅ Console logs show fetch activity and cache operations
✅ All responses include detailed metadata (age, staleness, etc.)

---

For questions or issues, check the console logs or use the cache viewer endpoints to inspect cache state.
