export function setJwtCookie(token) {
    document.cookie = `jwt=${encodeURIComponent(token)}; max-age=86400; path=/; SameSite=Lax`;
}