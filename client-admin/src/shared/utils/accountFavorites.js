export function getAccountFavoriteKey(userId) {
  return `novabank:favorites:${userId || 'anonymous'}`;
}

export function getAccountId(account) {
  return String(account?._id || account?.idCuenta || account?.id || account?.numeroCuenta || '');
}

export function loadFavoriteAccounts(userId) {
  try {
    const raw = localStorage.getItem(getAccountFavoriteKey(userId));
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteAccounts(userId, accountIds) {
  localStorage.setItem(getAccountFavoriteKey(userId), JSON.stringify([...new Set(accountIds.map(String))]));
}

export function toggleFavoriteAccount(userId, accountId) {
  const id = String(accountId);
  const current = loadFavoriteAccounts(userId);
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];

  saveFavoriteAccounts(userId, next);
  return next;
}

export function pruneInactiveFavorites(userId, accounts) {
  try {
    const current = loadFavoriteAccounts(userId);
    if (!current || current.length === 0) return [];

    // Find the normalized IDs of all accounts that are not active
    const inactiveIds = new Set(
      (accounts || [])
        .filter((acc) => {
          const estado = acc?.estado || acc?.status;
          return estado === "INACTIVE" || (estado && estado !== "ACTIVE");
        })
        .map((acc) => getAccountId(acc))
    );

    if (inactiveIds.size === 0) return current;

    // Filter out inactive ones
    const next = current.filter((id) => !inactiveIds.has(id));

    if (next.length !== current.length) {
      saveFavoriteAccounts(userId, next);
    }
    return next;
  } catch {
    return loadFavoriteAccounts(userId);
  }
}

