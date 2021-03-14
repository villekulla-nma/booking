import type { FC, SyntheticEvent } from 'react';
import { useState } from 'react';

import { login } from '../api';

export const LoginPage: FC = () => {
  const [feedback, setFeedback] = useState<string>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleEmailChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    setEmail(event.currentTarget.value);
  };
  const handlePasswordChange = (
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    setPassword(event.currentTarget.value);
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    login(email, password).then((result) => {
      switch (result) {
        case 'ok':
          window.location.reload();
          break;
        case 'unverified':
          setFeedback('Bitte verfifiziere deinen Nutzer.');
          setPassword('');
          break;
        case 'invalid':
          setFeedback('Nutzername oder Passwort sind nicht korrekt.');
          setPassword('');
          break;
        case 'error':
        default:
          setFeedback('Etwas ist schief gelaufen.');
          setPassword('');
          break;
      }
    });
  };

  return (
    <form action="/api/login" method="post" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Anmeldung</legend>
        {feedback && (
          <div>
            <b>{feedback}</b>
          </div>
        )}
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            placeholder="Dein Email-Adresse&hellip;"
            onInput={handleEmailChange}
          />
        </div>
        <div>
          <label htmlFor="password">Passwort</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            placeholder="Dein Passwort&hellip;"
            onInput={handlePasswordChange}
          />
        </div>
      </fieldset>
      <button>Absenden</button>
    </form>
  );
};
