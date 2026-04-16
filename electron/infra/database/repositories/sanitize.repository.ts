export function sanitizeForSqlite(data: any) {
  const cleanData = { ...data };

  for (const key in cleanData) {
    // 1. Transforma undefined em null
    if (cleanData[key] === undefined) {
      cleanData[key] = null;
    }
    // 2. Transforma booleanos em 0 ou 1
    if (typeof cleanData[key] === 'boolean') {
      cleanData[key] = cleanData[key] ? 1 : 0;
    }
    // 3. Se for um objeto (e não for null), vira String (JSON) ou dá erro
    if (typeof cleanData[key] === 'object' && cleanData[key] !== null) {
       console.warn(`Campo ${key} é um objeto. Convertendo para string.`);
       cleanData[key] = JSON.stringify(cleanData[key]);
    }
  }

  return cleanData;
}