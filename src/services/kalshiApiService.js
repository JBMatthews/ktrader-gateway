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


async function getPosition(account, ticker) {

    const method = 'GET';

    const path =
        '/trade-api/v2/portfolio/positions';

    const headers =
        buildAuthHeaders(
            account,
            method,
            path
        );

    const url =
        account.base_url +
        path +
        '?ticker=' +
        encodeURIComponent(ticker);

    console.log(
        `[KTRADER] Getting position for: ${ticker}`
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
            `[KTRADER] Kalshi position request returned HTTP ${response.status}`
        );

        console.error(
            `[KTRADER] Response: ${text}`
        );

        throw new Error(
            `Kalshi position API error ${response.status}: ${text}`
        );
    }

    return body;
}


async function getFills(account, ticker) {

    const method = 'GET';

    const path =
        '/trade-api/v2/portfolio/fills';

    const headers =
        buildAuthHeaders(
            account,
            method,
            path
        );

    const url =
        account.base_url +
        path +
        '?ticker=' +
        encodeURIComponent(ticker);

    console.log(
        `[KTRADER] Getting fills for: ${ticker}`
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
            `[KTRADER] Kalshi fills request returned HTTP ${response.status}`
        );

        console.error(
            `[KTRADER] Response: ${text}`
        );

        const error =
            new Error(
                `Kalshi fills API error ${response.status}: ${text}`
            );

        error.status =
            response.status;

        error.body =
            body;

        throw error;
    }

    return body;
}


module.exports = {
    getBalance,
    getPosition,
    getFills
};