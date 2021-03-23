import type { FC, SyntheticEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Link as A,
  TextField,
  PrimaryButton,
  Stack,
  Text,
  NeutralColors,
} from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import { login } from '../api';
import { Layout } from '../components/layout';

const form = mergeStyles({
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
});

const fieldset = mergeStyles({
  marginBottom: '16px',
  border: `1px solid ${NeutralColors.gray90}`,
});

const fieldsetTokens: IStackTokens = {
  childrenGap: 12,
};

export const LoginPage: FC = () => {
  const location = useLocation<{ from: string }>();
  const [feedback, setFeedback] = useState<string>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { from = '/app/' } = location.state || {};

  const handleEmailChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setEmail(event.currentTarget.value);
  };
  const handlePasswordChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setPassword(event.currentTarget.value);
  };
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();

    login(email.trim(), password.trim()).then((result) => {
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
    <Layout>
      <form className={form} method="post" onSubmit={handleSubmit}>
        <Stack as="fieldset" className={fieldset} tokens={fieldsetTokens}>
          <Text as="legend" variant="large">
            Anmeldung
          </Text>
          {feedback && (
            <div>
              <b>{feedback}</b>
            </div>
          )}
          <div>
            <TextField
              label="Email"
              type="email"
              name="email"
              id="email"
              value={email}
              placeholder="Dein Email-Adresse &hellip;"
              onChange={handleEmailChange}
            />
          </div>
          <div>
            <TextField
              label="Passwort"
              type="password"
              name="password"
              id="password"
              value={password}
              placeholder="Dein Passwort &hellip;"
              canRevealPassword={true}
              onChange={handlePasswordChange}
            />
          </div>
          <p>
            <A as={Link} to="/password-reset">
              Passwort vergessen?
            </A>
          </p>
        </Stack>
        <PrimaryButton>Absenden</PrimaryButton>
      </form>
    </Layout>
  );
};
