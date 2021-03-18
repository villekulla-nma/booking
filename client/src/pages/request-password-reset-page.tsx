import type { FC } from 'react';

export const RequestPasswordResetPage: FC = () => {
  return (
    <form method="post">
      <fieldset>
        <legend>Passwort-Reset anfordern</legend>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Deine Email-Adresse &hellip;"
          />
        </div>
      </fieldset>
      <button>Absenden</button>
    </form>
  );
};
