"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structural = exports.Propulsion = exports.Power = exports.LifeSupport = exports.Habitation = exports.Fuel = void 0;
// Civilization II's six kinds of spaceship part, as the shared `base-spaceship-*` classes. The original builds three
//  improvements (SS Structural, SS Component and SS Module) and asks a person which kind of component or module each
//  one becomes (`spaceship_add_part`); here each kind is built on its own, at its group's cost.
var Fuel_1 = require("@civ-clone/base-spaceship-fuel/Fuel");
Object.defineProperty(exports, "Fuel", { enumerable: true, get: function () { return Fuel_1.Fuel; } });
var Habitation_1 = require("@civ-clone/base-spaceship-habitation/Habitation");
Object.defineProperty(exports, "Habitation", { enumerable: true, get: function () { return Habitation_1.Habitation; } });
var LifeSupport_1 = require("@civ-clone/base-spaceship-life-support/LifeSupport");
Object.defineProperty(exports, "LifeSupport", { enumerable: true, get: function () { return LifeSupport_1.LifeSupport; } });
var Power_1 = require("@civ-clone/base-spaceship-power/Power");
Object.defineProperty(exports, "Power", { enumerable: true, get: function () { return Power_1.Power; } });
var Propulsion_1 = require("@civ-clone/base-spaceship-propulsion/Propulsion");
Object.defineProperty(exports, "Propulsion", { enumerable: true, get: function () { return Propulsion_1.Propulsion; } });
var Structural_1 = require("@civ-clone/base-spaceship-structural/Structural");
Object.defineProperty(exports, "Structural", { enumerable: true, get: function () { return Structural_1.Structural; } });
//# sourceMappingURL=Parts.js.map