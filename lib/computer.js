"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launches = exports.nextPart = exports.partOfGroup = exports.choosePartGroup = exports.projectedArrivalYear = exports.ownArrivalYear = exports.computerStats = exports.groupCanBuild = exports.groupFull = exports.groupCountClamped = exports.groupLimit = exports.groupCount = exports.CLOSE_YEARS = exports.SURE_SUCCESS = exports.LEAST_SUCCESS = exports.KING = exports.groupKinds = exports.MODULES = exports.COMPONENTS = exports.STRUCTURALS = void 0;
const parts_1 = require("../data/parts");
const stats_1 = require("./stats");
// A computer player's spaceship (OpenCiv2 `src/auto/spaceship.cpp`, richardpenman/civ2@49f26ec): which part it adds
//  next (`spaceship_choose_part_group`, `:1769`, then `spaceship_add_part`, `:1860`) and whether it launches after
//  adding one (`spaceship_add_part`'s computer branch). Plain numbers in, so a rule set's rules and tests can ask with
//  the ship as it is.
/** The three groups the original builds as improvements: structurals, components and modules. */
exports.STRUCTURALS = 0;
exports.COMPONENTS = 1;
exports.MODULES = 2;
/** The part kinds in each group. */
exports.groupKinds = [
    [parts_1.STRUCTURAL],
    [parts_1.PROPULSION, parts_1.FUEL],
    [parts_1.HABITATION, parts_1.LIFE_SUPPORT, parts_1.SOLAR_PANEL],
];
/** King's level: above it, the original's computer players wait for another computer's launch. */
exports.KING = 3;
/** The least chance of success, in %, a computer player launches with (`0x27 < success_pct`). */
exports.LEAST_SUCCESS = 40;
/** The chance of success, in %, above which a computer player launches with no person's ship in flight. */
exports.SURE_SUCCESS = 75;
/** A computer player's race is close when its ship arrives within this many years. */
exports.CLOSE_YEARS = 14;
const sum = (values) => values.reduce((total, value) => total + value, 0);
/** How many of a group are built (`spaceship_group_count`). */
const groupCount = (built, group) => sum(exports.groupKinds[group].map((kind) => built[kind]));
exports.groupCount = groupCount;
/** How many of a group a computer player's ship counts (`spaceship_group_limit`). */
const groupLimit = (built, group) => sum(exports.groupKinds[group].map((kind) => (0, stats_1.partLimit)(kind, built[parts_1.STRUCTURAL], false)));
exports.groupLimit = groupLimit;
/** How many of a group count of those built (`spaceship_group_count_clamped`). */
const groupCountClamped = (built, group) => sum(exports.groupKinds[group].map((kind) => Math.min(Math.max(built[kind], 0), (0, stats_1.partLimit)(kind, built[parts_1.STRUCTURAL], false))));
exports.groupCountClamped = groupCountClamped;
/** Whether a group is built in full (`spaceship_group_full`). */
const groupFull = (built, group) => sum(exports.groupKinds[group].map((kind) => parts_1.parts[kind][1])) <=
    (0, exports.groupCount)(built, group);
exports.groupFull = groupFull;
/**
 * Whether a computer player can add to a group (`spaceship_group_can_build`): below the group's limit, or with none of
 *  it yet; not built in full; and knowing its advance.
 */
const groupCanBuild = (ship, group) => ((0, exports.groupCount)(ship.built, group) < (0, exports.groupLimit)(ship.built, group) ||
    (0, exports.groupCount)(ship.built, group) === 0) &&
    !(0, exports.groupFull)(ship.built, group) &&
    ship.knows[group];
exports.groupCanBuild = groupCanBuild;
/** The ship's numbers as a computer player's choices read them: life support not applied (`spaceship_calc_stats(civ, 0)`). */
const computerStats = (ship) => (0, stats_1.shipStats)(ship.built, {
    human: false,
    fusion: ship.fusion,
    applySupport: false,
});
exports.computerStats = computerStats;
/** The year the ship would arrive if it launched now (`spaceship_arrival_year` before a launch). */
const ownArrivalYear = (ship) => ship.year + Math.trunc((0, exports.computerStats)(ship).arrivalFlight / 10);
exports.ownArrivalYear = ownArrivalYear;
/** The year the ship would arrive with every part built counted (`projected_arrival_year`). */
const projectedArrivalYear = (ship) => ship.year + Math.trunc((0, exports.computerStats)(ship).projectedFlight / 10);
exports.projectedArrivalYear = projectedArrivalYear;
/**
 * The group a computer player adds to, asked as it finishes a part of `group` (`spaceship_choose_part_group`): −1 once
 *  the ship has launched, −2 if it can add to none.
 *
 * A race is close when the ship would arrive within 14 years and before every person's. Modules come first, then
 *  components (not in a close race), then structurals; while a person's ship in flight arrives no later than this one's
 *  projection, components the ship isn't full of come first, when the player knows their advance.
 */
const choosePartGroup = (ship, group) => {
    if (ship.launched) {
        return -1;
    }
    const humans = ship.others.filter((other) => other.human && other.arrivalYear > 0), earliestHuman = humans.reduce((earliest, other) => Math.min(earliest, other.arrivalYear), 9999), 
    // Worked out afresh, as `spaceship_calc_stats` has just done: an empty ship's flight is centuries, never close.
    own = (0, exports.ownArrivalYear)(ship), raceClose = own - ship.year <= exports.CLOSE_YEARS && own < earliestHuman, below = (candidate) => (0, exports.groupCountClamped)(ship.built, candidate) <
        (0, exports.groupLimit)(ship.built, candidate);
    let chosen = false;
    if (group === exports.STRUCTURALS) {
        if (below(exports.MODULES)) {
            chosen = true;
        }
        else if (!raceClose && below(exports.COMPONENTS)) {
            chosen = true;
        }
    }
    if (chosen ||
        (group === exports.COMPONENTS && raceClose) ||
        !below(group) ||
        !(0, exports.groupCanBuild)(ship, group)) {
        for (let candidate = exports.MODULES; candidate >= (group === exports.STRUCTURALS ? 1 : 0); candidate--) {
            if ((0, exports.groupCanBuild)(ship, candidate) &&
                (candidate !== exports.COMPONENTS || !raceClose) &&
                below(candidate)) {
                group = candidate;
                break;
            }
        }
    }
    if (group === exports.STRUCTURALS) {
        const projected = (0, exports.projectedArrivalYear)(ship);
        if (ship.others.some((other) => other.human && other.launched && other.arrivalYear <= projected) &&
            !(0, exports.groupFull)(ship.built, exports.COMPONENTS) &&
            ship.knows[exports.COMPONENTS] &&
            (ship.built[parts_1.PROPULSION] <=
                (0, stats_1.partLimit)(parts_1.PROPULSION, ship.built[parts_1.STRUCTURAL], false) ||
                ship.built[parts_1.FUEL] <= (0, stats_1.partLimit)(parts_1.FUEL, ship.built[parts_1.STRUCTURAL], false))) {
            return exports.COMPONENTS;
        }
    }
    return (0, exports.groupCanBuild)(ship, group) ? group : -2;
};
exports.choosePartGroup = choosePartGroup;
/**
 * The kind a computer player adds to `group` (`spaceship_add_part`): a structural; propulsion while it has fewer than
 *  fuel, else fuel; the module it has fewest of, the first of a tie. −1 when the group is built in full.
 */
const partOfGroup = (built, group) => {
    const kinds = exports.groupKinds[group];
    if (kinds.every((kind) => parts_1.parts[kind][1] <= built[kind])) {
        return -1;
    }
    if (group === exports.STRUCTURALS) {
        return parts_1.STRUCTURAL;
    }
    if (group === exports.COMPONENTS) {
        return built[parts_1.PROPULSION] < built[parts_1.FUEL] ? parts_1.PROPULSION : parts_1.FUEL;
    }
    return kinds.reduce((fewest, kind) => built[kind] < built[fewest] ? kind : fewest, kinds[0]);
};
exports.partOfGroup = partOfGroup;
/**
 * The kind a computer player adds next: the group `choosePartGroup` gives as a structural is finished (the original's
 *  first choice, as a city on Auto builds structurals and they're turned into what's wanted), then the kind
 *  `partOfGroup` gives. −1 for none.
 */
const nextPart = (ship) => {
    const group = (0, exports.choosePartGroup)(ship, exports.STRUCTURALS);
    return group < 0 ? -1 : (0, exports.partOfGroup)(ship.built, group);
};
exports.nextPart = nextPart;
/**
 * Whether a computer player launches its ship now, as it does after adding a part (`spaceship_add_part`):
 *
 * 1. never below 40% success (life support not applied);
 * 2. once its structurals and both components are built in full;
 * 3. else, while a person's ship is in flight, only if it would arrive before the earliest of them;
 * 4. else, above King, it waits while another computer player's ship in flight arrives first (`wait`);
 * 5. else when its success is over 75%, or a person's player is stronger, or a person has a ship and more than 999 gold.
 */
const launches = (ship, wait = 'classic') => {
    if (ship.launched) {
        return false;
    }
    const { success } = (0, exports.computerStats)(ship);
    if (success < exports.LEAST_SUCCESS) {
        return false;
    }
    if ([parts_1.STRUCTURAL, parts_1.PROPULSION, parts_1.FUEL].every((kind) => parts_1.parts[kind][1] <= ship.built[kind])) {
        return true;
    }
    const humansInFlight = ship.others.filter((other) => other.human && other.launched);
    if (humansInFlight.length > 0) {
        const earliest = humansInFlight.reduce((year, other) => Math.min(year, other.arrivalYear), Infinity);
        return (0, exports.ownArrivalYear)(ship) < earliest;
    }
    if (ship.level > exports.KING) {
        // The year the original compares another computer's arrival with: the barbarians' ship's, 0, or this ship's own.
        const against = wait === 'classic' ? 0 : (0, exports.ownArrivalYear)(ship);
        if (ship.others.some((other) => !other.human && other.launched && other.arrivalYear < against)) {
            return false;
        }
    }
    return (success > exports.SURE_SUCCESS ||
        ship.others.some((other) => other.human && (other.stronger || (other.exists && other.gold > 999))));
};
exports.launches = launches;
//# sourceMappingURL=computer.js.map