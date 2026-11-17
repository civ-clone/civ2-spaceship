"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const WonderRegistry_1 = require("@civ-clone/core-wonder/WonderRegistry");
const newSpaceship_1 = require("../../lib/newSpaceship");
const RuleIds_1 = require("../../RuleIds");
const ApolloProgram_1 = require("@civ-clone/base-wonder-apolloprogram/ApolloProgram");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const Start_1 = require("@civ-clone/core-turn-based-game/Rules/Start");
const wonderHistory_1 = require("@civ-clone/base-wonder/lib/wonderHistory");
const landFirstArrival_1 = require("@civ-clone/base-spaceship/lib/landFirstArrival");
const shipsForNewcomers_1 = require("@civ-clone/base-spaceship/lib/shipsForNewcomers");
const stopPartsInFlight_1 = require("@civ-clone/base-spaceship/lib/stopPartsInFlight");
const getRules = (dependencies = {}) => {
    const { cityBuildRegistry = CityBuildRegistry_1.instance, cityImprovementRegistry = CityImprovementRegistry_1.instance, cityRegistry = CityRegistry_1.instance, playerRegistry = PlayerRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, wonderRegistry = WonderRegistry_1.instance, } = dependencies;
    return [
        // As the turn starts, the first launched ship whose arrival year has come lands, in player order, one a turn
        //  (OpenCiv2 `src/auto/game.cpp` `game_advance_turn` ~1735: `year >= arrival_year`, civs 1 to 7). `High`, before
        //  civ2-game-end's retirement, as the original checks the arrival first.
        new Start_1.default(RuleIds_1.default.arrival, new High_1.default(), new Effect_1.default(() => {
            (0, landFirstArrival_1.default)(playerRegistry, spaceshipRegistry);
        })),
        // A ship can't change in flight, so its player's cities stop building parts for it.
        new Start_1.default(`${RuleIds_1.prefix}:turn/start/stop-parts-in-flight`, new Effect_1.default(() => (0, stopPartsInFlight_1.default)(spaceshipRegistry, cityRegistry, cityBuildRegistry))),
        // Once the Apollo Program has been built, by anyone and even if lost since, every player has a ship to build
        //  parts into: a civilization that comes back, or rebels, get one too.
        new Start_1.default(`${RuleIds_1.prefix}:turn/start/ships-for-newcomers`, new Effect_1.default(() => {
            if (!(0, wonderHistory_1.everBuilt)(ApolloProgram_1.default, wonderRegistry, cityImprovementRegistry)) {
                return;
            }
            (0, shipsForNewcomers_1.default)((0, newSpaceship_1.shipPlayers)(playerRegistry), spaceshipRegistry, (player) => (0, newSpaceship_1.newSpaceship)(player, dependencies));
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=start.js.map