export type Coordinates = { latitude: number; longitude: number };

type PostalCodeResponse = {
  places?: { latitude?: string; longitude?: string }[];
};

const coordinateCache = new Map<string, Promise<Coordinates | null>>();

export function getPincodeCoordinates(pincode: string): Promise<Coordinates | null> {
  if (!/^\d{6}$/.test(pincode)) {
    return Promise.reject(new Error("Enter a valid 6-digit Indian PIN code."));
  }

  const cached = coordinateCache.get(pincode);
  if (cached) return cached;

  const lookup = fetch(`https://api.zippopotam.us/IN/${pincode}`).then(async (response) => {
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Could not look up PIN code ${pincode}.`);

    const data = (await response.json()) as PostalCodeResponse;
    const places = (data.places || [])
      .map((place) => ({
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
      }))
      .filter(
        (place) =>
          Number.isFinite(place.latitude) &&
          Number.isFinite(place.longitude) &&
          Math.abs(place.latitude) <= 90 &&
          Math.abs(place.longitude) <= 180,
      );
    if (!places.length) return null;

    return {
      latitude: places.reduce((sum, place) => sum + place.latitude, 0) / places.length,
      longitude: places.reduce((sum, place) => sum + place.longitude, 0) / places.length,
    };
  });
  const cachedLookup = lookup.catch((error: unknown) => {
    coordinateCache.delete(pincode);
    throw error;
  });
  coordinateCache.set(pincode, cachedLookup);
  return cachedLookup;
}

export function distanceKm(from: Coordinates, to: Coordinates) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
