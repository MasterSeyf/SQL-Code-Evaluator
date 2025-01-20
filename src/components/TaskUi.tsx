import { useEffect, useRef, useState } from 'react';
import CodeViewer from './CodeViewer';
import Measurement from '../tasks/Measurement';
import Introduction from '../walloftext/Introduction.ts';
import PauseTextInitial from '../walloftext/PauseTextInitial.ts';
import PauseTextDefault from '../walloftext/PauseTextDefault.ts';
import PauseTextTutorialCompletion from '../walloftext/PauseTextTutorialCompletion.ts';
import Conclusion from '../walloftext/Conclusion';
import { IVariantParameters, translateVariants } from '../walloftext/VariantTranslator';
import { ITitleParameters, titleGenerator } from '../walloftext/Title';
import Seeder from '../tasks/Seeder';
import Task from '../tasks/Task';

export interface TaskUiProps {
  fileName: string;
  seed: string;
}

// === CONSTS ===
// Feste Reihenfolge der Kombinationen der Varianten des Tutorials
const tutorialJoinVariant = [2, 2, 3, 3, 2, 2, 3, 3];
const tutorialPostfix = [2, 0, 2, 0, 2, 0, 2, 0];

class TaskUiState implements IVariantParameters, ITitleParameters {
  title: string;
  code: string;
  buttonAnswerEnabled: boolean;
  answerInputClassName: string;
  buttonText: string;
  paused: boolean;

  index: string;
  maxIndex: string;
  lineNumber: string;
  maxLineNumber: string;
  depth: string;
  maxDepth: string;

  // Variants
  joinVariant: number;
  aliasVariant: number;
  indexCategory: number;
  leftSide: boolean;
  alias: boolean;

  // Miscellaneous
  isTutorialDone: boolean;
  firstRealTask: boolean;
  isTask: boolean;
  started: boolean;
  finished: boolean;
  maxTasks: number;
  maxTutorialTasks: number;
  countTasks: number;
  countTutorialTasks: number;

  constructor(x?: TaskUiState) {
    if (x) {
      this.title = x.title;
      this.code = x.code;
      this.buttonAnswerEnabled = x.buttonAnswerEnabled;
      this.answerInputClassName = x.answerInputClassName;
      this.buttonText = x.buttonText;
      this.paused = x.paused;

      this.index = x.index;
      this.maxIndex = x.maxIndex;
      this.lineNumber = x.lineNumber;
      this.maxLineNumber = x.maxLineNumber;
      this.depth = x.depth;
      this.maxDepth = x.maxDepth;

      this.joinVariant = x.joinVariant;
      this.aliasVariant = x.aliasVariant;
      this.indexCategory = x.indexCategory;
      this.leftSide = x.leftSide;
      this.alias = x.alias;

      this.maxTutorialTasks = x.maxTutorialTasks;
      this.maxTasks = x.maxTasks;
      this.countTutorialTasks = x.countTutorialTasks;
      this.started = x.started;
      this.countTasks = x.countTasks;
      this.isTutorialDone = x.isTutorialDone;
      this.firstRealTask = x.firstRealTask;
      this.isTask = x.isTask;
      this.finished = x.finished;
    } else {
      this.code = Introduction.text;
      this.title = document.title;
      this.buttonAnswerEnabled = false;
      this.answerInputClassName = '';
      this.buttonText = 'Fortfahren (Enter)';
      this.paused = true;

      this.index = '';
      this.maxIndex = '';
      this.lineNumber = '';
      this.maxLineNumber = '';
      this.depth = '';
      this.maxDepth = '';

      this.joinVariant = 0;
      this.aliasVariant = 0;
      this.indexCategory = 0;
      this.leftSide = false;
      this.alias = false;

      // Die Anzahl der Tutorial-Aufgaben ist ein Vielfaches der Kombinationen in zwei Wiederholungen: 4 · 2 = 8
      const kombinationenTutorial = 4;
      const wiederholungenTutorial = 2;
      this.maxTutorialTasks = kombinationenTutorial * wiederholungenTutorial;
      this.countTutorialTasks = 0;
      this.started = false;
      this.countTasks = 1;
      this.isTutorialDone = false;
      this.firstRealTask = false;
      this.isTask = false;
      this.finished = false;

      // Die Anzahl der Aufgaben ist ein Vielfaches der Kombinationen in 8 Wiederholungen: (2 · 2 · 3) * 8 = 12 · 8 = 96
      const kombinationen = 12;
      const wiederholungen = 8;
      this.maxTasks = kombinationen * wiederholungen;
    }
  }
}

export default function TaskUi(props: TaskUiProps): JSX.Element {
  const [measurement, _setMeasurer] = useState<Measurement>(new Measurement(props.fileName));
  const [uiState, setUiState] = useState<TaskUiState>(new TaskUiState(undefined));
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const [seeder, _setSeeder] = useState<Seeder>(new Seeder(props.seed));
  const [enterUnlocked, setEnterUnlocked] = useState<boolean>(true);

  // Setzt die Kombination an Parameter für die nächste Aufgabe
  async function setParameter(state: TaskUiState) {
    // Sofern das Tutorial noch läuft, wird die vorher fest definierte Reihenfolge an Variationen durchgeführt
    if (!state.isTutorialDone) {
      state.joinVariant = tutorialJoinVariant[state.countTutorialTasks];
      state.aliasVariant = tutorialPostfix[state.countTutorialTasks];
      state.countTutorialTasks++;
      state.indexCategory = 0;
      return;
    }

    // Falls nicht, wird dynamisch bestimmt welche Kombination an Variationen in der nächsten Aufgabe drankommen sollen
    const combinations = measurement.getCombinations();
    const number = await seeder.getRandomAltInt(state.maxTasks - state.countTasks + 1); // Eine Zahl zwischen 0 und der noch offenen Anzahl an Aufgaben
    const tasksPerCombination = state.maxTasks / 12; // 96 / 12 = 8 Wiederholungen pro Kombinationsmöglichkeiten an Parametern
    let runner = 0; // Laufvariable

    // Alle möglichen Kombinationsmöglichkeiten der Parameter werden durchlaufen:
    // ConditionVariante : 2-4 : Postfix / Infix / Prefix
    // AliasVariante ----: 0-2 : Prefix / Postfix / Postfix NL
    // IndexCategory ----: 1-3 : Index -> 0-2 / 3-5 / 6-8
    for (let join = 2; join <= 3; join++) {
      for (let post = 0; post <= 2; post += 2) {
        for (let category = 1; category <= 3; category++) {
          const index = (join - 2) * 6 + (post / 2) * 3 + (category - 1);
          const remainingTasks = tasksPerCombination - combinations[index];

          for (let i = 0; i < remainingTasks; i++) {
            runner++;
            if (runner == number) {
              state.joinVariant = join;
              state.aliasVariant = post;
              state.indexCategory = category;
              return;
            }
          }
        }
      }
    }
  }

  // Erzeugt eine Aufgabe in dem nicht bearbeitbarem Textfeld
  async function createTask(state: TaskUiState) {
    // Aufgabe wird erzeugt
    // Tasks
    const task = new Task(seeder, !state.isTutorialDone, state.countTutorialTasks, state.joinVariant, state.aliasVariant, state.indexCategory);
    await task.initializeParameters();
    await task.createQuery();
    task.indentQuery();
    await task.fillQuery();
    await task.analyzeQuery();
    state.index = task.index + '';
    state.maxIndex = task.maxIndex + '';
    state.lineNumber = task.lineNumber + '';
    state.maxLineNumber = task.maxLineNumber + '';
    state.depth = task.depth + '';
    state.maxDepth = task.maxDepth + '';
    state.leftSide = task.leftSide;
    state.alias = task.alias;

    // Das Textfeld wird mit dem Query gefüllt und selbiger wird gefärbt
    state.code = task.query;

    // Zeitmessung wird gestartet
    measurement.startTimer();
  }

  async function stepForward2(answer: string, state: TaskUiState) {
    // Deaktivierung des Tutorials
    if (state.countTasks >= state.maxTutorialTasks + 1 && !state.isTutorialDone) {
      state.isTutorialDone = true;
      state.countTasks = 1;
      state.firstRealTask = true;
    }

    // Falls alle Aufgaben bearbeitet wurden, folgen keine weiteren Umschaltungen
    if (state.countTasks >= state.maxTasks + 1 && !state.finished) {
      measurement.endTimer(
        state.joinVariant,
        !state.isTutorialDone,
        state.aliasVariant,
        state.index,
        state.indexCategory + '',
        state.maxIndex,
        state.lineNumber,
        state.maxLineNumber,
        state.depth,
        state.maxDepth,
        state.leftSide,
        state.alias,
        answer
      );
      state.title = titleGenerator(state, 'Experiment concluded');
      state.code = Conclusion.text;
      if (answerInputRef.current) {
        answerInputRef.current.value = '';
      }
      state.finished = true;
      state.buttonText = 'Daten herunterladen (Enter)';
    } else if (!state.finished) {
      // Falls noch nicht alle Aufgaben bearbeitet wurden, folgt eine Umschaltung
      // Falls aktuell eine Aufgabe zu bearbeiten war, wird das Programm in den Pausenmodus geschaltet und die benötigte Zeit und die abgegebene Antwort erfasst
      if (state.isTask) {
        measurement.endTimer(
          state.joinVariant,
          !state.isTutorialDone,
          state.aliasVariant,
          state.index,
          state.indexCategory + '',
          state.maxIndex,
          state.lineNumber,
          state.maxLineNumber,
          state.depth,
          state.maxDepth,
          state.leftSide,
          state.alias,
          answer
        );
        await setParameter(state);
        state.title = titleGenerator(state, '(Pausiert)');
        state.paused = true;

        // Bei der allerersten Aufgabe nach dem Tutorial wird ein anderer Text angezeigt
        if (state.firstRealTask) {
          state.code = PauseTextTutorialCompletion.text + translateVariants(state);
          state.firstRealTask = false;
        } else {
          // Ansonsten der normale Text
          state.code = PauseTextDefault.text + translateVariants(state);
        }
        if (answerInputRef.current) {
          answerInputRef.current.value = '';
        }
        state.buttonText = 'Fortfahren (Enter)';
        state.isTask = false;
      } else {
        // else if (!isTask)
        // Falls aktuell keine Aufgabe zu bearbeiten war, wird das Programm in den Aufgabenmodus geschaltet und hierfür ein neuer Query erzeugt
        state.paused = false;
        await createTask(state);
        state.title = titleGenerator(state, '');
        if (answerInputRef.current) {
          answerInputRef.current.value = '';
        }
        state.answerInputClassName = ''; //White Background
        state.buttonText = 'Abschicken (Enter)';
        state.isTask = true;

        // Nummerierung der Aufgaben wird inkrementiert
        if (state.countTasks <= state.maxTasks) {
          state.countTasks += 1;
        }
      }
    }
  }

  async function stepForward() {
    let answer = ''; //Not sure if we need this as a global
    let process = true;
    const state = new TaskUiState(uiState);

    if (state.finished) {
      measurement.saveFile();
      return;
    }

    // Verarbeitet die abgegebene Antwort
    if (state.isTask) {
      const input = answerInputRef.current?.value ?? '';
      // Wenn die abgegebene Antwort Zeilenumbrüche hat, werden diese entfernt
      answer = input.replaceAll(/\r|\n/g, '');

      // Checkt, ob die Lösung richtig war (Nur im Tutorial)
      if (!state.isTutorialDone) {
        // Falls die Lösung richtig war, wird das Textfeld grün gefärbt
        if (answer === state.lineNumber || answer === '-') {
          state.answerInputClassName = 'answerCorrect';
        } else {
          // Falls die Lösung falsch war, wird das Textfeld rot gefärbt, der getrimmte String ins Abgabefeld geschrieben und die Funktion verlassen
          state.answerInputClassName = 'answerIncorrect';
          if (answerInputRef.current) {
            answerInputRef.current.value = answer;
          }
          process = false;
        }
      }
    }

    if (process) {
      await stepForward2(answer, state);
    }

    setUiState(state);
  }

  // Im Einführungstext wird nur weitergesteppt, wenn man Steuerung-Enter (oder für macs Command-Enter) drückt
  function handlePageOnKeyDown(evt: KeyboardEvent) {
    if (enterUnlocked) {
      if (!uiState.started && evt.key === 'Enter' && (evt.ctrlKey || evt.metaKey)) {
        setEnterUnlocked(false);
        setUiState((xState) => {
          const state = new TaskUiState(xState);
          state.joinVariant = tutorialJoinVariant[state.countTutorialTasks];
          state.aliasVariant = tutorialPostfix[state.countTutorialTasks];
          state.countTutorialTasks++;
          state.buttonAnswerEnabled = true;
          state.started = true;

          state.title = titleGenerator(state, '(Pausiert)');
          state.code = PauseTextInitial.text;
          state.code += translateVariants(state);
          return state;
        });
      } else if (uiState.started && evt.key === 'Enter') {
        setEnterUnlocked(false);
        if (evt.altKey) {
          measurement.saveFile();
        } else {
          stepForward();
        }
      }
    }
  }

  function handlePageOnKeyUp(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      setEnterUnlocked(true);
    }
  }

  function handleOnAnswerButtonClick(): void {
    if (uiState.started) {
      stepForward();
    }
  }

  // EFX
  useEffect(() => {
    answerInputRef.current?.focus();
    document.title = uiState.title;
  });

  useEffect(() => {
    window.addEventListener('keydown', handlePageOnKeyDown);
    return () => window.removeEventListener('keydown', handlePageOnKeyDown);
  });
  useEffect(() => {
    window.addEventListener('keyup', handlePageOnKeyUp);
    return () => window.removeEventListener('keyup', handlePageOnKeyUp);
  });

  function handleTextKeyDown(evt: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (uiState.started && evt.key === 'Enter') {
      setEnterUnlocked(false);
      if (evt.altKey) {
        measurement.saveFile();
      } else {
        evt.stopPropagation();
        evt.preventDefault();

        if (enterUnlocked) {
          stepForward();
        }
      }
    }
  }

  function handleTextKeyUp(evt: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (evt.key === 'Enter') {
      setEnterUnlocked(true);
    }
  }

  return (
    <div className="taskManager">
      <h1 className="title">{uiState.title}</h1>
      <CodeViewer code={uiState.code} />
      <div className="answerContainer">
        <div>Textfeld für Antworten</div>
        <textarea
          id="answerInput"
          ref={answerInputRef}
          className={uiState.answerInputClassName}
          disabled={!uiState.started || uiState.finished || uiState.paused}
          onKeyDown={handleTextKeyDown}
          onKeyUp={handleTextKeyUp}
        ></textarea>
        <button className="answerButton" disabled={!uiState.started} onClick={handleOnAnswerButtonClick}>
          {uiState.buttonText}
        </button>
      </div>
    </div>
  );
}
