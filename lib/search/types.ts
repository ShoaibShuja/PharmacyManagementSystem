export type GlobalSearchResult = {
  id: string;
  type: "medicine" | "sale" | "supplier" | "purchase";
  title: string;
  description: string;
  href: string;
  keywords: string;
};
