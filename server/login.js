import { setJwtCookie } from "../web/src/helpers/cookie.js";

const signin_api = 'https://learn.reboot01.com/api/auth/signin';


export async function login(identifier, password) {
    const credentials = btoa(`${identifier}:${password}`);

    const res = await fetch(signin_api, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    });

    if (!res.ok) {
        return "Invalid credentials"
    }

    // get the token as plain text
    let jwt = await res.text();

    // remove any whitespace
    jwt = jwt.trim();

    // remove quotes if present
    if (jwt.startsWith('"') && jwt.endsWith('"')) {
        jwt = jwt.slice(1, -1);
    }

    // validate token format
    const parts = jwt.split('.');
    if (parts.length !== 3) {
        console.error('Invalid JWT format. Received:', jwt.substring(0, 50));
        throw new Error('Received invalid token format from server');
        return null;
    }

    localStorage.setItem('jwt', jwt);
    setJwtCookie(jwt);

    return "ok";
}

