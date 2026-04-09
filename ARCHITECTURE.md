Systemarkitektur - Pacman Deluxe

Övergripande struktur

Spelet är uppbyggt som en modulär motor med en central orchestrator (game.js) som styr flödet mellan olika spellägen (Normal och Space för tillfället).

Game Loop använder requestAnimationFrame via funktionen animate() för att skapa en loop som genererar 60 bilder i sekunden (FramesPerSecond).

Beroenden hanteras via ES6-moduler (export/import) samt använder sig av HTML5 Canvas API.

1. Resurshantering (endast bilder än så länge)
Bild-filer är samlade i katalogen 'assests' och läses in i respektive map-fil:
map.js: huvudbanan baserad på klassiska pacman-spelet
map-extra-1: 'rymdbanan', en extra/bonusbana med ett helt annat rörelsemönster

Komponentgrupper
2. Entiteter (Modeller)
Objekt som existerar i spelvärlden. De har tillstånd (position, hastighet) och en draw()-metod.

Klasser:
Boundary (boundary.js): Olika typer av hinder (väggar i labyrinten, asteroider i rymdbanan etc)
FloatingText (floatingText.js): Visuella effekter för poäng
Ghost (ghost.js): Fiender i huvudbanan
Player (player.js): Hjälten, har olika physicsMode
Villain (villain.js): Den onda Pacman i rymdbanan
Pellet (items.js): Saker som går att äta (vissa är dock skadliga)
PowerUp (items.js): Saker som om dem äts ger extra förmågor

3. Controllers (Logik)
Rena logikmoduler som beräknar förflyttning och beteende av och för entiteterna. De ritar ingenting själva.

ghostController.js
itemsController.js
playerController.js (hanterar både rutnätsbaserad rörelse och rymdfysik.)
villainController.js

4. State Management & System
Minnet och globala regler

collision.js: Ett bibliotek av matematiska hjälpfunktioner för att detektera överlapp mellan cirklar och rektanglar.
gameState.js: Håller reda på poäng, hälsa och globala flaggor (t.ex. hasVisitedExtraLevel).
inputHandler.js: Styr inputmetoder via piltangenter eller via swipe/touch för mobilanvändare.
Map System: map.js samt map-extra-1.js håller reda på var väggar/hinder, entiteter samt items skall ritas ut - hur kartorna ser ut.
Level Snapshots: Vid byte mellan banor sparas entiteternas tillstånd temporärt i game.js.

5. UI & Flow (Användargränssnitt)
Lagret mellan spelaren och koden

Meny-system (menu.js): Hanterar menyer för Startskärm, Paus, LevelComplete och GameOver.
HUD (Heads-Up Display): Uppdaterar poängsiffror samt healthbar

6. Orchestrator (Dirigenten)
game.js: Kör init() - startar allt - och animate() - håller takten. Hanterar övergångar mellan olika physicsMode och sköter level snapshots kopplade till dessa.

När refactoring är färdig vill jag att koden skall följa denna struktur:

src/
│
├── core/
│   ├── game.js
│   ├── gameState.js
│
├── controllers/
│   ├── playerController.js
│   ├── ghostController.js
│   ├── villainController.js
│   ├── itemsController.js
│
├── rendering/
│   └── renderLevel.js
│
├── levels/
│   ├── classicMap.js
│   ├── spaceMap.js
│   ├── spaceLevel.js
│
├── entities/
│   ├── player.js
│   ├── ghost.js
│   ├── villain.js
│   ├── boundary.js
│   ├── items.js
│
├── systems/
│   ├── collision.js
│   ├── portalManager.js
│   ├── inputHandler.js
│   ├── uiManager.js
