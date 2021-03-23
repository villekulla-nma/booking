import type { FC, FormEvent } from 'react';
import { Stack, Text, PrimaryButton, NeutralColors } from '@fluentui/react';
import type { IStackTokens } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

interface Props {
  onSubmit: () => void;
  label: string;
}

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

export const Form: FC<Props> = ({ children, onSubmit, label }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form method="post" onSubmit={handleSubmit} className={form}>
      <Stack as="fieldset" className={fieldset} tokens={fieldsetTokens}>
        <Text as="legend" variant="large">
          {label}
        </Text>
        {children}
      </Stack>
      <PrimaryButton type="submit">Absenden</PrimaryButton>
    </form>
  );
};
