export interface Coordenadas {
  latitude: number;
  longitude: number;
}

/**
 * Calcula a distância em km entre dois pontos geográficos usando a fórmula de Haversine.
 */
export function haversineKm(p1: Coordenadas, p2: Coordenadas): number {
  const R = 6371; // raio da Terra em km
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);

  const lat1 = toRad(p1.latitude);
  const lat2 = toRad(p2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
