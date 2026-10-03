function calculateYesPositionCost(
    fillsResponse,
    currentOwned
) {

    const owned =
        Number(currentOwned);


    if (
        !Number.isFinite(owned) ||
        owned < 0
    ) {
        throw new Error(
            'currentOwned must be greater than or equal to 0.'
        );
    }


    if (owned === 0) {

        return {
            owned_contracts: 0,
            owned_cost: 0,
            average_acquisition_price: null,
            matched_contracts: 0
        };

    }


    const fills =
        fillsResponse?.fills || [];


    /*
     * KTRADER's current accumulator model
     * is interested in YES contracts that
     * were purchased.
     */
    const yesBuyFills =
        fills
            .filter(fill =>
                fill.action === 'buy' &&
                fill.side === 'yes'
            )
            .map(fill => ({
                quantity:
                    Number(fill.count_fp),

                price:
                    Number(
                        fill.yes_price_dollars
                    ),

                created_time:
                    fill.created_time
            }))
            .filter(fill =>
                Number.isFinite(fill.quantity) &&
                fill.quantity > 0 &&
                Number.isFinite(fill.price) &&
                fill.price >= 0 &&
                fill.price <= 1
            );


    /*
     * Use newest fills first.
     *
     * For the current KTRADER accumulator
     * this lets us identify enough purchase
     * history to account for the YES position
     * Kalshi says we currently own.
     *
     * This is intentionally NOT a complete
     * buy/sell inventory accounting system.
     */
    yesBuyFills.sort(
        (a, b) =>
            new Date(b.created_time) -
            new Date(a.created_time)
    );


    let remainingToMatch =
        owned;

    let matchedContracts =
        0;

    let ownedCost =
        0;


    for (const fill of yesBuyFills) {

        if (remainingToMatch <= 0) {
            break;
        }


        const quantityToMatch =
            Math.min(
                remainingToMatch,
                fill.quantity
            );


        matchedContracts +=
            quantityToMatch;

        ownedCost +=
            quantityToMatch *
            fill.price;

        remainingToMatch -=
            quantityToMatch;

    }


    /*
     * We should not silently invent a cost
     * basis when the fill history cannot
     * account for the current position.
     */
    if (matchedContracts < owned) {

        throw new Error(
            `Fill history accounts for ${matchedContracts} YES contracts, but current position owns ${owned}.`
        );

    }


    const averageAcquisitionPrice =
        ownedCost / owned;


    return {
        owned_contracts:
            owned,

        owned_cost:
            Number(
                ownedCost.toFixed(4)
            ),

        average_acquisition_price:
            Number(
                averageAcquisitionPrice.toFixed(4)
            ),

        matched_contracts:
            matchedContracts
    };
}


module.exports = {
    calculateYesPositionCost
};
