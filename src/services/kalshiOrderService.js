const crypto = require('crypto');

const {
    buildAuthHeaders
} = require('./kalshiAuthService');


async function createDemoOrder(account, order) {

    const method = 'POST';

    const path =
        '/trade-api/v2/portfolio/events/orders';

    const headers =
        buildAuthHeaders(
            account,
            method,
            path
        );

    headers['Content-Type'] =
        'application/json';


    const clientOrderId =
        crypto.randomUUID();


    const payload = {
        ticker: order.ticker,
        client_order_id: clientOrderId,
        side: 'bid',
        count: Number(order.contracts).toFixed(2),
        price: Number(order.limit_price).toFixed(4),
        time_in_force: 'immediate_or_cancel',
        self_trade_prevention_type: 'taker_at_cross'
    };


    if (
        order.exchange_index !== undefined &&
        order.exchange_index !== null
    ) {

        payload.exchange_index =
            Number(order.exchange_index);

    }


    const url =
        account.base_url + path;


    console.log(
        `[KTRADER] Submitting DEMO order: ${order.ticker}`
    );

    console.log(
        `[KTRADER] Contracts: ${payload.count}`
    );

    console.log(
        `[KTRADER] Limit price: ${payload.price}`
    );

    console.log(
        `[KTRADER] Client Order ID: ${clientOrderId}`
    );

    console.log(
        `[KTRADER] Exchange index: ${payload.exchange_index}`
    );


    const response =
        await fetch(
            url,
            {
                method,
                headers,
                body: JSON.stringify(payload)
            }
        );


    const text =
        await response.text();


    let body;

    try {

        body =
            JSON.parse(text);

    } catch {

        body = {
            raw_response: text
        };

    }


    if (!response.ok) {

        console.error(
            `[KTRADER] Kalshi order failed HTTP ${response.status}`
        );

        console.error(
            `[KTRADER] Response: ${text}`
        );


        const error =
            new Error(
                `Kalshi order failed HTTP ${response.status}`
            );

        error.status =
            response.status;

        error.body =
            body;

        throw error;

    }


    return {
        request: payload,
        response: body
    };

}


module.exports = {
    createDemoOrder
};
