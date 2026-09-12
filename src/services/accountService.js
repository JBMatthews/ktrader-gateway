const fs = require('fs');

function getAccount(accountId) {
    if (accountId !== 'kalshi_demo_01') {
        throw new Error(`Unknown account_id: ${accountId}`);
    }

    const apiKeyId = process.env.KALSHI_DEMO_API_KEY_ID;
    const privateKeyPath = process.env.KALSHI_DEMO_PRIVATE_KEY_PATH;

    if (!apiKeyId) {
        throw new Error('KALSHI_DEMO_API_KEY_ID is not configured.');
    }

    if (!privateKeyPath) {
        throw new Error('KALSHI_DEMO_PRIVATE_KEY_PATH is not configured.');
    }

    if (!fs.existsSync(privateKeyPath)) {
        throw new Error(
            `Kalshi private key file not found: ${privateKeyPath}`
        );
    }

    const privateKey = fs.readFileSync(
        privateKeyPath,
        'utf8'
    );

    return {
        account_id: accountId,
        environment: 'demo',
        api_key_id: apiKeyId,
        private_key: privateKey,
        base_url: 'https://external-api.demo.kalshi.co'
    };
}

module.exports = {
    getAccount
};
