interface GeocodeResult {
  latitude: number;
  longitude: number;
  label: string;
}

/**
 * Resolve a free-text region name to coordinates using Open-Meteo's free
 * geocoding API, so a farmer who only saved a region name (not GPS) can
 * still get a weather lookup without us storing precise coordinates for
 * them (section 77 — avoid storing precise coordinates unnecessarily).
 */
export async function geocodeRegion(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "1");
    url.searchParams.set("country", "KE");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.results?.[0];
    if (!result) return null;

    return { latitude: result.latitude, longitude: result.longitude, label: result.name };
  } catch (err) {
    console.error("geocoding failed", err);
    return null;
  }
}

/**
 * Resolve coordinates back to a human-readable place name (e.g. "Eldoret,
 * Uasin Gishu") using BigDataCloud's free reverse-geocoding endpoint (no
 * API key required). Used so a farmer who taps "Use My Current Field
 * Location" sees a real place name instead of raw GPS coordinates.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ label: string } | null> {
  try {
    const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lon.toString());
    url.searchParams.set("localityLanguage", "en");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();

    const place = json?.city || json?.locality;
    const region = json?.principalSubdivision;
    if (!place && !region) return null;

    const label = [place, region].filter(Boolean).join(", ");
    return { label: label || json?.countryName || "Your location" };
  } catch (err) {
    console.error("reverse geocoding failed", err);
    return null;
  }
}
