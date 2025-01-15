async function hashTextToIntRange(text: string, maxRange: number): Promise<number> {
  // 1. Encode the input string
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // 2. Calculate SHA-1 hash (returns an ArrayBuffer)
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);

  // 3. Convert ArrayBuffer to Uint8Array
  const hashArray = new Uint8Array(hashBuffer);

  // 4. Convert the bytes to a BigInt
  //    SHA-1 is 20 bytes (160 bits).
  let hashValue = 0n;
  for (const byte of hashArray) {
    hashValue = (hashValue << 8n) + BigInt(byte);
  }

  // 5. Reduce (mod) by the desired range
  //    If range > 2^53, consider returning a BigInt instead of a number
  const result = hashValue % BigInt(maxRange);

  // 6. Convert to number (safe if maxRange < 2^53)
  return Number(result);
}

export default class Seeder {
  private seed = '';
  private index = 0;

  constructor(seed: string) {
    this.seed = seed;
  }

  // Erzeugt die nächste Zahl im angegebenen Seed im Intervall [0, bound-1]
  async getRandomInt(bound: number): Promise<number> {
    this.index += 1;
    return await hashTextToIntRange(this.seed + this.index, bound);
  }

  // Erzeugt die nächste Zahl im angegebenen Seed im Intervall [1, bound]
  async getRandomAltInt(bound: number): Promise<number> {
    return (await this.getRandomInt(bound)) + 1;
  }

  // Erzeugt den nächsten boolischen Wert im angegebenen Seed
  async getRandomBoolean(): Promise<boolean> {
    return (await this.getRandomInt(2)) === 1;
  }
}
