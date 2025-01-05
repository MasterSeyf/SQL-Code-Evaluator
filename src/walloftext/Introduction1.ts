import { TaskDefinition } from '../tasks/taskCommons';

// Einfügen der Begrüßungsnachricht und Initialisierung des Programms im Pausenmodus
const einleitung: string =
  'Dies ist ein Experiment zur Evaluation von verschiedenen Syntaxen bezüglich der Reihenfolge bzw. Platzierung von SQL Codekomponenten. \n' +
  'Vielen Dank, dass sie sich zur Teilnahme bereiterklärt haben. \n' +
  'Zunächst werden die hier vorkommenden verschiedenen Variationen erläutert:';
const änderung1: string =
  '\n\n' +
  'Erste Änderung (Postfix / Prefix von Umbenennungen)\n' +
  'Standardmäßig befindet sich der Alias für die Umbenennung nach der umzubenennenden Tabelle bzw. Subquery. \n' +
  'Dies hat beispielsweise die folgende Form:';
const code1: string =
  '\n' +
  'SELECT *\n' +
  'FROM   Tabelle AS Alias;\n' +
  'bzw. \n' +
  'SELECT * \n' +
  'FROM   (Subquery) AS Alias;\n' +
  'Diese Reihenfolge wird hier bei manchen Aufgaben umgedreht und schaut wie folgt aus:\n' +
  'SELECT *\n' +
  'FROM   Alias AS Tabelle;\n' +
  'bzw. \n' +
  'SELECT *\n' +
  'FROM   Alias AS (Subquery);';
const änderung2: string =
  '\n\n' +
  'Zweite Änderung (Postfix / Infix / Prefix von Verbundsbedingungen)\n' +
  'Standardmäßig befindet sich der Verbundsoperator zwischen den zu verknüpfenden Tabellen während die Verbundsbedingung nach der zweiten Tabelle definiert wird. \n' +
  'Dies hat beispielsweise die folgende Form:';
const code2: string =
  '\n' +
  'Postfix Verbundsbedingung:\n' +
  'SELECT *\n' +
  'FROM   Tabelle1\n' +
  '       JOIN\n' +
  '       Tabelle2\n' +
  '       ON (Tabelle1.attribut = Tabelle2.attribut); \n' +
  'Diese Reihenfolge wird hier bei manchen Aufgaben auf zwei Weisen abgeändert und schaut wie folgt aus:\n' +
  'Infix Verbundsbedingung:\n' +
  'SELECT *\n' +
  'FROM   Tabelle1\n' +
  '       ⋈ (Tabelle1.attribut = Tabelle2.attribut) \n' +
  '       Tabelle2;\n' +
  'Prefix Verbundsbedingung:\nSELECT *\nFROM   ⋈ (Tabelle1.attribut = Tabelle2.attribut)\n       Tabelle1\n       Tabelle2;';
const ausleitung: string =
  '\n\n' +
  'Diese 2 Variationen bezüglich der Umbenennung als auch die 3 Variationen bezüglich des Verbundsoperators können in jeder Kombination auftreten. \n' +
  'Daraus resultieren 6 mögliche Aufgabentypen, die Ihnen begegnen können.' +
  '\nIhre Aufgabe wird es sein, die Zeile in der sich ein Syntaxfehler hinsichtlich einer Verbunds- oder Selektionsbedingung befindet zu erkennen und aufzuschreiben.' +
  '\nDamit Sie sich mit den verschiedenen Kombinationsmöglichkeiten vertraut machen, werden im Folgenden Übungsaufgaben präsentiert, bei denen Sie Feedback zu Ihren Lösungen erhalten.' +
  '\nBei einer richtigen Eingabe färbt sich das Abgabefeld Grün und es wird mit der nächsten Aufgabe fortgesetzt, während sich bei einer falschen Eingabe das Abgabefeld Rot färbt und Sie Ihre Eingabe korrigieren müssen, bis sie stimmt.' +
  '\nNach dem Tutorial wird es kein Feedback mehr zu den Abgaben gegeben und somit werden auch fehlerhafte Antworten zum Fortsetzen mit der nächsten Aufgabe führen.' +
  '\nVor jeder Aufgabe wird Ihnen im Vorfeld genannt, um welche Variantenkombination es sich in der kommenden Aufgabe handeln wird. \n' +
  'Nach jeder abgegebenen Lösung können Sie in der Zwischenübersicht eine Pause einlegen.' +
  '\n' +
  'Falls Sie Fragen zu den Syntaxen oder zum weiteren Ablauf haben sollten so klären Sie diese bitte jetzt mit der Aufsichtsperson. \n' +
  'Zum Verlassen dieser Hilfsübersicht drücken Sie bitte die Tastenkombination Strg + Enter.';

const Introduction1: TaskDefinition = {
  text: einleitung + änderung1 + code1 + änderung2 + code2 + ausleitung,
};

export default Introduction1;
