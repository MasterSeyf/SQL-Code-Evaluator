import Seeder from './Seeder';
import Tables from './Tables';

export default class QueryAnalyzer {
  private seeder: Seeder;
  private query: string;
  private filledPlaces: (string | null)[][];
  private stamps: number[][] = [];

  // Der Query und die Zeile der fehlerhaften Bedingung
  private oldConstraint: string = '';
  private newConstraint: string = '';
  private lineNumber: number = 0;
  private maxLineNumber: number = 0;
  private index: number = 0;
  private indexCategory: number;
  private maxIndex: number;
  private depth: number = 0;
  private maxDepth: number;
  private leftSide: boolean = false;
  private alias: boolean = false;

  constructor(seeder: Seeder, query: string, filledPlaces: (string | null)[][], countQueryDepth: number, indexCategory: number) {
    this.seeder = seeder;
    this.query = query;
    this.filledPlaces = filledPlaces;
    this.maxDepth = countQueryDepth;
    this.maxIndex = this.totalAmount(' = ');
    this.indexCategory = indexCategory;
    console.log('Bedingungen:');
    this.analyze();
  }

  // Berechnet die Anzahl der im Query vorkommenden Bedingungen (Verbundbedingungen und Selektionsbedingungen) (IS kann im Experiment nicht vorkommen)
  private totalAmount(target: string): number {
    let count: number = 0;
    let index: number = 0;
    while ((index = this.query.indexOf(target, index)) !== -1) {
      count++;
      index += target.length;
    }
    return count;
  }

  // Analysiert den übergebenen Query auf die in ihm vorkommenden Bedingungen und protokolliert den Ort aller Bedingungen
  analyze(): void {
    let startingPosition: number = 0;
    let depth: number = 0;
    let arrayIndex: number = 0;
    this.stamps = Array.from({ length: this.maxIndex }, () => Array(3).fill(0)); // 0: depth, 1: startingPos, 2: endingPos
    for (let i: number = 0; i < this.query.length; i++) {
      startingPosition = this.query.indexOf('.', i) - 1;
      const verify1: number = this.query.indexOf(' ', startingPosition);
      const verfiy2: number = this.query.indexOf('=', startingPosition);
      if (verify1 + 1 !== verfiy2) {
        i = this.query.indexOf('.', startingPosition);
        continue;
      }
      const endingPosition1: number = this.query.indexOf(')', startingPosition);
      const endingPosition2: number = this.query.indexOf('\n', startingPosition);
      let endingPosition: number = 0;
      if (endingPosition1 === -1 || endingPosition2 === -1) {
        endingPosition = this.query.length;
      } else {
        endingPosition = Math.min(endingPosition1, endingPosition2);
      }

      depth = this.calculateLevel(startingPosition);
      this.stamps[arrayIndex][0] = depth; // -----------Querytiefe der Bedingung
      this.stamps[arrayIndex][1] = startingPosition; // Anfangsindex der Bedingung
      this.stamps[arrayIndex][2] = endingPosition; // --Endindex der Bedingung

      console.log('Index: ' + (arrayIndex < 10 ? '0' + arrayIndex : arrayIndex) + ', Querytiefe: ' + depth + ' - ' + this.query.substring(startingPosition, endingPosition));
      arrayIndex++;
      i = endingPosition;
    }
  }

  // Berechnet die aktuelle Querytiefe an der übergebenen Stelle
  calculateLevel(currentPosition: number): number {
    let level: number = 0;
    for (let i: number = 0; i < currentPosition; i++) {
      if (this.query.substring(i, i + 1) === '(' && this.query.substring(i + 2, i + 3) === '.') {
        i = this.query.indexOf(')', i) + 1;
      }
      if (this.query.substring(i, i + 1) === '(' && this.query.substring(i + 2, i + 3) !== '.') {
        level++;
      }
      if (this.query.substring(i, i + 1) === ')' && this.query.substring(i + 2, i + 3) !== '.') {
        level--;
      }
    }
    return level;
  }

  // Korrumptiert eine Bedingung, sodass der Query syntaktisch fehlerhaft wird
  async corrupt(): Promise<void> {
    console.log('Korrumpierung:');

    // Bestimmt den Index der Bedingung, die abgeändert werden soll
    // Im Tutorial (this.indexCategory = 0) wird der Index zufällig gewählt
    // Außerhalb des Tutorials (this.indexCategory !== 0) wird der mögliche Index in 3 Kategorien gesplittet
    // this.indexCategory = 1 -> this.index = {0, 1, 2}
    // this.indexCategory = 2 -> this.index = {3, 4, 5}
    // this.indexCategory = 3 -> this.index = {6, 7, 8}
    if (this.indexCategory === 0) {
      this.index = await this.seeder.getRandomInt(this.maxIndex);
    } else {
      this.index = (await this.seeder.getRandomInt(3)) + (this.indexCategory - 1) * 3;
    }

    // Ermittelt die abzuändernde Bedingung im zuvor bestimmtem Index
    this.depth = this.stamps[this.index][0];
    this.oldConstraint = this.query.substring(this.stamps[this.index][1], this.stamps[this.index][2]);
    console.log('Index: ' + (this.index < 10 ? '0' + this.index : this.index) + ', ' + 'Querytiefe: ' + this.depth + ' - ' + this.oldConstraint + ' (Alte Bedingung)');

    // Bestimmt ob die linke oder rechte Gleichungsseite bzw. eine Tabelle oder ein Attribut dieser Bedingung abgeändert werden soll
    this.leftSide = await this.seeder.getRandomBoolean();
    this.alias = await this.seeder.getRandomBoolean();
    if (this.alias === true) {
      await this.corruptAlias();
    }
    if (this.alias === false) {
      await this.corruptAttribute();
    }

    // Protokolliert die wie vielte Zeile geändert wurde und die insgesamte Anzahl an Zeilen
    let count: number = 1;
    let nextStop: number = 0;
    let queryLocal: string = this.query.toString();
    while (true) {
      if (queryLocal.includes('\n')) {
        nextStop = queryLocal.indexOf('\n');
      } else {
        nextStop = queryLocal.length;
      }
      if (queryLocal.substring(0, nextStop).includes(this.newConstraint)) {
        this.lineNumber = count;
        break;
      }
      queryLocal = queryLocal.substring(nextStop + 1);
      count++;
    }
    this.maxLineNumber = this.query.split('').filter((ch) => ch === '\n').length + 1;
  }

  // Verfälscht den Alias einer Tabelle
  async corruptAlias(): Promise<void> {
    // Erzeugt einen von der aktuellen Tiefe distinkten korrupten Alias
    let corruptAlias: string = String.fromCharCode((await this.seeder.getRandomInt(26)) + 'A'.charCodeAt(0));
    for (let i: number = 0; i < this.stamps.length; i++) {
      if (this.query.substring(this.stamps[i][1], this.stamps[i][2]).includes(corruptAlias + '.')) {
        corruptAlias = String.fromCharCode((await this.seeder.getRandomInt(26)) + 'A'.charCodeAt(0));
        i = -1;
      }
    }

    // Der alte Alias wird mit mit dem neuen Alias ausgewechselt, je nach dem ob die linke oder rechte Gleichungsseite abgeändert werden soll
    let alias: string = '';
    if (this.leftSide) {
      const beg: number = this.stamps[this.index][1];
      const end: number = this.query.indexOf('.', beg);
      alias = this.query.substring(beg, end);
      this.query = this.query.slice(0, beg) + corruptAlias + this.query.slice(end);
    }
    if (!this.leftSide) {
      const beg: number = this.query.indexOf(' = ', this.stamps[this.index][1]) + 3;
      const end1: number = this.query.indexOf(' ', beg) - 1;
      const end2: number = this.query.indexOf('.', beg);
      let end: number = Math.min(end1, end2);
      if (end < 0) {
        end = end2;
      }
      alias = this.query.substring(beg, end);
      this.query = this.query.slice(0, beg) + corruptAlias + this.query.slice(end);
    }
    // Die Möglichen Endpositionen der neuen Bedingung
    const end1: number = this.query.indexOf(' ', this.query.indexOf(' = ', this.stamps[this.index][1]) + 3) - 1;
    const end2: number = this.query.indexOf(')', this.stamps[this.index][1]);
    const end3: number = this.stamps[this.index][2];
    const end4: number = this.query.length;

    // Der kleinste größer 0 (Fehlerfälle) ist die richtige Endposition
    let end: number = Number.MAX_SAFE_INTEGER;
    const ends: number[] = [end1, end2, end3, end4];
    for (const value of ends) {
      if (value >= 0 && value < end) {
        end = value;
      }
    }

    // Ändern der Constraint Variable auf die umgeänderte Bedingung
    this.newConstraint = this.query.substring(this.stamps[this.index][1], end);
    console.log('                           ' + this.newConstraint + ' (Neue Bedingung)');
    console.log('- Es wurde ein Alias verfälscht');
    console.log('- Die ' + (this.leftSide ? 'linke Tabelle' : 'rechte Tabelle') + ' wurde von ' + alias + ' zu ' + corruptAlias + ' abgeändert');
  }

  // Verfälscht ein Attribut einer Tabelle
  async corruptAttribute(): Promise<void> {
    // Bestimmt die zu betrachtende Tabelle in Abhängigkeit davon ob die linke oder rechte Seite verändert werden soll
    let tableName: string = '';
    if (this.leftSide) {
      tableName = this.oldConstraint.substring(0, 1);
    } else {
      const next: number = this.oldConstraint.indexOf('.', 2) - 1;
      tableName = this.oldConstraint.substring(next, next + 1);
    }

    // Schaut welches Element im Array dieser Tabelle entspricht
    let tableIndex: number = 0;
    for (let i: number = 1; i < this.filledPlaces.length; i++) {
      if (tableName === this.filledPlaces[i][0]) {
        tableIndex = i;
        break;
      }
    }

    // Erzeugt ein pseudozufälliges Attribut
    const attributes = new Tables().attributes;
    let corruptAttribute: string = attributes[await this.seeder.getRandomInt(attributes.length)];

    // Überprüft, ob diese Tabelle dieses Attribut nicht besitzen darf. Falls es das darf, wird ein neues Attribut generiert bis ein Falsches vorliegt
    // Falls im Array die Attribute einen Tabellennamen der Form "A.name" besitzen, wird dieser durch den Offset nicht beachtet sondern nur "name"
    const list: (string | null)[] = this.filledPlaces[tableIndex];
    for (let j: number = 4; j < list.length; j++) {
      const offset: number = list[j]!.includes('.') ? 2 : 0;
      if (corruptAttribute === list[j]!.substring(offset)) {
        corruptAttribute = attributes[await this.seeder.getRandomInt(attributes.length)];
        j = 3;
      }
    }

    // Das alte Attribut wird mit mit dem neuen Attribut ausgewechselt, je nach dem ob die linke oder rechte Gleichungsseite abgeändert werden soll
    let attribut: string = '';
    if (this.leftSide) {
      const beg: number = this.stamps[this.index][1] + 2;
      const end: number = this.query.indexOf(' ', beg);
      attribut = this.query.substring(beg, end);
      this.query = this.query.slice(0, beg) + corruptAttribute + this.query.slice(end);
    }
    if (!this.leftSide) {
      const beg: number = this.query.indexOf(' = ', this.stamps[this.index][1]) + 5;
      let end1: number = this.query.indexOf(' ', beg) - 1;
      let end2: number = this.query.indexOf(')', beg);
      const end3: number = this.query.length;
      end1 = end1 < 0 ? Number.MAX_SAFE_INTEGER : end1;
      end2 = end2 < 0 ? Number.MAX_SAFE_INTEGER : end2;
      const end: number = Math.min(end1, Math.min(end2, end3));
      attribut = this.query.substring(beg, end);
      this.query = this.query.slice(0, beg) + corruptAttribute + this.query.slice(end);
    }
    // Die Möglichen Endpositionen der neuen Bedingung
    const end1: number = this.query.indexOf(' ', this.query.indexOf(' = ', this.stamps[this.index][1]) + 3) - 1;
    const end2: number = this.query.indexOf(')', this.stamps[this.index][1]);
    const end3: number = this.stamps[this.index][2];
    const end4: number = this.query.length;

    // Der kleinste größer 0 (Fehlerfälle) ist die richtige Endposition
    let end: number = Number.MAX_SAFE_INTEGER;
    const ends: number[] = [end1, end2, end3, end4];
    for (const value of ends) {
      {
        if (value >= 0 && value < end) {
          end = value;
        }
      }

      // Ändern der Constraint Variable auf die umgeänderte Bedingung
      this.newConstraint = this.query.substring(this.stamps[this.index][1], end);
      console.log('                           ' + this.newConstraint + ' (Neue Bedingung)');
      console.log('- Es wurde ein Attribut verfälscht');
      console.log('- Das ' + (this.leftSide ? 'linke Attribut' : 'rechte Attribut') + ' wurde von ' + attribut + ' zu ' + corruptAttribute + ' abgeändert');
    }
  }

  // Erstellt den zurückzugebenden Output mit allen protokolierten Informationen über die Verfälschung der Anfrage
  output() {
    console.log(
      '- Die Bedingung mit dem Index (' + (this.index < 10 ? '0' + this.index : this.index) + '/' + (this.maxIndex - 1 < 10 ? '0' + (this.maxIndex - 1) : this.maxIndex - 1) + ') wurde verfälscht'
    );
    console.log('- Dies entspricht der lineNumberCategory: ' + '(' + this.indexCategory + '/3)');
    console.log('- Die Bedingung befindet sich auf Zeile (' + (this.lineNumber < 10 ? '0' + this.lineNumber : this.lineNumber) + '/' + this.maxLineNumber + ') der Anfrage');
    console.log('- Die Bedingung befindet sich in der Querytiefe (' + this.depth + '/' + this.maxDepth + ') der Anfrage');

    return {
      query: this.query, // --------- Index 0: Der gesammte Query als String
      lineNumber: this.lineNumber, // ---- Index 1: Die Zeile Code in der die Änderung durchgeführt wurde
      maxLineNumber: this.maxLineNumber, // - Index 2: Die maximale Anzahl an Zeilen von Code
      index: this.index, // --------- Index 3: Die wie vielte Bedingung verändert wurde
      maxIndex: this.maxIndex - 1, // -- Index 4: Die maximale Anzahl an Bedingungen
      depth: this.depth, // --------- Index 5: Die Querytiefe in der die Änderung durchgeführt wurde
      maxDepth: this.maxDepth, // ------ Index 6: Die maximale vorhandene Querytiefe
      leftSide: this.leftSide, // ------ Index 7: Ob die linke (True) oder die rechte (False) Seite der Bedingung verändert wurde
      alias: this.alias, // --------- Index 8: Ob ein Alias (True) oder ein Attribut (False) der Bedingung verändert wurde
    };
  }
}
