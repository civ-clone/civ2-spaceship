# civ2-spaceship

Civilization II's spaceship, as `core-spaceship` rules on `base-spaceship`'s mechanisms, following OpenCiv2's
reconstruction of the original (`src/auto/spaceship.cpp`, `src/auto/city.cpp`, `src/auto/game.cpp`,
richardpenman/civ2@49f26ec): the Classic behaviour, numbers only.

## Parts (`data/parts`)

| Kind | Most built | Mass | Cost | Advance |
|---|---|---|---|---|
| Structural | 39 | 1 | 80 | Space Flight |
| Propulsion | 8 | 4 | 160 | Plastics |
| Fuel | 8 | 4 | 160 | Plastics |
| Habitation | 4 | 16 | 320 | Superconductor |
| Life Support | 4 | 16 | 320 | Superconductor |
| Solar Panel (`Power`) | 4 | 16 | 320 | Superconductor |

- **Building them** (`Requirements`, `Rules/City/build`): the Apollo Program built by anyone, even if lost since
  (`Part` requires `ApolloProgram` at `range: 'world'`); each kind's advance; only for a ship that hasn't launched, in
  the years AD; and no more of a kind than can be built. The costs are the group's @IMPROVE rows × 10.
- **The ship:** once the Apollo Program is built every player gets a ship (`SpaceshipLayout`, our own plain layout: a
  row of slots for each kind), and a player who comes into the game later gets one at the start of a turn. A part goes
  into the first empty slot of its kind.
- **Counted parts** (`Rules/Spaceship/active`, `lib/stats` `partLimit`): every structural counts; propulsion up to
  (S + 1) / 4, fuel (S − 1) / 4, habitation (S + 1) / 8, life support (S − 3) / 8 and solar panels (S − 7) / 8, where
  S is the structurals built. A computer player's ship counts at most 1 of each module (`COMPUTER_MODULE_LIMIT`, for
  the computer players' space race too). Parts over the limit are built but don't count.

## The flight (`lib/stats`)

- **Mass:** every part built, counted or not. The full mass adds one of each kind not yet built.
- **Thrust:** the lesser of the counted propulsion's and fuel's, each 1 for the first four parts, 2 for the fifth and
  sixth, 3 for the seventh and eighth (14 for eight), × 10.
- **Flight** in tenths of a year: mass × 75 / (thrust + 1), 75 being @COSMIC's paradigm, three quarters (56) with fusion
  (Fusion Power known before the launch). The ship launches on the full mass's flight; whole years are added to the
  launch year for its arrival year.
- **Success:** 100, scaled by support (life support × 100 / habitation) and energy (solar panels × 200 / (habitation +
  life support)), each kept to 0 to 100, less (flight − 150) / 10 for a flight over 15 years (the mass's flight, not the
  full mass's), kept to 0 to 100. It only scales the score.

## Launch and arrival

- **Launchable** (`civ2-spaceship:spaceship/launchable`): a habitation module built (counted or not) and success above
  0. `launch()` does nothing otherwise, so the `LaunchSpaceship` action is offered only then.
- **The launch** is recorded in the game's pending effects (`lib/ship` `launchRecord`: fusion, launch year, arrival
  year) and `player:spaceship:launched` is emitted with the player and the arrival year. From then on every turn is a
  year (`civ2-game-year`).
- **Arrival** (`civ2-spaceship:turn/start/arrival`): as a turn starts, the first launched ship whose arrival year has
  come lands, in player order, one a turn, before the retirement check. There is no failure roll: the first to land
  wins (`civ2-game-end`).

## Losing a ship

- **The capital taken:** the ship is lost unless the Palace escapes to another city for 1000 gold
  (civ2-city-improvement). A computer player's is settled at the capture; a person, who is asked, at the start of the
  next turn. A launched ship returns, one being built is destroyed (`player:spaceship:lost`, with whether it had
  launched); either way its player may build another.
- **The civilization destroyed** loses its ship.

## Events

`player:spaceship:part-built`, `player:spaceship:launched` (player, arrival year), `player:spaceship:landed`,
`player:spaceship:lost` (player, launched).

## Saves

Register `SpaceshipLayout` with the game's saveable classes. The launch record is a `PendingEffect`.

## Not as the original

- The original builds three improvements and asks a person which component or module each becomes; here each of the
  six kinds is its own build, at its group's cost, and a kind built in full can't be chosen.
- The original keeps no ship apart from the parts; here a ship is handed to every player once the Apollo Program is
  built.
- The flight time a ship shows before it launches is the arrival flight in whole years, not the mass's flight in
  tenths.
- A person's ship waiting on a Palace escape isn't saved: a game saved between the capture and the next turn keeps
  the ship.
- Not here: a computer player's launch and its re-picked production (the computer players' space race), and the
  launch's diplomacy (civ2-diplomacy).
