import type { Page } from "~/types/Page";
import type { Project } from "~/types/Project";

export interface AboutPage extends Page {
  projects?: Project[];
}
