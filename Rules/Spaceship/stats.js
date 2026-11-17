"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const ship_1 = require("../../lib/ship");
const Year_1 = require("@civ-clone/core-game-year/Year");
const ChanceOfSuccess_1 = require("@civ-clone/core-spaceship/Rules/ChanceOfSuccess");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const FlightTime_1 = require("@civ-clone/core-spaceship/Rules/FlightTime");
const parts_1 = require("../../data/parts");
const Launch_1 = require("@civ-clone/core-spaceship/Rules/Launch");
const Launchable_1 = require("@civ-clone/core-spaceship/Rules/Launchable");
const RuleIds_1 = require("../../RuleIds");
const stats_1 = require("../../lib/stats");
const PendingEffectRegistry_1 = require("@civ-clone/core-pending-effect/PendingEffectRegistry");
const getRules = (dependencies = {}) => {
    const { engine = Engine_1.instance, pendingEffectRegistry = PendingEffectRegistry_1.instance, year = Year_1.instance, } = dependencies;
    return [
        // The whole years the flight takes: the arrival year less the launch year (`spaceship_calc_stats`: the launch
        //  year + full-mass flight / 10). Once launched, as recorded then.
        new FlightTime_1.default(`${RuleIds_1.prefix}:spaceship/flight-time`, new Effect_1.default((spaceship) => {
            const record = (0, ship_1.launchRecord)(spaceship, pendingEffectRegistry);
            if (record !== null) {
                return record.arrivalYear - record.launchYear;
            }
            return (0, stats_1.flightYears)((0, ship_1.statsOf)(spaceship, dependencies).arrivalFlight);
        })),
        // The chance of success, with life support applied, as a fraction. It only scales the score: an arriving ship
        //  always lands.
        new ChanceOfSuccess_1.default(`${RuleIds_1.prefix}:spaceship/chance-of-success`, new Effect_1.default((spaceship) => (0, ship_1.statsOf)(spaceship, dependencies).success / 100)),
        // A ship launches with at least one habitation module built and a chance of success above 0 (`spaceship.cpp`
        //  `spaceship_status_dialog` ~1640, the launch button).
        new Launchable_1.default(RuleIds_1.default.launchable, new Effect_1.default((spaceship) => (0, ship_1.built)(spaceship)[parts_1.HABITATION] > 0 &&
            (0, ship_1.statsOf)(spaceship, dependencies).success > 0)),
        // The launch is recorded: whether it has fusion (set only before the launch), the year and the arrival year.
        //  Then `player:spaceship:launched` is emitted with the player and the arrival year.
        new Launch_1.default(`${RuleIds_1.prefix}:spaceship/launch/record`, new Effect_1.default((spaceship) => {
            const fusion = (0, ship_1.hasFusion)(spaceship, dependencies), launchYear = year.value(), arrivalYear = launchYear +
                (0, stats_1.flightYears)((0, ship_1.statsOf)(spaceship, dependencies).arrivalFlight);
            (0, ship_1.recordLaunch)(spaceship, { fusion, launchYear, arrivalYear }, pendingEffectRegistry);
            engine.emit('player:spaceship:launched', spaceship.player(), arrivalYear);
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=stats.js.map