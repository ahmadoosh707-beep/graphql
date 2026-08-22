import { createHomeMarkup } from "./home.js";
import { getUserProfile, getXPTransactions, getUserID } from "../../../../server/graphql/queries.js";
import { createProfileMarkup } from "./profile.js";
import { createProgressSVG, getXPTree } from "../helpers/progress.js";
import { renderXPChart } from "../../js/charts.js";
import { renderSvgView } from "./svg.js";
import { initHome } from "../../js/home.js"

export async function showProgressPage(app) {

    /*
     * Render homepage first.
     */
    app.innerHTML =
        createHomeMarkup();


    /*
     * Render profile.
     */
    const profile =
        app.querySelector(".profile-card");


    if (profile) {

        const res =
            await getUserProfile();

        profile.innerHTML =
            createProfileMarkup(res);
    }


    /*
     * Find audits card.
     */
    const auditsCard =
        app.querySelector(".audit-buttons");


    if (!auditsCard) {

        console.error(
            "Could not find .Audits-card"
        );

        return;
    }

    const progressButton = document.getElementById("progress-button");
    progressButton.addEventListener(
        "click",
        async () => {

            await renderProgressPage(
                app
            );

        }
    );

    const auditsBUtton = document.getElementById("audit-history-button");
    auditsBUtton.addEventListener(
        "click",
        async () => {

            const mount = renderSvgView(app, {
                command: 'cat xp_growth.log',
                mountId: 'xp-chart',
                onHome: () => initHome(),
            });
            const res = await getUserID();
            const xpTransactions = await getXPTransactions(res.user[0].id);
            renderXPChart(mount, xpTransactions.transaction);

        }
    );
}


/*
 * Render the actual progress page.
 */
async function renderProgressPage(app) {

    app.innerHTML = "";


    /*
     * Page.
     */
    const page =
        document.createElement("div");

    page.className =
        "progress-page";


    /*
     * Header.
     */
    const header =
        document.createElement("div");

    header.className =
        "progress-page-header";


    const backButton =
        document.createElement("button");

    backButton.className =
        "audits-progress-button";

    const text = document.createElement('span');
    text.innerHTML = "Back Home";

    backButton.appendChild(text);



    header.appendChild(
        backButton
    );

    /*
     * SVG content.
     */
    const content =
        document.createElement("div");

    content.className =
        "progress-page-content";


    page.appendChild(
        header
    );

    page.appendChild(
        content
    );


    app.appendChild(
        page
    );


    /*
     * Back button.
     */
    backButton.addEventListener(
        "click",
        async () => {

            initHome();

        }
    );


    /*
     * Get tree.
     */
    const tree =
        await getXPTree();


    /*
     * Create SVG.
     */
    const svg =
        createProgressSVG(tree);


    content.appendChild(
        svg
    );
}