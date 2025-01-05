import { useEffect, useRef } from 'react';
import 'bulma/css/bulma.min.css';

export interface SingleIputBoxProps {
  onAction: (result: string | null) => void;
  question: string;
  placeholder?: string;
  tip?: string;
}

function SingleInputBox(props: SingleIputBoxProps): JSX.Element {
  const action = props.onAction;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  });

  function handleOnKeyDown(evt: React.KeyboardEvent<HTMLInputElement>) {
    if (evt.key === 'Enter') {
      action(inputRef.current?.value ?? null);
    }
  }

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-card modalCard" onClick={(evt: React.MouseEvent) => evt.stopPropagation()}>
        <header className="modal-card-head"></header>
        <section className="modal-card-body">
          <label className="label">{props.question}</label>
          <input className="input" ref={inputRef} type="text" placeholder={props.placeholder} onKeyDown={handleOnKeyDown} />
          <p className="help ">{props.tip}</p>
        </section>
        <footer className="modal-card-foot">
          <div className="buttons">
            <button className="button is-success" onClick={() => action(inputRef.current?.value ?? null)}>
              <span>&nbsp;OK</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default SingleInputBox;
