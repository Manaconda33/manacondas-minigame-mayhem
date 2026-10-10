// Offline-only instance validation of the JSON Schema keywords used by Stage B.
// Fail on unsupported keywords rather than silently ignoring schema drift.
// This intentionally adds no runtime dependency or production validation adapter.
const ANNOTATIONS = new Set(['$schema', '$id', 'title', 'description', '$defs']);
const ASSERTIONS = new Set([
  '$ref','type','const','enum','pattern','minimum','exclusiveMinimum',
  'minLength','maxLength','required','properties','additionalProperties',
  'items','minItems','maxItems','uniqueItems','allOf','anyOf','oneOf',
  'not','if','then','else'
]);
const matchesType = (value, type) => {
  switch (type) {
    case 'null': return value === null;
    case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'array': return Array.isArray(value);
    case 'string': return typeof value === 'string';
    case 'boolean': return typeof value === 'boolean';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'integer': return Number.isSafeInteger(value);
    default: throw Error(`unsupported JSON Schema type: ${type}`);
  }
};
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);

export function validateSchemaInstance(schema, value, pointer = '#') {
  if (!schema || schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    throw Error('expected Stage B JSON Schema Draft 2020-12');
  }
  const walk = (rule, current) => {
    if (typeof rule === 'boolean') return rule;
    if (rule === null || typeof rule !== 'object' || Array.isArray(rule)) throw Error('invalid schema rule');
    for (const key of Object.keys(rule)) {
      if (!ANNOTATIONS.has(key) && !ASSERTIONS.has(key)) throw Error(`unimplemented JSON Schema keyword ${key}`);
    }
    if (rule.$ref !== undefined) {
      if (typeof rule.$ref !== 'string' || !rule.$ref.startsWith('#/$defs/')) throw Error('unsupported schema reference');
      const definition = schema.$defs?.[rule.$ref.slice('#/$defs/'.length)];
      if (definition === undefined) throw Error(`missing schema reference: ${rule.$ref}`);
      if (!walk(definition,current)) return false;
    }
    if (rule.type !== undefined && !matchesType(current,rule.type)) return false;
    if (rule.const !== undefined && !equal(current,rule.const)) return false;
    if (rule.enum !== undefined && !rule.enum.some(x => equal(x,current))) return false;
    if (rule.allOf !== undefined && !rule.allOf.every(r => walk(r,current))) return false;
    if (rule.anyOf !== undefined && !rule.anyOf.some(r => walk(r,current))) return false;
    if (rule.oneOf !== undefined && rule.oneOf.filter(r => walk(r,current)).length !== 1) return false;
    if (rule.not !== undefined && walk(rule.not,current)) return false;
    if (rule.if !== undefined) {
      if (walk(rule.if,current)) {
        if (rule.then !== undefined && !walk(rule.then,current)) return false;
      } else if (rule.else !== undefined && !walk(rule.else,current)) return false;
    }
    if (typeof current === 'number') {
      if (rule.minimum !== undefined && current < rule.minimum) return false;
      if (rule.exclusiveMinimum !== undefined && current <= rule.exclusiveMinimum) return false;
    }
    if (typeof current === 'string') {
      if (rule.minLength !== undefined && [...current].length < rule.minLength) return false;
      if (rule.maxLength !== undefined && [...current].length > rule.maxLength) return false;
      if (rule.pattern !== undefined && !new RegExp(rule.pattern, 'u').test(current)) return false;
    }
    if (Array.isArray(current)) {
      if (rule.minItems !== undefined && current.length < rule.minItems) return false;
      if (rule.maxItems !== undefined && current.length > rule.maxItems) return false;
      if (rule.uniqueItems === true && current.some((v,i) => current.slice(0,i).some(prev => equal(prev,v)))) return false;
      if (rule.items !== undefined && !current.every(v => walk(rule.items,v))) return false;
    }
    if (matchesType(current,'object')) {
      if (rule.required !== undefined && !rule.required.every(k => Object.hasOwn(current,k))) return false;
      if (rule.additionalProperties === false && Object.keys(current).some(k => !Object.hasOwn(rule.properties ?? {},k))) return false;
      if (rule.properties !== undefined && Object.entries(rule.properties).some(([k,r]) => Object.hasOwn(current,k) && !walk(r,current[k]))) return false;
    }
    return true;
  };
  if (pointer === '#') return walk(schema,value);
  if (!pointer.startsWith('#/$defs/')) throw Error(`unsupported definition pointer: ${pointer}`);
  const def = schema.$defs?.[pointer.slice('#/$defs/'.length)];
  if (!def) throw Error(`missing schema definition: ${pointer}`);
  return walk(def,value);
}
