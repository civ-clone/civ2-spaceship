"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describedRequirements = exports.buildRequirements = exports.notLaunched = exports.unlaunchedSpaceship = exports.requiresAdvance = exports.requiresApollo = void 0;
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const parts_1 = require("./data/parts");
const ApolloProgram_1 = require("@civ-clone/base-wonder-apolloprogram/ApolloProgram");
const Part_1 = require("@civ-clone/core-spaceship/Part");
const RuleIds_1 = require("./RuleIds");
// What Civilization II's spaceship parts need, as the entries `Rules/City/build` makes its rules from. `registerRules`
//  adds them to the game's `requirements`, where a computer player's space race can read them.
/**
 * Every part needs the Apollo Program built, by anyone, and it counts once built even if it's lost with its city since
 *  (OpenCiv2 `src/auto/city.cpp` `city_can_build_improvement` ~2183: `game.wonder_city[WONDER_APOLLO] != -1`, which a
 *  lost Wonder's -2 passes).
 */
exports.requiresApollo = (0, Requirement_1.table)(RuleIds_1.default.requiresApollo, 'requires', [[Part_1.default, ApolloProgram_1.default]], { range: 'world' });
/** The advance a city's player needs for each kind (RULES.TXT @IMPROVE, the group's row): one rule each. */
exports.requiresAdvance = (0, Requirement_1.table)(RuleIds_1.default.requiresAdvance, 'requires', parts_1.parts.map(([PartType, , , , advance]) => [
    PartType,
    advance,
]));
/** A player whose ship hasn't launched, in the years AD: the hand-written rule's condition. */
exports.unlaunchedSpaceship = new Requirement_1.Condition(`${RuleIds_1.default.notLaunched}/condition`);
/** Parts are built only for a ship that hasn't launched, and only in the years AD (`0 < game.year`). Described only. */
exports.notLaunched = new Requirement_1.Requirement({
    id: RuleIds_1.default.notLaunched,
    subject: Part_1.default,
    relation: 'requires',
    targets: [exports.unlaunchedSpaceship],
});
/** The entries the rules are made from. */
exports.buildRequirements = [
    ...exports.requiresApollo,
    ...exports.requiresAdvance,
];
/** The entries that only describe. */
exports.describedRequirements = [exports.notLaunched];
exports.default = exports.buildRequirements;
//# sourceMappingURL=Requirements.js.map