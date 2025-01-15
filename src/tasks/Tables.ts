export default class Tables {
  tables: string[];
  tablesShort: string[];
  attributes: string[];

  // Konstruktor der beim Aufruf ein Objekt erstellt mit allen möglichen Tabellen, Aliasen und Attributen
  constructor() {
    this.tables = ['Person', 'Student', 'Mitarbeiter', 'Professor', 'Lehrveranstaltung', 'Betreuung', 'Leistung'];
    this.tablesShort = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    this.attributes = ['PersonID', 'Vorname', 'Nachname', 'SchulID', 'SchulName', 'Jahr', 'MitarbeiterID', 'BüroID', 'LehrveranstaltungsID', 'RaumID', 'Note'];
  }

  // Für den übergebenen Tabellennamen werden die zugehörigen Attributnamen in einem Array zurückgegeben
  matchingAttributes(tableName: string): string[] {
    switch (tableName) {
      case 'Person':
        return ['PersonID', 'Vorname', 'Nachname'];
      case 'Student':
        return ['PersonID', 'SchulID', 'SchulName', 'Jahr'];
      case 'Mitarbeiter':
        return ['PersonID', 'MitarbeiterID', 'BüroID', 'SchulID', 'Jahr'];
      case 'Professor':
        return ['PersonID', 'MitarbeiterID', 'BüroID', 'SchulID', 'Jahr'];
      case 'Lehrveranstaltung':
        return ['LehrveranstaltungsID', 'RaumID', 'SchulID', 'Jahr'];
      case 'Betreuung':
        return ['MitarbeiterID', 'LehrveranstaltungsID', 'Jahr'];
      case 'Leistung':
        return ['PersonID', 'LehrveranstaltungsID', 'Note', 'Jahr'];
      default:
        console.warn('Eine Tabelle wurde übergeben die nicht abgedeckt wird: ' + tableName);
        return this.attributes;
    }
  }

  // Für die übergebene Art (Tabellen, Aliase, Attribute) wird ein Array mit diesen möglichen Ausprägungen zurückgegeben
  output(art: number): string[] {
    switch (art) {
      case 0:
        return this.tables;
      case 1:
        return this.tablesShort;
      case 2:
        return this.attributes;
      default:
        console.warn('Eine Ausgabe wurde ausgewählt die nicht existiert: ' + art);
        return [];
    }
  }
}
