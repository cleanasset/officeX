import { NextResponse } from "next/server";

// Clean administrative words from addresses for clean Google Maps-style output
function cleanAddressSegment(str: string): string {
  if (!str) return "";
  return str
    .replace(/\b(?:[A-Z]\/[A-Z]\s*Ward|[A-Z]\s*Ward|Zone\s*\d+|Taluka|Subdivision|City Corporation|District|Suburban District|Urban District|Tehsil|Prefecture)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Normalize city names
function cleanCityName(rawCity: string, rawState: string): string {
  if (!rawCity) return "";
  let c = rawCity.replace(/\s+Taluka|\s+District|\s+Subdivision|\s+Municipal Corporation|\s+Tehsil|\s+Urban|\s+Rural/gi, "").trim();
  const lower = c.toLowerCase();
  if (lower.includes("ahmedabad") || lower === "ahemedabad" || lower === "maninagar" || lower === "vejalpur") return "Ahmedabad";
  if (lower === "bombay" || lower.includes("mumbai")) return "Mumbai";
  if (lower.includes("bangalore") || lower.includes("bengaluru")) return "Bengaluru";
  if (lower === "calcutta" || lower.includes("kolkata")) return "Kolkata";
  if (lower === "madras" || lower.includes("chennai")) return "Chennai";
  if (lower.includes("gurgaon") || lower.includes("gurugram")) return "Gurugram";
  if (lower.includes("hyderabad") || lower.includes("secunderabad") || lower.includes("cyberabad")) return "Hyderabad";
  if (lower.includes("delhi")) return "New Delhi";
  if (lower.includes("pune") || lower === "poona") return "Pune";
  if (lower.includes("noida")) return lower.includes("greater") ? "Greater Noida" : "Noida";
  return c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const targetCity = (searchParams.get("city") || "").trim();
  const targetState = (searchParams.get("state") || "").trim();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Reverse Geocoding if coordinates are provided
  if (lat && lon) {
    // If Google Maps API key is configured, use official Google Reverse Geocoding
    if (googleApiKey) {
      try {
        const gRevUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lon)}&key=${googleApiKey}`;
        const gRes = await fetch(gRevUrl);
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.results && gData.results.length > 0) {
            const first = gData.results[0];
            let city = "";
            let state = "";
            let pincode = "";
            let country = "";

            for (const comp of first.address_components || []) {
              const types = comp.types || [];
              if (types.includes("locality")) city = comp.long_name;
              else if (!city && types.includes("administrative_area_level_2")) city = comp.long_name;
              if (types.includes("administrative_area_level_1")) state = comp.long_name;
              if (types.includes("postal_code")) pincode = comp.long_name;
              if (types.includes("country")) country = comp.long_name;
            }

            return NextResponse.json({
              results: [{
                id: `g-rev-${first.place_id || Date.now()}`,
                buildingName: first.address_components?.[0]?.long_name || "Current Location",
                displayName: first.formatted_address,
                area: city,
                city: city,
                state: state,
                pincode: pincode,
                fullAddress: first.formatted_address,
                metroDistance: "",
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
              }]
            });
          }
        }
      } catch (err) {
        console.warn("Google Reverse Geocode failed:", err);
      }
    }

    // Worldwide OSM Reverse Geocoding Fallback
    try {
      const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
      const revRes = await fetch(revUrl, {
        headers: {
          "User-Agent": "OfficeX-Global-Commercial-System/1.0",
          "Accept-Language": "en"
        },
        next: { revalidate: 3600 }
      });
      if (revRes.ok) {
        const item = await revRes.json();
        const addr = item.address || {};
        const rawCity = addr.city || addr.town || addr.municipality || addr.district || addr.county || "";
        const city = cleanCityName(rawCity, addr.state || "");
        const state = addr.state || "";
        const pincode = addr.postcode || "";
        const road = addr.road || addr.street || "";
        const suburb = cleanAddressSegment(addr.suburb || addr.neighbourhood || addr.quarter || addr.commercial || "");
        const name = item.name || road || suburb || "Current Location";

        const cleanParts = [name, road, suburb, city, state, pincode]
          .map(s => s?.trim())
          .filter(Boolean)
          .filter((val, idx, arr) => arr.indexOf(val) === idx);

        const cleanDisplay = cleanParts.join(", ");

        return NextResponse.json({
          results: [{
            id: `rev-${item.place_id || Date.now()}`,
            buildingName: name,
            displayName: cleanDisplay,
            area: suburb || road || "",
            city: city,
            state: state,
            pincode: pincode,
            fullAddress: cleanDisplay,
            metroDistance: "",
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
          }]
        });
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    }
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQ = query.trim();
  const qLower = cleanQ.toLowerCase();
  const results: any[] = [];
  const seenPlaceKeys = new Set<string>();

  function addResult(item: any) {
    const normName = (item.buildingName || item.displayName.split(",")[0] || "").toLowerCase().trim();
    const normCity = (item.city || "").toLowerCase().trim();
    const normArea = (item.area || "").toLowerCase().trim();
    const normAddress = (item.fullAddress || item.displayName || "").toLowerCase().trim();
    const key = `${normName}|${normCity}|${normArea}|${normAddress.slice(0, 30)}`;

    if (!seenPlaceKeys.has(key)) {
      seenPlaceKeys.add(key);
      item.id = `${item.id || "geo"}-${results.length}`;
      results.push(item);
    }
  }

  // 2. Official Google Places Autocomplete API (When API Key is configured)
  if (googleApiKey) {
    try {
      const gPlacesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(cleanQ)}&key=${googleApiKey}`;
      const gRes = await fetch(gPlacesUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === "OK" && Array.isArray(gData.predictions)) {
          // Fetch place details for top predictions in parallel
          const detailTasks = gData.predictions.slice(0, 10).map(async (pred: any) => {
            try {
              const dUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${pred.place_id}&fields=name,formatted_address,geometry,address_components&key=${googleApiKey}`;
              const dRes = await fetch(dUrl);
              if (dRes.ok) {
                const dData = await dRes.json();
                if (dData.result) {
                  const r = dData.result;
                  let city = "";
                  let state = "";
                  let pincode = "";
                  let locality = "";

                  for (const comp of r.address_components || []) {
                    const types = comp.types || [];
                    if (types.includes("locality")) city = comp.long_name;
                    else if (!city && types.includes("administrative_area_level_2")) city = comp.long_name;
                    if (types.includes("sublocality") || types.includes("neighborhood")) locality = comp.long_name;
                    if (types.includes("administrative_area_level_1")) state = comp.long_name;
                    if (types.includes("postal_code")) pincode = comp.long_name;
                  }

                  return {
                    id: `g-${pred.place_id}`,
                    buildingName: r.name || pred.structured_formatting?.main_text || cleanQ,
                    displayName: r.formatted_address || pred.description,
                    fullAddress: r.formatted_address || pred.description,
                    area: locality || "",
                    city: city,
                    state: state,
                    pincode: pincode,
                    metroDistance: "",
                    latitude: r.geometry?.location?.lat ?? null,
                    longitude: r.geometry?.location?.lng ?? null
                  };
                }
              }
            } catch (err) {
              console.warn("Place detail fetch failed:", err);
            }
            return {
              id: `g-${pred.place_id}`,
              buildingName: pred.structured_formatting?.main_text || pred.description.split(",")[0],
              displayName: pred.description,
              fullAddress: pred.description,
              area: pred.structured_formatting?.secondary_text?.split(",")[0] || "",
              city: "",
              state: "",
              pincode: "",
              metroDistance: "",
              latitude: null,
              longitude: null
            };
          });

          const placeResults = await Promise.all(detailTasks);
          for (const pr of placeResults) {
            if (pr) addResult(pr);
          }

          if (results.length > 0) {
            return NextResponse.json({ results: results.slice(0, 15) });
          }
        }
      }
    } catch (err) {
      console.warn("Google Places API error:", err);
    }
  }

  // 3. Global Live Multi-Engine Search (Worldwide Coverage — Zero Pre-feeded Addresses)
  // Decompose query to also search core building/locality if user typed unit/flat numbers
  const decomposedQ = cleanQ.replace(
    /^(?:unit|office|flat|shop|plot|suite|floor|room|door|no\.?|#)?\s*[\w\d\-\/\,\.]+\s*(?:,|\s-|\s)/i,
    ""
  ).trim();

  const searchVariants = [cleanQ];
  if (targetCity) {
    if (targetState) {
      searchVariants.unshift(`${cleanQ}, ${targetCity}, ${targetState}`);
    }
    searchVariants.unshift(`${cleanQ}, ${targetCity}`);
  } else if (targetState) {
    searchVariants.unshift(`${cleanQ}, ${targetState}`);
  }

  if (decomposedQ && decomposedQ.length >= 3 && decomposedQ.toLowerCase() !== cleanQ.toLowerCase()) {
    searchVariants.push(decomposedQ);
    if (targetCity) {
      searchVariants.push(`${decomposedQ}, ${targetCity}`);
    }
  }

  const commaParts = cleanQ.split(",").map(s => s.trim()).filter(Boolean);
  if (commaParts.length >= 3) {
    const withoutFirst = commaParts.slice(1).join(", ");
    if (!searchVariants.includes(withoutFirst) && withoutFirst.length >= 3) {
      searchVariants.push(withoutFirst);
    }
  }

  const fetchTasks: Promise<any>[] = [];

  // A) Global Photon Geocoder (Fast Elasticsearch, no strict rate limit)
  const photonQ = targetCity ? `${cleanQ}, ${targetCity}` : cleanQ;
  fetchTasks.push(
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(photonQ)}&limit=15`, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 3600 }
    })
      .then(r => r.json())
      .then(data => ({ engine: "photon", data }))
      .catch(err => ({ engine: "photon", error: err }))
  );

  // Also query raw query on Photon if city was added
  if (targetCity) {
    fetchTasks.push(
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=10`, {
        headers: { "Accept-Language": "en" },
        signal: AbortSignal.timeout(2000),
        next: { revalidate: 3600 }
      })
        .then(r => r.json())
        .then(data => ({ engine: "photon", data }))
        .catch(err => ({ engine: "photon", error: err }))
    );
  }

  // B) Global Nominatim Geocoder (Single targeted query with strict 2s timeout)
  const nomQ = targetCity ? `${cleanQ}, ${targetCity}` : cleanQ;
  fetchTasks.push(
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nomQ)}&addressdetails=1&limit=12`, {
      headers: {
        "User-Agent": "OfficeX-Global-Commercial-System/1.0",
        "Accept-Language": "en"
      },
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 3600 }
    })
      .then(r => r.json())
      .then(data => ({ engine: "nom", data }))
      .catch(err => ({ engine: "nom", error: err }))
  );

  // C) Google Global Search Suggest
  const gSuggestUrl = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(cleanQ)}`;
  fetchTasks.push(
    fetch(gSuggestUrl, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(1200),
      next: { revalidate: 3600 }
    })
      .then(r => r.json())
      .then(data => ({ engine: "google", data }))
      .catch(err => ({ engine: "google", error: err }))
  );

  const taskResults = await Promise.all(fetchTasks);

  // 4. Process Global Photon Results
  for (const res of taskResults) {
    if (res.engine === "photon" && res.data?.features) {
      for (const feat of res.data.features) {
        const p = feat.properties || {};

        const name = p.name || p.street || cleanQ;
        const street = p.street && p.street !== name ? p.street : "";
        const house = p.housenumber ? `${p.housenumber}` : "";
        const rawCity = p.city || p.county || "";
        const city = cleanCityName(rawCity, p.state || "");
        const state = p.state || "";
        const country = p.country || "";
        const pincode = p.postcode || "";
        const area = [cleanAddressSegment(p.locality), cleanAddressSegment(p.district)]
          .filter(Boolean)
          .filter(a => a !== city && a !== state && a !== country)
          .join(", ");

        const parts = [name, house, street, area, city, state, country, pincode]
          .map(s => s?.trim())
          .filter(Boolean)
          .filter((val, idx, arr) => arr.indexOf(val) === idx);

        const cleanDisplay = parts.join(", ");
        const coords = feat.geometry?.coordinates;

        addResult({
          id: `photon-${p.osm_id || Math.random().toString(36).substring(2, 9)}`,
          buildingName: name,
          displayName: cleanDisplay,
          fullAddress: cleanDisplay,
          area: area || street || "",
          city: city,
          state: state,
          country: country,
          pincode: pincode,
          metroDistance: "",
          latitude: coords ? coords[1] : null,
          longitude: coords ? coords[0] : null
        });
      }
    }
  }

  // 5. Process Global Nominatim Results
  for (const res of taskResults) {
    if (res.engine === "nom" && Array.isArray(res.data)) {
      for (const item of res.data) {
        const addr = item.address || {};
        const name = item.name || cleanQ;
        const road = addr.road || addr.street || "";
        const suburb = addr.suburb || addr.neighbourhood || addr.commercial || addr.quarter || "";
        const rawCity = addr.city || addr.town || addr.municipality || addr.state_district || addr.district || addr.county || addr.city_district || "";
        const city = cleanCityName(rawCity, addr.state || "");
        const state = addr.state || "";
        const country = addr.country || "";
        let pincode = addr.postcode || "";
        if (!pincode) {
          const pinMatch = (item.display_name || "").match(/\b([1-9][0-9]{5})\b/);
          if (pinMatch) pincode = pinMatch[1];
        }
        const area = [cleanAddressSegment(suburb), cleanAddressSegment(addr.city_district)]
          .filter(Boolean)
          .filter(a => a !== city && a !== state && a !== country)
          .join(", ");

        const parts = [name, road, area, city, state, country, pincode]
          .map(s => s?.trim())
          .filter(Boolean)
          .filter((val, idx, arr) => arr.indexOf(val) === idx);

        const cleanDisplay = parts.join(", ");

        addResult({
          id: `nom-${item.place_id || Math.random().toString(36).substring(2, 9)}`,
          buildingName: name,
          displayName: cleanDisplay,
          fullAddress: cleanDisplay,
          area: area || road || "",
          city: city,
          state: state,
          country: country,
          pincode: pincode,
          metroDistance: "",
          latitude: item.lat ? parseFloat(item.lat) : null,
          longitude: item.lon ? parseFloat(item.lon) : null
        });
      }
    }
  }

  // 6. Process Global Google Place Suggestions (Filter out non-address queries)
  const junkWords = ["price", "menu", "buffet", "ticket", "review", "reviews", "career", "careers", "job", "jobs", "photo", "photos", "image", "images", "owner", "net worth", "turnover", "wiki", "wikipedia", "brochure", "booking", "timing", "timings", "contact", "download", "salary", "salaries", "pdf", "stock", "share", "lyrics", "restaurant", "restaurants", "club", "clubs", "bar", "bars", "nightlife", "night view", "weather", "it company list", "distance"];
  for (const res of taskResults) {
    if (res.engine === "google" && Array.isArray(res.data?.[1])) {
      const hints: string[] = res.data[1];
      for (const rawHint of hints) {
        const cleaned = rawHint
          .replace(/\s+(?:address|pin\s*code|directions|nearest metro station)\b/gi, "")
          .trim();

        if (junkWords.some(j => cleaned.toLowerCase().includes(j))) continue;

        const formattedTitle = cleaned
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        addResult({
          id: `g-${cleaned.replace(/\s+/g, "-").toLowerCase()}`,
          buildingName: formattedTitle,
          displayName: formattedTitle,
          fullAddress: formattedTitle,
          area: "",
          city: "",
          state: "",
          pincode: "",
          metroDistance: "",
          latitude: null,
          longitude: null
        });
      }
    }
  }

  // 7. Relevance Scoring & Sorting
  const qTokens = qLower
    .split(/[\s,.-]+/)
    .filter(t => t.length > 1 && !["plot", "flat", "unit", "office", "shop", "floor", "suite", "room", "door", "near", "opp", "opposite"].includes(t));

  const normCity = targetCity.toLowerCase();
  const normState = targetState.toLowerCase();

  const scoredResults = results.map(item => {
    const text = `${item.buildingName} ${item.displayName} ${item.area || ""} ${item.city || ""} ${item.state || ""} ${item.country || ""}`.toLowerCase();
    let matches = 0;
    for (const t of qTokens) {
      if (text.includes(t)) matches++;
    }
    let score = qTokens.length > 0 ? (matches / qTokens.length) * 10 : 0;

    // Bonus for matching tokens in building name
    const normBName = (item.buildingName || "").toLowerCase();
    let bMatches = 0;
    for (const t of qTokens) {
      if (normBName.includes(t)) bMatches++;
    }
    if (bMatches > 0 && qTokens.length > 0) {
      score += (bMatches / qTokens.length) * 40.0;
    }

    // Exact or prefix match on building name
    if (qTokens[0] && normBName.startsWith(qTokens[0])) {
      score += 15.0;
    }

    // Heavy priority boost for physical places with GPS coordinates and real city/state/pincode
    if (item.latitude !== null && item.longitude !== null) {
      score += 25.0;
    }
    if (item.city) {
      score += 15.0;
    }
    if (item.state) {
      score += 10.0;
    }
    if (item.pincode) {
      score += 10.0;
    }

    // Priority boost for matching target city & state if provided
    const itemCity = (item.city || "").toLowerCase();
    const itemState = (item.state || "").toLowerCase();
    const fullText = (item.fullAddress || item.displayName || "").toLowerCase();

    if (normCity) {
      if (itemCity.includes(normCity) || fullText.includes(normCity)) {
        score += 20.0; // Top priority for selected city (e.g. Ahmedabad)
      } else {
        score -= 10.0; // Demote results from other cities
      }
    }

    if (normState) {
      if (itemState.includes(normState) || fullText.includes(normState)) {
        score += 10.0; // High priority for selected state (e.g. Gujarat)
      } else if (normCity && !itemCity.includes(normCity)) {
        score -= 15.0; // Severely penalize other states
      }
    }

    return { item, score };
  });

  scoredResults.sort((a, b) => b.score - a.score);
  const sortedFinal = scoredResults.map(s => s.item);

  // 8. Enrich top results with Postal PIN Code if coordinates are present
  const topNeedPin = sortedFinal.slice(0, 4).filter(it => !it.pincode && it.latitude !== null && it.longitude !== null);
  if (topNeedPin.length > 0) {
    try {
      await Promise.all(
        topNeedPin.map(async (item) => {
          try {
            const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${item.latitude}&lon=${item.longitude}&addressdetails=1`;
            const revRes = await fetch(revUrl, {
              headers: { "User-Agent": "OfficeX-Global-Commercial-System/1.0" },
              signal: AbortSignal.timeout(1200),
            });
            if (revRes.ok) {
              const revData = await revRes.json();
              const pin = revData.address?.postcode;
              if (pin) {
                item.pincode = pin;
                if (!item.fullAddress.includes(pin)) {
                  item.fullAddress = `${item.fullAddress}, ${pin}`;
                  item.displayName = `${item.displayName}, ${pin}`;
                }
              }
            }
          } catch (_) {}
        })
      );
    } catch (_) {}
  }

  // 9. Fallback if still no results found
  if (sortedFinal.length === 0) {
    const formattedTitle = cleanQ
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    sortedFinal.push({
      id: "custom-manual-1",
      buildingName: formattedTitle,
      displayName: formattedTitle,
      fullAddress: cleanQ,
      area: "",
      city: "",
      state: "",
      pincode: "",
      metroDistance: "",
      latitude: null,
      longitude: null
    });
  }

  return NextResponse.json({ results: sortedFinal.slice(0, 15) });
}
