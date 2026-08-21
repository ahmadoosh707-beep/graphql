import { initHome } from "../../js/home.js";

function clearContainer(container) {
    container.innerHTML = '';
}

export function renderSvgView(
    container,
    { mountId = 'svg-mount', onHome } = {}
) {
    clearContainer(container);

    /* --------------------------------
       MAIN VIEW WRAPPER
    -------------------------------- */

    const view = document.createElement('div');
    view.className = 'svg-view';

    /* --------------------------------
       HEADER
    -------------------------------- */

    const header = document.createElement('div');
    header.className = 'header';

    const homeBtn = document.createElement('button');
    homeBtn.id = 'home-button';
    homeBtn.className = 'audits-show-button';

    const text = document.createElement('span');
    text.textContent = 'Back Home';

    homeBtn.appendChild(text);

    homeBtn.addEventListener('click', () => {
        initHome();
    });

    header.appendChild(homeBtn);
    view.appendChild(header);

    /* --------------------------------
       PANEL
    -------------------------------- */

    const panel = document.createElement('div');
    panel.className = 'panel';

    const mount = document.createElement('div');
    mount.id = mountId;

    panel.appendChild(mount);
    view.appendChild(panel);

    /* --------------------------------
       ADD VIEW TO CONTAINER
    -------------------------------- */

    container.appendChild(view);

    /* --------------------------------
       RETURN THE CHART MOUNT
    -------------------------------- */

    return mount;
}