import { NextRequest, NextResponse } from "next/server";

// Normalizes any incoming city, town, or region name to an OfficeX primary hub
function mapToOfficeXCity(rawCity: string, rawRegion: string = ""): string {
  if (!rawCity && !rawRegion) return "Ahmedabad"; // Default fallback
  const c = (rawCity || "").toLowerCase().trim();
  const r = (rawRegion || "").toLowerCase().trim();

  // 1. Ahmedabad & Gandhinagar (Gujarat)
  if (
    c.includes("ahmedabad") ||
    c.includes("ahemedabad") ||
    c.includes("gandhinagar") ||
    c.includes("gift") ||
    c.includes("sanand") ||
    c.includes("bavla") ||
    c.includes("kalol") ||
    c.includes("vadodara") ||
    c.includes("surat") ||
    c.includes("rajkot") ||
    r === "gj" ||
    r.includes("gujarat")
  ) {
    return "Ahmedabad";
  }

  // 2. Delhi NCR
  if (
    c.includes("delhi") ||
    c.includes("gurgaon") ||
    c.includes("gurugram") ||
    c.includes("noida") ||
    c.includes("faridabad") ||
    c.includes("ghaziabad") ||
    c.includes("manesar") ||
    c.includes("kundli") ||
    r === "dl" ||
    r.includes("delhi")
  ) {
    return "Delhi";
  }

  // 3. Mumbai MMR
  if (
    c.includes("mumbai") ||
    c.includes("bombay") ||
    c.includes("thane") ||
    c.includes("navi mumbai") ||
    c.includes("kalyan") ||
    c.includes("dombivli") ||
    c.includes("vasai") ||
    c.includes("virar") ||
    c.includes("panvel")
  ) {
    return "Mumbai";
  }

  // 4. Bengaluru
  if (
    c.includes("bengaluru") ||
    c.includes("bangalore") ||
    c.includes("whitefield") ||
    c.includes("hosur") ||
    r === "ka" ||
    r.includes("karnataka")
  ) {
    return "Bengaluru";
  }

  // 5. Pune
  if (c.includes("pune") || c.includes("poona") || c.includes("pimpri") || c.includes("chinchwad") || c.includes("hinjewadi")) {
    return "Pune";
  }

  // 6. Hyderabad
  if (c.includes("hyderabad") || c.includes("secunderabad") || c.includes("cyberabad") || r === "tg" || r.includes("telangana")) {
    return "Hyderabad";
  }

  // If outside these cities but in Maharashtra
  if (r === "mh" || r.includes("maharashtra")) {
    return "Mumbai";
  }

  return "Ahmedabad"; // Safe default
}

export async function GET(request: NextRequest) {
  try {
    // 1. Try Vercel Server Edge Geolocation Headers (Zero network latency, 100% server-side)
    const vercelCity = request.headers.get("x-vercel-ip-city");
    const vercelRegion = request.headers.get("x-vercel-ip-country-region");
    const vercelCountry = request.headers.get("x-vercel-ip-country");

    if (vercelCity) {
      const decodedCity = decodeURIComponent(vercelCity);
      const matchedCity = mapToOfficeXCity(decodedCity, vercelRegion || "");
      return NextResponse.json({
        success: true,
        source: "vercel_edge",
        rawCity: decodedCity,
        region: vercelRegion || null,
        country: vercelCountry || "IN",
        city: matchedCity,
      });
    }

    // 2. Try Cloudflare Geo Headers (if deployed behind CF)
    const cfCity = request.headers.get("cf-ipcity");
    const cfRegion = request.headers.get("cf-region");
    const cfCountry = request.headers.get("cf-ipcountry");

    if (cfCity) {
      const matchedCity = mapToOfficeXCity(cfCity, cfRegion || "");
      return NextResponse.json({
        success: true,
        source: "cloudflare_edge",
        rawCity: cfCity,
        region: cfRegion || null,
        country: cfCountry || "IN",
        city: matchedCity,
      });
    }

    // 3. Fallback: Extract Client IP from Headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    let clientIp = "";

    if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }

    // If running in development (localhost / private IPs 127.0.0.1, ::1, 192.168.x.x, 10.x.x.x)
    const isPrivateIp =
      !clientIp ||
      clientIp === "::1" ||
      clientIp === "127.0.0.1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.16.");

    if (isPrivateIp) {
      // In local dev, query public IP service to detect developer's actual real internet location
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json", {
          signal: controller.signal,
          headers: { "User-Agent": "OfficeX-Geo-Detector/1.0" },
        });
        clearTimeout(timeout);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const rawCity = geoData.city || "";
          const rawRegion = geoData.region || "";
          const matchedCity = mapToOfficeXCity(rawCity, rawRegion);
          return NextResponse.json({
            success: true,
            source: "geojs_lookup",
            rawCity,
            region: rawRegion,
            country: geoData.country || "IN",
            city: matchedCity,
          });
        }
      } catch {
        // Fallback silently if offline or request aborted
      }
    } else {
      // External IP lookup for the client's public IP
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const geoRes = await fetch(`https://ipwho.is/${clientIp}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.success) {
            const rawCity = geoData.city || "";
            const rawRegion = geoData.region || geoData.region_code || "";
            const matchedCity = mapToOfficeXCity(rawCity, rawRegion);
            return NextResponse.json({
              success: true,
              source: "ipwhois_lookup",
              rawCity,
              region: rawRegion,
              country: geoData.country || "IN",
              city: matchedCity,
            });
          }
        }
      } catch {
        // Fallback silently
      }
    }

    // Default safe fallback
    return NextResponse.json({
      success: true,
      source: "default",
      city: "Ahmedabad",
      rawCity: "Ahmedabad",
      country: "IN",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Location detection failed",
      city: "Ahmedabad",
    });
  }
}
