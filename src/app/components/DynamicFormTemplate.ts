import type { GetMetadataType } from '@bach.software/vue-dynamic-form';
import { defineMetadata } from '@bach.software/vue-dynamic-form';

export const metadata = defineMetadata<
  {
    text: string
    checkbox: boolean
    heading: never
  },
  {
    label?: string
    description?: string
    options?: { key: string, value: string }[]
  }
>();

export type Metadata = GetMetadataType<typeof metadata>;
