const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
};


export function renderXPChart(container, tx) {
    if (!tx?.length) return;

    const W = 560;
    const H = 220;

    const padL = 16;
    const padR = 16;
    const padT = 38;
    const padB = 28;

    let cum = 0;

    const points = tx.map(t => {
        cum += Number(t.amount) || 0;

        return {
            ...t,
            cum
        };
    });

    const maxY = points[points.length - 1].cum;

    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const x = i =>
        padL +
        (i / Math.max(points.length - 1, 1)) * chartW;

    const y = value =>
        padT +
        chartH -
        (value / maxY) * chartH;

    const svg = el('svg', {
        viewBox: `0 0 ${W} ${H}`,
        class: 'xp-chart',
        preserveAspectRatio: 'none'
    });

    /* --------------------------------
       DEFINITIONS
    -------------------------------- */

    const defs = el('defs');

    const gradient = el('linearGradient', {
        id: 'xpAreaGradient',
        x1: '0',
        y1: '0',
        x2: '0',
        y2: '1'
    });

    gradient.appendChild(el('stop', {
        offset: '0%',
        'stop-color': 'ghostwhite',
        'stop-opacity': '0.18'
    }));

    gradient.appendChild(el('stop', {
        offset: '100%',
        'stop-color': 'ghostwhite',
        'stop-opacity': '0'
    }));

    defs.appendChild(gradient);

    const glow = el('filter', {
        id: 'xpGlow',
        x: '-100%',
        y: '-100%',
        width: '300%',
        height: '300%'
    });

    glow.appendChild(
        el('feGaussianBlur', {
            stdDeviation: '3',
            result: 'blur'
        })
    );

    const merge = el('feMerge');

    merge.appendChild(
        el('feMergeNode', {
            in: 'blur'
        })
    );

    merge.appendChild(
        el('feMergeNode', {
            in: 'SourceGraphic'
        })
    );

    glow.appendChild(merge);
    defs.appendChild(glow);

    svg.appendChild(defs);

    /* --------------------------------
       HEADER
    -------------------------------- */

    const title = el('text', {
        x: padL,
        y: 17,
        class: 'xp-chart-title'
    });

    title.textContent = 'XP PROGRESSION';

    svg.appendChild(title);

    const total = el('text', {
        x: W - padR,
        y: 18,
        'text-anchor': 'end',
        class: 'xp-chart-total'
    });

    total.textContent = `${maxY.toLocaleString()} XP`;

    svg.appendChild(total);

    /* --------------------------------
       GRID
    -------------------------------- */

    const grid = el('g', {
        class: 'xp-chart-grid'
    });

    const gridSteps = 4;

    for (let i = 0; i <= gridSteps; i++) {
        const value = (maxY / gridSteps) * i;
        const gy = y(value);

        grid.appendChild(
            el('line', {
                x1: padL,
                x2: W - padR,
                y1: gy,
                y2: gy
            })
        );
    }

    svg.appendChild(grid);

    /* --------------------------------
       XP LINE
    -------------------------------- */

    let lineD = `M ${x(0)} ${y(0)}`;

    points.forEach((point, i) => {
        lineD += ` L ${x(i)} ${y(point.cum)}`;
    });

    /* --------------------------------
       AREA
    -------------------------------- */

    const areaD =
        lineD +
        ` L ${x(points.length - 1)} ${y(0)}` +
        ` L ${x(0)} ${y(0)} Z`;

    const area = el('path', {
        d: areaD,
        class: 'xp-chart-area'
    });

    svg.appendChild(area);

    /* --------------------------------
       MAIN LINE
    -------------------------------- */

    const line = el('path', {
        d: lineD,
        class: 'xp-chart-line'
    });

    svg.appendChild(line);

    /* --------------------------------
       TRANSACTION POINTS
    -------------------------------- */

    const pointsGroup = el('g', {
        class: 'xp-chart-points'
    });

    points.forEach((point, i) => {
        const showPoint =
            points.length <= 25 ||
            i === 0 ||
            i === points.length - 1;

        if (!showPoint) return;

        const dot = el('circle', {
            cx: x(i),
            cy: y(point.cum),
            r: i === points.length - 1 ? 4 : 2.5,
            class:
                i === points.length - 1
                    ? 'xp-chart-dot xp-chart-dot-current'
                    : 'xp-chart-dot'
        });

        const title = el('title');

        title.textContent =
            `${point.object?.name ?? 'Transaction'} · ` +
            `+${Number(point.amount).toLocaleString()} XP · ` +
            `${Number(point.cum).toLocaleString()} XP total · ` +
            `${point.createdAt}`;

        dot.appendChild(title);

        pointsGroup.appendChild(dot);
    });

    svg.appendChild(pointsGroup);

    /* --------------------------------
       CURRENT XP PULSE
    -------------------------------- */

    const last = points[points.length - 1];

    const pulse = el('circle', {
        cx: x(points.length - 1),
        cy: y(last.cum),
        r: 4,
        class: 'xp-chart-pulse'
    });

    pulse.innerHTML = `
        <animate
            attributeName="r"
            values="4;11;4"
            dur="2.2s"
            repeatCount="indefinite"
        />

        <animate
            attributeName="opacity"
            values="0.7;0;0.7"
            dur="2.2s"
            repeatCount="indefinite"
        />
    `;

    svg.appendChild(pulse);

    /* --------------------------------
       HOVER ELEMENTS
    -------------------------------- */

    const hoverLine = el('line', {
        class: 'xp-chart-hover-line',
        y1: padT,
        y2: H - padB,
        opacity: '0',
        'pointer-events': 'none'
    });

    const hoverPoint = el('circle', {
        class: 'xp-chart-hover-point',
        r: '4',
        opacity: '0',
        'pointer-events': 'none'
    });

    svg.appendChild(hoverLine);
    svg.appendChild(hoverPoint);

    /* --------------------------------
       TOOLTIP
    -------------------------------- */

    const tooltip = el('g', {
        class: 'xp-chart-tooltip',
        opacity: '0',
        'pointer-events': 'none'
    });

    const tooltipBg = el('rect', {
        rx: '5',
        ry: '5'
    });

    const tooltipTitle = el('text', {
        class: 'xp-chart-tooltip-title'
    });

    const tooltipXP = el('text', {
        class: 'xp-chart-tooltip-xp'
    });

    const tooltipDate = el('text', {
        class: 'xp-chart-tooltip-date'
    });

    tooltip.appendChild(tooltipBg);
    tooltip.appendChild(tooltipTitle);
    tooltip.appendChild(tooltipXP);
    tooltip.appendChild(tooltipDate);

    svg.appendChild(tooltip);

    /* --------------------------------
       INVISIBLE HOVER AREA
    -------------------------------- */

    const hitArea = el('rect', {
        x: padL,
        y: padT,
        width: chartW,
        height: chartH,
        fill: 'transparent',
        style: 'cursor: crosshair;'
    });

    svg.appendChild(hitArea);

    /* --------------------------------
       TOOLTIP HELPERS
    -------------------------------- */

    const formatDate = date => {
        return new Date(date).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNearestPoint = mouseX => {
        const ratio =
            (mouseX - padL) / chartW;

        const index = Math.round(
            ratio * (points.length - 1)
        );

        return Math.max(
            0,
            Math.min(points.length - 1, index)
        );
    };

    const showTooltip = index => {
        const point = points[index];

        const cx = x(index);
        const cy = y(point.cum);

        /* Vertical guide */

        hoverLine.setAttribute('x1', cx);
        hoverLine.setAttribute('x2', cx);
        hoverLine.setAttribute('opacity', '1');

        /* Highlighted point */

        hoverPoint.setAttribute('cx', cx);
        hoverPoint.setAttribute('cy', cy);
        hoverPoint.setAttribute('opacity', '1');

        /* Tooltip content */

        const name =
            point.object?.name ??
            'Transaction';

        tooltipTitle.textContent = name;

        tooltipXP.textContent =
            `+${Number(point.amount).toLocaleString()} XP  ·  ` +
            `${Number(point.cum).toLocaleString()} XP total`;

        tooltipDate.textContent =
            formatDate(point.createdAt);

        /*
         * Measure the tooltip after setting
         * the text so it can size correctly.
         */

        const titleLength =
            tooltipTitle.getComputedTextLength();

        const xpLength =
            tooltipXP.getComputedTextLength();

        const dateLength =
            tooltipDate.getComputedTextLength();

        const tooltipWidth =
            Math.max(
                150,
                titleLength,
                xpLength,
                dateLength
            ) + 20;

        const tooltipHeight = 52;

        /* Position horizontally */

        let tooltipX = cx + 12;

        if (
            tooltipX + tooltipWidth >
            W - padR
        ) {
            tooltipX =
                cx -
                tooltipWidth -
                12;
        }

        if (tooltipX < padL) {
            tooltipX = padL;
        }

        /* Position vertically */

        let tooltipY =
            cy -
            tooltipHeight -
            10;

        if (tooltipY < padT) {
            tooltipY = cy + 12;
        }

        /* Background */

        tooltipBg.setAttribute(
            'x',
            tooltipX
        );

        tooltipBg.setAttribute(
            'y',
            tooltipY
        );

        tooltipBg.setAttribute(
            'width',
            tooltipWidth
        );

        tooltipBg.setAttribute(
            'height',
            tooltipHeight
        );

        /* Text */

        tooltipTitle.setAttribute(
            'x',
            tooltipX + 10
        );

        tooltipTitle.setAttribute(
            'y',
            tooltipY + 15
        );

        tooltipXP.setAttribute(
            'x',
            tooltipX + 10
        );

        tooltipXP.setAttribute(
            'y',
            tooltipY + 30
        );

        tooltipDate.setAttribute(
            'x',
            tooltipX + 10
        );

        tooltipDate.setAttribute(
            'y',
            tooltipY + 44
        );

        tooltip.setAttribute(
            'opacity',
            '1'
        );
    };

    const hideTooltip = () => {
        tooltip.setAttribute(
            'opacity',
            '0'
        );

        hoverLine.setAttribute(
            'opacity',
            '0'
        );

        hoverPoint.setAttribute(
            'opacity',
            '0'
        );
    };

    /* --------------------------------
       MOUSE INTERACTION
    -------------------------------- */

    hitArea.addEventListener(
        'mousemove',
        event => {
            const rect =
                svg.getBoundingClientRect();

            /*
             * Convert browser coordinates
             * into SVG viewBox coordinates.
             */

            const mouseX =
                ((event.clientX - rect.left) /
                    rect.width) *
                W;

            const index =
                getNearestPoint(mouseX);

            showTooltip(index);
        }
    );

    hitArea.addEventListener(
        'mouseleave',
        hideTooltip
    );

    /* --------------------------------
       X AXIS
    -------------------------------- */

    const axis = el('line', {
        x1: padL,
        x2: W - padR,
        y1: H - padB,
        y2: H - padB,
        class: 'xp-chart-axis'
    });

    svg.appendChild(axis);

    /* --------------------------------
       DATE LABELS
    -------------------------------- */

    const startDate =
        new Date(points[0].createdAt);

    const endDate =
        new Date(
            points[points.length - 1].createdAt
        );

    const startLabel = el('text', {
        x: padL,
        y: H - 8,
        class: 'xp-chart-date'
    });

    startLabel.textContent =
        startDate.toLocaleDateString(
            undefined,
            {
                month: 'short',
                day: 'numeric'
            }
        );

    svg.appendChild(startLabel);

    const endLabel = el('text', {
        x: W - padR,
        y: H - 8,
        'text-anchor': 'end',
        class: 'xp-chart-date'
    });

    endLabel.textContent =
        endDate.toLocaleDateString(
            undefined,
            {
                month: 'short',
                day: 'numeric'
            }
        );

    svg.appendChild(endLabel);

    /* --------------------------------
       ADD TO CONTAINER
    -------------------------------- */

    container.appendChild(svg);

    /* --------------------------------
       DRAW ANIMATION
    -------------------------------- */

    requestAnimationFrame(() => {
        const length =
            line.getTotalLength();

        line.style.strokeDasharray =
            length;

        line.style.strokeDashoffset =
            length;

        line.style.transition =
            'stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)';

        requestAnimationFrame(() => {
            line.style.strokeDashoffset =
                '0';
        });
    });
}

export function renderAuditScale(container, audits) {
    const up = audits.filter(a => a.type === 'up').reduce((s, a) => s + a.amount, 0);
    const down = audits.filter(a => a.type === 'down').reduce((s, a) => s + a.amount, 0);
    const ratio = up / down;

    const W = 560, H = 190;
    const pivotX = W / 2, pivotY = 66;
    const angle = Math.max(-16, Math.min(16, (Math.log(ratio) * 12)));

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` });

    // post
    svg.appendChild(el('rect', { x: pivotX - 3, y: pivotY, width: 6, height: 96, rx: 2, fill: '#232b35' }));
    svg.appendChild(el('polygon', { points: `${pivotX - 46},${H - 24} ${pivotX + 46},${H - 24} ${pivotX + 14},${H - 40} ${pivotX - 14},${H - 40}`, fill: '#161b22', stroke: '#232b35' }));

    const beam = el('g', { transform: `rotate(${angle} ${pivotX} ${pivotY})` });
    beam.appendChild(el('line', { x1: pivotX - 190, y1: pivotY, x2: pivotX + 190, y2: pivotY, stroke: '#3a4551', 'stroke-width': '4', 'stroke-linecap': 'round' }));

    const panR = 30 + Math.min(20, Math.sqrt(up) / 6);
    const panL = 30 + Math.min(20, Math.sqrt(down) / 6);

    // left pan = given (up), right pan = received (down)
    const leftX = pivotX - 190, rightX = pivotX + 190;
    beam.appendChild(el('line', { x1: leftX, y1: pivotY, x2: leftX, y2: pivotY + 42, stroke: '#3a4551', 'stroke-width': '2' }));
    beam.appendChild(el('line', { x1: rightX, y1: pivotY, x2: rightX, y2: pivotY + 42, stroke: '#3a4551', 'stroke-width': '2' }));

    const leftPan = el('ellipse', { cx: leftX, cy: pivotY + 44, rx: panL, ry: 10, fill: 'var(--cyan)', 'fill-opacity': '0.85' });
    const rightPan = el('ellipse', { cx: rightX, cy: pivotY + 44, rx: panR, ry: 10, fill: 'var(--down)', 'fill-opacity': '0.85' });
    leftPan.appendChild(el('title'));
    leftPan.querySelector('title').textContent = `given: ${up} XP`;
    rightPan.appendChild(el('title'));
    rightPan.querySelector('title').textContent = `received: ${down} XP`;
    beam.appendChild(leftPan);
    beam.appendChild(rightPan);

    beam.appendChild(el('text', { x: leftX, y: pivotY - 14, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-size': '10', fill: 'var(--cyan)' })).textContent = 'UP';
    beam.appendChild(el('text', { x: rightX, y: pivotY - 14, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-size': '10', fill: 'var(--down)' })).textContent = 'DOWN';

    svg.appendChild(beam);
    svg.appendChild(el('circle', { cx: pivotX, cy: pivotY, r: 5, fill: '#e6edf3' }));

    const label = el('text', { x: pivotX, y: 22, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-weight': '700', 'font-size': '20', fill: ratio >= 1 ? 'var(--xp)' : 'var(--down)' });
    label.textContent = ratio.toFixed(2);
    svg.appendChild(label);
    const sub = el('text', { x: pivotX, y: 38, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-size': '10', fill: 'var(--muted)' });
    sub.textContent = 'audit ratio';
    svg.appendChild(sub);

    container.appendChild(svg);
    requestAnimationFrame(() => {
        beam.style.transition = 'transform 1.1s cubic-bezier(.3,.6,.3,1.2)';
        beam.setAttribute('transform', `rotate(${angle} ${pivotX} ${pivotY})`);
    });
}

export function renderProjectGrid(container, projects) {
    const W = 560, H = 190;
    const r = 22;
    const cols = 6;
    const startX = 40, startY = 34;

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` });

    function hexPoints(cx, cy, rad) {
        let pts = [];
        for (let i = 0; i < 6; i++) {
            const a = Math.PI / 180 * (60 * i - 30);
            pts.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`);
        }
        return pts.join(' ');
    }

    const hw = r * Math.sqrt(3) / 2;

    projects.forEach((p, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const cx = startX + col * (hw * 2 + 4) + (row % 2 ? hw : 0);
        const cy = startY + row * (r * 1.5 + 6);
        const pass = p.grade >= 1;
        const hex = el('polygon', {
            points: hexPoints(cx, cy, r - 2),
            fill: pass ? 'rgba(126,231,135,0.16)' : 'rgba(255,123,114,0.14)',
            stroke: pass ? 'var(--xp)' : 'var(--down)',
            'stroke-width': '1.4', opacity: '0'
        });
        const title = el('title');
        title.textContent = `${p.object.name} · grade ${p.grade.toFixed(2)} · ${pass ? 'PASS' : 'FAIL'}`;
        hex.appendChild(title);
        svg.appendChild(hex);

        const dot = el('circle', { cx, cy, r: 2.4, fill: pass ? 'var(--xp)' : 'var(--down)', opacity: '0' });
        svg.appendChild(dot);

        setTimeout(() => {
            hex.style.transition = 'opacity .45s ease';
            dot.style.transition = 'opacity .45s ease';
            hex.style.opacity = '1';
            dot.style.opacity = '1';
        }, i * 55);
    });

    const passCount = projects.filter(p => p.grade >= 1).length;
    svg.appendChild(el('text', { x: W - 16, y: 16, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace', 'font-size': '11', fill: 'var(--muted)' }))
        .textContent = `${passCount}/${projects.length} passed`;

    container.appendChild(svg);
}

export function renderProfileBadge(container, user, totalXP) {
    const W = 560, H = 190;
    const cx = 90, cy = 95, R = 58;
    const level = 14, levelProgress = 0.62;

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` });

    svg.appendChild(el('circle', { cx, cy, r: R, fill: 'none', stroke: '#1b232c', 'stroke-width': '7' }));
    const circumference = 2 * Math.PI * R;
    const arc = el('circle', {
        cx, cy, r: R, fill: 'none', stroke: 'var(--gold)', 'stroke-width': '7',
        'stroke-linecap': 'round', transform: `rotate(-90 ${cx} ${cy})`,
        'stroke-dasharray': circumference, 'stroke-dashoffset': circumference
    });
    svg.appendChild(arc);

    const initials = el('text', {
        x: cx, y: cy + 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-family': 'JetBrains Mono, monospace', 'font-weight': '800', 'font-size': '26', fill: 'var(--text)'
    });
    initials.textContent = user.login.slice(0, 2).toUpperCase();
    svg.appendChild(initials);

    const lvl = el('text', { x: cx, y: cy + R + 22, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-size': '11', fill: 'var(--gold)' });
    lvl.textContent = `LEVEL ${level}`;
    svg.appendChild(lvl);

    // info column
    const infoX = 190;
    const rows = [
        ['login', user.login],
        ['id', `#${user.id}`],
        ['email', user.email],
        ['total xp', `${totalXP.toLocaleString()}`],
        ['progress', `${Math.round(levelProgress * 100)}% to level ${level + 1}`],
    ];
    rows.forEach((r_, i) => {
        const rowY = 40 + i * 30;
        svg.appendChild(el('text', { x: infoX, y: rowY, 'font-family': 'JetBrains Mono, monospace', 'font-size': '11', fill: 'var(--muted)' })).textContent = r_[0];
        svg.appendChild(el('text', { x: infoX + 110, y: rowY, 'font-family': 'JetBrains Mono, monospace', 'font-size': '12', fill: 'var(--text)', 'font-weight': '600' })).textContent = r_[1];
    });

    container.appendChild(svg);
    requestAnimationFrame(() => {
        arc.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)';
        arc.setAttribute('stroke-dashoffset', circumference * (1 - levelProgress));
    });
}

// ---------------------------------------------------------------
// Usage (wired up externally, e.g. after renderSvgView from template.js):
//   renderXPChart(mount, xpTransactions);
//   renderAuditScale(mount, auditData);
//   renderProjectGrid(mount, projects);
//   renderProfileBadge(mount, user, xpTransactions.reduce((s,t)=>s+t.amount,0));
// ---------------------------------------------------------------