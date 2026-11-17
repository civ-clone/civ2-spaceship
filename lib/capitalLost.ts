import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import Player from '@civ-clone/core-player/Player';
import cancelSpaceship from '@civ-clone/base-spaceship/lib/cancelSpaceship';

/** Whether `city` has its player's standing Palace. */
export const isCapital = (
  city: City,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): boolean =>
  cityImprovementRegistry
    .getByCity(city)
    .some((improvement: CityImprovement) => improvement instanceof Palace);

/** Whether `player` has a standing Palace anywhere. */
export const hasCapital = (
  player: Player,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): boolean =>
  cityImprovementRegistry
    .getByType(Palace)
    .some(
      (palace: CityImprovement): boolean =>
        palace.city().player() === player && !palace.city().destroyed()
    );

/**
 * The players whose capital was taken and whose ship waits on whether the Palace escapes (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape` ~4805-4821): a ship is lost unless the Palace was bought into another city.
 *  A computer player decides at once; a person is asked, and answers later, so a person's ship is settled at the start
 *  of the next turn. Not saved: a game saved in between keeps the ship.
 */
export class CapitalsLost {
  #players = new Set<Player>();

  add(player: Player): void {
    this.#players.add(player);
  }

  has(player: Player): boolean {
    return this.#players.has(player);
  }

  /** Settles `player`'s ship: lost without a Palace. Settled, it is no longer waiting. */
  settle(
    player: Player,
    cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
    spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
  ): void {
    if (!this.#players.delete(player)) {
      return;
    }

    if (!hasCapital(player, cityImprovementRegistry)) {
      cancelSpaceship(player, spaceshipRegistry);
    }
  }

  /** Settles every ship still waiting. */
  settleAll(
    cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance,
    spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
  ): void {
    [...this.#players].forEach((player: Player) =>
      this.settle(player, cityImprovementRegistry, spaceshipRegistry)
    );
  }
}

export default CapitalsLost;
