import { TaskDefinition } from '../tasks/taskCommons';

// Einfügen der Begrüßungsnachricht und Initialisierung des Programms im Pausenmodus
const einleitung: string =
  'This is an experiment aiming to evaluate different syntaxes regarding the position of SQL code components. \n' +
  'We thank you for your willingness to participate. \n' +
  'First, make sure that all 50 lines are visible. \n' +
  'To do this, you can either enable the fullscreen mode or zoom out. \n' +
  'The following explains the different syntax variations of an SQL query used:';
const änderung1: string =
  '\n\n' +
  '____First variation (postfix / prefix of aliases)____\n' +
  'By default, the alias is placed after the subquery to be renamed. \n' +
  'This, for example, takes the following form:';
const code1: string =
  '\n' +
  '____Postfix Alias:____\n' +
  'SELECT * \n' +
  'FROM   (Subquery) AS Alias;\n' +
  'In some tasks, this syntax is modified and appears as follows:\n' +
  '____Prefix Alias:____\n' +
  'SELECT *\n' +
  'FROM   Alias AS (Subquery);';
const änderung2: string =
  '\n\n' +
  '____Second variation (postfix / infix of join conditions)____\n' +
  'By default, the join condition is placed after the second table. \n' +
  'This, for example, takes the following form:';
const code2: string =
  '\n' +
  '____Postfix Join Condition:____\n' +
  'SELECT *\n' +
  'FROM   Tabelle1\n' +
  '       JOIN\n' +
  '       Tabelle2\n' +
  '       ON (Tabelle1.attribut1 = Tabelle2.attribut2); \n' +
  'In some tasks, this syntax is modified and appears as follows:\n' +
  '____Infix Join Condition:____\n' +
  'SELECT *\n' +
  'FROM   Tabelle1\n' +
  '       ⋈ (Tabelle1.attribut1 = Tabelle2.attribut2)\n' +
  '       Tabelle2;\n';
const ausleitung: string =
  '\nThese 2 variations regarding aliases and join conditions can occur in any combination.' +
  '\nThis results in 4 possible task types that you may encounter.' +
  '\nWithin the SQL code, there will always be exactly 1 syntax error, either in a join or selection condition.' +
  '\nThese conditions will always consist of an equality comparison.' +
  '\nThe error will be a referenced table or an attribute that does not exist.' +
  '\nYou can assume that all attributes have the data type TEXT and can be compared to each other.' +
  '\nYour task will be to identify the line of the syntax error and to submit it.' +
  '\nTo familiarize yourself with the possible combinations, you will first be presented with practice tasks.' +
  '\nWithin these practice tasks, you will receive feedback on your solutions.' +
  '\nIf your input is correct, the submission field will turn green, and the next task will follow.' +
  '\nIf your input is incorrect, the submission field will turn red, and your must correct your input until it is correct.' +
  '\nAfter the tutorial, no feedback will be given, and incorrect answers will still allow progression.' +
  '\nBefore each task, you will be informed in advance which combination of variations will be used in the upcoming task.' +
  '\nAfter each submitted solution, you can take a break in the pause screen.' +
  '\nHowever, do not close this window under any circumstances, as your progress will otherwise be lost.' +
  '\nIf you have any questions, please clarify them now with the supervisor.' +
  '\nTo exit this explanation overview, please press the key combination Ctrl + Enter or Command + Enter.';

// @ts-expect-error - Alternative when English shall be used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Introduction_English: TaskDefinition = {
  text: einleitung + änderung1 + code1 + änderung2 + code2 + ausleitung
};

// export default Introduction_English;