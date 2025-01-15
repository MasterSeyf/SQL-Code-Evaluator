export interface ITitleParameters {
  countTasks: number;
  maxTasks: number;
  isTutorialDone: boolean;
  maxTutorialTasks: number;
}

export function titleGenerator(params: ITitleParameters, suffix: string): string {
  const { countTasks, maxTasks, isTutorialDone, maxTutorialTasks } = params;

  // Wenn alle Aufgaben erledigt wurden
  if (countTasks > maxTasks) {
    return 'SQL Code Evaluator';
  }

  // Variablen während des Experimentes
  let maxTasksLocal = 0;
  let numberOfDigits = 0;
  let stage = '';
  let surplus = '';

  // Vorgehen für das Tutorial
  if (!isTutorialDone) {
    maxTasksLocal = maxTutorialTasks;
    numberOfDigits = ('' + maxTutorialTasks).length;
    stage = 'Tutorial: ';
  }

  // Vorgehen für das Hauptexperiment
  if (isTutorialDone) {
    maxTasksLocal = maxTasks;
    numberOfDigits = ('' + maxTasks).length;
    stage = 'Experiment: ';
  }

  // Füllen der Nullen
  while (('' + countTasks).length < numberOfDigits) {
    surplus += '0';
    numberOfDigits--;
  }
  return 'SQL Code Evaluator, ' + stage + 'Task: ' + surplus + countTasks + '/' + maxTasksLocal + (suffix ? ' ' + suffix : '');
}