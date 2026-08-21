export interface DbCountry {
  id: string;
  name: string;
  code: string;
  dial_code: string;
  flag?: string;
}

export interface UserLocationResult {
  countryCode: string;
  countryName?: string;
  ip?: string;
}

export interface PlaceSuggestion {
  placeId: string;
  cityName: string;
  fullAddress: string;
  secondaryText?: string;
}

// Client-side session token generator for bundling requests
let currentSessionToken: string | null = null;

export function getOrCreateSessionToken(): string {
  if (!currentSessionToken) {
    currentSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  return currentSessionToken;
}

export function resetSessionToken() {
  currentSessionToken = null;
}

/**
 * Detect user's country code based on IP address to set default country & dial code.
 */
export async function detectUserLocationByIp(): Promise<UserLocationResult> {
  try {
    // Primary CORS-friendly IP lookup
    const response = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success !== false && data.country_code) {
        const countryCode = data.country_code.toUpperCase();
        console.log(`[IP Geolocation] Detected IP Country: ${countryCode}`);
        return {
          countryCode,
          countryName: data.country,
          ip: data.ip,
        };
      }
    }
  } catch (error) {
    console.warn("[IP Geolocation] Primary IP lookup failed:", error);
  }

  return { countryCode: "MA", countryName: "Morocco" };
}

/**
 * Fetch city suggestions directly from Komoot's free public Photon API (OpenStreetMap-based).
 * Provider-agnostic, keyless, and executed directly on the frontend.
 */
export async function fetchPlaceSuggestions(
  query: string,
  countryCode?: string
): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmedQuery = query.trim();

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmedQuery)}&limit=12&lang=fr`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return [];

    const data = await response.json();
    const features = data.features || [];
    const countryFilter = countryCode ? countryCode.toUpperCase() : null;

    const countryMatches: PlaceSuggestion[] = [];
    const otherMatches: PlaceSuggestion[] = [];
    const seen = new Set<string>();

    for (const feature of features) {
      const props = feature.properties || {};
      const cityName = props.name || props.city || props.town || props.village || props.county || props.state;
      if (!cityName) continue;

      const dedupKey = `${cityName.toLowerCase()}_${(props.country || '').toLowerCase()}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const secondaryParts = [props.state, props.country].filter(Boolean);
      const secondaryText = secondaryParts.join(', ');
      const featureCountryCode = (props.countrycode || '').toUpperCase();

      const suggestion: PlaceSuggestion = {
        placeId: `photon-${props.osm_id || Math.floor(Math.random() * 10000)}`,
        cityName,
        fullAddress: secondaryText ? `${cityName}, ${secondaryText}` : cityName,
        secondaryText,
      };

      if (countryFilter && featureCountryCode === countryFilter) {
        countryMatches.push(suggestion);
      } else {
        otherMatches.push(suggestion);
      }
    }

    return [...countryMatches, ...otherMatches].slice(0, 10);
  } catch (err) {
    console.warn('[Photon Autocomplete Error]', err);
    return [];
  }
}
