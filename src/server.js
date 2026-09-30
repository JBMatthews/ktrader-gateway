const express = require('express');

const executeTradePlanRoute =
    require('./routes/executeTradePlan');

const {
    getAccount
} = require('./services/accountService');

const {
    getBalance,
    getPosition,
    getOwnedPosition,
    getFills
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
 * Temporary authenticated Kalshi position test.
 *
 * This does NOT submit orders.
 */
app.get('/test-kalshi-position/:ticker', async (req, res) => {

    try {

        const ticker =
            req.params.ticker;

        const account =
            getAccount('kalshi_demo_01');

        const position =
            await getPosition(
                account,
                ticker
            );

        return res.json({
            success: true,
            ticker: ticker,
            kalshi: position
        });

    } catch (error) {

        console.error(
            '[KTRADER] Position test failed:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


/*
 * Temporary authenticated Kalshi fills test.
 *
 * This does NOT submit orders.
 */
app.get('/test-kalshi-fills/:ticker', async (req, res) => {

    try {

        const ticker =
            req.params.ticker;

        const account =
            getAccount('kalshi_demo_01');

        const fills =
            await getFills(
                account,
                ticker
            );

        return res.json({
            success: true,
            ticker: ticker,
            kalshi: fills
        });

    } catch (error) {

        console.error(
            '[KTRADER] Fills test failed:',
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


/*
 * Temporary position-completion test.
 *
 * Calculates:
 *
 * DESIRED - OWNED = NEEDED
 *
 * This does NOT submit orders.
 */
app.post('/test-position-needed', async (req, res) => {

    try {

        const {
            ticker,
            desired
        } = req.body;

        if (!ticker) {

            return res.status(400).json({
                success: false,
                error: 'ticker is required.'
            });

        }

        const desiredNumber =
            Number(desired);

        if (
            !Number.isFinite(desiredNumber) ||
            desiredNumber < 0
        ) {

            return res.status(400).json({
                success: false,
                error: 'desired must be a number greater than or equal to 0.'
            });

        }

        const account =
            getAccount('kalshi_demo_01');

        const position =
            await getOwnedPosition(
                account,
                ticker
            );

        const owned =
            position.owned;

        const needed =
            Math.max(
                desiredNumber - owned,
                0
            );

        const complete =
            needed === 0;

        console.log(
            `[KTRADER] Position target for ${ticker}`
        );

        console.log(
            `[KTRADER] Desired: ${desiredNumber}`
        );

        console.log(
            `[KTRADER] Owned: ${owned}`
        );

        console.log(
            `[KTRADER] Needed: ${needed}`
        );

        console.log(
            `[KTRADER] Complete: ${complete}`
        );

        return res.json({
            success: true,
            ticker: ticker,
            desired: desiredNumber,
            owned: owned,
            needed: needed,
            complete: complete,
            exchange_index: position.exchange_index
        });

    } catch (error) {

        console.error(
            '[KTRADER] Position completion test failed:',
            error
        );

        return res.status(500).json({
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
 * to 1 contract at a $0.98 limit price.
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
            exchange_index: 0,
            contracts: 1,
            limit_price: 0.98
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