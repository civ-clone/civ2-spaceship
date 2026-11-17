"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CapitalsLost_players;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapitalsLost = exports.hasCapital = exports.isCapital = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const Palace_1 = require("@civ-clone/base-city-improvement-palace/Palace");
const cancelSpaceship_1 = require("@civ-clone/base-spaceship/lib/cancelSpaceship");
/** Whether `city` has its player's standing Palace. */
const isCapital = (city, cityImprovementRegistry = CityImprovementRegistry_1.instance) => cityImprovementRegistry
    .getByCity(city)
    .some((improvement) => improvement instanceof Palace_1.default);
exports.isCapital = isCapital;
/** Whether `player` has a standing Palace anywhere. */
const hasCapital = (player, cityImprovementRegistry = CityImprovementRegistry_1.instance) => cityImprovementRegistry
    .getByType(Palace_1.default)
    .some((palace) => palace.city().player() === player && !palace.city().destroyed());
exports.hasCapital = hasCapital;
/**
 * The players whose capital was taken and whose ship waits on whether the Palace escapes (OpenCiv2 `src/auto/city.cpp`
 *  `city_capture_aftermath_palace_escape` ~4805-4821): a ship is lost unless the Palace was bought into another city.
 *  A computer player decides at once; a person is asked, and answers later, so a person's ship is settled at the start
 *  of the next turn. Not saved: a game saved in between keeps the ship.
 */
class CapitalsLost {
    constructor() {
        _CapitalsLost_players.set(this, new Set());
    }
    add(player) {
        __classPrivateFieldGet(this, _CapitalsLost_players, "f").add(player);
    }
    has(player) {
        return __classPrivateFieldGet(this, _CapitalsLost_players, "f").has(player);
    }
    /** Settles `player`'s ship: lost without a Palace. Settled, it is no longer waiting. */
    settle(player, cityImprovementRegistry = CityImprovementRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance) {
        if (!__classPrivateFieldGet(this, _CapitalsLost_players, "f").delete(player)) {
            return;
        }
        if (!(0, exports.hasCapital)(player, cityImprovementRegistry)) {
            (0, cancelSpaceship_1.default)(player, spaceshipRegistry);
        }
    }
    /** Settles every ship still waiting. */
    settleAll(cityImprovementRegistry = CityImprovementRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance) {
        [...__classPrivateFieldGet(this, _CapitalsLost_players, "f")].forEach((player) => this.settle(player, cityImprovementRegistry, spaceshipRegistry));
    }
}
exports.CapitalsLost = CapitalsLost;
_CapitalsLost_players = new WeakMap();
exports.default = CapitalsLost;
//# sourceMappingURL=capitalLost.js.map