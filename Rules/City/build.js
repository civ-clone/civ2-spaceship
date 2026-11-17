"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partsLeftRule = exports.notLaunchedRule = exports.deriveBuildRules = exports.buildRulesFor = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Requirement_1 = require("@civ-clone/core-requirement/Requirement");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const Year_1 = require("@civ-clone/core-game-year/Year");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Part_1 = require("@civ-clone/core-spaceship/Part");
const RuleIds_1 = require("../../RuleIds");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const build_1 = require("@civ-clone/base-city-improvement-rules/lib/build");
const ship_1 = require("../../lib/ship");
const wonderHistory_1 = require("@civ-clone/base-wonder/lib/wonderHistory");
const parts_1 = require("../../data/parts");
const isPart = (BuildItem) => Object.prototype.isPrototypeOf.call(Part_1.default, BuildItem);
const isWonder = (target) => Object.prototype.isPrototypeOf.call(Wonder_1.default, target);
/**
 * The rules `entry` is played by. An entry about `Part` itself, which is never built, is about every part, and a Wonder
 *  in it is met once anyone has ever built it (`everBuilt`). Any other entry is an advance the city's player must
 *  know, as base-city-improvement-rules plays it.
 */
const buildRulesFor = (entry, wonderRegistry = WonderRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance) => {
    if (entry.subject !== Part_1.default) {
        return (0, build_1.buildRulesFor)(entry, cityImprovementRegistry, playerResearchRegistry);
    }
    if (entry.relation !== 'requires') {
        return [];
    }
    return [
        new Build_1.Build(entry.id, Part_1.default, new Criterion_1.default((city, BuildItem) => isPart(BuildItem)), new Effect_1.default(() => new Criterion_1.default(() => (0, Requirement_1.met)(entry, (target) => isWonder(target) &&
            (0, wonderHistory_1.everBuilt)(target, wonderRegistry, cityImprovementRegistry))))),
    ];
};
exports.buildRulesFor = buildRulesFor;
/** What `registerRules` gives the game's `requirements` to make each entry's rules with. */
const deriveBuildRules = (wonderRegistry, playerResearchRegistry, cityImprovementRegistry) => (entry) => (0, exports.buildRulesFor)(entry, wonderRegistry, playerResearchRegistry, cityImprovementRegistry);
exports.deriveBuildRules = deriveBuildRules;
/**
 * Parts are built only for a ship that hasn't launched, and only in the years AD (`city_can_build_improvement` ~2185:
 *  `0 < game.year` and `civ_spaceship_launched(civ) == 0`). A player with no ship yet may build them: the first part
 *  brings one (`Rules/City/building-complete`).
 */
const notLaunchedRule = (spaceshipRegistry = SpaceshipRegistry_1.instance, year = Year_1.instance) => new Build_1.Build(RuleIds_1.default.notLaunched, Part_1.default, new Criterion_1.default((city, BuildItem) => isPart(BuildItem)), new Effect_1.default((city) => new Criterion_1.default(() => {
    var _a, _b;
    return year.value() > 0 &&
        ((_b = (_a = spaceshipRegistry.getActiveByPlayer(city.player())) === null || _a === void 0 ? void 0 : _a.launched()) !== null && _b !== void 0 ? _b : false) === false;
})));
exports.notLaunchedRule = notLaunchedRule;
/**
 * No more of a kind than can be built (39 structurals, 8 of each component, 4 of each module). The original asks a
 *  person again when the kind chosen is full (`spaceship_add_part`); here each kind is its own build.
 */
const partsLeftRule = (spaceshipRegistry = SpaceshipRegistry_1.instance) => new Build_1.Build(RuleIds_1.default.partsLeft, Part_1.default, new Criterion_1.default((city, BuildItem) => isPart(BuildItem)), new Effect_1.default((city, BuildItem) => {
    const kind = parts_1.default.findIndex(([PartType]) => PartType === BuildItem);
    return new Criterion_1.default(() => {
        if (kind < 0) {
            return false;
        }
        const spaceship = spaceshipRegistry.getActiveByPlayer(city.player());
        return spaceship === null || (0, ship_1.built)(spaceship)[kind] < parts_1.default[kind][1];
    });
}));
exports.partsLeftRule = partsLeftRule;
exports.default = exports.deriveBuildRules;
//# sourceMappingURL=build.js.map