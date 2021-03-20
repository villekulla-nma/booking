import type { FC, SyntheticEvent } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import type { UpdatePasswordResponse } from '../api';
import { updatePassword } from '../api';

interface Params {
  token: string;
}

interface FeedbackProps {
  feedback: UpdatePasswordResponse | undefined;
}

const Feedback: FC<FeedbackProps> = ({ feedback }) => {
  switch (feedback) {
    case 'ok':
      return <p>Passwort erfolgreich zurück gesetzt.</p>;
    case 'invalid':
      return <p>Passwörter stimmen nicht überein.</p>;
    case 'error':
      return <p>Ein Fehler ist aufgetreten. Bitte versuch es noch einmal.</p>;
    default:
      return null;
  }
};

export const PasswordUpdatePage: FC = () => {
  const { token } = useParams<Params>();
  const [feedback, setFeedback] = useState<
    UpdatePasswordResponse | undefined
  >();
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const handlePasswordChange = (
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    setFeedback(undefined);
    setPassword(event.currentTarget.value);
  };
  const handlePasswordConfirmChange = (
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    setFeedback(undefined);
    setPasswordConfirm(event.currentTarget.value);
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    updatePassword(token, password, passwordConfirm).then((status) => {
      setFeedback(status);

      if (status === 'ok') {
        setPassword('');
        setPasswordConfirm('');
      }
    });
  };

  return (
    <form method="post" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Passwort neu setzen</legend>
        <Feedback feedback={feedback} />
        <div>
          <label htmlFor="password">Passwort</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onInput={handlePasswordChange}
          />
        </div>
        <div>
          <label htmlFor="password_confirm">Passwort wiederholen</label>
          <input
            type="password"
            id="password_confirm"
            name="password_confirm"
            value={passwordConfirm}
            onInput={handlePasswordConfirmChange}
          />
        </div>
      </fieldset>
      <button>Absenden</button>
    </form>
  );
};
