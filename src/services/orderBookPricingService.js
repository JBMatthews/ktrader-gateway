function priceYesContracts(orderBook, requestedContracts) {

    const requested =
        Number(requestedContracts);

    if (
        !Number.isFinite(requested) ||
        requested <= 0
    ) {
        throw new Error(
            'requestedContracts must be greater than 0.'
        );
    }


    const noLevels =
        orderBook?.orderbook_fp?.no_dollars || [];


    /*
     * Kalshi exposes bids.
     *
     * To BUY YES, we consume NO bids.
     *
     * Example:
     *
     * NO bid = $0.30
     * Implied YES purchase price = $0.70
     *
     * Higher NO bids therefore produce
     * cheaper YES purchase prices.
     */
    const yesAskLevels =
        noLevels
            .map(level => {

                const noPrice =
                    Number(level[0]);

                const quantity =
                    Number(level[1]);

                return {
                    price:
                        1 - noPrice,
                    quantity: quantity
                };

            })
            .filter(level =>
                Number.isFinite(level.price) &&
                Number.isFinite(level.quantity) &&
                level.quantity > 0
            )
            .sort(
                (a, b) =>
                    a.price - b.price
            );


    let remaining =
        requested;

    let purchased =
        0;

    let expectedCost =
        0;

    let highestRequiredPrice =
        null;

    const levelsUsed =
        [];


    for (const level of yesAskLevels) {

        if (remaining <= 0) {
            break;
        }

        const quantityToBuy =
            Math.min(
                remaining,
                level.quantity
            );

        const levelCost =
            quantityToBuy *
            level.price;


        purchased +=
            quantityToBuy;

        expectedCost +=
            levelCost;

        remaining -=
            quantityToBuy;

        highestRequiredPrice =
            level.price;


        levelsUsed.push({
            price:
                Number(
                    level.price.toFixed(4)
                ),

            available:
                level.quantity,

            quantity:
                quantityToBuy,

            cost:
                Number(
                    levelCost.toFixed(4)
                )
        });

    }


    const sufficientLiquidity =
        purchased >= requested;


    const averagePrice =
        purchased > 0
            ? expectedCost / purchased
            : null;


    return {
        requested_contracts:
            requested,

        available_contracts:
            purchased,

        sufficient_liquidity:
            sufficientLiquidity,

        expected_cost:
            Number(
                expectedCost.toFixed(4)
            ),

        average_price:
            averagePrice === null
                ? null
                : Number(
                    averagePrice.toFixed(4)
                ),

        highest_required_price:
            highestRequiredPrice === null
                ? null
                : Number(
                    highestRequiredPrice.toFixed(4)
                ),

        levels_used:
            levelsUsed
    };
}


module.exports = {
    priceYesContracts
};
