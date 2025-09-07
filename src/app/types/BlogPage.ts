import type { Company } from '~/types/Company';
import type { Page } from '~/types/Page';

export interface BlogPage extends Page {
  company?: Company
}
