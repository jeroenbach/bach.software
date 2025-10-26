import type { Page } from '~/types/Page';

export interface AboutPage extends Omit<Page, 'company' | 'portfolio' | 'curriculumVitae'> {
}
