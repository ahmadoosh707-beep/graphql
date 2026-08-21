export function createHomeMarkup() {
    return `
    
    
    <div class="dashboard">
    
    <!-- Latest achievements scrolling bar -->
    <div class="haeder">

        <button id="logoutBtn" class="logout">
            <span>
                Logout
            </span>
        </button>

    </div>


            <div class="dashboard-grid">

                <!-- User profile / level -->
                <section class="profile-card">
                </section>
                                
                
                <section class="dashboard-card Audits-card">
                
                <div id="skills-graph-container">
                </div>

                <div>
                <div class="audit-button-container">
                    <div class="audit-buttons">

                        <button
                            class="audits-progress-button"
                            id="progress-button"
                        >
                            <span>
                                View All Projects
                            </span>
                        </button>

                        <button
                            class="audits-progress-button"
                            id="audit-history-button"
                        >
                            <span>
                                XP progression
                            </span>
                        </button>

                    </div>


                    <div class="audit-buttons">

                        <button
                            class="audits-progress-button"
                            id="all-audits-button"
                        >
                            <span>
                                All Audits
                            </span>
                        </button>

                        <button
                            id="skills-button"
                            class="audits-progress-button"
                        >
                            <span>
                                Show Skills
                            </span>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}