export function createProfileMarkup(data) {
    const user = data.user[0];
    const attrs = user.attrs;

    const fullName = `${attrs.firstName.trim()} ${attrs.lastName}`;

    const upTotal = user.totalUp + user.totalUpBonus;
    const downTotal = user.totalDown;

    const maxTotal = Math.max(upTotal, downTotal);

    const upWidth = (upTotal / maxTotal) * 100;
    const downWidth = (downTotal / maxTotal) * 100;

    return `
        <div class="profile">
            <h1>${fullName}</h1>

            <div class="profile-info">
                <div class="info-item">
                    <span class="label">Email</span>
                    <span class="value">${user.email}</span>
                </div>

                <div class="info-item">
                    <span class="label">Gender</span>
                    <span class="value">${attrs.genders}</span>
                </div>

                <div class="info-item">
                    <span class="label">Audit Ratio</span>
                    <span class="value">${user.auditRatio.toFixed(2)}</span>
                </div>

                <div class="info-item">
                    <span class="label">Username</span>
                    <span class="value">${user.login}</span>
                </div>
            </div>

            <div class="stats">

                <div class="stat">
                    <div class="stat-header">
                        <span>Done</span>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-up" style="width: ${upWidth}%"></div>
                    </div>

                    <div class="stat-details">
                        <span>${user.totalUp.toLocaleString()} MB ↑<br>+ ${user.totalUpBonus.toLocaleString()} kB</span>
                    </div>
                </div>

                <div class="stat">
                    <div class="stat-header">
                        <span>Recieved</span>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-down" style="width: ${downWidth}%"></div>
                    </div>

                    <div class="stat-details">
                        <span>${user.totalDown.toLocaleString()} MB ↓</span>
                    </div>
                </div>

            </div>
        </div>
    `;
}