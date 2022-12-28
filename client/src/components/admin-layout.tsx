import type { FC, PropsWithChildren, HTMLAttributes, ReactNode } from 'react';
import { memo } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Stack, Text, Link as A, NeutralColors } from '@fluentui/react';
import type { IStackTokens, IStyle } from '@fluentui/react';
import { mergeStyles } from '@fluentui/merge-styles';
import classNames from 'classnames';

interface Section {
  section: string;
}

const sections = ['Users', 'Units', 'Resources'];

const navTokens: IStackTokens = {
  childrenGap: 16,
};

const navStyles = mergeStyles({
  marginBottom: '32px',
  borderBottom: `1px solid ${NeutralColors.gray40}`,
});

const textSyles = mergeStyles({
  paddingTop: '8px',
  paddingBottom: '8px',
});

const linkActive: IStyle = {
  backgroundColor: NeutralColors.gray20,
  textDecoration: 'none',
};

const linkStyles = mergeStyles({
  padding: '8px 16px',
  userSelect: 'none',
  ':hover': linkActive,
  ':focus': linkActive,
  ':active': linkActive,
});

const activeLinkStyles = mergeStyles({
  ...linkActive,
});

const renderLink = (
  slug: string,
  label: string,
  section?: string
): ReactNode => (
  <Text variant="medium" key={slug} className={textSyles}>
    <A
      as={Link}
      to={`/admin/${slug}`}
      className={classNames(linkStyles, {
        [activeLinkStyles]: section === slug,
      })}
    >
      {label}
    </A>
  </Text>
);

const StackRoot: FC<PropsWithChildren<HTMLAttributes<HTMLElement>>> = ({
  children,
  ...props
}) => <nav {...props}>{children}</nav>;

export const AdminLayout: FC<PropsWithChildren> = memo(({ children }) => {
  const match = useRouteMatch<Section>({
    path: '/admin/:section',
  });

  return (
    <Stack>
      <Stack
        horizontal={true}
        // TODO: remove ignore-directive as soon as all React typings are on version 18
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        as={StackRoot}
        tokens={navTokens}
        className={navStyles}
      >
        {sections.map((label) =>
          renderLink(label.toLowerCase(), label, match?.params.section)
        )}
      </Stack>
      <Stack.Item>{children}</Stack.Item>
    </Stack>
  );
});
