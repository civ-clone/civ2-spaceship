"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightYears = exports.shipStats = exports.thrust = exports.effectiveCounts = exports.partLimit = void 0;
const parts_1 = require("../data/parts");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
// Civilization II's spaceship numbers (OpenCiv2 `src/auto/spaceship.cpp`, richardpenman/civ2@49f26ec), with C's
//  integer arithmetic. `built` is how many of each kind have been built, in the original's order (`data/parts`).
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
/**
 * How many of `part` count, from the structurals built (`spaceship_part_limit`, `:1307`): every structural counts;
 *  propulsion up to (S + 1) / 4 and fuel (S − 1) / 4; habitation (S + 1) / 8, life support (S − 3) / 8 and solar panels
 *  (S − 7) / 8, and a computer player's at most 1 of each module. Never more than can be built, nor below 0.
 */
const partLimit = (part, structurals, human) => {
    const [, max] = parts_1.parts[part];
    if (part === parts_1.STRUCTURAL) {
        return max;
    }
    if (part === parts_1.PROPULSION || part === parts_1.FUEL) {
        return clamp(Math.trunc((structurals + 1 - (part * 2 - 2)) / 4), 0, max);
    }
    const limit = clamp(Math.trunc((structurals + 1 - (part * 4 - 12)) / 8), 0, max);
    return human ? limit : clamp(limit, 0, parts_1.COMPUTER_MODULE_LIMIT);
};
exports.partLimit = partLimit;
/** How many of each kind count (`spaceship_part_count`): what was built, up to its limit. */
const effectiveCounts = (built, human) => built.map((count, part) => clamp(count, 0, (0, exports.partLimit)(part, built[parts_1.STRUCTURAL], human)));
exports.effectiveCounts = effectiveCounts;
/**
 * The thrust of `count` propulsion or fuel components (`spaceship_component_thrust`, `:1432`): 1 for each of the first
 *  four, 2 for the fifth and sixth, 3 for the seventh and eighth, so 14 for eight.
 */
const thrust = (count) => {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += i > 3 ? 2 : 1;
        if (i > 5) {
            total++;
        }
    }
    return total;
};
exports.thrust = thrust;
/**
 * A ship's numbers (`spaceship_calc_stats`, `:1454`):
 *
 * - mass: each part built × its mass; the full mass adds one of each kind still at 0;
 * - support = life support × 100 / habitation, energy = solar panels × 200 / (habitation + life support), fuel = fuel ×
 *   100 / propulsion, each divisor kept to 1 to 99, from the counted parts;
 * - the paradigm (75) is cut to three quarters with fusion, then halved while above 100, doubling the result each time;
 * - thrust is the lesser of the counted propulsion's and fuel's, × 10;
 * - the flight is mass × paradigm / (thrust + 1), in tenths of a year;
 * - success starts at 100, is scaled by support (when applied) and by energy, each kept to 0 to 100, then loses
 *   (flight − 150) / 10 for a flight over 15 years, and is kept to 0 to 100.
 */
const shipStats = (built, { applySupport = true, fusion, human, paradigm = cosmic_1.default.massThrustParadigm, }) => {
    const counted = (0, exports.effectiveCounts)(built, human), mass = built.reduce((total, count, part) => total + count * parts_1.parts[part][2], 0), fullMass = built.reduce((total, count, part) => total + (count === 0 ? parts_1.parts[part][2] : 0), mass), support = Math.trunc((counted[parts_1.LIFE_SUPPORT] * 100) / clamp(counted[parts_1.HABITATION], 1, 99)), energy = Math.trunc((counted[parts_1.SOLAR_PANEL] * 200) /
        clamp(counted[parts_1.HABITATION] + counted[parts_1.LIFE_SUPPORT], 1, 99)), fuel = Math.trunc((counted[parts_1.FUEL] * 100) / clamp(counted[parts_1.PROPULSION], 1, 99));
    let success = 100;
    if (applySupport) {
        success = Math.trunc((clamp(support, 0, 100) * success) / 100);
    }
    success = Math.trunc((clamp(energy, 0, 100) * success) / 100);
    let effectiveParadigm = clamp(paradigm, 25, 200), scale = 1;
    if (fusion) {
        effectiveParadigm = (effectiveParadigm * 3) >> 2;
    }
    while (effectiveParadigm > 100) {
        effectiveParadigm >>= 1;
        scale <<= 1;
    }
    const countedThrust = Math.min((0, exports.thrust)(counted[parts_1.PROPULSION]) * 10, (0, exports.thrust)(counted[parts_1.FUEL]) * 10), builtThrust = Math.min((0, exports.thrust)(built[parts_1.PROPULSION]) * 10, (0, exports.thrust)(built[parts_1.FUEL]) * 10), flight = Math.trunc((mass * effectiveParadigm) / (countedThrust + 1)) * scale, arrivalFlight = Math.trunc((effectiveParadigm * fullMass) / (countedThrust + 1)) * scale, projectedFlight = Math.trunc((effectiveParadigm * fullMass) / (builtThrust + 1)) * scale;
    if (flight > 150) {
        success -= Math.trunc((flight - 150) / 10);
    }
    return {
        mass,
        fullMass,
        counted,
        support,
        energy,
        fuel,
        flight,
        arrivalFlight,
        projectedFlight,
        success: clamp(success, 0, 100),
        population: counted[parts_1.HABITATION],
    };
};
exports.shipStats = shipStats;
/** The whole years a flight of `tenths` tenths of a year adds to the launch year (`spaceship_calc_stats`: `/ 10`). */
const flightYears = (tenths) => Math.trunc(tenths / 10);
exports.flightYears = flightYears;
exports.default = exports.shipStats;
//# sourceMappingURL=stats.js.map