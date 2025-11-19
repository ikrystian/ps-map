/**
 * Module Parser - Parsuje kod modułu i obsługuje specjalne tagi
 */

export interface ModuleField {
  type: 'input-text' | 'textarea' | 'textarea-wysiwyg' | 'input-number' | 'input-email' | 'input-url' | 'select' | 'checkbox';
  name: string;
  label?: string;
  placeholder?: string;
  options?: string[]; // dla select
  defaultValue?: string;
}

export interface ParsedModule {
  html: string;
  fields: ModuleField[];
}

/**
 * Parsuje kod modułu i ekstraktuje pola formularza
 */
export function parseModuleCode(code: string): ParsedModule {
  const fields: ModuleField[] = [];
  const regex = /\{([a-zA-Z0-9-_]+)(?::([^}]+))?\}/g;
  let match;

  while ((match = regex.exec(code)) !== null) {
    const [fullMatch, tagType, options] = match;

    // Parsuj opcje (jeśli istnieją)
    const parsedOptions = parseTagOptions(options);

    // Określ typ pola
    let fieldType: ModuleField['type'] = 'input-text';
    if (tagType.startsWith('input-')) {
      fieldType = tagType as ModuleField['type'];
    } else if (tagType === 'textarea') {
      fieldType = 'textarea';
    } else if (tagType === 'textarea-wysiwyg') {
      fieldType = 'textarea-wysiwyg';
    } else if (tagType === 'select') {
      fieldType = 'select';
    } else if (tagType === 'checkbox') {
      fieldType = 'checkbox';
    }

    // Wygeneruj unikalną nazwę pola
    const fieldName = `field_${fields.length}`;

    fields.push({
      type: fieldType,
      name: fieldName,
      label: parsedOptions.label || `Pole ${fields.length + 1}`,
      placeholder: parsedOptions.placeholder,
      options: parsedOptions.options,
      defaultValue: parsedOptions.default
    });
  }

  return {
    html: code,
    fields
  };
}

/**
 * Parsuje opcje tagu, np: "label:Tytuł,placeholder:Wpisz tytuł"
 */
function parseTagOptions(optionsString?: string): Record<string, any> {
  if (!optionsString) return {};

  const options: Record<string, any> = {};
  const parts = optionsString.split(',');

  for (const part of parts) {
    const [key, value] = part.split(':').map(s => s.trim());
    if (key && value) {
      if (key === 'options') {
        // Dla select - opcje oddzielone |
        options[key] = value.split('|').map(o => o.trim());
      } else {
        options[key] = value;
      }
    }
  }

  return options;
}

/**
 * Renderuje moduł z wypełnionymi danymi
 */
export function renderModule(code: string, data: Record<string, any>): string {
  let rendered = code;
  const regex = /\{([a-zA-Z0-9-_]+)(?::([^}]+))?\}/g;
  let fieldIndex = 0;

  rendered = rendered.replace(regex, (match) => {
    const fieldName = `field_${fieldIndex}`;
    const value = data[fieldName] || '';
    fieldIndex++;
    return value;
  });

  return rendered;
}

/**
 * Generuje formularz React do edycji modułu
 */
export function generateModuleFormFields(parsedModule: ParsedModule) {
  return parsedModule.fields.map((field, index) => ({
    name: field.name,
    type: field.type,
    label: field.label || `Pole ${index + 1}`,
    placeholder: field.placeholder,
    options: field.options,
    defaultValue: field.defaultValue || ''
  }));
}

/**
 * Waliduje dane formularza modułu
 */
export function validateModuleData(parsedModule: ParsedModule, data: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of parsedModule.fields) {
    const value = data[field.name];

    // Walidacja email
    if (field.type === 'input-email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field.label}: Nieprawidłowy adres email`);
      }
    }

    // Walidacja URL
    if (field.type === 'input-url' && value) {
      try {
        new URL(value);
      } catch {
        errors.push(`${field.label}: Nieprawidłowy adres URL`);
      }
    }

    // Walidacja number
    if (field.type === 'input-number' && value) {
      if (isNaN(Number(value))) {
        errors.push(`${field.label}: Wartość musi być liczbą`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
