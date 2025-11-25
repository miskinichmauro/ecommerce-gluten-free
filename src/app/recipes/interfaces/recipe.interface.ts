export interface Recipe {
  id: string,
  title: string,
  text: string,
  description?: string | null,
  matchCount?: number,
  recipeIngredients?: Array<{ ingredient?: { name?: string } }>
}
