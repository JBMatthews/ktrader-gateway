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
