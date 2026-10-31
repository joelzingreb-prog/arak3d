// Gestion des Favoris 3D en localStorage

const KEY = 'arak3d_favorites';

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(product) {
  const favs = getFavorites();
  if (!favs.find(f => f.id === product.id)) {
    favs.push(product);
    localStorage.setItem(KEY, JSON.stringify(favs));
  }
}

export function removeFavorite(productId) {
  const favs = getFavorites().filter(f => f.id !== productId);
  localStorage.setItem(KEY, JSON.stringify(favs));
}

export function isFavorite(productId) {
  return getFavorites().some(f => f.id === productId);
}