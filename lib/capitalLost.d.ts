import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import City from '@civ-clone/core-city/City';
import Player from '@civ-clone/core-player/Player';
/** Whether `city` has its player's standing Palace. */
export declare const isCapital: (
  city: City,
  cityImprovementRegistry?: CityImprovementRegistry
) => boolean;
/** Whether `player` has a standing Palace anywhere. */
export declare const hasCapital: (
  player: Player,
  cityImprovementRegistry?: CityImprovementRegistry
) => boolean;
/**
 * The players whose capital was taken and whose ship waits on whether the Palace escapes (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape` ~4805-4821): a ship is lost unless the Palace was bought into another city.
 *  A computer player decides at once; a person is asked, and answers later, so a person's ship is settled at the start
 *  of the next turn. Not saved: a game saved in between keeps the ship.
 */
export declare class CapitalsLost {
  #private;
  add(player: Player): void;
  has(player: Player): boolean;
  /** Settles `player`'s ship: lost without a Palace. Settled, it is no longer waiting. */
  settle(
    player: Player,
    cityImprovementRegistry?: CityImprovementRegistry,
    spaceshipRegistry?: SpaceshipRegistry
  ): void;
  /** Settles every ship still waiting. */
  settleAll(
    cityImprovementRegistry?: CityImprovementRegistry,
    spaceshipRegistry?: SpaceshipRegistry
  ): void;
}
export default CapitalsLost;
