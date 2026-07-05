import type { GetMetadataType } from '@bach.software/vue-dynamic-form';
import { defineMetadata } from '@bach.software/vue-dynamic-form';

/**
 * The field types available in our forms and the extra properties
 * fields can have. This is pure configuration - no rendering - so it
 * can be imported by pages and tests without pulling in Vue components.
 */
export const metadata = defineMetadata<
  {
    text: string
    select: string
    checkbox: boolean
    heading: never // display-only, no form value
  },
  {
    description?: string
    options?: { key: string, value: string }[]
    disabled?: boolean
  }
>();

export type Metadata = GetMetadataType<typeof metadata>;
