import type { CurriculumVitaeItem } from '~/types/CurriculumVitaeItem';
import type { Page } from '~/types/Page';

export interface AboutPage extends Page {
  greeting?: string
  curriculumVitae?: CurriculumVitaeItem[]
}
