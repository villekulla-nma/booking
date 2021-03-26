import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Stack,
  TextField,
  MessageBar,
  MessageBarType,
  Link as A,
} from '@fluentui/react';
import type { IStackTokens, IMessageBarStyles } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

import type { UpdatePasswordResponse } from '../api';
import { updatePassword } from '../api';
import { Layout } from '../components/layout';
import { Form } from '../components/form';

interface Params {
  token: string;
}

interface FeedbackProps {
  feedback: UpdatePasswordResponse | undefined;
}

const tokens: IStackTokens = {
  childrenGap: '16px',
};

const feedbackText = mergeStyles({
  fontSize: '14px',
});

const feedbackStyles: IMessageBarStyles = { text: feedbackText };

const Feedback: FC<FeedbackProps> = ({ feedback }) => {
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
    default:
      throw new Error(`Unknown type "${feedback}".`);
  }

  return (
    <MessageBar messageBarType={type} styles={feedbackStyles}>
      {message}
      {feedback === 'ok' && (
        <A as={Link} to="/login">
          Zum Login
        </A>
      )}
    </MessageBar>
  );
};

export const PasswordUpdatePage: FC = () => {
  const { token } = useParams<Params>();
  const [feedback, setFeedback] = useState<
    UpdatePasswordResponse | undefined
  >();
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
    updatePassword(token, password, passwordConfirm).then((status) => {
      setFeedback(status);

      if (status === 'ok') {
        setPassword('');
        setPasswordConfirm('');
      }
    });
  };

  return (
    <Layout>
      <Form label="Passwort neu setzen" onSubmit={handleSubmit}>
        <Stack tokens={tokens}>
          <Feedback feedback={feedback} />
          <TextField
            type="password"
            label="Passwort"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <TextField
            type="password"
            label="Passwort wiederholen"
            id="password_confirm"
            name="password_confirm"
            value={passwordConfirm}
            onChange={handlePasswordConfirmChange}
          />
        </Stack>
      </Form>
    </Layout>
  );
};
