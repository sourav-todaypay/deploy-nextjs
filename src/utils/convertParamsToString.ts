export const convertParamsToString = (
  params: Record<string, unknown>,
): Record<string, string> => {
  return Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      acc[key] = Array.isArray(value) ? value.join(',') : String(value);
      return acc;
    },
    {} as Record<string, string>,
  );
};
