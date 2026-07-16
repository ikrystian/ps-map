/**
 * Helpery do hierarchicznej struktury kategorii bloga.
 * Operują na płaskiej liście kategorii (z polem parentId) zwracanej przez API.
 */

import type { BlogCategory } from "@/types/blog"

export interface BlogCategoryNode extends BlogCategory {
  children: BlogCategoryNode[]
}

export interface FlatBlogCategory extends BlogCategory {
  depth: number
}

/**
 * Buduje drzewo kategorii z płaskiej listy.
 * Kategorie z parentId wskazującym na nieistniejącą (np. nieaktywną) kategorię
 * traktowane są jako korzenie.
 */
export function buildCategoryTree(categories: BlogCategory[]): BlogCategoryNode[] {
  const nodes = new Map<string, BlogCategoryNode>()
  categories.forEach((cat) => nodes.set(cat.id, { ...cat, children: [] }))

  const roots: BlogCategoryNode[] = []
  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortByName = (list: BlogCategoryNode[]) => {
    list.sort((a, b) => a.nazwa.localeCompare(b.nazwa, "pl"))
    list.forEach((n) => sortByName(n.children))
  }
  sortByName(roots)

  return roots
}

/**
 * Usuwa z drzewa kategorie bez wpisów (wg _count.blogPosts).
 * Kategoria nadrzędna bez własnych wpisów zostaje, jeśli ma niepuste podkategorie.
 */
export function pruneEmptyCategoryTree(nodes: BlogCategoryNode[]): BlogCategoryNode[] {
  return nodes
    .map((node) => ({ ...node, children: pruneEmptyCategoryTree(node.children) }))
    .filter((node) => (node._count?.blogPosts ?? 0) > 0 || node.children.length > 0)
}

/**
 * Spłaszcza drzewo kategorii do listy z poziomem zagnieżdżenia (depth),
 * zachowując kolejność drzewa (rodzic przed dziećmi).
 */
export function flattenCategoryTree(categories: BlogCategory[]): FlatBlogCategory[] {
  const result: FlatBlogCategory[] = []
  const walk = (nodes: BlogCategoryNode[], depth: number) => {
    nodes.forEach((node) => {
      const { children, ...cat } = node
      result.push({ ...cat, depth })
      walk(children, depth + 1)
    })
  }
  walk(buildCategoryTree(categories), 0)
  return result
}

/**
 * Zwraca id podanej kategorii oraz wszystkich jej potomków (podkategorii).
 */
export function getCategoryWithDescendantIds(
  categories: Pick<BlogCategory, "id" | "parentId">[],
  categoryId: string
): string[] {
  const childrenByParent = new Map<string, string[]>()
  categories.forEach((cat) => {
    if (cat.parentId) {
      const list = childrenByParent.get(cat.parentId) || []
      list.push(cat.id)
      childrenByParent.set(cat.parentId, list)
    }
  })

  const result: string[] = []
  const queue = [categoryId]
  while (queue.length > 0) {
    const id = queue.shift()!
    result.push(id)
    queue.push(...(childrenByParent.get(id) || []))
  }
  return result
}

/**
 * Zwraca ścieżkę przodków kategorii (od korzenia do podanej kategorii włącznie).
 */
export function getCategoryPath(
  categories: BlogCategory[],
  categoryId: string
): BlogCategory[] {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const path: BlogCategory[] = []
  let current = byId.get(categoryId)
  while (current) {
    path.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return path
}
