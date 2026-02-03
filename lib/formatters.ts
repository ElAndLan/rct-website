
export const formatPhoneNumber = (value: string) => {
  const phone = value.replace(/\D/g, "");
  const match = phone.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  
  if (!match[2]) return match[1];
  if (!match[3]) return `(${match[1]}) ${match[2]}`;
  return `(${match[1]}) ${match[2]} - ${match[3]}`;
};

export const formatCardExpiry = (value: string) => {
  const clean = value.replace(/\D/g, "");
  if (clean.length >= 2) {
    return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
  }
  return clean;
};

export const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
};

export const formatZipCode = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 5);
}
