import type { Company } from "~/types/Company";

export const buildCompany = (fn?: (company: Company) => void) => {
  const company: Company = {
    name: "Company",
    description: "Description",
    url: "https://bach.software",
    imageUrl: "/company/logo.png",
    imageAlt: "Company Logo",
  };
  if (fn) fn(company);
  return company;
};
