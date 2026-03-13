// ─── Always create a FRESH regex — NEVER use /g flag on a stored pattern ───
// With /g flag, regex remembers lastIndex and alternates true/false every call!

const getSQLPattern = () =>
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FROM|WHERE|TABLE|INTO|VALUES|JOIN|SCRIPT)\b|--|;|\/\*|\*\/|xp_|'|")/i;

const getXSSPattern = () =>
  /<\s*script|javascript:|on\w+\s*=|<\s*iframe|<\s*img/i;

export const containsSQLInjection = (value) => {
  if (typeof value !== "string") return false;
  return getSQLPattern().test(value);
};

export const containsXSS = (value) => {
  if (typeof value !== "string") return false;
  return getXSSPattern().test(value);
};

// Call this in every form onSubmit BEFORE dispatching
// Throws an Error with a user-friendly message if bad input found
export const sanitizeFormData = (data) => {
  const sanitized = {};

  for (const key in data) {
    const value = data[key];

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (containsXSS(trimmed)) {
        throw new Error(`Invalid input in "${key}" — scripts not allowed`);
      }

      if (containsSQLInjection(trimmed)) {
        throw new Error(`Invalid input in "${key}" — special characters not allowed`);
      }

      sanitized[key] = trimmed;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};