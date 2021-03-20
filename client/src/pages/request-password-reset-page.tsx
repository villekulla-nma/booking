import { useState } from 'react';
import type { FC, SyntheticEvent } from 'react';

import { requestPasswordReset } from '../api';

const Feedback: FC<{ display: boolean }> = ({ display }) => {
  if (display) {
    return (
      <p>
        Eine Email mit einem Link zum aktualisieren deines Passworts wurde an
        deine Emailadresse geschickt. Bitte prüfe deinen Spam-Ordner.
      </p>
    );
  }

  return null;
};

export const RequestPasswordResetPage: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    setEmail(value);
    setFormSubmitted(false);
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    requestPasswordReset(email).then(() => {
      setEmail('');
      setFormSubmitted(true);
    });
  };

  return (
    <form method="post" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Passwort-Reset anfordern</legend>
        <Feedback display={formSubmitted} />
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onInput={handleChange}
            placeholder="Deine Email-Adresse &hellip;"
          />
        </div>
      </fieldset>
      <button>Absenden</button>
    </form>
  );
};
