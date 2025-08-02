import type { Page } from "~/types/Page";
import type { Company } from "~/types/Company";

export interface BlogPage extends Page {
  company?: Company;
}
