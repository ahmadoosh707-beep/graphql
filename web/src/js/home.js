import { createHomeMarkup } from "../static/templates/home.js";
import { getUserProfile } from "../../../server/graphql/queries.js";
import { createProfileMarkup } from "../static/templates/profile.js";
import { showProgressPage } from "../static/templates/progress.js";
import { initAudits } from "./audits.js";
import { initSkills } from "./skills.js";
import { logout } from "./logout.js";

export async function initHome() {
    const app = document.getElementById("app");

    const markup = createHomeMarkup();

    app.innerHTML = markup;

    
    const profile = app.querySelector(".profile-card");
    
    if (!profile) {
        console.error("Could not find .profile-card");
        return;
    }
    
    
    const res = await getUserProfile();
    
    profile.innerHTML = createProfileMarkup(res);
    
    showProgressPage(app);
    
    initAudits();
    initSkills();
    
    const logoutButton = document.getElementById("logoutBtn");
    logoutButton.addEventListener("click", () => {
        logout();
        return;
    });
}