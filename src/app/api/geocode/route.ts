import { NextResponse } from "next/server";

// Clean up raw OSM administrative names into standard real-estate terminology
function cleanCityName(rawCity: string, rawState: string): string {
  if (!rawCity) return "";
  let c = rawCity.replace(/\s+Taluka|\s+District|\s+Subdivision|\s+Municipal Corporation/gi, "").trim();
  if (c.toLowerCase() === "ahemedabad" || c.toLowerCase() === "maninagar" || c.toLowerCase() === "vejalpur") {
    return "Ahmedabad";
  }
  return c;
}

function cleanAreaName(rawArea: string, rawCity: string, rawDisplayName: string): string {
  const d = rawDisplayName.toLowerCase();
  if (d.includes("kankaria") || d.includes("transstadia")) return "Kankaria / Maninagar";
  if (d.includes("nikol")) return "Nikol";
  if (d.includes("satellite") || d.includes("ramdev nagar") || d.includes("shilp")) return "Satellite";
  if (d.includes("bodakdev") || d.includes("sg highway") || d.includes("mondeal")) return "SG Highway / Bodakdev";
  if (d.includes("prahlad nagar")) return "Prahlad Nagar";
  if (d.includes("bopal") || d.includes("ambli")) return "Ambli / Bopal";
  if (d.includes("gift")) return "GIFT City";
  if (d.includes("bkc") || d.includes("bandra")) return "BKC";
  if (d.includes("whitefield")) return "Whitefield";
  if (d.includes("cyber city") || d.includes("gurugram")) return "DLF Cyber City";

  if (!rawArea || rawArea.toLowerCase() === "sherkotda") {
    return cleanCityName(rawCity, "");
  }

  return rawArea;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQ = query.trim();
  const results: any[] = [];
  const seenPlaceKeys = new Set<string>();

  // 1. Query Live OpenStreetMap Nominatim Engine (Strictly Filtered to India: countrycodes=in)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQ
    )}&countrycodes=in&addressdetails=1&limit=8`;

    const nomRes = await fetch(nomUrl, {
      headers: {
        "User-Agent": "OfficeX-Commercial-Property-System/1.0",
        "Accept-Language": "en"
      },
      next: { revalidate: 3600 }
    });

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      for (const item of nomData) {
        const addr = item.address || {};
        
        // Extract real building / establishment name
        const name = item.name || cleanQ;

        // Clean city, state, area, pincode
        const rawCity = addr.city || addr.town || addr.municipality || addr.district || addr.county || "";
        const city = cleanCityName(rawCity, addr.state || "");
        const state = addr.state || "";
        const pincode = addr.postcode || "";
        const rawArea = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.commercial || "";
        const area = cleanAreaName(rawArea, city, item.display_name);

        const placeKey = `${name}-${city}-${area}`.toLowerCase();

        if (!seenPlaceKeys.has(placeKey)) {
          seenPlaceKeys.add(placeKey);
          
          const cleanDisplay = [name, area, city, state, pincode, "India"]
            .filter(Boolean)
            .filter((val, idx, arr) => arr.indexOf(val) === idx)
            .join(", ");

          results.push({
            id: `osm-${item.place_id || Math.random()}`,
            buildingName: name,
            displayName: cleanDisplay,
            area: area,
            city: city,
            state: state,
            pincode: pincode,
            fullAddress: cleanDisplay,
            metroDistance: "",
            latitude: item.lat ? parseFloat(item.lat) : null,
            longitude: item.lon ? parseFloat(item.lon) : null
          });
        }
      }
    }
  } catch (err) {
    console.warn("Live OSM Nominatim fetch failed:", err);
  }

  // 2. Query Live Photon Geocoding Engine (Filtered to India)
  if (results.length < 5) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        cleanQ
      )}&limit=8&lat=20.5937&lon=78.9629`;

      const photonRes = await fetch(photonUrl, {
        headers: { "Accept-Language": "en" },
        next: { revalidate: 3600 }
      });

      if (photonRes.ok) {
        const pData = await photonRes.json();
        if (pData?.features) {
          for (const feat of pData.features) {
            const props = feat.properties || {};
            
            if (props.countrycode && props.countrycode.toUpperCase() !== "IN") {
              continue;
            }

            const name = props.name || props.street || cleanQ;
            const rawCity = props.city || props.county || "";
            const city = cleanCityName(rawCity, props.state || "");
            const state = props.state || "";
            const pincode = props.postcode || "";
            const rawArea = props.district || props.suburb || props.locality || props.street || "";
            const area = cleanAreaName(rawArea, city, `${name} ${props.street || ""} ${rawArea}`);

            const placeKey = `${name}-${city}-${area}`.toLowerCase();

            if (!seenPlaceKeys.has(placeKey)) {
              seenPlaceKeys.add(placeKey);

              const cleanDisplay = [name, area, city, state, pincode, "India"]
                .filter(Boolean)
                .filter((val, idx, arr) => arr.indexOf(val) === idx)
                .join(", ");

              const coords = feat.geometry?.coordinates;
              results.push({
                id: `photon-${props.osm_id || Math.random()}`,
                buildingName: name,
                displayName: cleanDisplay,
                area: area,
                city: city,
                state: state,
                pincode: pincode,
                fullAddress: cleanDisplay,
                metroDistance: "",
                latitude: coords ? coords[1] : null,
                longitude: coords ? coords[0] : null
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Live Photon fetch failed:", err);
    }
  }

  // 3. Clean Fallback for unlisted properties
  if (results.length === 0) {
    const formattedTitle = cleanQ
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    results.push({
      id: `custom-manual-1`,
      buildingName: formattedTitle,
      displayName: `${formattedTitle} (Unlisted Property — Fill details manually below)`,
      area: "",
      city: "",
      state: "",
      pincode: "",
      fullAddress: "",
      metroDistance: ""
    });
  }

  return NextResponse.json({ results: results.slice(0, 8) });
}
