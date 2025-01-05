import { useEffect, useState } from 'react';
import './App.css';
import SingleInputBox from './components/SingleInputBox';
import TaskUi from './components/TaskUi';

enum AppState {
  START,
  NAME_ENTERED,
  SEED_ENTERED,
}

function App() {
  useEffect(() => {
    const handleBeforeUnload = (evt: BeforeUnloadEvent) => {
       evt.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  const [state, setState] = useState<AppState>(AppState.START);
  const [fileName, setFileName] = useState<string>('NoName');
  const [seed, setSeed] = useState<string>('');

  let mainElement: JSX.Element | null = null;

  function onNameEnteredEvent(result: string | null) {
    console.log(result);
    if (result) {
      setFileName(result);
    }
    setState(AppState.NAME_ENTERED);
  }
  function onSeedEnteredEvent(result: string | null) {
    console.log(result);
    setSeed(result ?? '');
    setState(AppState.SEED_ENTERED);
  }

  switch (state) {
    case AppState.START:
      mainElement = (
        <SingleInputBox onAction={onNameEnteredEvent} question="Please enter your Name into the box below." tip="Just press return if you don't want your own name." placeholder="Enter name here" />
      );
      break;

    case AppState.NAME_ENTERED:
      mainElement = <SingleInputBox onAction={onSeedEnteredEvent} question="What seed should be used?" tip="Just press return if you don't want to choose your own seed." />;
      break;

    case AppState.SEED_ENTERED:
      mainElement = <TaskUi fileName={fileName} seed={seed} />;
      break;
  }

  return <>{mainElement}</>;
}

export default App;
