import type { Page } from "~/types/Page";
import type { PortfolioItem } from "~/types/PortfolioItem";

export interface PortfolioPage extends Page {
  portfolio?: PortfolioItem[];
}
