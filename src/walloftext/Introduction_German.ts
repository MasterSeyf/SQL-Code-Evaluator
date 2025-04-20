import { TaskDefinition } from '../tasks/taskCommons';

// Einfügen der Begrüßungsnachricht und Initialisierung des Programms im Pausenmodus
const einleitung: string =
  'Dies ist ein Experiment zur Evaluation von verschiedenen Syntaxen bezüglich der Platzierung von SQL Codekomponenten. \n' +
  'Wir danken Ihnen, dass Sie sich zur Teilnahme bereiterklärt haben. \n' +
  'Vergewissern Sie sich zunächst, dass alle 50 Zeilen sichtbar sind. \n' +
  'Dazu können Sie entweder den Fullscreenmodus aktivieren oder herauszoomen. \n' +
  'Nun werden die vorkommenden Variationen der Syntax einer SQL Anfrage erläutert:';
const änderung1: string =
  '\n\n' +
  '____Erste Änderung (Postfix / Prefix von Umbenennungen)____\n' +
  'Standardmäßig befindet sich der Alias nach der umzubenennenden Subquery. \n' +
  'Dies hat beispielsweise die folgende Form:';
const code1: string =
  '\n' +
  '____Postfix Alias:____\n' +
  'SELECT * \n' +
  'FROM   (Subquery) AS Alias;\n' +
  'Diese Syntax wird hier bei manchen Aufgaben abgeändert und schaut wie folgt aus:\n' +
  '____Prefix Alias:____\n' +
  'SELECT *\n' +
  'FROM   Alias AS (Subquery);';
const änderung2: string =
  '\n\n' +
  '____Zweite Änderung (Postfix / Infix von Verbundsbedingungen)____\n' +
  'Standardmäßig befindet sich die Verbundsbedingung nach der zweiten Tabelle. \n' +
  'Dies hat beispielsweise die folgende Form:';
const code2: string =
  '\n' +
  '____Postfix Verbundsbedingung:____\n' +
  'SELECT *\n' +
  'FROM   Tabelle1\n' +
  '       JOIN\n' +
  '       Tabelle2\n' +
  '       ON (Tabelle1.attribut1 = Tabelle2.attribut2); \n' +
  'Diese Syntax wird hier bei manchen Aufgaben abgeändert und schaut wie folgt aus:\n' +
  '____Infix Verbundsbedingung:____\n' +
  'SELECT *\n' +
  'FROM   Tabelle1\n' +
  '       ⋈ (Tabelle1.attribut1 = Tabelle2.attribut2)\n' +
  '       Tabelle2;\n';
const ausleitung: string =
  '\nDiese 2 Variationen bezüglich der Umbenennung und des Verbundsoperators können in jeder Kombination auftreten.' +
  '\nDaraus resultieren 4 mögliche Aufgabentypen, die Ihnen begegnen können.' +
  '\nIm SQL Code wird sich immer genau 1 Syntaxfehler entweder in einer Verbunds- oder Selektionsbedingung befinden.' +
  '\nDiese Bedingungen werden immer aus einem Gleichheitsvergleich bestehen.' +
  '\nDer Fehler wird eine referenzierte Tabelle oder Attribut sein, welches nicht existiert.' +
  '\nSie können davon ausgehen dass alle Attribute den Datentyp TEXT besitzen und miteinander verglichen werden können.' +
  '\nIhre Aufgabe wird es sein die Zeile des Syntaxfehlers ins untere Eingabefeld aufzuschreiben und abzuschicken.' +
  '\nDamit Sie sich mit den Kombinationsmöglichkeiten vertraut machen, werden zunächst Übungsaufgaben präsentiert.' +
  '\nInnerhalb dieser Übungsaufgaben werden Sie Feedback zu Ihren Lösungen erhalten.' +
  '\nBei einer richtigen Eingabe färbt sich das Abgabefeld Grün und es wird mit der nächsten Aufgabe fortgesetzt.' +
  '\nBei einer falschen Eingabe färbt sich das Abgabefeld Rot und Sie müssen Ihre Eingabe korrigieren, bis sie stimmt.' +
  '\nNach dem Tutorial wird es kein Feedback zu den Abgaben geben und auch fehlerhafte Antworten werden zum Fortsetzen führen.' +
  '\nVor jeder Aufgabe wird Ihnen genannt, um welche Variantenkombination es sich in der kommenden Aufgabe handeln wird.' +
  '\nNach jeder abgegebenen Lösung können Sie in der Zwischenübersicht eine Pause einlegen.' +
  '\nSchließen Sie allerdings auf keinen Fall dieses Fenster, ansonsten gehen Ihre Fortschritte verloren.' +
  '\nFalls Sie irgendwelche Fragen haben sollten, so klären Sie diese bitte jetzt mit der Aufsichtsperson.' +
  '\nZum Verlassen dieser Erklärungsübersicht drücken Sie bitte die Tastenkombination Strg + Enter oder Command + Enter.';

const Introduction: TaskDefinition = {
  text: einleitung + änderung1 + code1 + änderung2 + code2 + ausleitung
};

export default Introduction;
