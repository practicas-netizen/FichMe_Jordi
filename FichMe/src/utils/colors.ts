// Truco para saber si un color de fondo es "oscuro" o "claro",
// y así decidir si el texto/icono encima debe ser blanco o negro para que se lea bien.
export function isColorDark(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}