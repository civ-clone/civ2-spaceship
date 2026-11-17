"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kindOf = exports.COMPUTER_MODULE_LIMIT = exports.partTypes = exports.parts = exports.SOLAR_PANEL = exports.LIFE_SUPPORT = exports.HABITATION = exports.FUEL = exports.PROPULSION = exports.STRUCTURAL = void 0;
const Parts_1 = require("../Parts");
const Plastics_1 = require("@civ-clone/base-science-advance-plastics/Plastics");
const SpaceFlight_1 = require("@civ-clone/base-science-advance-spaceflight/SpaceFlight");
const Superconductor_1 = require("@civ-clone/base-science-advance-superconductor/Superconductor");
// Civilization II's spaceship parts, in the original's order (OpenCiv2 `src/data/gamedata.cpp`
//  `spaceship_part_table_block`, richardpenman/civ2@49f26ec): the most that can be built of each and its mass. The
//  group's improvement row in MGE's RULES.TXT @IMPROVE gives the advance and the cost in rows of shields (SS Structural:
//  Space Flight, 8; SS Component: Plastics, 16; SS Module: Superconductor, 32).
exports.STRUCTURAL = 0;
exports.PROPULSION = 1;
exports.FUEL = 2;
exports.HABITATION = 3;
exports.LIFE_SUPPORT = 4;
exports.SOLAR_PANEL = 5;
exports.parts = [
    [Parts_1.Structural, 39, 1, 8, SpaceFlight_1.default],
    [Parts_1.Propulsion, 8, 4, 16, Plastics_1.default],
    [Parts_1.Fuel, 8, 4, 16, Plastics_1.default],
    [Parts_1.Habitation, 4, 16, 32, Superconductor_1.default],
    [Parts_1.LifeSupport, 4, 16, 32, Superconductor_1.default],
    [Parts_1.Power, 4, 16, 32, Superconductor_1.default],
];
/** The part kinds' classes, in the original's order. */
exports.partTypes = exports.parts.map(([PartType]) => PartType);
/** A computer player's ship counts at most this many of each kind of module (`spaceship_part_limit`). */
exports.COMPUTER_MODULE_LIMIT = 1;
/** Which kind `part` is, by the original's order, or -1. */
const kindOf = (part) => exports.partTypes.findIndex((PartType) => part instanceof PartType);
exports.kindOf = kindOf;
exports.default = exports.parts;
//# sourceMappingURL=parts.js.map