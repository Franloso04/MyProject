import { API_BASE_URL } from "./config.js";
import { getToken } from "./auth.js";

export async function apiRequest(endpoint, method = "GET", data = null) {
    const token = getToken();

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        }
    };

    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(API_BASE_URL + endpoint, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
}
