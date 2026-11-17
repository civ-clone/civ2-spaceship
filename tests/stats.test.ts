import {
  effectiveCounts,
  flightYears,
  partLimit,
  shipStats,
  thrust,
} from '../lib/stats';
import { expect } from 'chai';

// OpenCiv2 `src/auto/spaceship.cpp` (richardpenman/civ2@49f26ec): `spaceship_part_limit` :1307,
//  `spaceship_component_thrust` :1432, `spaceship_calc_stats` :1454.

describe('lib/stats: partLimit', (): void => {
  it('counts every structural', (): void => {
    expect(partLimit(0, 0, true)).equal(39);
    expect(partLimit(0, 39, false)).equal(39);
  });

  it('counts propulsion up to (S + 1) / 4 and fuel up to (S − 1) / 4, at most 8', (): void => {
    expect([0, 2, 3, 6, 7, 30, 31, 39].map((s) => partLimit(1, s, true))).eql([
      0, 0, 1, 1, 2, 7, 8, 8,
    ]);
    expect([0, 1, 4, 5, 32, 33, 39].map((s) => partLimit(2, s, true))).eql([
      0, 0, 0, 1, 7, 8, 8,
    ]);
  });

  it('counts habitation up to (S + 1) / 8, life support (S − 3) / 8, solar panels (S − 7) / 8, at most 4', (): void => {
    expect([0, 6, 7, 31, 39].map((s) => partLimit(3, s, true))).eql([
      0, 0, 1, 4, 4,
    ]);
    expect([0, 2, 10, 11, 35, 39].map((s) => partLimit(4, s, true))).eql([
      0, 0, 0, 1, 4, 4,
    ]);
    expect([0, 6, 14, 15, 39].map((s) => partLimit(5, s, true))).eql([
      0, 0, 0, 1, 4,
    ]);
  });

  it("counts at most 1 of each module on a computer player's ship", (): void => {
    expect([3, 4, 5].map((part) => partLimit(part, 39, false))).eql([1, 1, 1]);
    expect(partLimit(1, 39, false)).equal(8);
    expect(partLimit(3, 6, false)).equal(0);
  });

  it('counts what was built up to the limit', (): void => {
    expect(effectiveCounts([3, 2, 2, 1, 0, 0], true)).eql([3, 1, 0, 0, 0, 0]);
  });
});

describe('lib/stats: thrust', (): void => {
  it('adds 1 for the first four, 2 for the fifth and sixth, 3 for the seventh and eighth', (): void => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map(thrust)).eql([
      0, 1, 2, 3, 4, 6, 8, 11, 14,
    ]);
  });
});

describe('lib/stats: shipStats', (): void => {
  it('a full ship: 15.6 years at the paradigm of 75, 100% success', (): void => {
    const stats = shipStats([39, 8, 8, 4, 4, 4], {
      human: true,
      fusion: false,
    });

    // 39 + 2 × 8 × 4 + 3 × 4 × 16 = 295; 295 × 75 / (140 + 1) = 156.9.
    expect(stats.mass).equal(295);
    expect(stats.fullMass).equal(295);
    expect(stats.flight).equal(156);
    expect(stats.arrivalFlight).equal(156);
    expect(stats.support).equal(100);
    expect(stats.energy).equal(100);
    expect(stats.fuel).equal(100);
    // Over 15.0 years, but (156 − 150) / 10 rounds to 0.
    expect(stats.success).equal(100);
    expect(stats.population).equal(4);
    expect(flightYears(stats.arrivalFlight)).equal(15);
  });

  it('fusion cuts the paradigm to three quarters, 56', (): void => {
    const stats = shipStats([39, 8, 8, 4, 4, 4], { human: true, fusion: true });

    // 295 × 56 / 141 = 117.2.
    expect(stats.flight).equal(117);
  });

  it('halves a paradigm above 100 and doubles the flight for it', (): void => {
    const stats = shipStats([39, 8, 8, 4, 4, 4], {
      human: true,
      fusion: false,
      paradigm: 200,
    });

    // 200 → 100, × 2: (295 × 100 / 141) × 2 = 209 × 2.
    expect(stats.flight).equal(418);
  });

  it('scales success by support and energy, then takes the long flight off', (): void => {
    const stats = shipStats([15, 4, 3, 2, 1, 1], {
      human: true,
      fusion: false,
    });

    // Support 1 × 100 / 2 = 50, energy 1 × 200 / 3 = 66: 100 → 50 → 33.
    expect(stats.support).equal(50);
    expect(stats.energy).equal(66);
    // Mass 15 + 16 + 12 + 32 + 16 + 16 = 107, thrust min(4, 3) × 10 = 30: 107 × 75 / 31 = 258.
    expect(stats.flight).equal(258);
    // 33 − (258 − 150) / 10 = 33 − 10.
    expect(stats.success).equal(23);
    expect(
      shipStats([15, 4, 3, 2, 1, 1], {
        human: true,
        fusion: false,
        applySupport: false,
      }).success
    ).equal(56);
  });

  it('weighs every part built, counted or not, and adds one of each kind not built to the full mass', (): void => {
    const stats = shipStats([1, 2, 0, 1, 0, 0], { human: true, fusion: false });

    // Nothing but the structural counts at S = 1, so there is no thrust.
    expect(stats.counted).eql([1, 0, 0, 0, 0, 0]);
    expect(stats.mass).equal(1 + 8 + 16);
    expect(stats.fullMass).equal(25 + 4 + 16 + 16);
    expect(stats.arrivalFlight).equal(61 * 75);
    // With every part counted, the projection has the thrust of 0 fuel: still none.
    expect(stats.projectedFlight).equal(61 * 75);
    // No life support for the (uncounted) habitation: support 0.
    expect(stats.success).equal(0);
  });

  it("caps a computer player's modules, so its success and colonists differ", (): void => {
    const person = shipStats([31, 8, 7, 4, 4, 4], {
        human: true,
        fusion: false,
      }),
      computer = shipStats([31, 8, 7, 4, 4, 4], {
        human: false,
        fusion: false,
      });

    expect(person.counted).eql([31, 8, 7, 4, 3, 3]);
    expect(computer.counted).eql([31, 8, 7, 1, 1, 1]);
    expect(computer.population).equal(1);
    // Energy: 1 × 200 / 2 = 100 for the computer; 3 × 200 / 7 = 85 for the person.
    expect(computer.energy).equal(100);
    expect(person.energy).equal(85);
  });
});
