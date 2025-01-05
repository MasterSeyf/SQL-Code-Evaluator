export default class QueryIndentator {
  private query: string;
  private aliasVariant: number;

  constructor(query: string, aliasVariant: number) {
    this.query = query;
    this.aliasVariant = aliasVariant;
    const queryString: string[] = this.indentQuery();
    this.query = this.composeQuery(queryString);
  }

  // Performs magic and spits out an indented query
  indentQuery(): string[] {
    let level: number = 0;
    const queryWords: string[] = this.query.split(' ').filter((word) => word != '');
    for (let i: number = 0; i < queryWords.length; i++) {
      // Subquery um eins einrücken, falls es sich um eine prefix aliasVariante handelt
      if (queryWords[i].includes('(SELECT') && this.aliasVariant === 0) {
        let bracketCounter: number = 0;
        for (let j: number = i; j < queryWords.length; j++) {
          if (
            queryWords[j].includes('FROM') ||
            queryWords[j].includes('NATURAL') ||
            (queryWords[j].includes('JOIN') && !queryWords[j - 1].includes('NATURAL')) ||
            (queryWords[j].includes('⋈') && !queryWords[j - 1].includes('FROM')) ||
            queryWords[j].includes('ON') ||
            queryWords[j].includes('WHERE') ||
            (!(queryWords[j - 1].includes('FROM') || queryWords[j - 1].includes('AS')) && queryWords[j].includes('$'))
          ) {
            queryWords[j] = '       ' + queryWords[j];
          }
          if (queryWords[j].includes('(')) {
            bracketCounter++;
          }
          if (queryWords[j].includes(')')) {
            bracketCounter--;
          }
          if (bracketCounter === 0) {
            break;
          }
        }
      }
      // Fügt Whitespaces um AS ein, je nachdem, ob es vor oder nach einem Subquery verwendet wird
      if (queryWords[i].includes('AS')) {
        queryWords[i] = ' ' + queryWords[i] + ' ';
        if (this.aliasVariant === 0) {
          queryWords[i] = queryWords[i] + ' ';
          if (i < queryWords.length - 1 && !queryWords[i + 1].includes('(SELECT')) {
            queryWords[i] = queryWords[i] + ' ';
          }
        }
      }
      // Bei einer WHERE Bedingung wird die Einrückung um eins reduziert
      if (queryWords[i].includes('WHERE')) {
        queryWords[i] = queryWords[i] + '  ';
        level--;
      }
      let offset: number;
      if (this.aliasVariant === 1 || this.aliasVariant === 2) {
        offset = 2;
      } else {
        offset = 1;
      }
      if (i > 1 && queryWords[i - offset].includes(')') && !queryWords[i - offset].includes('[]')) {
        level--;
      }
      if (queryWords[i].includes('SELECT')) {
        queryWords[i] = queryWords[i] + ' ';
      }
      if (
        i >= 4 &&
        (queryWords[i - 1].includes('JOIN') ||
          queryWords[i - 4].includes('⋈') ||
          (queryWords[i - 1].includes(')') && queryWords[i + 1].includes('AS')) ||
          (queryWords[i - 1].includes('$') && queryWords[i].includes('(')))
      ) {
        for (let j: number = 0; j < level; j++) {
          queryWords[i] = '       ' + queryWords[i];
        }
        // Vor einem SELECT wird ein Whitespace entfernt
        if (queryWords[i].includes('SELECT')) {
          queryWords[i] = queryWords[i].replace('  ', ' ');
        }
        queryWords[i] = ' \n' + queryWords[i];
      }
      if (
        (queryWords[i].includes('⋈') && !queryWords[i - 1].includes('FROM')) ||
        queryWords[i].includes('FROM') ||
        queryWords[i].includes('NATURAL') ||
        (queryWords[i].includes('JOIN') && !queryWords[i - 1].includes('NATURAL')) ||
        queryWords[i].includes('ON') ||
        queryWords[i].includes('USING') ||
        queryWords[i].includes('WHERE') ||
        queryWords[i].includes('GROUP') ||
        queryWords[i].includes('HAVING') ||
        queryWords[i].includes('ORDER')
      ) {
        for (let j: number = 0; j < level; j++) {
          queryWords[i] = '       ' + queryWords[i];
        }
        if (queryWords[i].includes('ON')) {
          queryWords[i] = queryWords[i] + '    ';
        }
        queryWords[i] = ' \n' + queryWords[i];
      }
      // Bei einer FROM Klausel wird die Einrückung um eins erhöht
      if (queryWords[i].includes('FROM')) {
        if (queryWords[i + 1].includes('SELECT')) {
          queryWords[i] = queryWords[i] + '  ';
        } else {
          queryWords[i] = queryWords[i] + '   ';
        }
        level++;
      }
      if (queryWords[i].includes('JOIN')) {
        queryWords[i] = queryWords[i] + '   ';
      }
      if (queryWords[i].includes('⋈')) {
        queryWords[i] = queryWords[i] + '     ';
      }
      if (queryWords[i].includes('=') || queryWords[i].includes('IS') || queryWords[i].includes('AND')) {
        queryWords[i] = ' ' + queryWords[i] + ' ';
      }
      if (queryWords[i].includes(',') || queryWords[i].includes('NATURAL') || queryWords[i].includes('NOT')) {
        queryWords[i] = queryWords[i] + ' ';
      }
      // Attributliste nach einem SELECT soll untereinander stehen
      if (i >= 1 && queryWords[i - 1].includes('SELECT')) {
        for (let j: number = i + 1; j < queryWords.length; j++) {
          if (queryWords[j].includes('FROM')) {
            break;
          }
          for (let k: number = 0; k < level; k++) {
            queryWords[j] = '       ' + queryWords[j];
            if (this.aliasVariant === 0) {
              queryWords[j] = '       ' + queryWords[j];
            }
          }
          queryWords[j] = '\n       ' + queryWords[j];
        }
      }

      // Zusatz zur Behandlung des Falls in dem der Alias in einer neuen Zeile nach der Subquery plaziert werden soll
      if (this.aliasVariant === 2) {
        if (queryWords[i].includes('AS')) {
          queryWords[i] = ')' + queryWords[i];
          queryWords[i - 1] = queryWords[i - 1].substring(0, queryWords[i - 1].length - 1);
          for (let k: number = 0; k < level - 1; k++) {
            queryWords[i] = '       ' + queryWords[i];
          }
          // queryWords[i] = queryWords[i].substring(1);
          queryWords[i] = '\n' + queryWords[i];
        }
        if (queryWords[i].includes('WHERE')) {
          level++;
        }
      }
    }
    return queryWords;
  }

  // Konkateniert die einzelnen Wörter des Querys
  composeQuery(query: string[]): string {
    let queryComposed: string = '';
    for (let i: number = 0; i < query.length; i++) {
      queryComposed += query[i];
    }
    queryComposed = queryComposed.replace('  =', ' =');
    return queryComposed;
  }

  // Gibt den fertigen Querry aus
  output(): string {
    return this.query;
  }
}
