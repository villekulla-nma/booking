import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TextField,
  MessageBar,
  MessageBarType,
  Link as A,
} from '@fluentui/react';

import { requestPasswordReset } from '../api';
import { Layout } from '../components/layout';
import { Form } from '../components/form';

const Feedback: FC<{ display: boolean }> = ({ display }) => {
  if (display) {
    return (
      <MessageBar messageBarType={MessageBarType.success}>
        Eine Email mit einem Link zum aktualisieren deines Passworts wurde an
        deine Emailadresse geschickt. Bitte prüfe deinen Spam-Ordner.
        <A as={Link} to="/">
          Zurück zur Startseite
        </A>
      </MessageBar>
    );
  }

  return null;
};

export const PasswordResetPage: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const handleChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = event.currentTarget;

    setEmail(value);
    setFormSubmitted(false);
  };
  const handleSubmit = (): void => {
    requestPasswordReset(email.trim()).then(() => {
      setEmail('');
      setFormSubmitted(true);
    });
  };

  return (
    <Layout>
      <Form label="Passwort-Reset anfordern" onSubmit={handleSubmit}>
        <Feedback display={formSubmitted} />
        <TextField
          label="Email"
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Deine Email-Adresse &hellip;"
        />
      </Form>
    </Layout>
  );
};
