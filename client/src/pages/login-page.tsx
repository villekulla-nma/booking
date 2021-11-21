import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Link as A, TextField, MessageBarType } from '@fluentui/react';

import { redirect } from '../helpers/location';
import { login } from '../api';
import { Layout } from '../components/layout';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';

export const LoginPage: FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(false);
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
  const handleSubmit = (): void => {
    setLoading(true);

    login(email.trim(), password).then(
      (result) => {
        switch (result) {
          case 'ok':
            redirect(from);
            break;
          case 'unverified':
            setFeedback('Bitte verfifiziere deinen Nutzer.');
            setPassword('');
            setLoading(false);
            break;
          case 'invalid':
            setFeedback('Nutzername oder Passwort sind nicht korrekt.');
            setPassword('');
            setLoading(false);
            break;
          case 'error':
          default:
            setFeedback(
              'Etwas ist schief gelaufen. Bitte versuche es noch einmal.'
            );
            setPassword('');
            setLoading(false);
            break;
        }
      },
      () => alert('Da ist leider etwas schief gelaufen.')
    );
  };

  return (
    <Layout>
      <Form label="Anmeldung" loading={loading} onSubmit={handleSubmit}>
        {feedback && (
          <Feedback type={MessageBarType.error}>{feedback}</Feedback>
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
            required={true}
            disabled={loading}
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
            required={true}
            disabled={loading}
          />
        </div>
        <p>
          <A as={Link} to="/password-reset">
            Passwort vergessen?
          </A>
        </p>
      </Form>
    </Layout>
  );
};
