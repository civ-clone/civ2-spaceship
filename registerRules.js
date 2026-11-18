"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const core_game_1 = require("@civ-clone/core-game");
const build_1 = require("./Rules/City/build");
const Requirements_1 = require("./Requirements");
const build_cost_1 = require("./Rules/City/build-cost");
const building_complete_1 = require("./Rules/City/building-complete");
const action_1 = require("./Rules/Player/action");
const defeated_1 = require("./Rules/Player/defeated");
const active_1 = require("./Rules/Spaceship/active");
const choose_slot_1 = require("./Rules/Spaceship/choose-slot");
const computer_1 = require("./Rules/Spaceship/computer");
const events_1 = require("./Rules/Spaceship/events");
const stats_1 = require("./Rules/Spaceship/stats");
const yield_1 = require("./Rules/Spaceship/yield");
const start_1 = require("./Rules/Turn/start");
const register = (game) => {
    const shipDependencies = {
        clientRegistry: game.clients,
        pendingEffectRegistry: game.pendingEffects,
        playerResearchRegistry: game.playerResearch,
        ruleRegistry: game.rules,
        spaceshipRegistry: game.spaceships,
        turn: game.turn,
        year: game.year,
    }, deriveBuildRule = (0, build_1.deriveBuildRules)(game.wonders, game.playerResearch, game.cityImprovements);
    // Which parts a city may build: the Apollo Program, the hand-written rules for an unlaunched ship and the parts left,
    //  then each kind's advance.
    game.requirements.add(deriveBuildRule, ...Requirements_1.requiresApollo);
    game.rules.register((0, build_1.notLaunchedRule)(game.spaceships, game.year), (0, build_1.partsLeftRule)(game.spaceships));
    game.requirements.add(deriveBuildRule, ...Requirements_1.requiresAdvance);
    game.requirements.add(null, ...Requirements_1.describedRequirements);
    game.rules.register(...(0, build_cost_1.default)(), ...(0, building_complete_1.default)({
        ...shipDependencies,
        playerRegistry: game.players,
    }), ...(0, action_1.default)(game.spaceships), ...(0, defeated_1.default)(game.spaceships), ...(0, active_1.default)(game.spaceships, game.clients), ...(0, choose_slot_1.default)(), ...(0, computer_1.default)({
        ...shipDependencies,
        gameDifficultyRegistry: game.difficulty,
        playerRegistry: game.players,
        playerTreasuryRegistry: game.playerTreasuries,
    }), ...(0, events_1.default)({ ...shipDependencies, engine: game.engine }), ...(0, stats_1.default)({ ...shipDependencies, engine: game.engine }), ...(0, yield_1.default)(), ...(0, start_1.default)({
        ...shipDependencies,
        cityBuildRegistry: game.cityBuilds,
        cityImprovementRegistry: game.cityImprovements,
        cityRegistry: game.cities,
        playerRegistry: game.players,
        wonderRegistry: game.wonders,
    }));
};
exports.register = register;
// The plugin loader imports each package for this side effect.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map