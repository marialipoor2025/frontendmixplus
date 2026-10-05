# Media storage

## Approach (common marketplace pattern)

1. **Binaries on local disk** under `Media:RootPath` (not in PostgreSQL).
2. **Metadata in DB** (`media` schema): asset id, original name, content type, relative folder, variant keys/sizes.
3. **On upload**, ImageSharp generates presets once: `original`, `thumb` (120), `card` (320), `gallery` (800). Later requests serve the ready files.
4. **URLs**: `GET /api/media/{id}/{variant}` (e.g. `card`).

## Next.js role

- Product/admin UI uploads via `POST /api/media/upload` (multipart `file`).
- Display with `next/image` pointing at the API variant URLs (or rewrite `/media/*` → API).
- Do **not** rely on Next.js on-the-fly resize as the source of truth for catalog images; pre-generated variants are faster and predictable.

## Later

- Swap `ILocalMediaStorage` for S3/MinIO without changing Catalog contracts.
- Harden upload auth (admin-only) once admin session is enforced.
