const express = require('express');

const executeTradePlanRoute =
    require('./routes/executeTradePlan');

const {
    getAccount
} = require('./services/accountService');

const {
    getBalance
} = require('./services/kalshiApiService');

const {
    createDemoOrder
} = require('./services/kalshiOrderService');


const app = express();

const PORT =
    process.env.PORT || 3000;


app.use(express.json());


app.get('/health', (req, res) => {

    res.json({
        status: 'ok',
        service: 'ktrader-gateway'
    });

});


/*
 * Temporary authenticated Kalshi balance test.
 *
 * This does NOT submit orders.
 */
app.get('/test-kalshi-balance', async (req, res) => {

    try {

        const account =
            getAccount('kalshi_demo_01');

        const balance =
            await getBalance(account);

        res.json({
            success: true,
            account_id: account.account_id,
            environment: account.environment,
            kalshi: balance
        });

    } catch (error) {

        console.error(
            '[KTRADER] Balance test failed:',
            error
        );

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


/*
 * TEMPORARY DEMO ORDER TEST
 *
 * Places exactly ONE order
 * against the Kalshi Demo environment.
 *
 * This endpoint is intentionally hard-coded
 * to 1 contract at a $0.01 limit price.
 */
app.post('/test-kalshi-order', async (req, res) => {

    try {

        const {
            ticker
        } = req.body;

        if (!ticker) {
            return res.status(400).json({
                success: false,
                error: 'ticker is required.'
            });
        }

        const account =
            getAccount('kalshi_demo_01');

        /*
         * Safety check:
         * This temporary endpoint may never
         * execute against Production.
         */
        if (account.environment !== 'demo') {
            return res.status(400).json({
                success: false,
                error: 'Demo order test may only use a Demo account.'
            });
        }

        /*
         * Intentionally tiny test order.
         */
        const order = {
            ticker: ticker,
            contracts: 1,
            limit_price: 0.01
        };

        const result =
            await createDemoOrder(
                account,
                order
            );

        return res.status(201).json({
            success: true,
            message: 'Demo order submitted.',
            kalshi: result
        });

    } catch (error) {

        console.error(
            '[KTRADER] Demo order test failed:',
            error
        );

        return res.status(
            error.status || 500
        ).json({
            success: false,
            error: error.message,
            kalshi: error.body || null
        });

    }

});


app.use('/', executeTradePlanRoute);


app.listen(PORT, () => {

    console.log(
        `KTRADER Gateway running on port ${PORT}`
    );

});
