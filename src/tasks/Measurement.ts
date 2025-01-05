// Object zum Speichern einzelnen Tasks erweiterbar um die Independent Variablen
class MeasuredTask {
  readonly number: number;
  readonly tutorial: boolean;
  readonly joinVariant: number;
  readonly aliasVariant: number;
  readonly index: string;
  readonly indexCategory: string;
  readonly maxIndex: string;
  readonly lineNumber: string;
  readonly maxLineNumber: string;
  readonly depth: string;
  readonly maxDepth: string;
  readonly leftSide: boolean;
  readonly alias: boolean;
  readonly answer: string;
  readonly time: number;

  constructor(
    number: number,
    tutorial: boolean,
    joinVariant: number,
    aliasVariant: number,
    index: string,
    indexCategory: string,
    maxIndex: string,
    lineNumber: string,
    maxLineNumber: string,
    depth: string,
    maxDepth: string,
    leftSide: boolean,
    alias: boolean,
    answer: string,
    time: number
  ) {
    this.number = number;
    this.tutorial = tutorial;
    this.joinVariant = joinVariant;
    this.aliasVariant = aliasVariant;
    this.index = index;
    this.indexCategory = indexCategory;
    this.maxIndex = maxIndex;
    this.lineNumber = lineNumber;
    this.maxLineNumber = maxLineNumber;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.leftSide = leftSide;
    this.alias = alias;
    this.answer = answer;
    this.time = time;
  }

  // Konsolenausgabe
  toString(): string {
    let seite: string = 'Rechts';
    if (this.leftSide) {
      seite = 'Links';
    }
    let subjekt: string = 'Tabelle';
    if (this.alias) {
      subjekt = 'Attribut';
    }
    return (
      '________________________________________\nNutzerdaten:\n' +
      'Task: ' +
      this.number +
      '\n' +
      'Tutorial: ' +
      this.tutorial +
      '\n' +
      'Join Variante: ' +
      this.joinVariant +
      '\n' +
      'Alias Variante: ' +
      this.aliasVariant +
      '\n' +
      'Index: (' +
      this.index +
      '/' +
      this.maxIndex +
      ')' +
      '\n' +
      'IndexCategory: (' +
      this.indexCategory +
      '/3)' +
      '\n' +
      'LineNumber: (' +
      this.lineNumber +
      '/' +
      this.maxLineNumber +
      ')' +
      '\n' +
      'Depth: (' +
      this.depth +
      '/' +
      this.maxDepth +
      ')' +
      '\nSeite: ' +
      seite +
      '\nSubjekt: ' +
      subjekt +
      '\n' +
      'Antwort: ' +
      this.answer +
      '\n' +
      'Zeit: ' +
      this.time
    );
  }
}

export default class Measurement {
  private list: MeasuredTask[] = [];
  private startingTime: number = 0;
  private isTutorialDone: boolean = false;
  private countTutorial: number = 0;
  private countExperiment: number = 0;
  combinations: number[] = Array(12).fill(0);
  private fileName: string;

  // Konstruktor zum Erzeugen der csv Datei
  constructor(fileName: string) {
    this.fileName = fileName + '.csv';
  }

  // Misst die Zeit zum Startzeitpunkt einer Aufgabe
  startTimer(): void {
    this.startingTime = new Date().getTime();
  }

  // Misst die Zeit zum Endzeitpunkt einer Aufgabe und trägt die gemessene Länge in die CSV Datei ein
  endTimer(
    joinVariant: number,
    tutorial: boolean,
    aliasVariant: number,
    index: string,
    indexCategory: string,
    maxIndex: string,
    lineNumber: string,
    maxLineNumber: string,
    depth: string,
    maxDepth: string,
    leftSide: boolean,
    alias: boolean,
    answer: string
  ): void {
    answer = answer.trim();
    const finishingTime: number = new Date().getTime();
    const i: number = this.list.length;
    if (answer.length === 0) {
      answer = '0';
    }
    const measuredTask = new MeasuredTask(
      i + 1,
      tutorial,
      joinVariant,
      aliasVariant,
      index,
      indexCategory,
      maxIndex,
      lineNumber,
      maxLineNumber,
      depth,
      maxDepth,
      leftSide,
      alias,
      answer,
      finishingTime - this.startingTime
    );
    this.list.push(measuredTask);
    console.log(this.list[i]);

    // Ruft Funktion auf, die die bisherigen Vorkommnisse an Variationen protokolliert
    this.incrementCounts(joinVariant, aliasVariant, +indexCategory, tutorial);
  }

  // Zählt, wie oft die verschiedenen Parameter vorkamen
  incrementCounts(joinVariant: number, aliasVariant: number, indexCategory: number, tutorial: boolean): void {
    // Zählen der bearbeiteten Tutorial-Aufgaben
    if (tutorial) {
      this.countTutorial++;
    }

    // Bei der ersten Aufgabe außerhalb des Tutorials wird noch ein letztes Mal gezählt
    if (!tutorial && !this.isTutorialDone) {
      this.countTutorial++;
      this.isTutorialDone = true;
    }

    // Zählung der bisherigen Vorkommnisse an Kombinationsmöglichkeiten der Parameter
    else if (!tutorial && indexCategory != 0) {
      // Formel zum Berechnen welcher Index inkrementiert werden soll
      const index: number = (joinVariant - 2) * 6 + (aliasVariant / 2) * 3 + (indexCategory - 1);
      this.countExperiment++;
      this.combinations[index]++;
    }

    // Ausgabe zur Protokollierung für Debugzwecke
    console.log('________________________________________');
    console.log('Anzahl an bisher vorgekommenen Varianten:');
    console.log('Tutorial:   ' + this.countTutorial + '/8');
    console.log('Experiment: ' + this.countExperiment + '/96');
    console.log('POST JOIN + PRE  Alias + 1. indexCategory: ' + this.combinations[0]);
    console.log('POST JOIN + PRE  Alias + 2. indexCategory: ' + this.combinations[1]);
    console.log('POST JOIN + PRE  Alias + 3. indexCategory: ' + this.combinations[2]);
    console.log('POST JOIN + POST Alias + 1. indexCategory: ' + this.combinations[3]);
    console.log('POST JOIN + POST Alias + 2. indexCategory: ' + this.combinations[4]);
    console.log('POST JOIN + POST Alias + 3. indexCategory: ' + this.combinations[5]);
    console.log('IN   JOIN + PRE  Alias + 1. indexCategory: ' + this.combinations[6]);
    console.log('IN   JOIN + PRE  Alias + 2. indexCategory: ' + this.combinations[7]);
    console.log('IN   JOIN + PRE  Alias + 3. indexCategory: ' + this.combinations[8]);
    console.log('IN   JOIN + POST Alias + 1. indexCategory: ' + this.combinations[9]);
    console.log('IN   JOIN + POST Alias + 2. indexCategory: ' + this.combinations[10]);
    console.log('IN   JOIN + POST Alias + 3. indexCategory: ' + this.combinations[11]);

    if (this.countExperiment === 96) {
      console.log('________________________________________');
      console.log('Experiment abgeschlossen');
    }
  }

  // Liefert den Array mit den Anzahlen der bisher vorgekommenen Kombinationen der Parameter
  getCombinations(): number[] {
    return this.combinations;
  }

  saveFile(): void {
    let csv = 'Number;Tutorial;Join Variante;Alias Variante;Index;Index Category;Max Index;Line;Max Line;Depth;Max Depth;Links vom =;Links vom .;Answer;Time\r\n';
    for (const mt of this.list) {
      csv +=
        mt.number +
        ';' +
        mt.tutorial +
        ';' +
        mt.joinVariant +
        ';' +
        mt.aliasVariant +
        ';' +
        mt.index +
        ';' +
        mt.indexCategory +
        ';' +
        mt.maxIndex +
        ';' +
        mt.lineNumber +
        ';' +
        mt.maxLineNumber +
        ';' +
        mt.depth +
        ';' +
        mt.maxDepth +
        ';' +
        mt.leftSide +
        ';' +
        !mt.alias +
        ';' +
        mt.answer +
        ';' +
        mt.time +
        '\r\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    //Create anchor
    link.setAttribute('href', url);
    link.setAttribute('download', this.fileName);
    document.body.appendChild(link);

    //Click the download
    link.click();

    //Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
