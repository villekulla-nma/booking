import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stack, TextField, MessageBarType, Link as A } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';

import type { ResponseStatus } from '../api';
import { updatePassword } from '../api';
import { Layout } from '../components/layout';
import { Form } from '../components/form';
import { Feedback } from '../components/feedback';
import { useRedirectUnauthenticatedUser } from '../hooks/use-redirect-unauthenticated-user';

interface Params {
  token: string;
}

interface FeedbackProps {
  feedback: ResponseStatus | undefined;
}

const tokens: IStackTokens = {
  childrenGap: '16px',
};

const UserFeedback: FC<FeedbackProps> = ({ feedback }) => {
  if (!feedback) {
    return null;
  }

  let message: string;
  let type: MessageBarType;

  switch (feedback) {
    case 'ok':
      message = 'Passwort erfolgreich zurück gesetzt.';
      type = MessageBarType.success;
      break;
    case 'invalid':
      message = 'Die Passwörter stimmen leider nicht überein.';
      type = MessageBarType.warning;
      break;
    case 'error':
      message = 'Ein Fehler ist aufgetreten. Bitte versuch es noch einmal.';
      type = MessageBarType.error;
      break;
    case 'overlapping':
    case 'unverified':
      throw new Error(`Unexpected type "${feedback}".`);
    default:
      throw new Error(`Unknown type "${feedback}".`);
  }

  return (
    <Feedback type={type}>
      {message}
      {feedback === 'ok' && (
        <A as={Link} to="/login">
          Zum Login
        </A>
      )}
    </Feedback>
  );
};

export const PasswordUpdatePage: FC = () => {
  const redirect = useRedirectUnauthenticatedUser();
  const { token } = useParams<Params>();
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<ResponseStatus | undefined>();
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const handlePasswordChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFeedback(undefined);
    setPassword(event.currentTarget.value);
  };
  const handlePasswordConfirmChange = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFeedback(undefined);
    setPasswordConfirm(event.currentTarget.value);
  };
  const handleSubmit = (): void => {
    setLoading(true);

    updatePassword(token, password, passwordConfirm)
      .then(
        (status) => {
          setFeedback(status);

          if (status === 'ok') {
            setPassword('');
            setPasswordConfirm('');
          }
        },
        (error) => redirect(error)
      )
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Layout>
      <Form
        label="Passwort neu setzen"
        loading={loading}
        onSubmit={handleSubmit}
      >
        <Stack tokens={tokens}>
          <UserFeedback feedback={feedback} />
          <TextField
            type="password"
            label="Passwort"
            id="password"
            name="password"
            placeholder="Dein neues Passwort &hellip;"
            value={password}
            onChange={handlePasswordChange}
            minLength={8}
            required={true}
            canRevealPassword={true}
            description="Mindestens 8 Zeichen"
            disabled={loading}
          />
          <TextField
            type="password"
            label="Passwort wiederholen"
            id="password_confirm"
            name="password_confirm"
            placeholder="Bestätige das Passwort &hellip;"
            value={passwordConfirm}
            onChange={handlePasswordConfirmChange}
            minLength={8}
            required={true}
            canRevealPassword={true}
            disabled={loading}
          />
        </Stack>
      </Form>
    </Layout>
  );
};
