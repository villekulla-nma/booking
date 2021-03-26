import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextField, MessageBarType, Link as A } from '@fluentui/react';

import { requestPasswordReset } from '../api';
import { Layout } from '../components/layout';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';

const UserFeedback: FC<{ display: boolean }> = ({ display }) => {
  if (display) {
    return (
      <Feedback type={MessageBarType.success}>
        Eine Email mit einem Link zum Aktualisieren deines Passworts wurde an
        deine Email-Adresse geschickt. Bitte prüfe deinen Spam-Ordner.
        <A as={Link} to="/">
          Zurück zur Startseite
        </A>
      </Feedback>
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
        <UserFeedback display={formSubmitted} />
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
