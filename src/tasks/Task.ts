import QueryAnalyzer from './QueryAnalyzer';
import QueryCreator from './QueryCreator';
import QueryFiller from './QueryFiller';
import QueryIndentator from './QueryIndentator';
import Seeder from './Seeder';

// Debugging Modus für konkrete Werte
const debug = false;

export default class Task {
  // Parameter für die Erzeugung der Anfrage
  private seeder: Seeder;
  private countAttributes: number = 0;
  private countConditions: number = 0;
  private countJoins: number = 0;
  private countSubqueries: number = 0;
  private countQueryDepth: number = 0;
  private joinVariant: number;
  private aliasVariant: number;
  public leftSide: boolean = false;
  public alias: boolean = false;
  private tutorial: boolean;
  private tutorialCounter: number;

  // Der Query und die Zeile der fehlerhaften Bedingung
  private filledPlaces: (string | null)[][] = [];
  public query: string = '';
  public lineNumber: number = 0;
  public maxLineNumber: number = 0;
  public index: number = 0;
  public maxIndex: number = 0;
  public depth: number = 0;
  public maxDepth: number = 0;
  private lineNumberCategory: number;

  // Seed, Join- und Umbenennungsvariante aus dem Pausenbildschirm werden gesetzt und die Query im Anschluss erzeugt, indentiert und analysiert
  constructor(seeder: Seeder, tutorial: boolean, tutorialCounter: number, joinVariant: number, aliasVariant: number, lineNumberCategory: number) {
    this.seeder = seeder;
    this.tutorial = tutorial;
    this.tutorialCounter = tutorialCounter;
    this.joinVariant = joinVariant;
    this.aliasVariant = aliasVariant;
    this.lineNumberCategory = lineNumberCategory;
  }

  // Setzt die Parameter für eine neue Aufgabe
  async initializeParameters() {
    // Zum Debuggen können hier die Parameter frei gew�hlt werden
    if (debug) {
      this.countAttributes = 1; // -(1, ... , n): Anzahl der Attribute auf die bei jedem SELECT projiziert wird
      this.countConditions = 1; // -(1, ... , n): Anzahl der Bedingungen in jedem WHERE
      this.countJoins = 1; // ------(1, ... , n): Anzahl der Verb�nde in jedem FROM
      this.countSubqueries = 1; // -(0, ... , n): Anzahl der Unterabfragen in jedem FROM
      this.countQueryDepth = 1; // -(0, ... , n): Anzahl der tiefsten Verschachtelung
      this.joinVariant = 2; // -----(1, ... , 4): Die Syntaxvariante für den Verbund - (1 = NJ / 2 = PostfixCondition / 3 = InfixCondition / 4 = PrefixCondition)
      this.aliasVariant = 0; // ----(0, ... , 2): Die Syntaxvariante für den Alias --- (0 = PrefixAlias / 1 = PostfixAlias / 2 = PostfixAlias NL)
    }

    // Tutorial
    if (debug === false && this.tutorial === true) {
      // Erste (leichtere) Stufe des Tutorials für die ersten 4 Aufgaben
      if (this.tutorialCounter <= 4) {
        this.countAttributes = 2;
        this.countConditions = 1;
        this.countJoins = 1;
        this.countSubqueries = 1;
        this.countQueryDepth = 0;
      }
      // Zweite (etwas schwerere) Stufe des Tutorials für die n�chsten 4 Aufgaben
      else if (this.tutorialCounter > 4) {
        this.countAttributes = 3;
        this.countConditions = 1;
        this.countJoins = 1;
        this.countSubqueries = 1;
        this.countQueryDepth = 1;
      }
    }

    // Experiment
    if (debug === false && this.tutorial === false) {
      // Erste Idee
      this.countAttributes = await this.seeder.getRandomAltInt(2);
      this.countConditions = 1;
      this.countJoins = 2;
      this.countSubqueries = 2;
      this.countQueryDepth = 1;

      // Zweite Idee
      // countAttributes = seeder.getRandomAltInt(2);
      // countConditions = 1;
      // countJoins = 2;
      // countSubqueries = 1;
      // countQueryDepth = 2;
    }
  }

  // Der Querie wird mit den definierten Parametern erzeugt
  async createQuery() {
    const Query = new QueryCreator(
      this.seeder,
      this.countAttributes,
      this.countConditions,
      this.countJoins,
      this.countSubqueries,
      this.countQueryDepth,
      this.joinVariant,
      this.aliasVariant,
      this.tutorial
    );
    await Query.create();
    this.query = Query.output();
    console.log('________________________________________\n________________________________________\nErzeugter Query:\n' + this.query);
  }

  // Der bisherige Query wird indentiert
  indentQuery() {
    this.query = new QueryIndentator(this.query, this.aliasVariant).output();
    console.log('________________________________________\nIndentierter Query:');
    console.log(this.query);
  }

  // Der bisherige Query wird mit Tabellennamen und Attributen gefüllt
  async fillQuery() {
    console.log('________________________________________\nGefüllter Query:');
    const qf = new QueryFiller(this.seeder, this.query, this.countQueryDepth, this.countJoins, this.countAttributes, this.aliasVariant, this.joinVariant);
    await qf.fill();
    const meta = qf.output();
    this.query = meta.query;
    this.filledPlaces = meta.filledPlaces;
    console.log(this.query);
  }

  // Der bisherige Query wird analysiert und in einer Bedingung verf�lscht
  async analyzeQuery() {
    console.log('________________________________________\nAnalysierter Query:');
    const qa = new QueryAnalyzer(this.seeder, this.query, this.filledPlaces, this.countQueryDepth, this.lineNumberCategory);
    await qa.corrupt();
    const meta = qa.output();
    this.query = meta.query;
    this.lineNumber = meta.lineNumber;
    this.maxLineNumber = meta.maxLineNumber;
    this.index = meta.index;
    this.maxIndex = meta.maxIndex;
    this.depth = meta.depth;
    this.maxDepth = meta.maxDepth;
    this.leftSide = meta.leftSide;
    this.alias = meta.alias;
  }
}
