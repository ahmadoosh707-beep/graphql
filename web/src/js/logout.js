export function logout() {
    document.cookie =
        "jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    window.location.href = "./index.html";
}