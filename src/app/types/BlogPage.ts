import type { Page } from '~/types/Page';

export interface BlogPage extends Omit<Page, 'greeting' | 'curriculumVitae'> {
}
