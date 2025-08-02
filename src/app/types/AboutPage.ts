import type { Page } from "~/types/Page";
import type { CurriculumVitaeItem } from "~/types/CurriculumVitaeItem";

export interface AboutPage extends Page {
  greeting?: string;
  curriculumVitae?: CurriculumVitaeItem[];
}
