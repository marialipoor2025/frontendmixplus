import { siteConfig } from "@/config/site";
import { getAdminAccessToken } from "@/lib/admin/session";
import { getAccessToken } from "@/lib/auth/session";

export type MediaVariantDto = {
  key: string;
  url: string;
  width: number;
  height: number;
  byteSize: number;
};

export type MediaAssetDto = {
  id: string;
  originalFileName: string;
  contentType: string;
  variants: MediaVariantDto[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

/** Upload image to Media module; returns pre-generated variants. */
export async function uploadMediaAsset(file: File): Promise<MediaAssetDto> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const objectUrl = URL.createObjectURL(file);
    return {
      id: `mock-${Date.now()}`,
      originalFileName: file.name,
      contentType: file.type || "image/jpeg",
      variants: [
        {
          key: "original",
          url: objectUrl,
          width: 1200,
          height: 1200,
          byteSize: file.size,
        },
        {
          key: "gallery",
          url: objectUrl,
          width: 800,
          height: 800,
          byteSize: file.size,
        },
        {
          key: "card",
          url: objectUrl,
          width: 320,
          height: 320,
          byteSize: Math.round(file.size * 0.4),
        },
        {
          key: "thumb",
          url: objectUrl,
          width: 120,
          height: 120,
          byteSize: Math.round(file.size * 0.15),
        },
      ],
    };
  }

  const form = new FormData();
  form.append("file", file);

  const token = getAdminAccessToken() ?? getAccessToken();
  const response = await fetch(`${apiBase()}/api/media/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  const asset = (await response.json()) as MediaAssetDto;
  return {
    ...asset,
    variants: asset.variants.map((v) => ({
      ...v,
      url: v.url.startsWith("http") ? v.url : `${apiBase()}${v.url}`,
    })),
  };
}

export function pickVariantUrl(
  asset: MediaAssetDto,
  key: "thumb" | "card" | "gallery" | "original" = "card",
): string {
  return (
    asset.variants.find((v) => v.key === key)?.url ??
    asset.variants[0]?.url ??
    ""
  );
}
