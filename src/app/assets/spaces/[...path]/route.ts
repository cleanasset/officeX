import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CLOUDINARY_BASE = "https://res.cloudinary.com/myhq/image/upload";

function serveFallback() {
  try {
    const fallbackPath = path.join(process.cwd(), "public", "images", "showcase_commercial_warmshell.jpg");
    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "X-Asset-Origin": "OfficeX-Storage-Fallback"
        }
      });
    }
  } catch (err) {
    console.error("Failed to load local fallback image:", err);
  }
  return new NextResponse(null, { status: 404 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathParts = resolvedParams?.path;

    if (!pathParts || pathParts.length === 0) {
      return serveFallback();
    }

    const rawSubPath = Array.isArray(pathParts) ? pathParts.join("/") : String(pathParts);
    // Securely map sanitized client slugs back to upstream Cloudinary storage
    const upstreamSubPath = rawSubPath.replace(/officex-/g, "myhq-");

    const upstreamUrl = `${CLOUDINARY_BASE}/${upstreamSubPath}`;

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
      // Cache server-side
      next: { revalidate: 60 * 60 * 24 * 30 }
    });

    if (!upstreamRes.ok) {
      return serveFallback();
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const buffer = await upstreamRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Asset-Origin": "OfficeX-Secure-Media"
      }
    });
  } catch (err) {
    console.warn("Marketplace image proxy exception, serving fallback:", err);
    return serveFallback();
  }
}

