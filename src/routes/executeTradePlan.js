const express = require('express');

const {
    getAccount
} = require('../services/accountService');

const router = express.Router();

// Development-only idempotency store.
// This resets whenever the container restarts.
const processedExecutions = new Map();

router.post('/execute-trade-plan', async (req, res) => {
    try {
        const payload = req.body;

        if (!payload) {
            return res.status(400).json({
                success: false,
                error: 'Request body is required.'
            });
        }

        const {
            execution_id,
            account_id,
            environment,
            trade_plan_id,
            orders
        } = payload;

        // Required fields
        if (!execution_id) {
            return res.status(400).json({
                success: false,
                error: 'execution_id is required.'
            });
        }

        /*
         * IDEMPOTENCY CHECK
         *
         * Never process the same execution_id twice.
         */
        if (processedExecutions.has(execution_id)) {
            return res.status(409).json({
                success: false,
                error: 'Duplicate execution_id.',
                execution_id: execution_id
            });
        }

        if (!account_id) {
            return res.status(400).json({
                success: false,
                error: 'account_id is required.'
            });
        }

        if (!environment) {
            return res.status(400).json({
                success: false,
                error: 'environment is required.'
            });
        }

        if (!trade_plan_id) {
            return res.status(400).json({
                success: false,
                error: 'trade_plan_id is required.'
            });
        }

        if (!Array.isArray(orders) || orders.length !== 3) {
            return res.status(400).json({
                success: false,
                error: 'Exactly 3 orders are required.'
            });
        }

        /*
         * Put the orders into execution sequence.
         */
        const sortedOrders = [...orders].sort(
            (a, b) => a.sequence - b.sequence
        );

        /*
         * PRIMARY must execute first.
         */
        if (
            sortedOrders[0].sequence !== 1 ||
            sortedOrders[0].role !== 'primary'
        ) {
            return res.status(400).json({
                success: false,
                error: 'Primary order must be execution sequence 1.'
            });
        }

        /*
         * Validate every order.
         */
        for (const order of sortedOrders) {

            if (!order.role) {
                return res.status(400).json({
                    success: false,
                    error: 'Order role is required.'
                });
            }

            if (!order.ticker) {
                return res.status(400).json({
                    success: false,
                    error: `Ticker is required for role ${order.role}.`
                });
            }

            if (order.side !== 'yes') {
                return res.status(400).json({
                    success: false,
                    error: `Only YES-side orders are currently supported for role ${order.role}.`
                });
            }

            if (order.action !== 'buy') {
                return res.status(400).json({
                    success: false,
                    error: `Only BUY orders are currently supported for role ${order.role}.`
                });
            }

            if (
                !Number.isFinite(order.contracts) ||
                order.contracts <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid contract quantity for role ${order.role}.`
                });
            }

            if (
                !Number.isFinite(order.limit_price) ||
                order.limit_price <= 0 ||
                order.limit_price >= 1
            ) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid limit price for role ${order.role}.`
                });
            }
        }

        /*
         * Load the configured Kalshi account.
         *
         * This proves the gateway can resolve:
         * account_id -> API Key ID -> RSA private key
         *
         * We are NOT sending an order to Kalshi yet.
         */
        const account = getAccount(account_id);

        if (account.environment !== environment) {
            return res.status(400).json({
                success: false,
                error: 'Requested environment does not match the configured account environment.'
            });
        }

        console.log(
            `[KTRADER] Account loaded: ${account.account_id}`
        );

        console.log(
            `[KTRADER] Kalshi API Key ID available: ${!!account.api_key_id}`
        );

        console.log(
            `[KTRADER] RSA private key available: ${!!account.private_key}`
        );

        console.log(
            `[KTRADER] Valid execution request: ${execution_id}`
        );

        /*
         * Mark this execution_id as processed.
         *
         * IMPORTANT:
         * We do this only AFTER the complete request has passed validation
         * and the account configuration has loaded successfully.
         */
        processedExecutions.set(execution_id, {
            status: 'validated',
            trade_plan_id: trade_plan_id,
            account_id: account_id,
            timestamp: new Date().toISOString()
        });

        /*
         * No Kalshi orders are being submitted yet.
         */
        return res.status(200).json({
            success: true,
            execution_id: execution_id,
            trade_plan_id: trade_plan_id,
            account_id: account_id,
            environment: environment,
            message: 'Trade plan validated and trading account loaded. No orders submitted.',
            orders: sortedOrders
        });

    } catch (error) {

        console.error(
            '[KTRADER] execute-trade-plan error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error.'
        });
    }
});

module.exports = router;
