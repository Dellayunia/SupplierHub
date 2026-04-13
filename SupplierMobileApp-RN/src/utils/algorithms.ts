// ─── Haversine Distance Algorithm ────────────────────────────────────────────
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// ─── SAW (Simple Additive Weighting) Algorithm ───────────────────────────────
// Weight: Distance 60% (cost – lower is better), Rating 40% (benefit – higher is better)
export function applySAW(partners: any[]): any[] {
  if (!partners || partners.length === 0) return [];

  const W_JARAK = 0.6;
  const W_RATING = 0.4;

  const minJarak = Math.min(...partners.map((p) => p.distance));
  const maxRating = Math.max(...partners.map((p) => p.rating));

  const scoredList = partners.map((partner) => {
    const normJarak = partner.distance === 0 ? 1 : minJarak / partner.distance;
    const normRating = maxRating === 0 ? 0 : partner.rating / maxRating;
    const finalScore = Math.round((W_JARAK * normJarak + W_RATING * normRating) * 100);
    return { ...partner, sawScore: finalScore };
  });

  return scoredList.sort((a, b) => b.sawScore - a.sawScore);
}
