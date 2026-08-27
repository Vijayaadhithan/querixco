export type CompanyQueryPages = {
  pages: Array<{ company_id: string }>;
};

export class AnalyticsCompanyMismatchError extends Error {
  constructor() {
    super("The analytics service returned data for a different company.");
    this.name = "AnalyticsCompanyMismatchError";
  }
}

export function queryPagesMatchCompany(
  data: CompanyQueryPages | undefined,
  company: string,
): boolean {
  return data === undefined || data.pages.every((page) => page.company_id === company);
}

export function retainMatchingCompanyData<T extends CompanyQueryPages>(company: string) {
  return (previous: T | undefined): T | undefined =>
    queryPagesMatchCompany(previous, company) ? previous : undefined;
}
