import type { FC, SyntheticEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { login } from '../api';

export const LoginPage: FC = () => {
  const location = useLocation<{ from: string }>();
  const [feedback, setFeedback] = useState<string>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { from = '/app/' } = location.state || {};

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
          window.location.href = from;
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
        <p>
          <Link to="/password-reset">Passwort vergessen?</Link>
        </p>
      </fieldset>
      <button>Absenden</button>
    </form>
  );
};
