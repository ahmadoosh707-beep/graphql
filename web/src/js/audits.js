import { renderAuditsPage } from "../static/templates/audits.js";

function clearContainer(container) {
    container.innerHTML = '';
}

export async function initAudits() {
    const auditsButton = document.getElementById("all-audits-button");
    auditsButton.addEventListener("click", async () => {
        await renderAuditsPage(
            app
        );
    })
}