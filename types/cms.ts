/**
 * Centralized CMS types
 * Used for page builder and module management
 */

/**
 * Module types
 */
export type ModuleType = "TEMPLATE" | "EDITABLE_HTML"

/**
 * Base module interface (database model)
 */
export interface Module {
  id: string
  nazwa: string
  typ: ModuleType
  szablon?: string | null
  html?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * Module interface for page builder (with aliases)
 * Uses English names for better code readability
 */
export interface ModuleForBuilder {
  id: string
  name: string
  code: string
  description?: string | null
  type?: ModuleType
}

/**
 * Page module (junction table) - database model
 */
export interface PageModule {
  id: string
  pageId: string
  moduleId: string
  kolejnosc: number
  dane?: string | null
  module?: Module
}

/**
 * Page module for builder (with parsed data)
 */
export interface PageModuleForBuilder {
  id?: string
  moduleId: string
  module?: ModuleForBuilder
  order: number
  data: Record<string, any>
}

/**
 * Page interface
 */
export interface Page {
  id: string
  slug: string
  title: string
  metaTitle?: string | null
  metaDescription?: string | null
  active: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
  modules?: PageModule[]
}

/**
 * Page with modules for builder
 */
export interface PageWithModules extends Page {
  modules: (PageModule & { module: Module })[]
}

/**
 * Converts database Module to ModuleForBuilder
 */
export function toModuleForBuilder(module: Module): ModuleForBuilder {
  return {
    id: module.id,
    name: module.nazwa,
    code: module.szablon || module.html || '',
    description: null,
    type: module.typ,
  }
}

/**
 * Converts database PageModule to PageModuleForBuilder
 */
export function toPageModuleForBuilder(pageModule: PageModule): PageModuleForBuilder {
  return {
    id: pageModule.id,
    moduleId: pageModule.moduleId,
    module: pageModule.module ? toModuleForBuilder(pageModule.module) : undefined,
    order: pageModule.kolejnosc,
    data: pageModule.dane ? JSON.parse(pageModule.dane) : {},
  }
}
