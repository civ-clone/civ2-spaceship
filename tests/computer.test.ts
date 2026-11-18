import {
  COMPONENTS,
  ComputerShip,
  MODULES,
  OtherShip,
  STRUCTURALS,
  choosePartGroup,
  computerStats,
  launches,
  nextPart,
  ownArrivalYear,
  partOfGroup,
} from '../lib/computer';
import {
  FUEL,
  HABITATION,
  LIFE_SUPPORT,
  PROPULSION,
  SOLAR_PANEL,
  STRUCTURAL,
} from '../data/parts';
import {
  Fuel,
  Habitation,
  LifeSupport,
  Power,
  Propulsion,
  Structural,
} from '../Parts';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Client from '@civ-clone/core-client/Client';
import ComputerLaunch from '@civ-clone/base-spaceship/lib/Rules/ComputerLaunch';
import ComputerSpaceshipPart from '@civ-clone/base-spaceship/lib/Rules/ComputerSpaceshipPart';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Part from '@civ-clone/core-spaceship/Part';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Plastics from '@civ-clone/base-science-advance-plastics/Plastics';
import Rank from '@civ-clone/core-power/Rules/Rank';
import RuleIds from '../RuleIds';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SpaceFlight from '@civ-clone/base-science-advance-spaceflight/SpaceFlight';
import Superconductor from '@civ-clone/base-science-advance-superconductor/Superconductor';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Year from '@civ-clone/core-game-year/Year';
import YearRule from '@civ-clone/core-game-year/Rules/Year';
import { computerLaunchRule } from '../Rules/Spaceship/computer';
import { expect } from 'chai';
import { register } from '../registerRules';

const ship = (values: Partial<ComputerShip> = {}): ComputerShip => ({
  built: [0, 0, 0, 0, 0, 0],
  launched: false,
  knows: [true, true, true],
  fusion: false,
  year: 1900,
  level: 3,
  others: [],
  ...values,
});

const other = (values: Partial<OtherShip> = {}): OtherShip => ({
  human: false,
  launched: false,
  exists: true,
  arrivalYear: 0,
  stronger: false,
  gold: 0,
  ...values,
});

// What a computer player's ship has once it has added parts as `nextPart` says until it launches.
const buildUntilLaunch = (start: ComputerShip): [ComputerShip, number[]] => {
  const added: number[] = [];

  for (let i = 0; i < 200; i++) {
    const kind = nextPart(start);

    if (kind < 0) {
      break;
    }

    start.built[kind]++;
    added.push(kind);

    if (launches(start)) {
      break;
    }
  }

  return [start, added];
};

describe('a computer player adding parts (spaceship_choose_part_group, spaceship_add_part)', (): void => {
  it('starts the frame with structurals, while no component or module would count', (): void => {
    expect(nextPart(ship())).equal(STRUCTURAL);
    expect(nextPart(ship({ built: [2, 0, 0, 0, 0, 0] }))).equal(STRUCTURAL);
  });

  it('adds a component once one would count: fuel while it has no fewer propulsion than fuel', (): void => {
    // 3 structurals: (3 + 1) / 4 = 1 propulsion counts.
    expect(choosePartGroup(ship({ built: [3, 0, 0, 0, 0, 0] }), 0)).equal(
      COMPONENTS
    );
    expect(partOfGroup([3, 0, 0, 0, 0, 0], COMPONENTS)).equal(FUEL);
    expect(partOfGroup([3, 0, 1, 0, 0, 0], COMPONENTS)).equal(PROPULSION);
  });

  it('adds modules first once one would count, the one it has fewest of', (): void => {
    // 7 structurals: (7 + 1) / 8 = 1 habitation counts.
    expect(choosePartGroup(ship({ built: [7, 1, 1, 0, 0, 0] }), 0)).equal(
      MODULES
    );
    expect(partOfGroup([7, 1, 1, 0, 0, 0], MODULES)).equal(HABITATION);
    expect(partOfGroup([11, 1, 1, 1, 0, 0], MODULES)).equal(LIFE_SUPPORT);
    expect(partOfGroup([15, 1, 1, 1, 1, 0], MODULES)).equal(SOLAR_PANEL);
  });

  it('adds no second module of a kind, as a computer player counts only one (COMPUTER_MODULE_LIMIT)', (): void => {
    // 31 structurals would count 4 habitation for a person; a computer player's ship counts 1 of each module.
    const [built, added] = buildUntilLaunch(
      ship({ built: [31, 0, 0, 0, 0, 0] })
    );

    expect(built.built.slice(HABITATION)).eql([1, 1, 1]);
    expect(added.filter((kind) => kind >= HABITATION)).length(3);
  });

  it('builds a 15-structural ship with 3 of each component and 1 of each module, then launches at 94%', (): void => {
    const [built, added] = buildUntilLaunch(ship());

    expect(built.built).eql([15, 3, 3, 1, 1, 1]);
    expect(added).eql([
      0, 0, 0, 2, 0, 0, 1, 0, 0, 3, 2, 0, 0, 1, 0, 0, 4, 2, 0, 0, 1, 0, 0, 5,
    ]);
    expect(computerStats(built).success).equal(94);
    expect(ownArrivalYear(built)).equal(1921);
  });

  it("adds nothing it doesn't know the advance for, and nothing once launched", (): void => {
    expect(
      nextPart(ship({ built: [3, 0, 0, 0, 0, 0], knows: [true, false, false] }))
    ).equal(STRUCTURAL);
    expect(nextPart(ship({ knows: [false, false, false] }))).equal(-1);
    expect(nextPart(ship({ launched: true }))).equal(-1);
  });

  it("adds components while a person's ship in flight arrives no later than this one's projection", (): void => {
    // 4 structurals: the 1 propulsion that counts is built, and no module counts yet, so structurals come next.
    const waiting = ship({
      built: [4, 1, 0, 0, 0, 0],
      others: [other({ human: true, launched: true, arrivalYear: 1950 })],
    });

    expect(choosePartGroup(waiting, STRUCTURALS)).equal(COMPONENTS);
    expect(
      choosePartGroup(
        { ...waiting, others: [other({ human: true, arrivalYear: 1950 })] },
        STRUCTURALS
      )
    ).equal(STRUCTURALS);
  });
});

describe('a close race (spaceship_choose_part_group)', (): void => {
  it("takes no components once its ship would arrive within 14 years, before every person's", (): void => {
    // 27 structurals (6 propulsion and 6 fuel count): 5 + 6 components arrive in 14 years, 5 + 7 in 15.
    const close = ship({ built: [27, 5, 6, 1, 1, 1] }),
      notClose = ship({ built: [27, 5, 7, 1, 1, 1] });

    expect(ownArrivalYear(close) - close.year).equal(14);
    expect(ownArrivalYear(notClose) - notClose.year).equal(15);
    expect(choosePartGroup(close, STRUCTURALS)).equal(STRUCTURALS);
    expect(choosePartGroup(notClose, STRUCTURALS)).equal(COMPONENTS);
    // Not close when a person's ship would arrive first.
    expect(
      choosePartGroup(
        {
          ...close,
          others: [other({ human: true, arrivalYear: close.year + 10 })],
        },
        STRUCTURALS
      )
    ).equal(COMPONENTS);
  });
});

describe('a computer player launching (spaceship_add_part)', (): void => {
  it('never launches below 40%, life support not applied', (): void => {
    // No modules: no energy, so 0%.
    expect(launches(ship({ built: [39, 8, 8, 0, 0, 0] }))).false;
    // No life support: 0% with it applied, 98% without, as the original's computer reckons it.
    expect(computerStats(ship({ built: [15, 3, 3, 1, 0, 1] })).success).equal(
      98
    );
    expect(launches(ship({ built: [15, 3, 3, 1, 0, 1] }))).true;
  });

  it('launches once its structurals and components are built in full', (): void => {
    expect(launches(ship({ built: [39, 8, 8, 1, 1, 1] }))).true;
  });

  it("launches above 75% with no person's ship in flight, and waits below", (): void => {
    // 15 structurals, 1 + 1 components and a module of each: 67% (a 48-year flight).
    expect(computerStats(ship({ built: [15, 1, 1, 1, 1, 1] })).success).equal(
      67
    );
    expect(launches(ship({ built: [15, 1, 1, 1, 1, 1] }))).false;
    expect(launches(ship({ built: [15, 2, 2, 1, 1, 1] }))).true;
  });

  it("launches over 40% when a person's player is stronger, or a person has a ship and more than 999 gold", (): void => {
    const built = [15, 1, 1, 1, 1, 1];

    expect(
      launches(
        ship({ built, others: [other({ human: true, stronger: true })] })
      )
    ).true;
    expect(
      launches(ship({ built, others: [other({ human: true, gold: 1000 })] }))
    ).true;
    expect(
      launches(ship({ built, others: [other({ human: true, gold: 999 })] }))
    ).false;
    expect(
      launches(
        ship({
          built,
          others: [other({ human: true, gold: 1000, exists: false })],
        })
      )
    ).false;
    // A computer player stronger than this one is no reason.
    expect(launches(ship({ built, others: [other({ stronger: true })] })))
      .false;
  });

  it("with a person's ship in flight, launches only to arrive before it", (): void => {
    const built = [15, 2, 2, 1, 1, 1];

    // 1900 + 28.
    expect(ownArrivalYear(ship({ built }))).equal(1928);
    expect(
      launches(
        ship({
          built,
          others: [other({ human: true, launched: true, arrivalYear: 1929 })],
        })
      )
    ).true;
    expect(
      launches(
        ship({
          built,
          others: [other({ human: true, launched: true, arrivalYear: 1928 })],
        })
      )
    ).false;
  });

  it("never waits for another computer player's launch, as the original compares with the barbarians' ship", (): void => {
    const built = [15, 2, 2, 1, 1, 1],
      early = [other({ launched: true, arrivalYear: 1910 })];

    expect(launches(ship({ built, level: 5, others: early }), 'classic')).true;
  });

  it("with 'other-computers', waits above King while another computer's ship arrives first", (): void => {
    const built = [15, 2, 2, 1, 1, 1],
      early = [other({ launched: true, arrivalYear: 1910 })],
      late = [other({ launched: true, arrivalYear: 1940 })];

    expect(
      launches(ship({ built, level: 4, others: early }), 'other-computers')
    ).false;
    expect(launches(ship({ built, level: 4, others: late }), 'other-computers'))
      .true;
    // At King and below it doesn't wait.
    expect(
      launches(ship({ built, level: 3, others: early }), 'other-computers')
    ).true;
    // A full ship launches regardless.
    expect(
      launches(
        ship({ built: [39, 8, 8, 1, 1, 1], level: 5, others: early }),
        'other-computers'
      )
    ).true;
  });
});

// A game of a person and a computer player, a year a turn from 1990, with civ2-spaceship's rules.
const setUp = () => {
  const rules = new RuleRegistry(),
    turn = new Turn(),
    year = new Year(turn, rules),
    game = new Game({ rules, turn, year }),
    person = new Player(rules),
    computer = new Player(rules);

  rules.register(new YearRule(new Effect((value: number) => 1990 + value)));
  register(game);

  game.players.register(person, computer);
  game.clients.register(new Client(person), new AIClient(computer));

  [person, computer].forEach((player) => {
    const research = new PlayerResearch(player, game.advances, rules);

    game.playerResearch.register(research);
    [SpaceFlight, Plastics, Superconductor].forEach((Advance) =>
      research.addAdvance(Advance)
    );
  });

  const complete = (player: Player, PartType: typeof Part, count = 1): void => {
    const city = {
      player: () => player,
      destroyed: () => false,
      id: () => 'city',
    } as unknown as City;

    for (let i = 0; i < count; i++) {
      rules.process(
        BuildingComplete,
        {} as CityBuild,
        new PartType(city, rules)
      );
    }
  };

  return { complete, computer, game, person, rules };
};

const all = [Structural, Propulsion, Fuel, Habitation, LifeSupport, Power];

describe('the computer players rules (base-spaceship ComputerSpaceshipPart, ComputerLaunch)', (): void => {
  it("answers for a computer player's ship, not a person's", (): void => {
    const { complete, computer, game, person, rules } = setUp();

    complete(person, Structural, 3);
    complete(computer, Structural, 3);

    const personShip = game.spaceships.getActiveByPlayer(person)!,
      computerShip = game.spaceships.getActiveByPlayer(computer)!;

    expect(rules.process(ComputerSpaceshipPart, personShip, all, [])).eql([]);
    expect(rules.process(ComputerLaunch, personShip)).eql([]);
    expect(rules.process(ComputerSpaceshipPart, computerShip, all, [])).eql([
      Fuel,
    ]);
    expect(rules.process(ComputerLaunch, computerShip)).eql([false]);
    expect(
      rules
        .get(ComputerSpaceshipPart)
        .map((rule) => rule.id())
        .concat(rules.get(ComputerLaunch).map((rule) => rule.id()))
    ).eql([RuleIds.computerPart, RuleIds.computerLaunch]);
  });

  it("counts the parts the player's cities are building, and answers null for a part it can't build", (): void => {
    const { complete, computer, game, rules } = setUp();

    complete(computer, Structural, 3);

    const spaceship = game.spaceships.getActiveByPlayer(computer)!;

    // With a Fuel on the way, the next is a Structural ((3 + 1) / 4 = 1 component counts, and it's taken).
    expect(rules.process(ComputerSpaceshipPart, spaceship, all, [Fuel])).eql([
      Structural,
    ]);
    expect(
      rules.process(ComputerSpaceshipPart, spaceship, [Structural], [])
    ).eql([null]);
  });

  // The computer player ranks above the person unless `personStronger` (core-power's `Rank`).
  const ranked = (
    rules: RuleRegistry,
    person: Player,
    personStronger: boolean
  ) =>
    rules.register(
      new Rank(
        new Effect((player: Player): number =>
          (player === person) === personStronger ? 10 : 1
        )
      )
    );

  const ship15 = (
    complete: (player: Player, PartType: typeof Part, count?: number) => void,
    computer: Player,
    components: number
  ) => {
    complete(computer, Structural, 15);
    complete(computer, Propulsion, components);
    complete(computer, Fuel, components);
    complete(computer, Habitation);
    complete(computer, LifeSupport);
    complete(computer, Power);
  };

  it('launches a computer player\'s ship over 75%, with "other-computers" offered for a rule set to register', (): void => {
    const { complete, computer, game, person, rules } = setUp();

    ranked(rules, person, false);
    ship15(complete, computer, 2);

    const spaceship = game.spaceships.getActiveByPlayer(computer)!;

    expect(rules.process(ComputerLaunch, spaceship)).eql([true]);
    expect(
      computerLaunchRule('test', 'other-computers', {
        clientRegistry: game.clients,
        spaceshipRegistry: game.spaceships,
        playerRegistry: game.players,
        playerResearchRegistry: game.playerResearch,
        pendingEffectRegistry: game.pendingEffects,
        gameDifficultyRegistry: game.difficulty,
        ruleRegistry: rules,
        year: game.year,
      }).process(spaceship)
    ).true;
  });

  it("reads a person's power rank for the launch, whether or not the person has a ship", (): void => {
    // 15 structurals, 1 + 1 components: 67%, launched only when a person is stronger.
    const weaker = setUp(),
      stronger = setUp();

    ranked(weaker.rules, weaker.person, false);
    ranked(stronger.rules, stronger.person, true);
    ship15(weaker.complete, weaker.computer, 1);
    ship15(stronger.complete, stronger.computer, 1);

    expect(
      weaker.rules.process(
        ComputerLaunch,
        weaker.game.spaceships.getActiveByPlayer(weaker.computer)!
      )
    ).eql([false]);
    expect(
      stronger.rules.process(
        ComputerLaunch,
        stronger.game.spaceships.getActiveByPlayer(stronger.computer)!
      )
    ).eql([true]);
  });
});
