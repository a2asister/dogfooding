export interface SubCategory {
  id: string;
  name: string;
  amount: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  color: string;
  amount: number;
  subCategories: SubCategory[];
}
