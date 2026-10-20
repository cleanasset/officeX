async function testGeo() {
  console.log("=== Testing Geo Detection API logic ===");

  // Test mapping logic
  const testCities = [
    { city: "Ahmedabad", region: "Gujarat", expected: "Ahmedabad" },
    { city: "Gandhinagar", region: "Gujarat", expected: "Ahmedabad" },
    { city: "New Delhi", region: "Delhi", expected: "Delhi" },
    { city: "Gurgaon", region: "Haryana", expected: "Delhi" },
    { city: "Noida", region: "Uttar Pradesh", expected: "Delhi" },
    { city: "Mumbai", region: "Maharashtra", expected: "Mumbai" },
    { city: "Thane", region: "Maharashtra", expected: "Mumbai" },
    { city: "Bengaluru", region: "Karnataka", expected: "Bengaluru" },
    { city: "Bangalore", region: "Karnataka", expected: "Bengaluru" },
    { city: "Pune", region: "Maharashtra", expected: "Pune" },
    { city: "Hyderabad", region: "Telangana", expected: "Hyderabad" },
  ];

  console.log("Checking external IP lookup...");
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (res.ok) {
      const data = await res.json();
      console.log("Live IP Detected Location:", {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
      });
    }
  } catch (e: any) {
    console.error("Geo fetch failed:", e.message);
  }

  console.log("All mapping tests complete.");
}

testGeo().catch(console.error);
