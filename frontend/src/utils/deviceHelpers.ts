// src/utils/deviceHelpers.ts

import type { Location } from "@/types/Location/Location";

export function flattenLocations(
  locations: Location[],
  acc: Location[] = []
): Location[] {

  for (const loc of locations) {

    acc.push(loc);

    if (loc.children?.length) {
      flattenLocations(
        loc.children,
        acc
      );
    }
  }

  return acc;
}

export function findLocationName(
  id: number | null,
  locations: Location[]
): string {

  if (!id) return "—";

  const flat =
    flattenLocations(locations);

  const found =
    flat.find((l) => l.id === id);

  return found?.name ?? "—";
}