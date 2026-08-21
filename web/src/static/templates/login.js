export function createLoginMarkup() {
    return `
        <div class="login-card">
            <div class="login-header">
                <h1>Welcome To GraphQL</h1>
                <p>Please enter your credentials</p>
            </div>
            <div class="error-container" hidden></div>
            <form id="login-form">
                <div class="form-group">
                    <label for="identifier">Username / Email</label>
                    <input id="identifier" name="identifier" type="text" placeholder="Enter your username or email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input id="password" name="password" type="password" placeholder="Enter your password" required>
                </div>
                <div class="login-button-container">
                    <button class="btn-5" type="submit">
                        <span>Sign In</span>
                    </button>
                </div>
                <div class="status-message" id="login-status">No backend required — login is simulated.</div>
            </form>
        </div>
    `;
}