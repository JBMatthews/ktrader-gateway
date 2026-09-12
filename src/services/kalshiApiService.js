const {
    buildAuthHeaders
} = require('./kalshiAuthService');


async function getBalance(account) {

    const method = 'GET';

    const path =
        '/trade-api/v2/portfolio/balance';

    const headers =
        buildAuthHeaders(
            account,
            method,
            path
        );

    const url =
        account.base_url + path;

    console.log(
        `[KTRADER] Calling Kalshi Demo: ${method} ${path}`
    );

    const response =
        await fetch(url, {
            method: method,
            headers: headers
        });

    const text =
        await response.text();

    let body;

    try {
        body = JSON.parse(text);
    } catch {
        body = {
            raw_response: text
        };
    }

    if (!response.ok) {

        console.error(
            `[KTRADER] Kalshi returned HTTP ${response.status}`
        );

        throw new Error(
            `Kalshi API error ${response.status}: ${text}`
        );
    }

    return body;
}


module.exports = {
    getBalance
};
