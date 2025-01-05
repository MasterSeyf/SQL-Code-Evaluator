import Seeder from './Seeder';
import Tables from './Tables';

export default class QueryCreator {
  private Query: string = '';
  private tables: Tables = new Tables();
  private seeder: Seeder;
  private countAttributes: number;
  private countConditions: number;
  private countJoins: number;
  private countSubqueries: number;
  private countQueryDepth: number;
  private joinVariant: number;
  private aliasVariant: number;
  private tutorial: boolean;

  // Konstruktor, in der die Funktionen zum Erzeugen der einzelnen Abschnitte des Queries aufgerufen und eingefügt werden
  constructor(
    seeder: Seeder,
    countAttributes: number,
    countConditions: number,
    countJoins: number,
    countSubqueries: number,
    countQueryDepth: number,
    joinVariant: number,
    aliasVariant: number,
    tutorial: boolean
  ) {
    this.seeder = seeder;
    this.countAttributes = countAttributes <= 0 ? 1 : countAttributes;
    this.countConditions = countConditions;
    this.countJoins = countJoins;
    this.countSubqueries = countSubqueries;
    this.countQueryDepth = countQueryDepth;
    this.joinVariant = joinVariant;
    this.aliasVariant = aliasVariant;
    this.tutorial = tutorial;
  }

  async create() {
    // Zusammenbasteln des Queries
    this.Query += this.querySelect();
    this.Query += await this.queryFrom();
    this.Query += this.queryWhere();
  }

  // Erzeugt den SELECT Abschnitt eines Queries
  querySelect(): string {
    let select: string = '';
    select += 'SELECT ';
    for (let i: number = 0; i < this.countAttributes; i++) {
      select += '[]';
      if (i < this.countAttributes - 1) {
        select += ', ';
      } else {
        select += ' ';
      }
    }
    return select;
  }

  // Erzeugt den WHERE Abschnitt eines Queries
  queryWhere(): string {
    let where: string = '';
    where += ' WHERE ';
    for (let i: number = 0; i < this.countConditions; i++) {
      if (this.countConditions > 0 && this.countJoins === 0) {
        where += this.emptyNullCondition();
      } else {
        where += this.emptyCondition();
      }
      if (i < this.countConditions - 1) {
        where += ' AND ';
      }
    }
    return where;
  }

  // Erzeugt den FROM Abschnitt eines Queries
  async queryFrom(): Promise<string> {
    let join: string = '';
    let countRelations: number = this.countJoins + 1;
    let countSubqueries: number = Math.min(this.countSubqueries, countRelations);
    const countQueryDepth: number = this.countQueryDepth;
    join += 'FROM ';

    // Erste Tabelle vor dem Verbundsoperator, welche nur bei Joinvariante 4 nicht vorkommt
    if (countRelations >= 0 && this.joinVariant !== 4) {
      const decider: number = await this.seeder.getRandomInt(3);

      // Subquery oder primitive Tabelle
      if (countQueryDepth > 0 && countSubqueries > 0 && (decider === 1 || countRelations === countSubqueries)) {
        join += await this.randomSubquery();
        countSubqueries -= 1;
        countRelations -= 1;
      } else {
        join += await this.randomPrimitiveRelation();
        countRelations -= 1;
      }
    }

    // Verbundsoperator und erste Tabelle nach dem Verbundsoperator
    while ((countRelations > 0 && this.joinVariant !== 4) || (countRelations > 1 && this.joinVariant === 4)) {
      const decider: number = await this.seeder.getRandomInt(2);
      switch (this.joinVariant) {
        case 1:
          // A NATURAL JOIN B: Subquery oder primitive Tabelle - (Kommt im Experiment nicht mehr vor)
          if (countQueryDepth > 0 && countSubqueries > 0 && (decider === 1 || countRelations === countSubqueries)) {
            join += ' NATURAL JOIN ' + (await this.randomSubquery());
            countSubqueries -= 1;
            countRelations -= 1;
          } else {
            join += ' NATURAL JOIN ' + (await this.randomPrimitiveRelation());
            countRelations -= 1;
          }
          break;
        case 2:
          // A JOIN B ON (...): Subquery oder primitive Tabelle
          if (countQueryDepth > 0 && countSubqueries > 0 && (decider === 1 || countRelations === countSubqueries)) {
            join += ' JOIN ' + (await this.randomSubquery()) + ' ON (' + this.emptyCondition() + ')';
            countSubqueries -= 1;
            countRelations -= 1;
          } else {
            join += ' JOIN ' + (await this.randomPrimitiveRelation()) + ' ON (' + this.emptyCondition() + ')';
            countRelations -= 1;
          }
          break;
        case 3:
        case 4:
          // A |><| (...) B als auch |><| (...) A B: Subquery oder primitive Tabelle
          if (countQueryDepth > 0 && countSubqueries > 0 && (decider === 1 || countRelations === countSubqueries)) {
            join += ' ⋈    (' + this.emptyCondition() + ') ' + (await this.randomSubquery());
            countSubqueries -= 1;
            countRelations -= 1;
          } else {
            join += ' ⋈    (' + this.emptyCondition() + ') ' + (await this.randomPrimitiveRelation());
            countRelations -= 1;
          }
          break;
      }
    }

    // Zweite Tabelle nach dem Verbundsoperator, welche nur bei Joinvariante 4 vorkommt
    if (this.joinVariant === 4) {
      // Subquery oder primitive Tabelle
      const decider: number = await this.seeder.getRandomInt(2);
      if (countQueryDepth > 0 && countSubqueries > 0 && (decider === 1 || countRelations === countSubqueries)) {
        join += ' ' + (await this.randomSubquery());
        countSubqueries -= 1;
        countRelations -= 1;
      } else {
        join += ' ' + (await this.randomPrimitiveRelation());
        countRelations -= 1;
      }
    }
    return join;
  }

  // Erzeugt einen leeren Alias
  emptyAlias(): string {
    return '$';
  }

  // Erzeugt eine leere Bedingnug zwischen zwei Relationen
  emptyCondition(): string {
    return '{}.[] = {}.[]';
  }

  // Erzeugt eine leere Bedingungen wenn es nur eine Relation gibt - Im Experiment derzeit nicht benötigt
  emptyNullCondition(): string {
    return '{}.[] IS NOT NULL';
  }

  // Erzeugt eine Subquery ohne weitere Verbünde als tiefstes Element einer Querry
  async randomPrimitiveRelation(): Promise<string> {
    let output: string = '';

    // Bestimmung der Tabelle
    const relations: string[] = this.tables.output(0);
    const relation: string = relations[await this.seeder.getRandomInt(relations.length)];
    output += '(SELECT ';

    // Bestimmung der beiden Attribute im SELECT
    const attributes: string[] = this.tables.matchingAttributes(relation + '');
    const attributeOne: string = attributes[await this.seeder.getRandomInt(attributes.length)];
    let attributeTwo: string = attributes[await this.seeder.getRandomInt(attributes.length)];

    // Die Attribute dürfen sich nicht gleichen
    while (attributeOne === attributeTwo) {
      attributeTwo = attributes[await this.seeder.getRandomInt(attributes.length)];
    }

    // Einfügen der Attrtibute und der Tabelle
    output += attributeOne + ', ' + attributeTwo;
    output += ' FROM ';
    output += relation + ')';

    // Hinzufügen des Alias je nach dem ob er vor oder nach der Tabelle platziert werden soll
    if (this.aliasVariant === 1 || this.aliasVariant === 2) {
      output += ' AS ' + this.emptyAlias() + ' ';
    } else if (this.aliasVariant === 0) {
      output = ' ' + this.emptyAlias() + ' AS ' + output;
    }
    return output;
  }

  // Erzeugt einen Subquery durch rekursiven Aufruf des Konstruktors, wobei die QueryDepth um eins reduziert wird
  async randomSubquery(): Promise<string> {
    let subQuery: string = '';

    // Je nach dem ob es sich um den PostAlias oder PreAlias Fall handelt, wird an die zu erzeugende Unterabfrage davor und danach etwas anderes hinzugefügt
    subQuery += this.aliasVariant === 0 ? this.emptyAlias() + ' AS (' : ' (';
    const qc = new QueryCreator(
      this.seeder,
      this.countAttributes - 1,
      this.countConditions,
      this.countJoins,
      this.countSubqueries,
      this.countQueryDepth - 1,
      this.joinVariant,
      this.aliasVariant,
      this.tutorial
    );
    await qc.create();
    subQuery += qc.Query;
    subQuery += this.aliasVariant === 0 ? ') ' : ') AS ' + this.emptyAlias();
    return subQuery;
  }

  // Von der erzeugten Anfrage werden überschüssige Whitespaces entfernt
  output(): string {
    return this.Query.replaceAll(/\\s{2,}/g, ' ');
  }
}
