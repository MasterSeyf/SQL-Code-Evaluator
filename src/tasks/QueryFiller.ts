import { integerValueOf, sbReplace } from './JavaJava';
import Seeder from './Seeder';
import Tables from './Tables';

export default class QueryFiller {
  private query: string;

  private usedRelations: (string | null)[] = [];
  private places: (string | null)[][] = [];
  private filledPlaces: (string | null)[][] = [];
  private seeder: Seeder;
  private countJoins: number;
  private countQueryDepth: number;
  private countPerLevel: number[] = [];
  private countRelations: number = 0;
  private countAttributes: number;
  private joinVariant: number;
  private aliasVariant: number;

  // Konstruktor
  constructor(seeder: Seeder, query: string, countQueryDepth: number, countJoins: number, countAttributes: number, aliasVariant: number, joinVariant: number) {
    this.seeder = seeder;
    this.query = query;
    this.countQueryDepth = countQueryDepth;
    this.countJoins = countJoins;
    this.countAttributes = countAttributes;
    this.aliasVariant = aliasVariant;
    this.joinVariant = joinVariant;
  }

  async fill(): Promise<void> {
    await this.fillTableAlias();
    await this.fillTableConditions();
    await this.fillTableAttributes();
    this.fillSelect0();
    await this.fillConditions();
  }

  // Füllung der Tabellennamen der Unterabfragen
  async fillTableAlias(): Promise<void> {
    // Bestimmt die Anzahl der Aliase im Query
    this.countRelations = 0;
    let offset: number = 0;
    let index: number = this.query.indexOf('$', offset);
    while (index !== -1) {
      this.countRelations++;
      offset = index + 1;
      index = this.query.indexOf('$', offset);
    }

    // Wechselt jeden Aliasplatzhalter mit einem Alias aus
    let numRelationsFound: number = 0;
    this.usedRelations = Array(this.countRelations).fill(null);
    offset = 0;
    index = this.query.indexOf('$', offset);
    while (index !== -1) {
      this.query = sbReplace(this.query, index, index + 1, await this.randomAlias(numRelationsFound));
      numRelationsFound++;
      offset = index + 1;
      index = this.query.indexOf('$', offset);
    }
  }

  // Wählt einen Alias aus, welcher global noch nicht im Query verwendet wurde
  async randomAlias(k: number): Promise<string> {
    const relationsAlias: string[] = new Tables().output(1);
    let alias: string;

    while (true) {
      // Erstellt den potentiellen Alias und schaut, ob er in der Liste der bisherigen Aliase schonmal vorkam
      alias = relationsAlias[await this.seeder.getRandomInt(relationsAlias.length)];
      let isUnique: boolean = true;
      for (let i: number = 0; i < k; i++) {
        if (this.usedRelations[i] === alias) {
          isUnique = false;
          break;
        }
      }

      // Falls es sich um kein Duplikat handelt, wird er abgespeichert und zurückgegeben
      if (isUnique) {
        this.usedRelations[k] = alias;
        return alias;
      }
    }
  }

  // Füllung der Tabellennamen in den Bedingungen
  async fillTableConditions(): Promise<void> {
    this.places = Array.from({ length: this.countRelations }, () => Array(5 + this.countAttributes).fill(null));

    this.countPerLevel = Array(this.countQueryDepth + 1).fill(0);
    let count: number = 0;
    let level: number = 0;
    let on: boolean = false;
    for (let i: number = 0; i < this.query.length - 4; i++) {
      // Erster Schritt: Protokollierung welche Aliase es gibt, in welcher Ebene und als wie vielter sie sich in dieser Ebene befinden
      if (this.query.substring(i, i + 4) === ' ON ') {
        on = true;
      }
      if (this.query.substring(i, i + 1) === '(') {
        level++;
      }
      if (this.query.substring(i, i + 1) === ')') {
        level--;
      }

      if (/ [A-Z] /.test(this.query.substring(i, i + 3))) {
        this.places[count][0] = this.query.substring(i + 1, i + 2); // Alias
        this.places[count][1] = level + ''; // Level
        this.places[count][2] = this.countPerLevel[level] + ''; // Der wievielte in diesem Level
        this.countPerLevel[level]++;
        count++;

        // Bestimmung der Tabellennamen und Attribute in den primitiven Unterabfragen für später im prefix Alias Fall
        if (this.query.substring(i + 7, i + 8) === '(' && this.query.substring(i + 7, i + 17) !== '(SELECT []') {
          let j: number = i + 15;
          let countLocalAttributes: number = 0;
          const nextFROM: number = this.query.indexOf('FROM', j);

          while (true) {
            const nextComma: number = this.query.indexOf(',', j);
            const nextSpace: number = this.query.indexOf(' ', j);
            let next: number = 0;
            if (nextComma < 0) {
              next = nextSpace;
            } else {
              next = Math.min(nextComma, nextSpace);
            }
            this.places[count - 1][4 + countLocalAttributes] = this.query.substring(j, next);
            countLocalAttributes += 1;
            this.places[count - 1][3] = countLocalAttributes + '';
            if (nextComma > nextFROM || nextComma < 0) {
              break;
            }
            for (let k: number = nextComma; k < this.query.length; k++) {
              const c = this.query.charAt(k);
              // Check if character is uppercase
              if (c >= 'A' && c <= 'Z') {
                j = k;
                break;
              }
            }
          }
        }

        // Bestimmung der Anzahl der Attribute wenn es keine primitive Anfrage war für den prefix Alias Fall
        if (this.query.substring(i + 7, i + 8) === '(' && this.query.substring(i + 7, i + 17) === '(SELECT []') {
          let j: number = i + 15;
          let countLocalAttributes: number = 0;
          const nextFROM: number = this.query.indexOf('FROM', j);
          let nextAttribute: number = this.query.indexOf('[]', j);
          while (nextAttribute < nextFROM) {
            countLocalAttributes += 1;
            j = nextAttribute;
            nextAttribute = this.query.indexOf('[]', j + 1);
          }
          this.places[count - 1][3] = countLocalAttributes + '';
        }

        // Bestimmung der Tabellennamen und Attribute in den primitiven Unterabfragen für später im postfix Alias Fall
        if (this.query.substring(i - 4, i - 3) === ')') {
          let primitive: boolean = true;
          let done: boolean = false;
          let localLevel: number = level;
          for (let l: number = i - 4; l > 0; l--) {
            if (done === true) {
              break;
            }
            if (/ [A-Z] /.test(this.query.substring(l, l + 3))) {
              primitive = false;
            }
            if (this.query.substring(l, l + 1) === ')') {
              localLevel++;
            }
            if (this.query.substring(l, l + 1) === '(') {
              localLevel--;
            }

            // Zwischengeschobene Logik zur Bestimmung der Anzahl der Attribute wenn es keine primitive Anfrage war für den postfix Alias Fall
            if (this.query.substring(l, l + 1) === '(' && this.query.substring(l, l + 10) === '(SELECT []' && localLevel === level) {
              let countLocalAttributes: number = 0;
              const nextFROM: number = this.query.indexOf('FROM', l);
              let nextAttribute: number = this.query.indexOf('[]', l);
              while (nextAttribute < nextFROM) {
                countLocalAttributes += 1;
                l = nextAttribute;
                nextAttribute = this.query.indexOf('[]', l + 1);
              }
              this.places[count - 1][3] = countLocalAttributes + '';
            }

            if (this.query.substring(l, l + 1) === '(' && this.query.substring(l, l + 7) === '(SELECT' && this.query.substring(l, l + 10) !== '(SELECT []' && primitive) {
              let j: number = l + 8; //Nach "(SELECT "
              let countLocalAttributes: number = 0;
              const nextFROM: number = this.query.indexOf('FROM', j);

              while (true) {
                const nextComma: number = this.query.indexOf(',', j);
                const nextSpace: number = this.query.indexOf(' ', j);
                let next: number = 0;
                if (nextComma < 0) {
                  next = nextSpace;
                } else {
                  next = Math.min(nextComma, nextSpace);
                }
                this.places[count - 1][4 + countLocalAttributes] = this.query.substring(j, next);
                countLocalAttributes += 1;
                this.places[count - 1][3] = countLocalAttributes + '';
                if (nextComma > nextFROM || nextComma < 0) {
                  done = true;
                  break;
                }
                for (let k: number = nextComma; k < this.query.length; k++) {
                  const c = this.query.charAt(k);
                  // Check if character is uppercase
                  if (c >= 'A' && c <= 'Z') {
                    j = k;
                    break;
                  }
                }
              }
            }
          }
        }
      }
      // Zweiter Schritt: Füllung der Tabellennamen der ON und WHERE Bedingungen mit den letzten beiden Aliasen der selben Ebene
      // Fall für ON Bedingungen für alle Verbundsarten ungleich 4
      if (this.query.substring(i, i + 2) === '({' && this.joinVariant < 4) {
        let prev: number = 0;
        let prevIndex: number = 0;
        let max: number = 0;
        let maxIndex: number = 0;
        let found: boolean = false;
        for (let j: number = 0; j < this.places.length; j++) {
          if (this.places[j][1] !== null && integerValueOf(this.places[j][1]) === level - 1) {
            if (this.places[j][2] !== null && integerValueOf(this.places[j][2]) >= max) {
              max = integerValueOf(this.places[j][2]);
              maxIndex = j;
            }
          }
        }
        for (let j: number = 0; j < this.places.length; j++) {
          if (this.places[j][1] !== null && integerValueOf(this.places[j][1]) === level - 1) {
            if (this.places[j][2] !== null && integerValueOf(this.places[j][2]) >= prev && integerValueOf(this.places[j][2]) < max) {
              if (on === false) {
                if (integerValueOf(this.places[j][2]) > integerValueOf(this.places[maxIndex][2])) {
                  prev = integerValueOf(this.places[j][2]);
                  prevIndex = j;
                  found = true;
                }
              }
              if (on === true) {
                prev = integerValueOf(this.places[j][2]);
                prevIndex = j;
                found = true;
              }
            }
          }
        }
        // // Subfall für infix Verbundsfall
        let replace: string = '?';
        if (found === false) {
          let levelPrev: number = level;
          for (let j: number = i + 1; j < this.query.length; j++) {
            if (this.query.substring(j, j + 1) === '(') {
              levelPrev++;
            }
            if (this.query.substring(j, j + 1) === ')') {
              levelPrev--;
            }
            if (/ [A-Z] /.test(this.query.substring(j, j + 3)) && levelPrev === level - 1) {
              replace = this.query.substring(j + 1, j + 2);
              break;
            }
          }
        }

        // // Fallunterscheidung infix und postfix Verbundsbedingungen
        if (found === false) {
          this.query = sbReplace(this.query, i + 1, i + 14, this.places[maxIndex][0] + '.[] = ' + (found ? this.places[prevIndex][0] : replace) + '.[]');
        }
        if (found === true) {
          this.query = sbReplace(this.query, i + 1, i + 14, (found ? this.places[prevIndex][0] : replace) + '.[] = ' + this.places[maxIndex][0] + '.[]');
        }
        i = i + 11;
      }

      // Fall für ON Bedingungen für die Verbundsart 4
      if (this.query.substring(i, i + 2) === '({' && this.joinVariant === 4) {
        let replace1: string = '?';
        let replace2: string = '?';
        let found: boolean = false;
        let levelPrev: number = level;
        for (let j: number = i + 1; j < this.query.length; j++) {
          if (this.query.substring(j, j + 1) === '(') {
            levelPrev++;
          }
          if (this.query.substring(j, j + 1) === ')') {
            levelPrev--;
          }
          if (/ [A-Z] /.test(this.query.substring(j, j + 3)) && levelPrev === level - 1) {
            if (found === false) {
              replace1 = this.query.substring(j + 1, j + 2);
              found = true;
              continue;
            }
            if (found === true) {
              replace2 = this.query.substring(j + 1, j + 2);
              break;
            }
          }
        }
        this.query = sbReplace(this.query, i + 1, i + 14, replace1 + '.[] = ' + replace2 + '.[]');
      }

      // Fall für WHERE Bedingungen
      if (this.query.substring(i, i + 2) === ' {') {
        let levelLocal: number = 1;
        let countLocal: number = 0;
        const aliasLocal: (string | null)[] = Array(this.countJoins + 1).fill(null);
        for (let j: number = i; j > 0; j--) {
          if (this.query.substring(j, j + 1) === '(') {
            levelLocal--;
          }
          if (this.query.substring(j, j + 1) === ')') {
            levelLocal++;
          }
          if (levelLocal === 0) {
            break;
          }
          if (/ [A-Z] /.test(this.query.substring(j, j + 3)) && levelLocal === 1) {
            aliasLocal[countLocal] = this.query.substring(j + 1, j + 2);
            countLocal++;
          }
        }
        let random1: string = '';
        let random2: string = '';
        let lonely: boolean = false;
        if (countLocal === 1) {
          lonely = true;
        }
        while (true) {
          const j: number = await this.seeder.getRandomInt(this.countJoins + 1);
          if (aliasLocal[j] !== null) {
            random1 = aliasLocal[j];
            break;
          }
        }
        while (lonely === false) {
          const j: number = await this.seeder.getRandomInt(this.countJoins + 1);
          if (aliasLocal[j] !== null && aliasLocal[j] !== random1) {
            random2 = aliasLocal[j];
            break;
          }
        }
        if (lonely === false) {
          this.query = sbReplace(this.query, i + 1, i + 14, random1 + '.[] = ' + random2 + '.[]');
        }
        if (lonely === true) {
          this.query = sbReplace(this.query, i + 1, i + 3, random1);
        }
        i = i + 11;
      }
    }
  }

  // Methode zum Füllen der Attribute in den Bedingungen
  async fillTableAttributes(): Promise<void> {
    // Erstellung einer ArrayListe aus ArrayListen aus den Werten von Places um dynamisch die Anzahl ändern zu können für die Attribute der Relationen
    this.filledPlaces = [];
    for (let i: number = 0; i < this.places.length; i++) {
      const rowList: string[] = [];
      for (let j: number = 0; j < this.places[i].length; j++) {
        if (this.places[i][j] !== null) {
          rowList.push(this.places[i][j] ?? '');
        }
      }
      this.filledPlaces.push(rowList);
    }

    // Bestimmt die maximale Tiefe der Unterabfragen
    let maxLevel: number = 0;
    for (let i: number = 0; i < this.places.length; i++) {
      const localLevel: number = +(this.places[i][1] ?? 0);
      if (localLevel > maxLevel) {
        maxLevel = localLevel;
      }
    }
    let currentMaxLevel: number = maxLevel;

    // Füllt die nichtprimitiven Relationen mit allen möglichen Attributen aus ihren Unterabfragen (DO NOT TOUCH)
    let startIndex: number = 0;
    let oneUp: number = 0;
    let started: boolean = false;
    let go: boolean = true;
    while (currentMaxLevel >= 0) {
      if (started === true && go) {
        await this.appropriateAttributes(oneUp);
        started = false;
      }
      let indexStart: number = 0;
      let indexEnd: number = 0;
      oneUp = 0;
      let begin: boolean = false;
      let maxUnreached: boolean = true;
      for (let i: number = startIndex; i < this.filledPlaces.length; i++) {
        const localLevel: number = +(this.filledPlaces[i][1] ?? 0);
        if (localLevel < currentMaxLevel && begin === true) {
          startIndex = i;
          started = true;
          go = true;
          break;
        }
        if (localLevel === currentMaxLevel && begin === true) {
          indexEnd = i;
          for (let j: number = 4; j < this.filledPlaces[indexEnd].length; j++) {
            if (!this.filledPlaces[indexEnd][j]!.includes('.')) {
              this.filledPlaces[oneUp].push(this.filledPlaces[indexEnd][0] + '.' + this.filledPlaces[indexEnd][j]);
            }
            if (this.filledPlaces[indexEnd][j]!.includes('.')) {
              this.filledPlaces[oneUp].push(this.filledPlaces[indexEnd][0] + '.' + this.filledPlaces[indexEnd][j]!.substring(2));
            }
          }
        }
        if (localLevel === currentMaxLevel && begin === false) {
          indexStart = i;
          if (currentMaxLevel === 0 && maxUnreached === true) {
            // Fügt für die höchste Oberanfrage korrespondierende Werte wie das Level und die Anzahl der Attribute hinzu
            this.filledPlaces.splice(0, 0, []);
            this.filledPlaces[0].splice(0, 0, null);
            this.filledPlaces[0].splice(1, 0, -1 + '');
            this.filledPlaces[0].splice(2, 0, 0 + '');
            this.filledPlaces[0].splice(3, 0, this.countAttributes + '');
            i = 0;
            indexStart = 1;
            oneUp = 0;
            maxUnreached = false;
            continue;
          } else if (maxUnreached === true) {
            if (this.aliasVariant === 0) {
              oneUp = i - 1;
            }
            if (this.aliasVariant === 1 || this.aliasVariant === 2) {
              for (let j: number = i; j < this.filledPlaces.length; j++) {
                if (+(this.filledPlaces[j][1] ?? 0) < currentMaxLevel) {
                  oneUp = j;
                  break;
                }
              }
            }
          }
          for (let j: number = 4; j < this.filledPlaces[indexStart].length; j++) {
            if (!this.filledPlaces[indexStart][j]!.includes('.')) {
              this.filledPlaces[oneUp].push(this.filledPlaces[indexStart][0] + '.' + this.filledPlaces[indexStart][j]);
            }
            if (this.filledPlaces[indexStart][j]!.includes('.')) {
              this.filledPlaces[oneUp].push(this.filledPlaces[indexStart][0] + '.' + this.filledPlaces[indexStart][j]!.substring(2));
            }
          }
          begin = true;
        }
        if (i === this.filledPlaces.length - 1) {
          currentMaxLevel -= 1;
          startIndex = 0;
          started = true;
          if (this.aliasVariant === 0) {
            go = true;
          }
          if (this.aliasVariant === 1 || this.aliasVariant === 2) {
            go = false;
          }
          break;
        }
      }
    }
    await this.appropriateAttributes(0);
  }

  // Füllt den übergebenen Alias mit genau nur so vielen duplikatfreien Einträgen wie gewünscht
  async appropriateAttributes(oneUp: number): Promise<void> {
    let attributes: (string | null)[] = [];
    const numPotentialAttributes: number = this.filledPlaces[oneUp].length - 4;
    const numPotentialAttributesDistinct: number = Array.from(new Set(this.filledPlaces[oneUp].slice(4))).length; //Set is pretty much the equivalent of distinct
    const numNecessaryAttributes: number = +(this.filledPlaces[oneUp][3] ?? 0);

    loop: while (true) {
      // Wenn die Anzahl der distinkten Attribute kleiner ist als die benötigte Anzahl, werden alle Attribute genommen und die Schleife verlassen
      if (numPotentialAttributesDistinct < numNecessaryAttributes) {
        attributes.push(...Array.from(new Set(this.filledPlaces[oneUp].slice(4))));
        break;
      }

      // Ansonsten wird immer wieder ein neues Attribut genommen und auf Distinktheit geprüft
      const nextAttribute: number = (await this.seeder.getRandomInt(numPotentialAttributes)) + 4;
      attributes.push(this.filledPlaces[oneUp][nextAttribute]);
      for (let i: number = 0; i < attributes.length - 1; i++) {
        if (attributes[i] === attributes[attributes.length - 1]) {
          attributes = attributes.splice(attributes.length - 1, 1);
          continue loop;
        }
      }

      // Sobald genug Attribute gewählt wurden wird die Schleife verlassen
      if (attributes.length === numNecessaryAttributes) {
        break;
      }
    }

    const seenSuffixes = new Set<string | null>();
    attributes = attributes.filter((attr) => {
      const attrPart = attr?.substring(2) ?? null;
      if (seenSuffixes.has(attrPart)) {
        return false;
      } else {
        seenSuffixes.add(attrPart);
        return true;
      }
    });

    const firstPart = this.filledPlaces[oneUp].slice(0, 4);
    const combined = [...firstPart, ...attributes];
    this.filledPlaces[oneUp] = combined;

    // Die Anzahl der Attribute in einer benannten Unterabfrage wurde eventuell durch die Entfernung von Duplikaten reduziert; Hier wird sie aktuallisiert
    if (oneUp !== 0) {
      this.filledPlaces[oneUp][3] = this.filledPlaces[oneUp].length - 4 + '';
    }
  }

  // Fügt die zu den benannten Unterabfragen passenden Attribute im SELECT hinzu
  fillSelect0(): void {
    // Füllen der zu selektierenden Attribute bei der obersten Anfrage
    this.fillSelect2('', 0);

    let nextBracket: number = 0;
    for (let i: number = 0; i < this.query.length; i++) {
      // Prüft ob es weitere Brackets gibt
      nextBracket = this.query.indexOf('[]', i + 3);
      if (nextBracket === -1) {
        break;
      }

      // Füllt den SELECT
      if (/ [A-Z] /.test(this.query.substring(i, i + 3))) {
        // Sub-Fall für prefix Alias
        if (/ [A-Z] AS  \(/.test(this.query.substring(i, i + 8)) && / [A-Z] AS  \(SELECT \[\]/.test(this.query.substring(i, i + 17))) {
          const alias: string = this.query.substring(i + 1, i + 2);
          this.fillSelect2(alias, i + 8);
        }

        // Sub-Fall für postfix Alias
        if (/\) AS [A-Z] /.test(this.query.substring(i - 4, i + 3))) {
          const alias: string = this.query.substring(i + 1, i + 2);
          let localLevel: number = 0;
          for (let j: number = i - 4; j > 0; j--) {
            if (this.query.substring(j, j + 1) === ')') {
              localLevel++;
            }
            if (this.query.substring(j, j + 1) === '(') {
              localLevel--;
            }
            if (localLevel === 0) {
              if (this.query.substring(j, j + 10) === '(SELECT []') {
                this.fillSelect2(alias, j + 1);
              }
              if (/\(SELECT [A-Z]/.test(this.query.substring(j, j + 9))) {
                break;
              }
            }
          }
        }
      }
    }
  }

  // Für den übergebenen Alias und Index in dem sich der SELECT befindet werden passende Attribute ausgewählt
  fillSelect2(alias: string, index: number): void {
    let indexPlaces: number = 0;
    if (alias === '') {
      indexPlaces = 0;
    } else {
      for (let i: number = 1; i < this.filledPlaces.length; i++) {
        if (this.filledPlaces[i][0] === alias) {
          indexPlaces = i;
          break;
        }
      }
    }
    let attribute: string = '';
    let indexFROM: number = this.query.indexOf('FROM', index);
    let indexBracket: number = this.query.indexOf('[]', index);
    let countUsed: number = 0;
    const countPossible: number = this.filledPlaces[indexPlaces].length - 4;
    for (let i: number = index + 7; i < indexFROM; i++) {
      if (this.query.substring(i, i + 2) === '[]' && countUsed < countPossible) {
        attribute = this.filledPlaces[indexPlaces][countUsed + 4]!;
        this.query = sbReplace(this.query, i, i + 2, attribute);
        countUsed += 1;
        indexFROM = this.query.indexOf('FROM', index);
        indexBracket = this.query.indexOf('[]', i + 1);

        // Falls alles möglichen Attribute ausgewählt wurden es aber noch offene [] gibt, wird der Rest weggecutted
        if (countUsed === countPossible) {
          if (indexFROM > indexBracket) {
            const indexComma: number = this.query.indexOf(',', i);
            const indexEraseEnd: number = this.query.substring(indexComma, indexFROM).lastIndexOf('\n') + indexComma;
            this.query = sbReplace(this.query, indexComma, indexEraseEnd, '');
            break;
          }
        }
        i = indexBracket - 1;
      }
    }
  }

  // Fügt die zu den benannten Unterabfragen passenden Attribute in den Bedingungen hinzu
  async fillConditions(): Promise<void> {
    let attribute: string = '';
    let nextBracket: number = 0;
    for (let i: number = 0; i < this.query.length; i++) {
      // Prüft ob es weitere Brackets gibt
      if (nextBracket === -1) {
        break;
      }

      // Füllt die ON und WHERE Bedingungen
      if (/[A-Z]\.\[\]/.test(this.query.substring(i, i + 4))) {
        const alias: string = this.query.substring(i, i + 1);
        attribute = '';
        for (let j: number = 1; j < this.filledPlaces.length; j++) {
          if (alias === this.filledPlaces[j][0]) {
            attribute = this.filledPlaces[j][(await this.seeder.getRandomInt(this.filledPlaces[j].length - 4)) + 4]!;
            if (attribute.includes('.')) {
              attribute = attribute.substring(2);
            }
            this.query = sbReplace(this.query, i + 2, i + 4, attribute);
            nextBracket = this.query.indexOf('[]', i + 3);
            break;
          }
        }
      }
    }
  }

  // Gibt den gefüllten Querry aus
  public output(): { query: string; filledPlaces: (string | null)[][] } {
    return {
      query: this.query,
      filledPlaces: this.filledPlaces,
    };
  }
}
