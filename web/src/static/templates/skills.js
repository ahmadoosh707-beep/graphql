import { initHome } from "../../js/home.js";

export function createSkillsSVG(processedSkills) {

    const page =
        document.createElement("div");

    page.className =
        "progress-page";

    const header =
        document.createElement("div");

    header.className =
        "progress-page-header";

    const backButton =
        document.createElement("button");

    backButton.className =
        "audits-progress-button";

    const text =
        document.createElement("span");

    text.innerHTML =
        "Back Home";

    backButton.appendChild(
        text
    );

    backButton.addEventListener(
        "click",
        async () => {
            initHome();
        }
    );

    header.appendChild(
        backButton
    );

    page.appendChild(
        header
    );

    /*
     * ------------------------------------------------------------
     * SCROLL AREA
     * ------------------------------------------------------------
     */

    const scroll =
        document.createElement("div");

    scroll.className =
        "skills-scroll-container";

    Object.assign(
        scroll.style,
        {
            width: "100%",
            flex: "1",
            minHeight: "0",
            overflowX: "auto",
            overflowY: "hidden",
            boxSizing: "border-box"
        }
    );

    page.appendChild(
        scroll
    );

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

    const skillEntries =
        Object.entries(skills)
            .filter(
                ([, skill]) =>
                    skill &&
                    Number.isFinite(
                        Number(
                            skill.level
                        )
                    )
            )
            .sort(
                ([, a], [, b]) =>
                    Number(b.level) -
                    Number(a.level)
            );

    /*
     * ------------------------------------------------------------
     * EMPTY
     * ------------------------------------------------------------
     */

    if (
        skillEntries.length === 0
    ) {

        const empty =
            document.createElement("div");

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

        scroll.appendChild(
            empty
        );

        return page;
    }

    /*
     * ------------------------------------------------------------
     * SVG
     * ------------------------------------------------------------
     */

    const svgNS =
        "http://www.w3.org/2000/svg";

    const CARD_WIDTH =
        280;

    const CARD_GAP =
        28;

    const SIDE_PADDING =
        45;

    const CARD_HEIGHT =
        410;

    const TOP_PADDING =
        45;

    const BOTTOM_PADDING =
        35;

    const totalWidth =
        SIDE_PADDING * 2 +
        skillEntries.length *
        CARD_WIDTH +
        (skillEntries.length - 1) *
        CARD_GAP;

    const totalHeight =
        CARD_HEIGHT +
        TOP_PADDING +
        BOTTOM_PADDING;

    const svg =
        document.createElementNS(
            svgNS,
            "svg"
        );

    svg.classList.add(
        "skills-svg"
    );

    svg.setAttribute(
        "width",
        totalWidth
    );

    svg.setAttribute(
        "height",
        totalHeight
    );

    svg.setAttribute(
        "viewBox",
        `0 0 ${totalWidth} ${totalHeight}`
    );

    Object.assign(
        svg.style,
        {
            display: "block",
            width:
                `${totalWidth}px`,
            minWidth:
                `${totalWidth}px`,
            height:
                `${totalHeight}px`,
            userSelect: "none"
        }
    );

    scroll.appendChild(
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
        parent,
        text,
        x,
        y,
        size,
        weight = "normal",
        opacity = 1,
        anchor = "start"
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
                        anchor
                }
            );

        element.textContent =
            String(text);

        parent.appendChild(
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

    function formatProjectName(
        path
    ) {

        if (!path) {
            return "Unknown";
        }

        const parts =
            String(path)
                .split("/")
                .filter(Boolean);

        const name =
            parts[
            parts.length - 1
            ];

        return name
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
     * GET CUMULATIVE PROJECT VALUE
     * ------------------------------------------------------------
     *
     * The project data contains cumulative values.
     *
     * Example:
     *
     * Project A = 20
     * Project B = 35
     * Project C = 50
     *
     * Individual contributions:
     *
     * Project A = 20
     * Project B = 15
     * Project C = 15
     */

    function getProjectCumulativeValue(
        project
    ) {

        return Number(
            project.amount ??
            project.added ??
            project.value ??
            0
        );
    }

    function getProjectContribution(
        projects,
        index
    ) {

        const current =
            getProjectCumulativeValue(
                projects[index]
            );

        if (
            index === 0
        ) {
            return current;
        }

        const previous =
            getProjectCumulativeValue(
                projects[index - 1]
            );

        return current -
            previous;
    }

    /*
     * ------------------------------------------------------------
     * SHOW ALL PROJECTS
     * ------------------------------------------------------------
     */

    function showSkillProjects(
        skillName,
        skill,
        projects
    ) {

        const existing =
            document.querySelector(
                ".skill-projects-overlay"
            );

        if (existing) {
            existing.remove();
        }

        /*
         * --------------------------------------------------------
         * OVERLAY
         * --------------------------------------------------------
         */

        const overlay =
            document.createElement(
                "div"
            );

        overlay.className =
            "skill-projects-overlay";

        Object.assign(
            overlay.style,
            {
                position: "fixed",
                inset: "0",
                zIndex: "9999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "rgba(0, 0, 0, 0.55)",
                backdropFilter:
                    "blur(8px)",
                padding: "24px",
                boxSizing: "border-box"
            }
        );

        /*
         * --------------------------------------------------------
         * PANEL
         * --------------------------------------------------------
         */

        const panel =
            document.createElement(
                "div"
            );

        Object.assign(
            panel.style,
            {
                position: "relative",
                width:
                    "min(560px, 100%)",
                maxHeight:
                    "80vh",
                overflowY:
                    "auto",
                padding:
                    "28px",
                borderRadius:
                    "24px",
                boxSizing:
                    "border-box",
                background:
                    "var(--background-color, #111)",
                color:
                    "var(--text-color, currentColor)",
                border:
                    "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                    "0 25px 80px rgba(0,0,0,0.45)",
                fontFamily:
                    "MyCustomFont"
            }
        );

        panel.addEventListener(
            "click",
            event => {
                event.stopPropagation();
            }
        );

        overlay.appendChild(
            panel
        );

        /*
         * --------------------------------------------------------
         * CLOSE BUTTON
         * --------------------------------------------------------
         */

        const close =
            document.createElement(
                "button"
            );

        close.textContent =
            "×";

        Object.assign(
            close.style,
            {
                position: "absolute",
                top: "18px",
                right: "18px",
                zIndex: "10",
                width: "36px",
                height: "36px",
                border: "none",
                borderRadius: "50%",
                background:
                    "rgba(255,255,255,0.08)",
                color: "inherit",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0"
            }
        );

        close.addEventListener(
            "mouseenter",
            () => {
                close.style.background =
                    "rgba(255,255,255,0.16)";
            }
        );

        close.addEventListener(
            "mouseleave",
            () => {
                close.style.background =
                    "rgba(255,255,255,0.08)";
            }
        );

        close.addEventListener(
            "click",
            () => {
                overlay.remove();
            }
        );

        panel.appendChild(
            close
        );

        /*
         * --------------------------------------------------------
         * TITLE
         * --------------------------------------------------------
         */

        const title =
            document.createElement(
                "div"
            );

        title.textContent =
            formatSkillName(
                skillName
            );

        Object.assign(
            title.style,
            {
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "6px"
            }
        );

        panel.appendChild(
            title
        );

        /*
         * --------------------------------------------------------
         * LEVEL
         * --------------------------------------------------------
         */

        const level =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        skill.level
                    )
                )
            );

        const levelElement =
            document.createElement(
                "div"
            );

        levelElement.textContent =
            `${level}%  •  ${projects.length} projects`;

        Object.assign(
            levelElement.style,
            {
                fontSize: "13px",
                fontWeight: "bold",
                opacity: "0.55",
                marginBottom: "24px"
            }
        );

        panel.appendChild(
            levelElement
        );

        /*
         * --------------------------------------------------------
         * PROJECT TITLE
         * --------------------------------------------------------
         */

        const projectsTitle =
            document.createElement(
                "div"
            );

        projectsTitle.textContent =
            "PROJECT CONTRIBUTIONS";

        Object.assign(
            projectsTitle.style,
            {
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing:
                    "1px",
                opacity: "0.45",
                marginBottom:
                    "12px"
            }
        );

        panel.appendChild(
            projectsTitle
        );

        /*
         * --------------------------------------------------------
         * PROJECT LIST
         * --------------------------------------------------------
         */

        const projectContainer =
            document.createElement(
                "div"
            );

        projects.forEach(
            (project, index) => {

                const amount =
                    getProjectContribution(
                        projects,
                        index
                    );

                const projectElement =
                    document.createElement(
                        "div"
                    );

                Object.assign(
                    projectElement.style,
                    {
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        gap: "20px",
                        padding:
                            "12px 14px",
                        marginBottom:
                            "6px",
                        borderRadius:
                            "10px",
                        background:
                            "rgba(255,255,255,0.04)"
                    }
                );

                const name =
                    document.createElement(
                        "span"
                    );

                name.textContent =
                    `${index + 1}. ${formatProjectName(
                        project.path
                    )}`;

                const value =
                    document.createElement(
                        "span"
                    );

                value.textContent =
                    `+${amount}`;

                Object.assign(
                    value.style,
                    {
                        opacity: "0.55",
                        fontWeight:
                            "bold",
                        whiteSpace:
                            "nowrap"
                    }
                );

                projectElement.appendChild(
                    name
                );

                projectElement.appendChild(
                    value
                );

                projectContainer.appendChild(
                    projectElement
                );
            }
        );

        panel.appendChild(
            projectContainer
        );

        /*
         * --------------------------------------------------------
         * CLICK OUTSIDE
         * --------------------------------------------------------
         */

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {
                    overlay.remove();
                }
            }
        );

        /*
         * --------------------------------------------------------
         * ADD TO PAGE
         * --------------------------------------------------------
         */

        document.body.appendChild(
            overlay
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
                x: 15,
                y: 15,
                width:
                    totalWidth - 30,
                height:
                    totalHeight - 30,
                rx: 24,
                fill:
                    "currentColor",
                "fill-opacity":
                    "0.015"
            }
        )
    );

    /*
     * ------------------------------------------------------------
     * HEADER TEXT
     * ------------------------------------------------------------
     */

    addText(
        svg,
        "SKILLS",
        SIDE_PADDING,
        32,
        15,
        "bold",
        0.45
    );

    addText(
        svg,
        `${skillEntries.length} skills`,
        totalWidth -
        SIDE_PADDING,
        32,
        13,
        "normal",
        0.3,
        "end"
    );

    /*
     * ------------------------------------------------------------
     * CARDS
     * ------------------------------------------------------------
     */

    skillEntries.forEach(
        ([skillName, skill], index) => {

            const x =
                SIDE_PADDING +
                index *
                (
                    CARD_WIDTH +
                    CARD_GAP
                );

            const y =
                TOP_PADDING;

            const level =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            skill.level
                        )
                    )
                );

            const projects =
                Array.isArray(
                    skill.projects
                )
                    ? [...skill.projects]
                    : [];

            const hasExtraProjects =
                projects.length > 5;

            /*
             * ----------------------------------------------------
             * CARD GROUP
             * ----------------------------------------------------
             */

            const group =
                createSVGElement(
                    "g",
                    {
                        cursor:
                            hasExtraProjects
                                ? "pointer"
                                : "default"
                    }
                );

            /*
             * ----------------------------------------------------
             * CARD BACKGROUND
             * ----------------------------------------------------
             */

            const background =
                createSVGElement(
                    "rect",
                    {
                        x,
                        y,
                        width:
                            CARD_WIDTH,
                        height:
                            CARD_HEIGHT,
                        rx: 22,
                        fill:
                            "currentColor",
                        "fill-opacity":
                            "0.025",
                        stroke:
                            "currentColor",
                        "stroke-opacity":
                            "0.12",
                        "stroke-width":
                            "1"
                    }
                );

            group.appendChild(
                background
            );

            /*
             * ----------------------------------------------------
             * SKILL NUMBER
             * ----------------------------------------------------
             */

            addText(
                group,
                String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                ),
                x + 22,
                y + 30,
                11,
                "bold",
                0.25
            );

            /*
             * ----------------------------------------------------
             * SKILL NAME
             * ----------------------------------------------------
             */

            addText(
                group,
                formatSkillName(
                    skillName
                ),
                x + 22,
                y + 65,
                23,
                "bold",
                0.95
            );

            /*
             * ----------------------------------------------------
             * LEVEL
             * ----------------------------------------------------
             */

            addText(
                group,
                `${level}%`,
                x +
                CARD_WIDTH -
                22,
                y + 64,
                25,
                "bold",
                0.8,
                "end"
            );

            /*
             * ----------------------------------------------------
             * LEVEL BAR
             * ----------------------------------------------------
             */

            const barX =
                x + 22;

            const barY =
                y + 82;

            const barWidth =
                CARD_WIDTH - 44;

            const barHeight =
                6;

            group.appendChild(
                createSVGElement(
                    "rect",
                    {
                        x: barX,
                        y: barY,
                        width:
                            barWidth,
                        height:
                            barHeight,
                        rx: 3,
                        fill:
                            "currentColor",
                        "fill-opacity":
                            "0.07"
                    }
                )
            );

            const progress =
                createSVGElement(
                    "rect",
                    {
                        x: barX,
                        y: barY,
                        width: 0,
                        height:
                            barHeight,
                        rx: 3,
                        fill:
                            "currentColor",
                        "fill-opacity":
                            "0.7"
                    }
                );

            progress.appendChild(
                createSVGElement(
                    "animate",
                    {
                        attributeName:
                            "width",
                        from: "0",
                        to:
                            String(
                                barWidth *
                                level /
                                100
                            ),
                        dur:
                            "0.7s",
                        begin:
                            `${index * 0.08}s`,
                        fill:
                            "freeze"
                    }
                )
            );

            group.appendChild(
                progress
            );

            /*
             * ----------------------------------------------------
             * PROJECTS LABEL
             * ----------------------------------------------------
             */

            addText(
                group,
                "PROJECT CONTRIBUTIONS",
                x + 22,
                y + 122,
                10,
                "bold",
                0.3
            );

            /*
             * ----------------------------------------------------
             * PROJECTS
             * ----------------------------------------------------
             */

            const projectArea =
                createSVGElement(
                    "g"
                );

            group.appendChild(
                projectArea
            );

            const visibleProjects =
                projects.slice(
                    0,
                    5
                );

            visibleProjects.forEach(
                (
                    project,
                    projectIndex
                ) => {

                    const projectY =
                        y +
                        148 +
                        projectIndex *
                        43;

                    const amount =
                        getProjectContribution(
                            projects,
                            projectIndex
                        );

                    const projectName =
                        formatProjectName(
                            project.path
                        );

                    let displayName =
                        projectName;

                    if (
                        displayName.length >
                        21
                    ) {

                        displayName =
                            displayName.slice(
                                0,
                                20
                            ) +
                            "…";
                    }

                    addText(
                        projectArea,
                        displayName,
                        x + 22,
                        projectY,
                        12,
                        "normal",
                        0.65
                    );

                    addText(
                        projectArea,
                        `+${amount}`,
                        x +
                        CARD_WIDTH -
                        22,
                        projectY,
                        12,
                        "bold",
                        0.55,
                        "end"
                    );

                    projectArea.appendChild(
                        createSVGElement(
                            "line",
                            {
                                x1:
                                    x + 22,
                                y1:
                                    projectY + 8,
                                x2:
                                    x +
                                    CARD_WIDTH -
                                    22,
                                y2:
                                    projectY + 8,
                                stroke:
                                    "currentColor",
                                "stroke-opacity":
                                    "0.07",
                                "stroke-width":
                                    "1"
                            }
                        )
                    );
                }
            );

            /*
             * ----------------------------------------------------
             * MORE PROJECTS
             * ----------------------------------------------------
             */

            if (
                hasExtraProjects
            ) {

                addText(
                    group,
                    `+ ${projects.length - 5} more`,
                    x + 22,
                    y + 380,
                    10,
                    "normal",
                    0.3
                );

                /*
                 * WHOLE CARD CLICKABLE
                 */

                group.addEventListener(
                    "click",
                    () => {

                        showSkillProjects(
                            skillName,
                            skill,
                            projects
                        );
                    }
                );
            }

            /*
             * ----------------------------------------------------
             * HOVER
             * ----------------------------------------------------
             */

            group.addEventListener(
                "mouseenter",
                () => {

                    background.setAttribute(
                        "fill-opacity",
                        hasExtraProjects
                            ? "0.065"
                            : "0.045"
                    );

                    background.setAttribute(
                        "stroke-opacity",
                        hasExtraProjects
                            ? "0.35"
                            : "0.25"
                    );

                    background.setAttribute(
                        "stroke-width",
                        hasExtraProjects
                            ? "1.5"
                            : "1"
                    );

                    progress.setAttribute(
                        "fill-opacity",
                        "1"
                    );
                }
            );

            group.addEventListener(
                "mouseleave",
                () => {

                    background.setAttribute(
                        "fill-opacity",
                        "0.025"
                    );

                    background.setAttribute(
                        "stroke-opacity",
                        "0.12"
                    );

                    background.setAttribute(
                        "stroke-width",
                        "1"
                    );

                    progress.setAttribute(
                        "fill-opacity",
                        "0.7"
                    );
                }
            );

            svg.appendChild(
                group
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * ADD TO APP
     * ------------------------------------------------------------
     */

    const app =
        document.getElementById(
            "app"
        );

    app.innerHTML = "";

    app.appendChild(
        page
    );

    return;
}