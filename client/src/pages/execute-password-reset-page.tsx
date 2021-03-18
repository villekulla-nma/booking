import type { FC } from 'react';

export const ExecutePasswordResetPage: FC = () => {
  return (
    <form method="post">
      <fieldset>
        <legend>Passwort neu setzen</legend>
        <div>
          <label htmlFor="password">Passwort</label>
          <input type="password" id="password" name="password" />
        </div>
        <div>
          <label htmlFor="password_repeat">Passwort wiederholen</label>
          <input type="password" id="password_repeat" name="password_repeat" />
        </div>
      </fieldset>
      <button>Absenden</button>
    </form>
  );
};
