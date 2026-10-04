# Frontend ↔ Backend contracts

Source of truth today: TypeScript types under `src/types/`.

Backend DTOs should serialize to the **same JSON shape** (camelCase).

## `GET /api/home`

Frontend: `HomePageData` (`src/types/home.ts`)  
Backend: `HomePageDto` (`Modules/Merchandising/Application/Home/HomePageDto.cs`)  
Owner: **Merchandising**

| JSON field | Notes |
|------------|--------|
| `topBanner?` | Optional banner |
| `heroSlides` | `HomeBanner[]` |
| `categories` | Homepage circle strip (`HomeCategory`) |
| `amazingOffers` | `Product[]` — from Promotions + Catalog |
| `midBanners` | `HomeBanner[]` |
| `brands` | `Brand[]` — from Catalog |
| `productRails` | Rails with embedded `products` |
| `bottomBanners` | `HomeBanner[]` |

### Nested `Product` card

Frontend: `src/types/product.ts`  
Backend: `ProductCardDto`

| Field | Type |
|-------|------|
| `id`, `title`, `slug`, `imageUrl` | string |
| `brandId`, `brandName`, `brandLogoUrl?` | string |
| `sellerId`, `sellerName` | string |
| `price`, `originalPrice?` | `{ amount: number, currency: string }` |
| `discountPercent?`, `rating?`, `reviewCount?` | number |
| `badges?` | `("mixplus-choice" \| "opportunity")[]` |
| `condition?` | `"new" \| "used"` |
| `inStock` | boolean |

## `GET /api/nav`

Frontend: `MainNavData` (`src/types/nav.ts`)  
Backend: `MainNavDto` (`Modules/Navigation/Application/MainNavDto.cs`)  
Owner: **Navigation**

| JSON field | Notes |
|------------|--------|
| `categoryTriggerLabel` | string |
| `categories` | Mega-menu tree |
| `quickLinks` | Header / drawer quick links |
| `sellerCta` | `{ title, href }` |

`MegaMenuLink.kind` is `"parent"` or `"leaf"`.

## Auth (Identity)

| Endpoint | Body | Response |
|----------|------|----------|
| `POST /api/auth/otp/start` | `{ username }` | `{ challengeId, maskedDestination, expiresInSeconds, resendAvailableInSeconds, devCode? }` |
| `POST /api/auth/otp/resend` | `{ challengeId }` | same as start |
| `POST /api/auth/otp/verify` | `{ challengeId, code }` | `{ accessToken, expiresInSeconds, user }` |

SMS: `Sms:Provider=Mock` logs OTP (optional `Sms:MockFixedCode`). Swap provider later without changing the API.

## Planned (not implemented)

| Endpoint | Frontend trigger | Module |
|----------|------------------|--------|
| `GET /api/catalog/products/{slug}` | Product PDP | Catalog |
| `GET /api/search` | Search bar | Search |
| `GET /api/cart` | Cart icon | Cart |

## Compatibility checklist

When changing a DTO:

1. Update TypeScript type + mock in the frontend (or OpenAPI first, later)
2. Update backend DTO + mapping
3. Keep camelCase JSON
4. Prefer additive changes; avoid breaking homepage fields
