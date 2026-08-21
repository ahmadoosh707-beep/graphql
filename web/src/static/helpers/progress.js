import { queryXPAndAudits } from "../../../../server/graphql/queries.js";

// ============================================================
// GET XP TREE
// ============================================================

export async function getXPTree() {

    const result = await queryXPAndAudits();


    if (
        !result ||
        !result.xp_view
    ) {
        throw new Error(
            "Could not retrieve XP data"
        );
    }

    const entries = result.xp_view;



    // --------------------------------------------------------
    // Build tree
    // --------------------------------------------------------

    const tree = {};


    for (const entry of entries) {

        if (!entry.path) {
            continue;
        }


        const parts =
            entry.path
                .split("/")
                .filter(Boolean);


        let current = tree;


        for (
            let i = 0;
            i < parts.length;
            i++
        ) {

            const part =
                parts[i];


            /*
             * Create path node if it doesn't exist.
             */
            if (
                !current[part]
            ) {

                current[part] = {};
            }


            /*
             * Last part of the path.
             *
             * Store XP metadata here.
             */
            if (
                i ===
                parts.length - 1
            ) {

                current[part].xp =
                    Number(
                        entry.amount
                    );

                current[part].startAt =
                    entry.event?.startAt ??
                    null;

                current[part].createdAt =
                    entry.event?.createdAt ??
                    null;

                current[part].endAt =
                    entry.event?.endAt ??
                    null;

                current[part].originEventId =
                    entry.originEventId ??
                    null;

                current[part].userId =
                    entry.userId ??
                    null;

                /*
                 * Keep audits attached to the
                 * XP entry, but DON'T treat them
                 * as tree children in the SVG.
                 */
                current[part].audits =
                    entry.audits ??
                    null;
            }


            current =
                current[part];
        }
    }


    return tree;
}



// ============================================================
// CREATE PROGRESS SVG
// ============================================================

export function createProgressSVG(tree) {
    const container = document.createElement("div");

    container.className = "progress-svg-container";

    Object.assign(container.style, {
        width: "100%",
        height: "100%",
        minHeight: "0",
        overflow: "hidden",
        boxSizing: "border-box"
    });

    const svgNS = "http://www.w3.org/2000/svg";

    /*
     * ------------------------------------------------------------
     * DISPLAY TREE
     * ------------------------------------------------------------
     */

    const displayTree = structuredClone(tree);

    if (
        displayTree.bahrain &&
        displayTree.bahrain["bh-module"]
    ) {
        const moduleNode =
            displayTree.bahrain["bh-module"];

        if (moduleNode.checkpoint) {
            displayTree.bahrain.checkpoint =
                moduleNode.checkpoint;

            delete moduleNode.checkpoint;
        }

        if (moduleNode["piscine-js"]) {
            displayTree.bahrain["piscine-js"] =
                moduleNode["piscine-js"];

            delete moduleNode["piscine-js"];
        }
    }

    /*
     * ------------------------------------------------------------
     * SVG
     * ------------------------------------------------------------
     */

    const VIEWBOX_WIDTH = 1000;
    const VIEWBOX_HEIGHT = 600;

    const svg =
        document.createElementNS(
            svgNS,
            "svg"
        );

    svg.setAttribute(
        "viewBox",
        `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

    Object.assign(svg.style, {
        display: "block",
        width: "100%",
        height: "100%",
        minWidth: "0",
        minHeight: "0",
        overflow: "hidden",
        userSelect: "none"
    });

    container.appendChild(svg);

    /*
     * ------------------------------------------------------------
     * DEFS
     * ------------------------------------------------------------
     */

    const defs =
        document.createElementNS(
            svgNS,
            "defs"
        );

    const glow =
        document.createElementNS(
            svgNS,
            "filter"
        );

    glow.setAttribute(
        "id",
        "progress-glow"
    );

    glow.setAttribute(
        "x",
        "-50%"
    );

    glow.setAttribute(
        "y",
        "-50%"
    );

    glow.setAttribute(
        "width",
        "200%"
    );

    glow.setAttribute(
        "height",
        "200%"
    );

    const blur =
        document.createElementNS(
            svgNS,
            "feGaussianBlur"
        );

    blur.setAttribute(
        "stdDeviation",
        "4"
    );

    blur.setAttribute(
        "result",
        "blur"
    );

    glow.appendChild(
        blur
    );

    const merge =
        document.createElementNS(
            svgNS,
            "feMerge"
        );

    const blurNode =
        document.createElementNS(
            svgNS,
            "feMergeNode"
        );

    blurNode.setAttribute(
        "in",
        "blur"
    );

    const sourceNode =
        document.createElementNS(
            svgNS,
            "feMergeNode"
        );

    sourceNode.setAttribute(
        "in",
        "SourceGraphic"
    );

    merge.appendChild(
        blurNode
    );

    merge.appendChild(
        sourceNode
    );

    glow.appendChild(
        merge
    );

    defs.appendChild(
        glow
    );

    const clipPath =
        document.createElementNS(
            svgNS,
            "clipPath"
        );

    clipPath.setAttribute(
        "id",
        "progress-safe-clip"
    );

    const clipRect =
        document.createElementNS(
            svgNS,
            "rect"
        );

    clipRect.setAttribute(
        "x",
        "18"
    );

    clipRect.setAttribute(
        "y",
        "18"
    );

    clipRect.setAttribute(
        "width",
        "964"
    );

    clipRect.setAttribute(
        "height",
        "564"
    );

    clipPath.appendChild(
        clipRect
    );

    defs.appendChild(
        clipPath
    );

    svg.appendChild(
        defs
    );

    /*
     * ------------------------------------------------------------
     * SCENE
     * ------------------------------------------------------------
     */

    const scene =
        document.createElementNS(
            svgNS,
            "g"
        );

    scene.setAttribute(
        "clip-path",
        "url(#progress-safe-clip)"
    );

    svg.appendChild(
        scene
    );

    /*
     * ------------------------------------------------------------
     * METADATA
     * ------------------------------------------------------------
     */

    const metadata = new Set([
        "xp",
        "startAt",
        "createdAt",
        "endAt",
        "originEventId",
        "userId",
        "audits",
        "audit"
    ]);

    function isNode(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    }

    function getChildren(node) {
        return Object.entries(node)
            .filter(
                ([key, value]) =>
                    !metadata.has(key) &&
                    isNode(value)
            );
    }

    function getXP(data) {
        const xp =
            Number(data?.xp);

        return Number.isFinite(xp)
            ? xp
            : 0;
    }

    function formatXP(xp) {
        return Number(xp)
            .toLocaleString();
    }

    function formatName(name) {
        return String(name)
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            );
    }

    function createElement(
        type,
        attributes = {}
    ) {
        const element =
            document.createElementNS(
                svgNS,
                type
            );

        for (
            const [key, value]
            of Object.entries(attributes)
        ) {
            element.setAttribute(
                key,
                value
            );
        }

        return element;
    }

    /*
     * ------------------------------------------------------------
     * TEXT
     * ------------------------------------------------------------
     */

    function addText(
        parent,
        text,
        x,
        y,
        size = 18,
        weight = "normal",
        opacity = 1,
        anchor = "start"
    ) {
        const element =
            createElement(
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
     * FIND MAX LEAF XP
     * ------------------------------------------------------------
     */

    let maxLeafXP = 0;

    function findMaxLeafXP(node) {
        if (!isNode(node)) {
            return;
        }

        const children =
            getChildren(node);

        if (children.length === 0) {
            maxLeafXP =
                Math.max(
                    maxLeafXP,
                    getXP(node)
                );

            return;
        }

        for (
            const [, child]
            of children
        ) {
            findMaxLeafXP(child);
        }
    }

    findMaxLeafXP(
        displayTree
    );

    function getLeafRadius(xp) {
        const MIN_RADIUS = 16;
        const MAX_RADIUS = 48;

        if (maxLeafXP <= 0) {
            return MIN_RADIUS;
        }

        const ratio =
            Math.max(
                0,
                Math.min(
                    1,
                    xp / maxLeafXP
                )
            );

        return (
            MIN_RADIUS +
            ratio *
            (MAX_RADIUS - MIN_RADIUS)
        );
    }

    /*
     * ------------------------------------------------------------
     * NAVIGATION
     * ------------------------------------------------------------
     */

    const navigation = [];

    const MAX_VISIBLE_CHILDREN = 8;

    let childPage = 0;

    /*
     * ------------------------------------------------------------
     * BACKGROUND
     * ------------------------------------------------------------
     */

    function renderBackground() {
        const background =
            createElement(
                "rect",
                {
                    x: 18,
                    y: 18,
                    width: 964,
                    height: 564,
                    rx: 24,
                    fill:
                        "currentColor",
                    "fill-opacity":
                        "0.018"
                }
            );

        scene.appendChild(
            background
        );

        const orbit =
            createElement(
                "ellipse",
                {
                    cx: 500,
                    cy: 300,
                    rx: 420,
                    ry: 220,
                    fill: "none",
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.055",
                    "stroke-width":
                        "1",
                    "stroke-dasharray":
                        "2 18"
                }
            );

        scene.appendChild(
            orbit
        );

        const particles =
            createElement(
                "g"
            );

        const positions = [
            [70, 110],
            [910, 85],
            [120, 510],
            [865, 525],
            [250, 95],
            [760, 105],
            [55, 315],
            [940, 340],
            [300, 540],
            [700, 550]
        ];

        positions.forEach(
            ([x, y], index) => {
                const particle =
                    createElement(
                        "circle",
                        {
                            cx: x,
                            cy: y,
                            r: 1.5,
                            fill:
                                "currentColor",
                            "fill-opacity":
                                "0.18"
                        }
                    );

                particle.appendChild(
                    createElement(
                        "animate",
                        {
                            attributeName:
                                "opacity",
                            values:
                                "0.1;0.45;0.1",
                            dur:
                                `${3 + index % 3}s`,
                            begin:
                                `${index * 0.25}s`,
                            repeatCount:
                                "indefinite"
                        }
                    )
                );

                particles.appendChild(
                    particle
                );
            }
        );

        scene.appendChild(
            particles
        );
    }

    /*
     * ------------------------------------------------------------
     * CLEAR
     * ------------------------------------------------------------
     */

    function clearScene() {
        while (scene.firstChild) {
            scene.removeChild(
                scene.firstChild
            );
        }
    }

    /*
     * ------------------------------------------------------------
     * RENDER
     * ------------------------------------------------------------
     */

    function render() {
        clearScene();

        renderBackground();

        if (navigation.length === 0) {
            renderRootPage();
        } else {
            renderPathPage();
        }
    }

    /*
     * ------------------------------------------------------------
     * ROOT PAGE
     * ------------------------------------------------------------
     */

    function renderRootPage() {
        const root =
            createElement(
                "g"
            );

        scene.appendChild(
            root
        );

        addText(
            root,
            "PROGRESS",
            55,
            60,
            16,
            "bold",
            0.45
        );

        addText(
            root,
            "Choose your path",
            55,
            95,
            38,
            "bold",
            1
        );

        addText(
            root,
            "Explore your projects one path at a time",
            57,
            122,
            16,
            "normal",
            0.4
        );

        const entries =
            Object.entries(
                displayTree
            );

        if (entries.length === 0) {
            addText(
                root,
                "No progress available",
                500,
                300,
                22,
                "normal",
                0.4,
                "middle"
            );

            return;
        }

        const startIndex =
            childPage *
            MAX_VISIBLE_CHILDREN;

        const visible =
            entries.slice(
                startIndex,
                startIndex +
                MAX_VISIBLE_CHILDREN
            );

        const hasPrevious =
            childPage > 0;

        const hasNext =
            startIndex +
            MAX_VISIBLE_CHILDREN <
            entries.length;

        const columns = 4;

        const cardWidth = 205;
        const cardHeight = 130;

        const gapX = 20;
        const gapY = 20;

        const gridWidth =
            columns * cardWidth +
            (columns - 1) * gapX;

        const gridStartX =
            (VIEWBOX_WIDTH -
                gridWidth) /
            2;

        const gridStartY = 165;

        visible.forEach(
            ([name, data], index) => {
                const column =
                    index % columns;

                const row =
                    Math.floor(
                        index / columns
                    );

                const x =
                    gridStartX +
                    column *
                    (cardWidth +
                        gapX);

                const y =
                    gridStartY +
                    row *
                    (cardHeight +
                        gapY);

                createPathCard(
                    root,
                    name,
                    data,
                    x,
                    y,
                    cardWidth,
                    cardHeight,
                    index
                );
            }
        );

        const controlsY =
            485;

        if (hasPrevious) {
            createControlButton(
                root,
                "Previous",
                385,
                controlsY,
                () => {
                    childPage--;
                    render();
                }
            );
        }

        if (hasNext) {
            createControlButton(
                root,
                "More paths →",
                615,
                controlsY,
                () => {
                    childPage++;
                    render();
                }
            );
        }

        if (
            entries.length >
            MAX_VISIBLE_CHILDREN
        ) {
            const totalPages =
                Math.ceil(
                    entries.length /
                    MAX_VISIBLE_CHILDREN
                );

            addText(
                root,
                `${childPage + 1} / ${totalPages}`,
                500,
                525,
                15,
                "normal",
                0.35,
                "middle"
            );
        }

        addText(
            root,
            "Click a path to explore",
            500,
            558,
            15,
            "normal",
            0.3,
            "middle"
        );
    }

    /*
     * ------------------------------------------------------------
     * PATH CARD
     * ------------------------------------------------------------
     */

    function createPathCard(
        parent,
        name,
        data,
        x,
        y,
        width,
        height,
        index
    ) {
        const group =
            createElement(
                "g",
                {
                    transform:
                        `translate(${x} ${y})`,
                    cursor:
                        "pointer"
                }
            );

        const card =
            createElement(
                "rect",
                {
                    x: 0,
                    y: 0,
                    width,
                    height,
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

        group.appendChild(
            card
        );

        const orb =
            createElement(
                "circle",
                {
                    cx: 31,
                    cy: 35,
                    r: 20,
                    fill:
                        "currentColor",
                    "fill-opacity":
                        "0.055",
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.35",
                    "stroke-width":
                        "1"
                }
            );

        group.appendChild(
            orb
        );

        const pulse =
            createElement(
                "circle",
                {
                    cx: 31,
                    cy: 35,
                    r: 20,
                    fill: "none",
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.18",
                    "stroke-width":
                        "1"
                }
            );

        pulse.appendChild(
            createElement(
                "animate",
                {
                    attributeName:
                        "r",
                    values:
                        "20;26;20",
                    dur:
                        "3s",
                    begin:
                        `${index * 0.2}s`,
                    repeatCount:
                        "indefinite"
                }
            )
        );

        pulse.appendChild(
            createElement(
                "animate",
                {
                    attributeName:
                        "opacity",
                    values:
                        "0.35;0;0.35",
                    dur:
                        "3s",
                    begin:
                        `${index * 0.2}s`,
                    repeatCount:
                        "indefinite"
                }
            )
        );

        group.appendChild(
            pulse
        );

        let projectName =
            formatName(name);

        if (projectName.length > 17) {
            projectName =
                projectName.slice(0, 16) +
                "…";
        }

        addText(
            group,
            projectName,
            65,
            39,
            28,
            "bold",
            0.98
        );

        const children =
            getChildren(data);

        addText(
            group,
            children.length === 1
                ? "1 item"
                : `${children.length} items`,
            65,
            67,
            16,
            "normal",
            0.48
        );

        addText(
            group,
            children.length === 0
                ? "Complete"
                : "Explore",
            22,
            104,
            14,
            "normal",
            0.35
        );

        addText(
            group,
            "→",
            width - 22,
            height - 20,
            20,
            "bold",
            0.4,
            "middle"
        );

        group.addEventListener(
            "mouseenter",
            () => {
                card.setAttribute(
                    "fill-opacity",
                    "0.07"
                );

                card.setAttribute(
                    "stroke-opacity",
                    "0.4"
                );

                card.setAttribute(
                    "stroke-width",
                    "1.5"
                );

                orb.setAttribute(
                    "fill-opacity",
                    "0.1"
                );
            }
        );

        group.addEventListener(
            "mouseleave",
            () => {
                card.setAttribute(
                    "fill-opacity",
                    "0.025"
                );

                card.setAttribute(
                    "stroke-opacity",
                    "0.15"
                );

                card.setAttribute(
                    "stroke-width",
                    "1"
                );

                orb.setAttribute(
                    "fill-opacity",
                    "0.055"
                );
            }
        );

        group.addEventListener(
            "click",
            () => {
                navigation.push({
                    name,
                    data
                });

                childPage = 0;

                render();
            }
        );

        parent.appendChild(
            group
        );
    }

    /*
     * ------------------------------------------------------------
     * PATH PAGE
     * ------------------------------------------------------------
     */

    function renderPathPage() {
        const root =
            createElement(
                "g"
            );

        scene.appendChild(
            root
        );

        const current =
            navigation[
                navigation.length - 1
            ];

        const name =
            current.name;

        const data =
            current.data;

        const children =
            getChildren(data);

        /*
         * --------------------------------------------------------
         * BACK BUTTON
         * --------------------------------------------------------
         */

        const back =
            createElement(
                "g",
                {
                    transform:
                        "translate(55 55)",
                    cursor:
                        "pointer"
                }
            );

        const backCircle =
            createElement(
                "circle",
                {
                    cx: 0,
                    cy: 0,
                    r: 21,
                    fill:
                        "#00aaff",
                    "fill-opacity":
                        "1",
                    stroke:
                        "#00aaff",
                    "stroke-opacity":
                        "1"
                }
            );

        back.appendChild(
            backCircle
        );

        /*
         * FIXED BACK BUTTON TEXT
         *
         * Uses the same visual centering method as the working
         * blue control buttons.
         */

        const backText =
            addText(
                back,
                "Back",
                0,
                0,
                15,
                "bold",
                1,
                "middle"
            );

        backText.setAttribute(
            "fill",
            "ghostwhite"
        );

        backText.setAttribute(
            "dy",
            "0.35em"
        );

        backText.setAttribute(
            "text-anchor",
            "middle"
        );

        back.addEventListener(
            "mouseenter",
            () => {
                backCircle.setAttribute(
                    "fill",
                    "#b0c4ff"
                );

                backCircle.setAttribute(
                    "stroke",
                    "#b0c4ff"
                );

                backText.setAttribute(
                    "fill",
                    "black"
                );
            }
        );

        back.addEventListener(
            "mouseleave",
            () => {
                backCircle.setAttribute(
                    "fill",
                    "#00aaff"
                );

                backCircle.setAttribute(
                    "stroke",
                    "#00aaff"
                );

                backText.setAttribute(
                    "fill",
                    "ghostwhite"
                );
            }
        );

        back.addEventListener(
            "click",
            () => {
                navigation.pop();

                childPage = 0;

                render();
            }
        );

        root.appendChild(
            back
        );

        const breadcrumb =
            navigation
                .map(item =>
                    formatName(
                        item.name
                    )
                )
                .join("  /  ");

        addText(
            root,
            breadcrumb,
            90,
            50,
            14,
            "normal",
            0.35
        );

        addText(
            root,
            formatName(name),
            55,
            105,
            38,
            "bold",
            1
        );

        /*
         * --------------------------------------------------------
         * LEAF
         * --------------------------------------------------------
         */

        if (children.length === 0) {
            renderLeafPage(
                root,
                data
            );

            return;
        }

        /*
         * --------------------------------------------------------
         * CHILDREN
         * --------------------------------------------------------
         */

        const startIndex =
            childPage *
            MAX_VISIBLE_CHILDREN;

        const visible =
            children.slice(
                startIndex,
                startIndex +
                MAX_VISIBLE_CHILDREN
            );

        const hasPrevious =
            childPage > 0;

        const hasNext =
            startIndex +
            MAX_VISIBLE_CHILDREN <
            children.length;

        const lineY = 290;

        root.appendChild(
            createElement(
                "line",
                {
                    x1: 120,
                    y1: lineY,
                    x2: 880,
                    y2: lineY,
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.12",
                    "stroke-width":
                        "1"
                }
            )
        );

        const scanner =
            createElement(
                "circle",
                {
                    cx: 120,
                    cy: lineY,
                    r: 3,
                    fill:
                        "currentColor",
                    "fill-opacity":
                        "0.45"
                }
            );

        scanner.appendChild(
            createElement(
                "animate",
                {
                    attributeName:
                        "cx",
                    values:
                        "120;880;120",
                    dur:
                        "7s",
                    repeatCount:
                        "indefinite"
                }
            )
        );

        root.appendChild(
            scanner
        );

        visible.forEach(
            ([childName, childData], index) => {
                const count =
                    visible.length;

                const x =
                    count === 1
                        ? 500
                        : 120 +
                        (
                            index /
                            (count - 1)
                        ) *
                        760;

                createChildNode(
                    root,
                    childName,
                    childData,
                    x,
                    lineY,
                    index
                );
            }
        );

        if (hasPrevious) {
            createControlButton(
                root,
                "Previous",
                385,
                475,
                () => {
                    childPage--;
                    render();
                }
            );
        }

        if (hasNext) {
            createControlButton(
                root,
                "More →",
                615,
                475,
                () => {
                    childPage++;
                    render();
                }
            );
        }

        if (
            children.length >
            MAX_VISIBLE_CHILDREN
        ) {
            const totalPages =
                Math.ceil(
                    children.length /
                    MAX_VISIBLE_CHILDREN
                );

            addText(
                root,
                `${childPage + 1} / ${totalPages}`,
                500,
                510,
                15,
                "normal",
                0.3,
                "middle"
            );
        }

        addText(
            root,
            `${children.length} ${
                children.length === 1
                    ? "item"
                    : "items"
            }`,
            500,
            550,
            15,
            "normal",
            0.3,
            "middle"
        );
    }

    /*
     * ------------------------------------------------------------
     * CHILD NODE
     * ------------------------------------------------------------
     */

    function createChildNode(
        parent,
        name,
        data,
        x,
        y,
        index
    ) {
        const children =
            getChildren(data);

        const hasChildren =
            children.length > 0;

        let radius = 22;

        if (!hasChildren) {
            radius =
                getLeafRadius(
                    getXP(data)
                );
        }

        const group =
            createElement(
                "g",
                {
                    transform:
                        `translate(${x} ${y})`,
                    cursor:
                        hasChildren
                            ? "pointer"
                            : "default"
                }
            );

        group.appendChild(
            createElement(
                "line",
                {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: -38,
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.18"
                }
            )
        );

        const pulse =
            createElement(
                "circle",
                {
                    cx: 0,
                    cy: 0,
                    r: radius,
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
            createElement(
                "animate",
                {
                    attributeName:
                        "r",
                    values:
                        `${radius};${radius + 5};${radius}`,
                    dur:
                        `${3 + (index % 3)}s`,
                    begin:
                        `${index * 0.2}s`,
                    repeatCount:
                        "indefinite"
                }
            )
        );

        pulse.appendChild(
            createElement(
                "animate",
                {
                    attributeName:
                        "opacity",
                    values:
                        "0.4;0;0.4",
                    dur:
                        `${3 + (index % 3)}s`,
                    begin:
                        `${index * 0.2}s`,
                    repeatCount:
                        "indefinite"
                }
            )
        );

        group.appendChild(
            pulse
        );

        const node =
            createElement(
                "circle",
                {
                    cx: 0,
                    cy: 0,
                    r: radius,
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

        group.appendChild(
            node
        );

        group.appendChild(
            createElement(
                "circle",
                {
                    cx: 0,
                    cy: 0,
                    r:
                        Math.max(
                            3,
                            radius * 0.12
                        ),
                    fill:
                        "currentColor",
                    "fill-opacity":
                        "0.65"
                }
            )
        );

        let label =
            formatName(name);

        if (label.length > 19) {
            label =
                label.slice(0, 18) +
                "…";
        }

        addText(
            group,
            label,
            0,
            radius + 27,
            14,
            "bold",
            0.8,
            "middle"
        );

        if (!hasChildren) {
            const xp =
                getXP(data);

            addText(
                group,
                `${formatXP(xp)} XP`,
                0,
                radius + 46,
                12,
                "normal",
                0.4,
                "middle"
            );
        } else {
            addText(
                group,
                `${children.length} →`,
                0,
                radius + 46,
                11,
                "normal",
                0.3,
                "middle"
            );
        }

        group.addEventListener(
            "mouseenter",
            () => {
                node.setAttribute(
                    "stroke-opacity",
                    hasChildren
                        ? "0.9"
                        : "0.8"
                );

                node.setAttribute(
                    "stroke-width",
                    hasChildren
                        ? "2.5"
                        : "2"
                );

                node.setAttribute(
                    "fill-opacity",
                    "0.09"
                );
            }
        );

        group.addEventListener(
            "mouseleave",
            () => {
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

        if (hasChildren) {
            group.addEventListener(
                "click",
                event => {
                    event.stopPropagation();

                    navigation.push({
                        name,
                        data
                    });

                    childPage = 0;

                    render();
                }
            );
        }

        parent.appendChild(
            group
        );
    }

    /*
     * ------------------------------------------------------------
     * LEAF PAGE
     * ------------------------------------------------------------
     */

    function renderLeafPage(
        parent,
        data
    ) {
        const centerX = 500;
        const centerY = 290;

        const xp =
            getXP(data);

        const radius =
            getLeafRadius(xp);

        const outer =
            createElement(
                "circle",
                {
                    cx: centerX,
                    cy: centerY,
                    r: radius + 18,
                    fill: "none",
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.12",
                    "stroke-width":
                        "1"
                }
            );

        outer.appendChild(
            createElement(
                "animate",
                {
                    attributeName:
                        "r",
                    values:
                        `${radius + 16};${radius + 26};${radius + 16}`,
                    dur:
                        "4s",
                    repeatCount:
                        "indefinite"
                }
            )
        );

        parent.appendChild(
            outer
        );

        parent.appendChild(
            createElement(
                "circle",
                {
                    cx: centerX,
                    cy: centerY,
                    r: radius,
                    fill:
                        "currentColor",
                    "fill-opacity":
                        "0.04",
                    stroke:
                        "currentColor",
                    "stroke-opacity":
                        "0.45",
                    "stroke-width":
                        "2"
                }
            )
        );

        addText(
            parent,
            "XP",
            centerX,
            centerY - 8,
            15,
            "bold",
            0.4,
            "middle"
        );

        addText(
            parent,
            formatXP(xp),
            centerX,
            centerY + 22,
            30,
            "bold",
            0.9,
            "middle"
        );

        addText(
            parent,
            "End of path",
            centerX,
            centerY + radius + 50,
            15,
            "normal",
            0.3,
            "middle"
        );
    }

    /*
     * ------------------------------------------------------------
     * CONTROL BUTTON
     * ------------------------------------------------------------
     */

    function createControlButton(
        parent,
        label,
        x,
        y,
        callback
    ) {
        const group =
            createElement(
                "g",
                {
                    transform:
                        `translate(${x} ${y})`,
                    cursor:
                        "pointer"
                }
            );

        const width =
            label.length * 10 + 44;

        const height = 42;

        const rect =
            createElement(
                "rect",
                {
                    x:
                        -width / 2,
                    y:
                        -height / 2,
                    width,
                    height,
                    rx:
                        height / 2,
                    fill:
                        "#00aaff",
                    "fill-opacity":
                        "1",
                    stroke:
                        "#00aaff",
                    "stroke-opacity":
                        "1"
                }
            );

        group.appendChild(
            rect
        );

        /*
         * Keep the working centering method:
         * horizontal center = text-anchor middle
         * vertical visual center = dy 0.35em
         */

        const text =
            addText(
                group,
                label,
                0,
                0,
                15,
                "bold",
                1,
                "middle"
            );

        text.setAttribute(
            "fill",
            "ghostwhite"
        );

        text.setAttribute(
            "dy",
            "0.35em"
        );

        text.setAttribute(
            "text-anchor",
            "middle"
        );

        group.addEventListener(
            "mouseenter",
            () => {
                rect.setAttribute(
                    "fill",
                    "#b0c4ff"
                );

                rect.setAttribute(
                    "stroke",
                    "#b0c4ff"
                );

                text.setAttribute(
                    "fill",
                    "black"
                );
            }
        );

        group.addEventListener(
            "mouseleave",
            () => {
                rect.setAttribute(
                    "fill",
                    "#00aaff"
                );

                rect.setAttribute(
                    "stroke",
                    "#00aaff"
                );

                text.setAttribute(
                    "fill",
                    "ghostwhite"
                );
            }
        );

        group.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                callback();
            }
        );

        parent.appendChild(
            group
        );
    }

    /*
     * ------------------------------------------------------------
     * INITIAL STATE
     * ------------------------------------------------------------
     */

    childPage = 0;

    render();

    return container;
}