"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleIds = exports.prefix = void 0;
// The ids of civ2-spaceship's rules that other packages (civ2-enhanced, a renderer) may need to find.
exports.prefix = 'civ2-spaceship';
exports.RuleIds = {
    requiresApollo: `${exports.prefix}:city/build/requires-apollo`,
    requiresAdvance: `${exports.prefix}:city/build/requires-advance`,
    notLaunched: `${exports.prefix}:city/build/not-launched`,
    partsLeft: `${exports.prefix}:city/build/parts-left`,
    buildCost: `${exports.prefix}:city/build-cost`,
    arrival: `${exports.prefix}:turn/start/arrival`,
    launchable: `${exports.prefix}:spaceship/launchable`,
    computerPart: `${exports.prefix}:spaceship/computer/part`,
    computerLaunch: `${exports.prefix}:spaceship/computer/launch`,
};
exports.default = exports.RuleIds;
//# sourceMappingURL=RuleIds.js.map