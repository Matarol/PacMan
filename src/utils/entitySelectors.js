// Hjälpfunktion för att hämta entitet utifrån typ
export const getPlayer = (world) => world.entities.find(e => e.type === 'player');
export const getGhosts = (world) => world.entities.filter(e => e.type === 'ghost');
export const getVillains = (world) => world.entities.filter(e => e.type === 'villain');
export const getBoundaries = (world) => world.entities.filter(e => e.type === 'boundary');
export const getPowerUps = (world) => world.entities.filter(e => e.type === 'powerUp');
export const getPellets = (world) => world.entities.filter(e => e.type === 'pellet');

// Hjälpfunktion för att hämta entitet utifrån egenskap
export const getPortals = (world) => world.entities.filter(e => e.isPortal);
export const getPortalCandidates = (world) => world.entities.filter(e => e.canBecomePortal);


// Generell hjälpfunktion för att hämta entitet utifrån typ, där man anger typen som argument. 
export const getEntitiesByType = (world, type) => world.entities.filter(e => e.type === type);
export const getEntityByType = (world, type) => world.entities.find(e => e.type === type);