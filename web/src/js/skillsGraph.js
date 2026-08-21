export function createSkillsGraph(processedSkills) {

    /*
     * ------------------------------------------------------------
     * GET SKILLS
     * ------------------------------------------------------------
     */

    let skills = {};

    if (
        processedSkills &&
        processedSkills.skills
    ) {

        skills =
            processedSkills.skills;

    } else if (
        processedSkills &&
        typeof processedSkills === "object"
    ) {

        skills =
            processedSkills;
    }

    /*
     * ------------------------------------------------------------
     * PROCESS SKILLS
     * ------------------------------------------------------------
     */

    const skillEntries =
        Object.entries(
            skills
        )
            .filter(
                ([, skill]) => {

                    return (
                        skill &&
                        Number.isFinite(
                            Number(
                                skill.percentage
                            )
                        )
                    );
                }
            )
            .map(
                ([name, skill]) => {

                    const percentage =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                Number(
                                    skill.percentage
                                )
                            )
                        );

                    return {
                        name,

                        percentage,

                        level:
                            Number(
                                skill.level
                            ) || 0,

                        projects:
                            Array.isArray(
                                skill.projects
                            )
                                ? skill.projects
                                : []
                    };
                }
            )
            .sort(
                (a, b) =>
                    b.percentage -
                    a.percentage
            );

    /*
     * ------------------------------------------------------------
     * GRAPH CONTAINER
     * ------------------------------------------------------------
     */

    const graphWrapper =
        document.createElement(
            "div"
        );

    graphWrapper.className =
        "skills-radar-wrapper";

    Object.assign(
        graphWrapper.style,
        {
            width: "100%",
            height: "100%",
            minHeight: "0",
            minWidth: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxSizing: "border-box"
        }
    );

    /*
     * ------------------------------------------------------------
     * EMPTY STATE
     * ------------------------------------------------------------
     */

    if (
        skillEntries.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.textContent =
            "No skills found.";

        Object.assign(
            empty.style,
            {
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: "0.45"
            }
        );

        graphWrapper.appendChild(
            empty
        );

        return graphWrapper;
    }

    /*
     * ------------------------------------------------------------
     * RADAR DATA
     * ------------------------------------------------------------
     */

    const radarSkills =
        skillEntries.slice(
            0,
            8
        );

    /*
     * ------------------------------------------------------------
     * SVG
     * ------------------------------------------------------------
     */

    const svgNS =
        "http://www.w3.org/2000/svg";

    const WIDTH =
        620;

    const HEIGHT =
        560;

    const CENTER_X =
        WIDTH / 2;

    const CENTER_Y =
        HEIGHT / 2 + 10;

    const RADIUS =
        170;

    const svg =
        document.createElementNS(
            svgNS,
            "svg"
        );

    svg.classList.add(
        "skills-radar-svg"
    );

    svg.setAttribute(
        "viewBox",
        `0 0 ${WIDTH} ${HEIGHT}`
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

    Object.assign(
        svg.style,
        {
            width: "90%",
            height: "100%",
            maxWidth: `${WIDTH}px`,
            maxHeight: `${HEIGHT}px`,
            display: "block",
            overflow: "visible",
            color: "currentColor",
            fontFamily: "MyCustomFont",
            flexShrink: "1"
        }
    );

    graphWrapper.appendChild(
        svg
    );

    /*
     * ------------------------------------------------------------
     * HELPERS
     * ------------------------------------------------------------
     */

    function createSVGElement(
        type,
        attributes = {}
    ) {

        const element =
            document.createElementNS(
                svgNS,
                type
            );

        Object.entries(
            attributes
        ).forEach(
            ([key, value]) => {

                element.setAttribute(
                    key,
                    value
                );
            }
        );

        return element;
    }

    function addText(
        text,
        x,
        y,
        size,
        opacity = 0.55,
        anchor = "middle",
        weight = "normal"
    ) {

        const element =
            createSVGElement(
                "text",
                {
                    x,
                    y,
                    "font-size":
                        size,
                    "font-family":
                        "MyCustomFont",
                    "font-weight":
                        weight,
                    fill:
                        "currentColor",
                    "fill-opacity":
                        opacity,
                    "text-anchor":
                        anchor,
                    "dominant-baseline":
                        "middle"
                }
            );

        element.textContent =
            text;

        svg.appendChild(
            element
        );

        return element;
    }

    function formatSkillName(
        name
    ) {

        return String(name)
            .replace(
                /^skill_/,
                ""
            )
            .replace(
                /[-_]/g,
                " "
            )
            .replace(
                /\b\w/g,
                char =>
                    char.toUpperCase()
            );
    }

    /*
     * ------------------------------------------------------------
     * BACKGROUND
     * ------------------------------------------------------------
     */

    svg.appendChild(
        createSVGElement(
            "rect",
            {
                x: 25,
                y: 25,
                width:
                    WIDTH - 50,
                height:
                    HEIGHT - 50,
                rx: 24,
                fill:
                    "currentColor",
                "fill-opacity":
                    "0.025",
                stroke:
                    "currentColor",
                "stroke-opacity":
                    "0.08"
            }
        )
    );

    /*
     * ------------------------------------------------------------
     * TITLE
     * ------------------------------------------------------------
     */

    addText(
        "SKILLS",
        55,
        58,
        15,
        0.55,
        "start",
        "bold"
    );

    addText(
        `${skillEntries.length} skills`,
        WIDTH - 55,
        58,
        12,
        0.3,
        "end"
    );

    /*
     * ------------------------------------------------------------
     * RADAR GEOMETRY
     * ------------------------------------------------------------
     */

    const count =
        radarSkills.length;

    function getAngle(
        index
    ) {

        return (
            -Math.PI / 2 +
            (
                Math.PI * 2 *
                index /
                count
            )
        );
    }

    function getPoint(
        index,
        radius
    ) {

        const angle =
            getAngle(index);

        return {

            x:
                CENTER_X +
                Math.cos(angle) *
                radius,

            y:
                CENTER_Y +
                Math.sin(angle) *
                radius
        };
    }

    /*
     * ------------------------------------------------------------
     * RADAR GRID
     * ------------------------------------------------------------
     */

    const GRID_LEVELS =
        5;

    for (
        let level = 1;
        level <= GRID_LEVELS;
        level++
    ) {

        const radius =
            RADIUS *
            level /
            GRID_LEVELS;

        const points =
            radarSkills
                .map(
                    (_, index) => {

                        const point =
                            getPoint(
                                index,
                                radius
                            );

                        return (
                            `${point.x},${point.y}`
                        );
                    }
                )
                .join(" ");

        svg.appendChild(
            createSVGElement(
                "polygon",
                {
                    points,

                    fill:
                        "none",

                    stroke:
                        "currentColor",

                    "stroke-opacity":
                        "0.13",

                    "stroke-width":
                        "1"
                }
            )
        );
    }

    /*
     * ------------------------------------------------------------
     * AXIS LINES
     * ------------------------------------------------------------
     */

    radarSkills.forEach(
        (_, index) => {

            const point =
                getPoint(
                    index,
                    RADIUS
                );

            svg.appendChild(
                createSVGElement(
                    "line",
                    {
                        x1:
                            CENTER_X,

                        y1:
                            CENTER_Y,

                        x2:
                            point.x,

                        y2:
                            point.y,

                        stroke:
                            "currentColor",

                        "stroke-opacity":
                            "0.12",

                        "stroke-width":
                            "1"
                    }
                )
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * VALUE LABELS
     * ------------------------------------------------------------
     */

    const valueLabels = [
        20,
        40,
        60,
        80,
        100
    ];

    valueLabels.forEach(
        value => {

            const radius =
                RADIUS *
                value /
                100;

            addText(
                `${value}`,
                CENTER_X + 5,
                CENTER_Y - radius,
                8,
                0.2,
                "start"
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * RADAR VALUE
     * ------------------------------------------------------------
     */

    const valuePoints =
        radarSkills
            .map(
                (skill, index) => {

                    const point =
                        getPoint(
                            index,
                            RADIUS *
                            skill.percentage /
                            100
                        );

                    return (
                        `${point.x},${point.y}`
                    );
                }
            )
            .join(" ");

    const radarArea =
        createSVGElement(
            "polygon",
            {
                points:
                    valuePoints,

                fill:
                    "currentColor",

                "fill-opacity":
                    "0.18",

                stroke:
                    "currentColor",

                "stroke-opacity":
                    "0.75",

                "stroke-width":
                    "2"
            }
        );

    svg.appendChild(
        radarArea
    );

    /*
     * ------------------------------------------------------------
     * VALUE POINTS
     * ------------------------------------------------------------
     */

    radarSkills.forEach(
        (skill, index) => {

            const point =
                getPoint(
                    index,
                    RADIUS *
                    skill.percentage /
                    100
                );

            const circle =
                createSVGElement(
                    "circle",
                    {
                        cx:
                            point.x,

                        cy:
                            point.y,

                        r:
                            4,

                        fill:
                            "currentColor",

                        "fill-opacity":
                            "0.95"
                    }
                );

            svg.appendChild(
                circle
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * SKILL LABELS
     * ------------------------------------------------------------
     */

    radarSkills.forEach(
        (skill, index) => {

            const angle =
                getAngle(index);

            const labelRadius =
                RADIUS + 38;

            const x =
                CENTER_X +
                Math.cos(angle) *
                labelRadius;

            const y =
                CENTER_Y +
                Math.sin(angle) *
                labelRadius;

            let anchor =
                "middle";

            if (
                Math.cos(angle) >
                0.35
            ) {

                anchor =
                    "start";

            } else if (
                Math.cos(angle) <
                -0.35
            ) {

                anchor =
                    "end";
            }

            const label =
                addText(
                    formatSkillName(
                        skill.name
                    ),
                    x,
                    y,
                    11,
                    0.55,
                    anchor,
                    "normal"
                );

            label.style.cursor =
                "pointer";

            label.addEventListener(
                "mouseenter",
                () => {

                    label.setAttribute(
                        "fill-opacity",
                        "1"
                    );

                    label.setAttribute(
                        "font-weight",
                        "bold"
                    );
                }
            );

            label.addEventListener(
                "mouseleave",
                () => {

                    label.setAttribute(
                        "fill-opacity",
                        "0.55"
                    );

                    label.setAttribute(
                        "font-weight",
                        "normal"
                    );
                }
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * CENTER VALUE
     * ------------------------------------------------------------
     */

    const average =
        radarSkills.reduce(
            (
                total,
                skill
            ) =>
                total +
                skill.percentage,
            0
        ) /
        radarSkills.length;

    addText(
        `${Math.round(average)}%`,
        CENTER_X,
        CENTER_Y + 4,
        17,
        0.7,
        "middle",
        "bold"
    );

    addText(
        "TOP SKILLS",
        CENTER_X,
        CENTER_Y + 23,
        8,
        0.3,
        "middle",
        "normal"
    );

    /*
     * ------------------------------------------------------------
     * FOOTER
     * ------------------------------------------------------------
     */

    if (
        skillEntries.length > 8
    ) {

        addText(
            `+ ${skillEntries.length - 8} more skills`,
            WIDTH / 2,
            HEIGHT - 48,
            10,
            0.3,
            "middle"
        );
    }

    /*
     * ------------------------------------------------------------
     * RETURN CONTAINER
     * ------------------------------------------------------------
     */

    return graphWrapper;
}