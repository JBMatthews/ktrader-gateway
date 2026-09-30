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


async function getOwnedPosition(account, ticker) {

    const positionResponse =
        await getPosition(
            account,
            ticker
        );

    const marketPositions =
        positionResponse.market_positions || [];

    const marketPosition =
        marketPositions.find(
            position =>
                position.ticker === ticker
        );

    if (!marketPosition) {

        console.log(
            `[KTRADER] No current position for: ${ticker}`
        );

        return {
            ticker: ticker,
            owned: 0,
            position_fp: '0.00',
            exchange_index: null
        };
    }

    const positionValue =
        Number(
            marketPosition.position_fp || 0
        );

    /*
     * Kalshi position_fp is signed:
     *
     * Positive = YES position
     * Negative = NO position
     *
     * KTRADER currently measures ownership
     * of the YES side for its target position.
     */
    const owned =
        Math.max(
            positionValue,
            0
        );

    console.log(
        `[KTRADER] Current YES position for ${ticker}: ${owned}`
    );

    return {
        ticker: ticker,
        owned: owned,
        position_fp: marketPosition.position_fp,
        exchange_index: marketPosition.exchange_index
    };
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


async function getOrderBook(account, ticker) {

    const method = 'GET';

    const path =
        '/trade-api/v2/markets/' +
        encodeURIComponent(ticker) +
        '/orderbook';

    const headers =
        buildAuthHeaders(
            account,
            method,
            path
        );

    const url =
        account.base_url + path;

    console.log(
        `[KTRADER] Getting order book for: ${ticker}`
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
            `[KTRADER] Kalshi order book request returned HTTP ${response.status}`
        );

        console.error(
            `[KTRADER] Response: ${text}`
        );

        const error =
            new Error(
                `Kalshi order book API error ${response.status}: ${text}`
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
    getOwnedPosition,
    getFills,
    getOrderBook
};