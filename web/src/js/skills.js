import { getSkillTransactions } from "../../../server/graphql/queries.js";
import { createSkillsSVG } from "../static/templates/skills.js";
import { createSkillsGraph } from "../js/skillsGraph.js";

export function processSkillTransactions(
    transactions
) {

    if (!Array.isArray(transactions)) {
        return {};
    }

    const skills = {};

    /*
     * ------------------------------------------------------------
     * GROUP BY SKILL TYPE
     * ------------------------------------------------------------
     */

    transactions.forEach(
        transaction => {

            const type =
                transaction?.type;

            if (!type) {
                return;
            }

            if (!skills[type]) {
                skills[type] = [];
            }

            skills[type].push(
                transaction
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * PROCESS EACH SKILL
     * ------------------------------------------------------------
     */

    Object.entries(
        skills
    ).forEach(
        ([skill, skillTransactions]) => {

            /*
             * The query returns newest -> oldest.
             *
             * Reverse it so we process the skill
             * from its earliest transaction to its latest.
             */

            skillTransactions.sort(
                (a, b) => {

                    return (
                        new Date(
                            a.createdAt
                        ).getTime() -
                        new Date(
                            b.createdAt
                        ).getTime()
                    );
                }
            );

            /*
             * ----------------------------------------------------
             * HIGHEST SKILL LEVEL
             * ----------------------------------------------------
             */

            const highest =
                Math.max(
                    ...skillTransactions.map(
                        transaction =>
                            Number(
                                transaction.amount
                            ) || 0
                    )
                );

            /*
             * ----------------------------------------------------
             * PROJECT CONTRIBUTIONS
             * ----------------------------------------------------
             */

            let previousAmount = 0;

            const projects =
                skillTransactions.map(
                    transaction => {

                        const amount =
                            Number(
                                transaction.amount
                            ) || 0;

                        const added =
                            amount -
                            previousAmount;

                        /*
                         * Get the last part of the path.
                         *
                         * /bahrain/bh-module/
                         * real-time-forum
                         *
                         * -> real-time-forum
                         */

                        const path =
                            String(
                                transaction.path ||
                                ""
                            );

                        const pathParts =
                            path
                                .split("/")
                                .filter(Boolean);

                        const project =
                            pathParts.length
                                ? pathParts[
                                pathParts.length - 1
                                ]
                                : "Unknown Project";

                        previousAmount =
                            amount;

                        return {

                            project,

                            added,

                            amount,

                            createdAt:
                                transaction.createdAt,

                            path:
                                transaction.path
                        };
                    }
                )
                    .filter(
                        project =>
                            project.added > 0
                    );

            /*
             * ----------------------------------------------------
             * STORE RESULT
             * ----------------------------------------------------
             */

            skills[skill] = {

                /*
                 * Highest amount represents
                 * the final skill level.
                 */

                level:
                    highest,

                /*
                 * Skill level as percentage.
                 * Assumes 100 is the maximum.
                 */

                percentage:
                    Math.min(
                        highest,
                        100
                    ),

                projects
            };
        }
    );

    return skills;
}

export async function initSkills() {

    const transactions =
        await getSkillTransactions();

    const skills =
        processSkillTransactions(
            transactions
        );

    const graph = createSkillsGraph(skills);

    const cont = document.getElementById("skills-graph-container");
    cont.appendChild(graph);

    const skillsButton = document.getElementById("skills-button");
    skillsButton.addEventListener("click", async () => {

        createSkillsSVG(skills);
    })

}

