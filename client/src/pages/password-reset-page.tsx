import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextField, MessageBarType, Link as A } from '@fluentui/react';

import { requestPasswordReset } from '../api';
import { Layout } from '../components/layout';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';

const SuccessFeedback: FC<{ display: boolean }> = ({ display }) => {
  if (display) {
    return (
      <Feedback type={MessageBarType.success}>
        Dein Passwort wurde erfolgreich zurück gesetzt. Bitte wende dich an
        einen der Administratoren, um den Verifizierungs-Code zu bekommen.
        <A as={Link} to="/">
          Zurück zur Startseite
        </A>
      </Feedback>
    );
  }

  return null;
};

export const PasswordResetPage: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
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
    setLoading(true);

    requestPasswordReset(email.trim())
      .then(
        () => {
          setEmail('');
          setFormSubmitted(true);
        },
        () => alert('Da ist leider etwas schief gelaufen.')
      )
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Layout>
      <Form
        label="Passwort-Reset anfordern"
        loading={loading}
        onSubmit={handleSubmit}
      >
        <SuccessFeedback display={formSubmitted} />
        <TextField
          label="Email"
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Deine Email-Adresse &hellip;"
          required={true}
          disabled={loading}
        />
      </Form>
    </Layout>
  );
};
