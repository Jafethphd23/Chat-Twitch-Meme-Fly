// Storage interface - not actively used for chat translation
// but available for future preference persistence

export interface IStorage {
  // Available for future features like saving preferences
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
