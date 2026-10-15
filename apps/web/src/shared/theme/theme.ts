import {
  createTheme,
  type ButtonFactory,
  type CSSVariablesResolver,
  type ExtendComponent,
  type MantineColorsTuple,
} from '@mantine/core';

const brand = [
  '#f3f8ec',
  '#e3f0d4',
  '#c6e2a8',
  '#a8d46f',
  '#8fcb5e',
  '#6aaf3e',
  '#3b7a2a',
  '#2f6a25',
  '#24541d',
  '#163412',
] as const satisfies MantineColorsTuple;

export const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand },
  fontFamily: 'var(--font-sans), sans-serif',
  fontFamilyMonospace: 'var(--font-mono), monospace',
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      classNames: {
        root: 'h-10 border border-solid border-line bg-surface px-4 text-ink hover:brightness-[1.06] data-[variant=filled]:border-transparent data-[variant=filled]:bg-accent data-[variant=filled]:text-on-accent',
        inner: 'gap-2',
        label: 'font-sans text-sm leading-5 font-medium [[data-variant=filled]_&]:font-bold',
      },
    } satisfies ExtendComponent<ButtonFactory>,
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--mantine-primary-color-filled': 'var(--accent)',
  },
  light: {
    '--mantine-color-body': 'var(--bg-canvas)',
    '--mantine-color-text': 'var(--text-primary)',
  },
  dark: {
    '--mantine-color-body': 'var(--bg-canvas)',
    '--mantine-color-text': 'var(--text-primary)',
  },
});
