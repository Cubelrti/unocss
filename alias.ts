import { resolve } from 'path'

const r = (p: string) => resolve(__dirname, p)

export const alias: Record<string, string> = {
  '@unocss/shared-integration': r('./packages/shared-integration/src/'),
  '@unocss/shared-docs': r('./packages/shared-docs/src/'),
  '@unocss/shared-common': r('./packages/shared-common/src/'),
  '@unocss/autocomplete': r('./packages/autocomplete/src'),
  '@unocss/cli': r('./packages/cli/src/'),
  '@unocss/core': r('./packages/core/src/'),
  '@unocss/inspector': r('./packages/inspector/node/'),
  '@unocss/preset-attributify': r('./packages/preset-attributify/src/'),
  '@unocss/preset-icons': r('./packages/preset-icons/src/'),
  '@unocss/preset-mini': r('./packages/preset-mini/src/'),
  '@unocss/preset-tagify': r('./packages/preset-tagify/src/'),
  '@unocss/preset-typography': r('./packages/preset-typography/src/'),
  '@unocss/preset-uno': r('./packages/preset-uno/src/'),
  '@unocss/preset-web-fonts': r('./packages/preset-web-fonts/src/'),
  '@unocss/preset-wind': r('./packages/preset-wind/src/'),
  '@unocss/preset-rem-to-px': r('./packages/preset-rem-to-px/src/'),
  '@unocss/transformer-directives': r('./packages/transformer-directives/src/'),
  '@unocss/transformer-variant-group': r('./packages/transformer-variant-group/src/'),
  '@unocss/transformer-compile-class': r('./packages/transformer-compile-class/src/'),
  '@unocss/vite': r('./packages/vite/src/'),
  'unocss': r('./packages/unocss/src/'),
}
