import {
    getAllAudits,
    getAllResults,
    getGroupMembers
} from "../../../../server/graphql/queries.js";

import { initHome } from "../../js/home.js"

export async function renderAuditsPage(app) {

    const audits =
        await getAllAudits();

    const results =
        await getAllResults();

    console.log(
        "AUDIT DATA:",
        audits
    );

    console.log(
        "RESULT DATA:",
        results
    );

    /*
     * ------------------------------------------------------------
     * CREATE RESULT LOOKUP
     * ------------------------------------------------------------
     */

    const resultMap =
        new Map();

    if (Array.isArray(results)) {
        results.forEach(
            result => {

                if (
                    result &&
                    result.id !== null &&
                    result.id !== undefined
                ) {
                    resultMap.set(
                        Number(result.id),
                        result
                    );
                }
            }
        );
    }

    /*
     * ------------------------------------------------------------
     * PROCESS AUDITS
     * ------------------------------------------------------------
     */

    let processedAudits =
        Array.isArray(audits)
            ? audits
                .map(
                    audit => {

                        const result =
                            resultMap.get(
                                Number(
                                    audit.resultId
                                )
                            );

                        const projectPath =
                            result?.path ??
                            "";

                        const pathParts =
                            projectPath
                                .split("/")
                                .filter(Boolean);

                        const projectName =
                            pathParts.length > 0
                                ? pathParts[
                                pathParts.length - 1
                                ]
                                : "Unknown Project";

                        return {

                            id:
                                audit.id,

                            createdAt:
                                audit.createdAt,

                            updatedAt:
                                audit.updatedAt,

                            endAt:
                                audit.endAt,

                            grade:
                                audit.grade !== null &&
                                    audit.grade !== undefined
                                    ? audit.grade
                                    : result?.grade ?? null,

                            /*
                             * IMPORTANT
                             * Keep the group ID so we can
                             * fetch its members when clicked.
                             */
                            groupId:
                                audit.groupId,

                            resultId:
                                audit.resultId,

                            projectName,

                            projectPath,

                            objectId:
                                result?.objectId ??
                                null
                        };
                    }
                )
                .filter(
                    audit =>
                        audit.projectName &&
                        audit.projectName !==
                        "Unknown Project" &&
                        audit.projectPath &&
                        audit.projectPath.trim() !== ""
                )
            : [];

    /*
     * ------------------------------------------------------------
     * REMOVE DUPLICATES
     * ------------------------------------------------------------
     */

    const uniqueAudits =
        new Map();

    processedAudits.forEach(
        audit => {

            const key =
                `${audit.projectName}|${audit.grade}`;

            const existing =
                uniqueAudits.get(key);

            if (!existing) {

                uniqueAudits.set(
                    key,
                    audit
                );

                return;
            }

            const existingTime =
                new Date(
                    existing.updatedAt
                ).getTime();

            const currentTime =
                new Date(
                    audit.updatedAt
                ).getTime();

            if (
                currentTime >
                existingTime
            ) {
                uniqueAudits.set(
                    key,
                    audit
                );
            }
        }
    );

    processedAudits =
        Array.from(
            uniqueAudits.values()
        );

    /*
     * ------------------------------------------------------------
     * SORT
     * ------------------------------------------------------------
     */

    processedAudits.sort(
        (a, b) => {

            const aTime =
                new Date(
                    a.updatedAt
                ).getTime();

            const bTime =
                new Date(
                    b.updatedAt
                ).getTime();

            return aTime - bTime;
        }
    );

    console.log(
        "PROCESSED AUDITS:",
        processedAudits
    );

    /*
     * ------------------------------------------------------------
     * PAGE
     * ------------------------------------------------------------
     */

    app.innerHTML = "";

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

    const text = document.createElement('span');
    text.innerHTML = "Back Home";

    backButton.appendChild(text);

    backButton.addEventListener("click", async () => {
        initHome();
    })



    header.appendChild(
        backButton
    );

    page.appendChild(header);

    const content =
        document.createElement("div");

    content.className =
        "progress-page-content";

    Object.assign(
        content.style,
        {
            width: "100%",
            height: "100%",
            minHeight: "0",
            overflow: "hidden",
            boxSizing: "border-box"
        }
    );

    page.appendChild(content);

    app.appendChild(
        page
    );

    /*
     * ------------------------------------------------------------
     * SVG
     * ------------------------------------------------------------
     */

    createAuditsTimelineSVG(
        processedAudits
    );
}

export function createAuditsTimelineSVG(audits) {

    const container =
        document.querySelector(
            ".progress-page-content"
        );

    if (!container) {

        console.error(
            "Could not find .progress-page-content"
        );

        return;
    }

    container.innerHTML = "";

    /*
     * ------------------------------------------------------------
     * STATUS
     * ------------------------------------------------------------
     */

    function getStatus(audit) {

        const grade =
            Number(audit.grade);

        if (!Number.isFinite(grade)) {
            return "NOT GRADED";
        }

        if (grade > 1) {
            return "PASSED";
        }

        if (grade > 0 && grade < 1) {
            return "FAILED";
        }

        return "NOT GRADED";
    }

    /*
     * ------------------------------------------------------------
     * REMOVE NOT GRADED
     * ------------------------------------------------------------
     */

    const gradedAudits =
        Array.isArray(audits)
            ? audits.filter(
                audit => {

                    const status =
                        getStatus(audit);

                    return (
                        status === "PASSED" ||
                        status === "FAILED"
                    );
                }
            )
            : [];

    if (gradedAudits.length === 0) {

        const empty =
            document.createElement("div");

        empty.textContent =
            "No graded audits found.";

        Object.assign(
            empty.style,
            {
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: "0.5",
                fontFamily:
                    "MyCustomFont"
            }
        );

        container.appendChild(
            empty
        );

        return;
    }

    /*
     * ------------------------------------------------------------
     * SORT
     * ------------------------------------------------------------
     */

    const sortedAudits =
        [...gradedAudits].sort(
            (a, b) => {

                const aTime =
                    new Date(
                        a.updatedAt
                    ).getTime();

                const bTime =
                    new Date(
                        b.updatedAt
                    ).getTime();

                return aTime - bTime;
            }
        );

    /*
     * ------------------------------------------------------------
     * OUTER SCROLL CONTAINER
     * ------------------------------------------------------------
     */

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "audits-timeline-container";

    Object.assign(
        wrapper.style,
        {
            width: "100%",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            position: "relative",
            boxSizing: "border-box"
        }
    );

    /*
     * ------------------------------------------------------------
     * SVG
     * ------------------------------------------------------------
     */

    const svgNS =
        "http://www.w3.org/2000/svg";

    const svg =
        document.createElementNS(
            svgNS,
            "svg"
        );

    svg.classList.add(
        "audits-timeline-svg"
    );

    /*
     * ------------------------------------------------------------
     * DIMENSIONS
     * ------------------------------------------------------------
     */

    const CARD_WIDTH = 230;
    const CARD_HEIGHT = 145;

    const CARD_GAP = 55;

    const SIDE_PADDING = 60;

    const TOP_Y = 55;

    const TIMELINE_Y = 250;

    const BOTTOM_Y = 285;

    const HEADER_HEIGHT = 30;

    const totalWidth =
        SIDE_PADDING * 2 +
        sortedAudits.length *
        CARD_WIDTH +
        (sortedAudits.length - 1) *
        CARD_GAP;

    const totalHeight = 480;

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
            minWidth:
                `${totalWidth}px`,
            width:
                `${totalWidth}px`,
            height: "100%",
            maxWidth: "none",
            fontFamily:
                "MyCustomFont",
            userSelect: "none"
        }
    );

    wrapper.appendChild(svg);

    container.appendChild(
        wrapper
    );

    /*
     * ------------------------------------------------------------
     * SVG HELPERS
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
        size = 12,
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
                    "font-size": size,
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

    /*
     * ------------------------------------------------------------
     * DATE HELPERS
     * ------------------------------------------------------------
     */

    function formatDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            [],
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    function formatShortDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleDateString(
            [],
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    /*
     * ------------------------------------------------------------
     * BACKGROUND
     * ------------------------------------------------------------
     */

    const background =
        createSVGElement(
            "rect",
            {
                x: 18,
                y: 18,
                width:
                    totalWidth - 36,
                height:
                    totalHeight - 36,
                rx: 24,
                fill:
                    "currentColor",
                "fill-opacity":
                    "0.018"
            }
        );

    svg.appendChild(
        background
    );

    /*
     * ------------------------------------------------------------
     * DECORATIVE LINE
     * ------------------------------------------------------------
     */

    svg.appendChild(
        createSVGElement(
            "line",
            {
                x1:
                    SIDE_PADDING,
                y1:
                    TIMELINE_Y,
                x2:
                    totalWidth -
                    SIDE_PADDING,
                y2:
                    TIMELINE_Y,
                stroke:
                    "currentColor",
                "stroke-opacity":
                    "0.12",
                "stroke-width":
                    "1",
                "stroke-dasharray":
                    "2 18"
            }
        )
    );

    /*
     * ------------------------------------------------------------
     * HEADER
     * ------------------------------------------------------------
     */

    addText(
        svg,
        "AUDITS",
        SIDE_PADDING,
        HEADER_HEIGHT,
        16,
        "bold",
        0.45
    );

    addText(
        svg,
        `${sortedAudits.length} audits`,
        totalWidth -
        SIDE_PADDING,
        HEADER_HEIGHT,
        14,
        "normal",
        0.35,
        "end"
    );

    /*
     * ------------------------------------------------------------
     * MAIN TIMELINE
     * ------------------------------------------------------------
     */

    const lineStart =
        SIDE_PADDING;

    const lineEnd =
        totalWidth -
        SIDE_PADDING;

    svg.appendChild(
        createSVGElement(
            "line",
            {
                x1: lineStart,
                y1: TIMELINE_Y,
                x2: lineEnd,
                y2: TIMELINE_Y,
                stroke:
                    "currentColor",
                "stroke-width":
                    "1",
                "stroke-opacity":
                    "0.18"
            }
        )
    );

    /*
     * ------------------------------------------------------------
     * AUDIT CARDS
     * ------------------------------------------------------------
     */

    sortedAudits.forEach(
        (audit, index) => {

            const x =
                SIDE_PADDING +
                index *
                (
                    CARD_WIDTH +
                    CARD_GAP
                );

            const centerX =
                x +
                CARD_WIDTH / 2;

            const isTop =
                index % 2 === 0;

            const cardY =
                isTop
                    ? TOP_Y
                    : BOTTOM_Y;

            const status =
                getStatus(audit);

            /*
             * ----------------------------------------------------
             * CONNECTOR
             * ----------------------------------------------------
             */

            const connectorStart =
                isTop
                    ? cardY +
                    CARD_HEIGHT
                    : TIMELINE_Y;

            const connectorEnd =
                isTop
                    ? TIMELINE_Y
                    : cardY;

            svg.appendChild(
                createSVGElement(
                    "line",
                    {
                        x1: centerX,
                        y1:
                            connectorStart,
                        x2: centerX,
                        y2:
                            connectorEnd,
                        stroke:
                            "currentColor",
                        "stroke-width":
                            "1",
                        "stroke-opacity":
                            "0.18"
                    }
                )
            );

            /*
             * ----------------------------------------------------
             * PULSE
             * ----------------------------------------------------
             */

            const pulse =
                createSVGElement(
                    "circle",
                    {
                        cx: centerX,
                        cy: TIMELINE_Y,
                        r: 8,
                        fill: "none",
                        stroke:
                            "currentColor",
                        "stroke-opacity":
                            "0.15",
                        "stroke-width":
                            "1"
                    }
                );

            pulse.appendChild(
                createSVGElement(
                    "animate",
                    {
                        attributeName:
                            "r",
                        values:
                            "8;13;8",
                        dur:
                            "3s",
                        begin:
                            `${index * 0.08}s`,
                        repeatCount:
                            "indefinite"
                    }
                )
            );

            pulse.appendChild(
                createSVGElement(
                    "animate",
                    {
                        attributeName:
                            "opacity",
                        values:
                            "0.35;0;0.35",
                        dur:
                            "3s",
                        begin:
                            `${index * 0.08}s`,
                        repeatCount:
                            "indefinite"
                    }
                )
            );

            svg.appendChild(
                pulse
            );

            /*
             * ----------------------------------------------------
             * NODE
             * ----------------------------------------------------
             */

            const node =
                createSVGElement(
                    "circle",
                    {
                        cx: centerX,
                        cy: TIMELINE_Y,
                        r: 7,
                        fill:
                            "currentColor",
                        "fill-opacity":
                            "0.045",
                        stroke:
                            "currentColor",
                        "stroke-opacity":
                            "0.45",
                        "stroke-width":
                            "1.5"
                    }
                );

            svg.appendChild(
                node
            );

            /*
             * ----------------------------------------------------
             * CARD
             * ----------------------------------------------------
             */

            const card =
                createSVGElement(
                    "g",
                    {
                        cursor:
                            "pointer"
                    }
                );

            card.classList.add(
                "audit-card"
            );

            const cardBackground =
                createSVGElement(
                    "rect",
                    {
                        x,
                        y: cardY,
                        width:
                            CARD_WIDTH,
                        height:
                            CARD_HEIGHT,
                        rx: 20,
                        fill:
                            "currentColor",
                        "fill-opacity":
                            "0.025",
                        stroke:
                            "currentColor",
                        "stroke-opacity":
                            "0.15",
                        "stroke-width":
                            "1"
                    }
                );

            card.appendChild(
                cardBackground
            );

            /*
             * ----------------------------------------------------
             * STATUS
             * ----------------------------------------------------
             */

            const statusText =
                addText(
                    card,
                    status,
                    x + 20,
                    cardY + 24,
                    10,
                    "bold",
                    0.8
                );

            if (status === "PASSED") {

                statusText.setAttribute(
                    "fill",
                    "#22c55e"
                );

                statusText.setAttribute(
                    "fill-opacity",
                    "1"
                );

            } else if (
                status === "FAILED"
            ) {

                statusText.setAttribute(
                    "fill",
                    "#ef4444"
                );

                statusText.setAttribute(
                    "fill-opacity",
                    "1"
                );
            }

            /*
             * ----------------------------------------------------
             * PROJECT NAME
             * ----------------------------------------------------
             */

            let projectName =
                String(
                    audit.projectName ||
                    "Unknown Project"
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

            if (
                projectName.length > 20
            ) {
                projectName =
                    projectName.slice(
                        0,
                        19
                    ) +
                    "…";
            }

            addText(
                card,
                projectName,
                x + 20,
                cardY + 75,
                24,
                "bold",
                0.98
            );

            /*
             * ----------------------------------------------------
             * DATES
             * ----------------------------------------------------
             */

            addText(
                card,
                `Started ${formatShortDate(
                    audit.createdAt
                )}`,
                x + 20,
                cardY + 116,
                11,
                "normal",
                0.35
            );

            addText(
                card,
                `Done ${formatShortDate(
                    audit.updatedAt
                )}`,
                x + 20,
                cardY + 133,
                11,
                "normal",
                0.35
            );

            /*
             * ----------------------------------------------------
             * HOVER
             * ----------------------------------------------------
             */

            card.addEventListener(
                "mouseenter",
                () => {

                    cardBackground.setAttribute(
                        "fill-opacity",
                        "0.07"
                    );

                    cardBackground.setAttribute(
                        "stroke-opacity",
                        "0.4"
                    );

                    cardBackground.setAttribute(
                        "stroke-width",
                        "1.5"
                    );

                    node.setAttribute(
                        "stroke-opacity",
                        "0.8"
                    );

                    node.setAttribute(
                        "stroke-width",
                        "2"
                    );

                    node.setAttribute(
                        "fill-opacity",
                        "0.09"
                    );
                }
            );

            card.addEventListener(
                "mouseleave",
                () => {

                    cardBackground.setAttribute(
                        "fill-opacity",
                        "0.025"
                    );

                    cardBackground.setAttribute(
                        "stroke-opacity",
                        "0.15"
                    );

                    cardBackground.setAttribute(
                        "stroke-width",
                        "1"
                    );

                    node.setAttribute(
                        "stroke-opacity",
                        "0.45"
                    );

                    node.setAttribute(
                        "stroke-width",
                        "1.5"
                    );

                    node.setAttribute(
                        "fill-opacity",
                        "0.045"
                    );
                }
            );

            /*
             * ----------------------------------------------------
             * CLICK
             * ----------------------------------------------------
             *
             * Fetch group members and show project details.
             */

            card.addEventListener(
                "click",
                async () => {

                    console.log(
                        "Audit selected:",
                        audit
                    );

                    /*
                     * Show loading state immediately.
                     */
                    showAuditDetails(
                        audit,
                        null,
                        true
                    );

                    try {

                        const members =
                            await getGroupMembers(
                                audit.groupId
                            );

                        console.log(
                            "GROUP MEMBERS:",
                            members
                        );

                        showAuditDetails(
                            audit,
                            members,
                            false
                        );

                    } catch (error) {

                        console.error(
                            "Failed to load group members:",
                            error
                        );

                        showAuditDetails(
                            audit,
                            [],
                            false,
                            "Could not load group members."
                        );
                    }
                }
            );

            svg.appendChild(
                card
            );
        }
    );

    /*
     * ------------------------------------------------------------
     * DATE RANGE
     * ------------------------------------------------------------
     */

    addText(
        svg,
        formatDate(
            sortedAudits[0]
                .updatedAt
        ),
        SIDE_PADDING,
        TIMELINE_Y + 32,
        11,
        "normal",
        0.3
    );

    addText(
        svg,
        formatDate(
            sortedAudits[
                sortedAudits.length - 1
            ].updatedAt
        ),
        totalWidth -
        SIDE_PADDING,
        TIMELINE_Y + 32,
        11,
        "normal",
        0.3,
        "end"
    );

    return container;
}

function showAuditDetails(
    audit,
    members = null,
    loading = false,
    errorMessage = null
) {
    const existing =
        document.querySelector(
            ".audit-details-overlay"
        );

    if (existing) {
        existing.remove();
    }

    /*
     * ------------------------------------------------------------
     * OVERLAY
     * ------------------------------------------------------------
     */

    const overlay =
        document.createElement("div");

    overlay.className =
        "audit-details-overlay";

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
     * ------------------------------------------------------------
     * PANEL
     * ------------------------------------------------------------
     */

    const panel =
        document.createElement("div");

    Object.assign(
        panel.style,
        {
            position: "relative",
            width: "min(560px, 100%)",
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "28px",
            borderRadius: "24px",
            boxSizing: "border-box",
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

    /*
     * IMPORTANT:
     * Stop clicks inside the card from reaching the overlay.
     */

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
     * ------------------------------------------------------------
     * CLOSE BUTTON
     * ------------------------------------------------------------
     */

    const close =
        document.createElement("button");

    close.textContent = "×";

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
     * ------------------------------------------------------------
     * PROJECT NAME
     * ------------------------------------------------------------
     */

    const title =
        document.createElement("div");

    title.textContent =
        String(
            audit.projectName ||
            "Unknown Project"
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

    Object.assign(
        title.style,
        {
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "8px"
        }
    );

    panel.appendChild(
        title
    );

    /*
     * ------------------------------------------------------------
     * STATUS
     * ------------------------------------------------------------
     */

    const grade =
        Number(audit.grade);

    const status =
        grade > 1
            ? "PASSED"
            : grade > 0
                ? "FAILED"
                : "NOT GRADED";

    const statusElement =
        document.createElement("div");

    statusElement.textContent =
        `${status}  •  ${grade}`;

    Object.assign(
        statusElement.style,
        {
            fontSize: "13px",
            fontWeight: "bold",
            opacity: "0.65",
            marginBottom: "24px"
        }
    );

    panel.appendChild(
        statusElement
    );

    /*
     * ------------------------------------------------------------
     * PROJECT INFORMATION
     * ------------------------------------------------------------
     */

    const info =
        document.createElement("div");

    Object.assign(
        info.style,
        {
            display: "grid",
            gap: "10px",
            marginBottom: "28px"
        }
    );

    function addInfo(
        label,
        value
    ) {
        const row =
            document.createElement("div");

        Object.assign(
            row.style,
            {
                display: "flex",
                justifyContent:
                    "space-between",
                gap: "20px",
                padding:
                    "10px 0",
                borderBottom:
                    "1px solid rgba(255,255,255,0.06)"
            }
        );

        const labelElement =
            document.createElement("span");

        labelElement.textContent =
            label;

        labelElement.style.opacity =
            "0.45";

        const valueElement =
            document.createElement("span");

        valueElement.textContent =
            value ?? "—";

        valueElement.style.textAlign =
            "right";

        row.appendChild(
            labelElement
        );

        row.appendChild(
            valueElement
        );

        info.appendChild(
            row
        );
    }

    addInfo(
        "Project",
        audit.projectName
    );

    addInfo(
        "Path",
        audit.projectPath
    );

    addInfo(
        "Group ID",
        audit.groupId
    );

    addInfo(
        "Result ID",
        audit.resultId
    );

    addInfo(
        "Object ID",
        audit.objectId
    );

    addInfo(
        "Started",
        audit.createdAt
            ? new Date(
                audit.createdAt
            ).toLocaleString()
            : "—"
    );

    addInfo(
        "Completed",
        audit.updatedAt
            ? new Date(
                audit.updatedAt
            ).toLocaleString()
            : "—"
    );

    panel.appendChild(
        info
    );

    /*
     * ------------------------------------------------------------
     * GROUP MEMBERS TITLE
     * ------------------------------------------------------------
     */

    const membersTitle =
        document.createElement("div");

    membersTitle.textContent =
        "GROUP MEMBERS";

    Object.assign(
        membersTitle.style,
        {
            fontSize: "12px",
            fontWeight: "bold",
            letterSpacing: "1px",
            opacity: "0.45",
            marginBottom: "12px"
        }
    );

    panel.appendChild(
        membersTitle
    );

    /*
     * ------------------------------------------------------------
     * GROUP MEMBERS
     * ------------------------------------------------------------
     */

    const membersContainer =
        document.createElement("div");

    if (loading) {

        membersContainer.textContent =
            "Loading group members...";

        membersContainer.style.opacity =
            "0.5";

    } else if (errorMessage) {

        membersContainer.textContent =
            errorMessage;

        membersContainer.style.opacity =
            "0.5";

    } else if (
        Array.isArray(members) &&
        members.length > 0
    ) {

        members.forEach(
            (member, index) => {

                const memberElement =
                    document.createElement(
                        "div"
                    );

                memberElement.textContent =
                    `${index + 1}. ${member}`;

                Object.assign(
                    memberElement.style,
                    {
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

                membersContainer.appendChild(
                    memberElement
                );
            }
        );

    } else {

        membersContainer.textContent =
            "No members found.";

        membersContainer.style.opacity =
            "0.5";
    }

    panel.appendChild(
        membersContainer
    );

    /*
     * ------------------------------------------------------------
     * CLICK OUTSIDE = SAME AS X
     * ------------------------------------------------------------
     */

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {
                overlay.remove();
            }
        }
    );

    /*
     * ------------------------------------------------------------
     * ADD TO PAGE
     * ------------------------------------------------------------
     */

    document.body.appendChild(
        overlay
    );
}