import {
  Fuel,
  Habitation,
  LifeSupport,
  Power,
  Propulsion,
  Structural,
} from '../Parts';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Landed from '@civ-clone/core-spaceship/Rules/Landed';
import Action from '@civ-clone/core-player/Rules/Action';
import ApolloProgram from '@civ-clone/base-wonder-apolloprogram/ApolloProgram';
import Build from '@civ-clone/core-city-build/Rules/Build';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Client from '@civ-clone/core-client/Client';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import LaunchSpaceship from '@civ-clone/base-player-action-launch-spaceship/LaunchSpaceship';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import Part from '@civ-clone/core-spaceship/Part';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import SpaceFlight from '@civ-clone/base-science-advance-spaceflight/SpaceFlight';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Year from '@civ-clone/core-game-year/Year';
import YearRule from '@civ-clone/core-game-year/Rules/Year';
import civ2CityImprovementCaptured from '@civ-clone/civ2-city-improvement/Rules/City/captured';
import { expect } from 'chai';
import { launchRecord } from '../lib/ship';
import { register } from '../registerRules';

// A game of a person and a computer player, a year a turn from 1990, with civ2-spaceship's rules.
const setUp = () => {
  const rules = new RuleRegistry(),
    turn = new Turn(),
    year = new Year(turn, rules),
    game = new Game({ rules, turn, year }),
    person = new Player(rules),
    computer = new Player(rules),
    events: [string, ...unknown[]][] = [];

  rules.register(new YearRule(new Effect((value: number) => 1990 + value)));
  register(game);

  game.players.register(person, computer);
  game.clients.register(new Client(person), new AIClient(computer));

  [
    'player:spaceship:part-built',
    'player:spaceship:launched',
    'player:spaceship:landed',
    'player:spaceship:lost',
  ].forEach((event) =>
    game.engine.on(event, (...args: unknown[]) => events.push([event, ...args]))
  );

  let cityCount = 0;

  const cityOf = (player: Player): City => {
      const id = `city-${++cityCount}`;

      return {
        player: () => player,
        destroyed: () => false,
        id: () => id,
      } as unknown as City;
    },
    cities = new Map([
      [person, cityOf(person)],
      [computer, cityOf(computer)],
    ]),
    complete = (player: Player, PartType: typeof Part, count = 1): void => {
      for (let i = 0; i < count; i++) {
        rules.process(
          BuildingComplete,
          {} as CityBuild,
          new PartType(cities.get(player)!, rules)
        );
      }
    },
    fill = (
      player: Player,
      counts: [typeof Part, number][] = [
        [Structural, 39],
        [Propulsion, 8],
        [Fuel, 8],
        [Habitation, 4],
        [LifeSupport, 4],
        [Power, 4],
      ]
    ): Spaceship => {
      counts.forEach(([PartType, count]) => complete(player, PartType, count));

      return game.spaceships.getActiveByPlayer(player)!;
    },
    startTurn = (value: number): void => {
      turn.set(value);
      rules.process(Start, turn);
    };

  return {
    cities,
    complete,
    computer,
    events,
    fill,
    game,
    person,
    rules,
    startTurn,
    turn,
    year,
  };
};

describe('civ2-spaceship rules', (): void => {
  it('builds the first part into a new ship, and counts parts only within the limits', (): void => {
    const { complete, events, game, person } = setUp();

    complete(person, Structural, 3);
    complete(person, Propulsion, 2);
    complete(person, Habitation);

    const spaceship = game.spaceships.getActiveByPlayer(person)!;

    // 3 structurals: 1 propulsion ((3 + 1) / 4), no habitation ((3 + 1) / 8).
    expect(spaceship.activeParts().map((part) => part.constructor)).eql([
      Structural,
      Structural,
      Structural,
      Propulsion,
    ]);
    expect(spaceship.inactiveParts().map((part) => part.constructor)).eql([
      Propulsion,
      Habitation,
    ]);
    expect(
      events.filter(([event]) => event === 'player:spaceship:part-built')
    ).length(6);
  });

  it("caps a computer player's ship at one of each module", (): void => {
    const { computer, fill } = setUp(),
      spaceship = fill(computer);

    expect(
      spaceship.activeParts().filter((part) => part instanceof Habitation)
        .length
    ).equal(1);
    expect(spaceship.chanceOfSuccess()).equal(1);
  });

  it('may launch with a habitation module built and success above 0, and offers the launch only then', (): void => {
    const { complete, game, person, rules } = setUp(),
      launches = () =>
        rules
          .process(Action, person)
          .flat()
          .filter((action) => action instanceof LaunchSpaceship);

    complete(person, Structural, 15);
    complete(person, Propulsion, 4);
    complete(person, Fuel, 3);
    complete(person, LifeSupport);
    complete(person, Power);

    const spaceship = game.spaceships.getActiveByPlayer(person)!;

    // Life support and power but no habitation: success is 97% (75 × 75 / 31 = 18.1 years), but there is no one to
    //  launch.
    expect(spaceship.chanceOfSuccess()).equal(0.97);
    expect(spaceship.launchable()).false;
    expect(launches()).length(0);
    expect(spaceship.launch()).false;

    complete(person, Habitation);

    expect(spaceship.launchable()).true;
    expect(launches()).length(1);
  });

  it('launches on the full mass flight, lands as the arrival year starts, and keeps a year a turn', (): void => {
    const { events, fill, person, rules, startTurn, turn, game } = setUp(),
      spaceship = fill(person);

    turn.set(400);
    expect(spaceship.flightTime()).equal(15);
    expect(spaceship.launch()).true;

    expect(launchRecord(spaceship, game.pendingEffects)).eql({
      fusion: false,
      launchYear: 2390,
      arrivalYear: 2405,
    });
    expect(events).deep.include(['player:spaceship:launched', person, 2405]);

    startTurn(414);
    expect(spaceship.successful()).null;

    // The game ends for it in civ2-game-end's rule, at the default priority and registered first (civ2-game-end loads
    //  before civ2-spaceship), yet after the landing is announced.
    const emit = rules.getById('civ2-spaceship:spaceship/landed/emit')!;

    rules.unregister(emit);
    rules.register(
      new Landed(
        new Effect(() => {
          events.push(['game:over']);
        })
      ),
      emit
    );

    startTurn(415);
    expect(spaceship.successful()).true;
    expect(events.slice(-2)).eql([
      ['player:spaceship:landed', person],
      ['game:over'],
    ]);

    // Landed, it's still launched: a part finished now is left behind, and makes no second ship.
    fill(person, [[Structural, 1]]);
    expect(game.spaceships.getBy('player', person)).length(1);
  });

  it('stops building parts once launched, and refuses a kind built in full', (): void => {
    const { cities, complete, fill, game, person, rules, startTurn, turn } =
        setUp(),
      city = cities.get(person)!,
      buildable = (PartType: typeof Part): boolean =>
        rules
          .get(Build)
          .filter((rule) => rule.mayApplyTo(PartType))
          .filter((rule) => rule.validate(city, PartType))
          .every((rule) => rule.process(city, PartType).validate());

    game.playerResearch.register(new PlayerResearch(person, rules));
    game.playerResearch.getByPlayer(person).addAdvance(SpaceFlight);

    // No Apollo Program yet.
    expect(buildable(Structural)).false;

    game.cityImprovements.register(
      new ApolloProgram(city, rules) as unknown as any
    );
    turn.set(300);
    expect(buildable(Structural)).true;
    // Plastics unknown.
    expect(buildable(Propulsion)).false;

    complete(person, Structural, 39);
    expect(buildable(Structural)).false;

    const spaceship = fill(person, [
      [Propulsion, 8],
      [Fuel, 8],
      [Habitation, 1],
      [LifeSupport, 1],
      [Power, 1],
    ]);

    expect(spaceship.launch()).true;
    complete(person, Habitation);
    expect(buildable(Habitation)).false;
    expect(
      spaceship.inactiveParts().length + spaceship.activeParts().length
    ).equal(58);

    // Landed, the flag stays: still no parts.
    startTurn(300 + spaceship.flightTime());
    expect(spaceship.successful()).true;
    expect(buildable(Structural)).false;
  });

  it('loses a ship when its player is destroyed, and gives a new one', (): void => {
    const { events, fill, game, person, rules } = setUp(),
      spaceship = fill(person);

    rules.process(Defeated, person, null);

    expect(spaceship.successful()).false;
    expect(events).deep.include(['player:spaceship:lost', person, false]);
    expect(game.spaceships.getActiveByPlayer(person)).not.null;
    expect(game.spaceships.getActiveByPlayer(person)).not.equal(spaceship);
  });

  it("loses the ship with the capital through civ2-city-improvement's Palace escape, a computer player's or a person's", (): void => {
    const { cities, computer, fill, game, person, rules } = setUp(),
      ships = [fill(computer), fill(person)],
      capitals = [cities.get(computer)!, cities.get(person)!];

    capitals.forEach((capital) =>
      game.cityImprovements.register(new Palace(capital, rules))
    );
    // Its escape and its Palace's loss, as civ2-city-improvement registers them.
    rules.register(
      ...civ2CityImprovementCaptured({
        cityGrowthRegistry: game.cityGrowth,
        cityImprovementRegistry: game.cityImprovements,
        cityRegistry: game.cities,
        clientRegistry: game.clients,
        gameDifficultyRegistry: game.difficulty,
        landMassRegistry: game.landMasses,
        playerTreasuryRegistry: game.playerTreasuries,
        ruleRegistry: rules,
        spaceshipRegistry: game.spaceships,
        unitRegistry: game.units,
      } as any).filter((rule) =>
        [
          'civ2-city-improvement:city/captured/palace-escape',
          'civ2-city-improvement:city/captured/palace',
        ].includes(rule.id()!)
      )
    );

    // Neither has the 1000 gold to move its Palace.
    rules.process(Captured, capitals[0], person, computer, null);
    rules.process(Captured, capitals[1], computer, person, null);

    expect(ships.map((ship) => ship.successful())).eql([false, false]);
    // Each may build another.
    expect(game.spaceships.getActiveByPlayer(computer)).not.null;
    expect(game.spaceships.getActiveByPlayer(person)).not.null;
  });
});

describe('civ2-spaceship: the Apollo Program', (): void => {
  it('gives every player a ship when it is built, and a newcomer one at the start of a turn', (): void => {
    const { cities, computer, game, person, rules, startTurn } = setUp(),
      apollo = new ApolloProgram(cities.get(person)!, rules),
      newcomer = new Player(rules),
      barbarians = new Player(rules);

    barbarians.setCivilization(new Barbarian());
    game.players.register(barbarians);

    startTurn(2);
    expect(game.spaceships.entries()).length(0);

    rules.process(BuildingComplete, {} as CityBuild, apollo);
    expect(game.spaceships.getActiveByPlayer(person)).not.null;
    expect(game.spaceships.getActiveByPlayer(computer)).not.null;

    game.wonders.register(apollo);
    game.players.register(newcomer);
    startTurn(3);
    expect(game.spaceships.getActiveByPlayer(newcomer)).not.null;
    // Never the barbarians.
    expect(game.spaceships.getActiveByPlayer(barbarians)).null;
    expect(game.spaceships.entries()).length(3);
  });
});
