export function checkToken() {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("jwt="));

    if (!cookie) {
        return "not ok";
    }

    const token =
        decodeURIComponent(cookie.substring(4));

    try {
        const payload =
            JSON.parse(atob(token.split(".")[1]));

        if (
            !payload.exp ||
            Date.now() >= payload.exp * 1000
        ) {
            return "not ok";
        }

        return "ok";

    } catch (error) {
        return "not ok";
    }
}