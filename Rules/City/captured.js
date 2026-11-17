"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const capitalLost_1 = require("../../lib/capitalLost");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const RuleIds_1 = require("../../RuleIds");
const getRules = (capitalsLost, { cityImprovementRegistry = CityImprovementRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, } = {}) => [
    // Losing the capital loses the ship, unless the Palace escapes (`city_capture_aftermath_palace_escape`). `High`, so
    //  the Palace is still there to find: civ2-city-improvement's own rules move it or destroy it.
    new Captured_1.default(`${RuleIds_1.prefix}:city/captured/capital`, new High_1.default(), new Criterion_1.default((city) => (0, capitalLost_1.isCapital)(city, cityImprovementRegistry)), new Effect_1.default((city, capturer, loser) => capitalsLost.add(loser))),
    // A computer player's escape is decided by then: `Low`, after civ2-city-improvement's. A person's waits for the
    //  start of the next turn (`Rules/Turn/start`). Asked in the effect: every rule's criteria are checked before any
    //  effect runs, so a criterion here can't see the capital the rule above has just noted.
    new Captured_1.default(`${RuleIds_1.prefix}:city/captured/ship-lost`, new Low_1.default(), new Effect_1.default((city, capturer, loser) => {
        if (capitalsLost.has(loser) && !(0, isHuman_1.default)(loser, clientRegistry)) {
            capitalsLost.settle(loser, cityImprovementRegistry, spaceshipRegistry);
        }
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map