import type { FC } from 'react';
import { MessageBar } from '@fluentui/react';
import type { IMessageBarStyles, MessageBarType } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

interface Props {
  type: MessageBarType;
}

const feedbackText = mergeStyles({
  fontSize: '14px',
});

const feedbackStyles: IMessageBarStyles = { text: feedbackText };

export const Feedback: FC<Props> = ({ type, children }) => (
  <MessageBar messageBarType={type} styles={feedbackStyles}>
    {children}
  </MessageBar>
);
