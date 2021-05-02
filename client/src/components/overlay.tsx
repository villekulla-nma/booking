import type { FC } from 'react';
import { Overlay as OverlayComp } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';

interface Props {
  visible: boolean;
}

const overlay = mergeStyles({
  zIndex: 100,
});

const inner = mergeStyles({
  maxWidth: '400px',
  padding: '32px',
  margin: '64px auto 32px auto',
  backgroundColor: 'white',
});

export const Overlay: FC<Props> = ({ visible, children }) => {
  if (!visible) {
    return null;
  }

  return (
    <OverlayComp isDarkThemed={true} className={overlay} data-testid="overlay">
      <div className={inner}>{children}</div>
    </OverlayComp>
  );
};
