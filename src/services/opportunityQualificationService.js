function qualifyPackage(
    legs,
    constraints
) {

    if (
        !Array.isArray(legs) ||
        legs.length === 0
    ) {
        throw new Error(
            'legs are required.'
        );
    }


    const maxPackageAverage =
        Number(
            constraints?.max_package_average
        );


    if (
        !Number.isFinite(maxPackageAverage) ||
        maxPackageAverage <= 0 ||
        maxPackageAverage > 1
    ) {
        throw new Error(
            'max_package_average must be greater than 0 and less than or equal to 1.'
        );
    }


    let totalContracts =
        0;

    let totalCost =
        0;

    let allLegsHaveLiquidity =
        true;


    const evaluatedLegs =
        legs.map(leg => {

            if (!leg.pricing) {
                throw new Error(
                    `pricing is required for ${leg.role}.`
                );
            }


            const requestedContracts =
                Number(
                    leg.pricing.requested_contracts || 0
                );

            const availableContracts =
                Number(
                    leg.pricing.available_contracts || 0
                );

            const expectedCost =
                Number(
                    leg.pricing.expected_cost || 0
                );

            const sufficientLiquidity =
                leg.pricing.sufficient_liquidity === true;


            if (!sufficientLiquidity) {
                allLegsHaveLiquidity = false;
            }


            /*
             * For full-package qualification,
             * only count the requested position
             * when the pricing service confirms
             * that quantity can actually be filled.
             */
            if (sufficientLiquidity) {

                totalContracts +=
                    requestedContracts;

                totalCost +=
                    expectedCost;

            }


            return {
                role:
                    leg.role,

                ticker:
                    leg.ticker,

                requested_contracts:
                    requestedContracts,

                available_contracts:
                    availableContracts,

                expected_cost:
                    expectedCost,

                average_price:
                    leg.pricing.average_price,

                sufficient_liquidity:
                    sufficientLiquidity
            };

        });


    const packageAverage =
        totalContracts > 0
            ? totalCost / totalContracts
            : null;


    const priceQualified =
        allLegsHaveLiquidity &&
        packageAverage !== null &&
        packageAverage <= maxPackageAverage;


    const qualified =
        allLegsHaveLiquidity &&
        priceQualified;


    const reasons =
        [];


    if (!allLegsHaveLiquidity) {

        reasons.push(
            'Insufficient liquidity to complete the full package.'
        );

    }


    if (
        allLegsHaveLiquidity &&
        packageAverage !== null &&
        packageAverage > maxPackageAverage
    ) {

        reasons.push(
            `Package average ${packageAverage.toFixed(4)} exceeds maximum ${maxPackageAverage.toFixed(4)}.`
        );

    }


    return {
        qualified:
            qualified,

        max_package_average:
            maxPackageAverage,

        total_contracts:
            totalContracts,

        total_cost:
            Number(
                totalCost.toFixed(4)
            ),

        package_average:
            packageAverage === null
                ? null
                : Number(
                    packageAverage.toFixed(4)
                ),

        all_legs_have_liquidity:
            allLegsHaveLiquidity,

        price_qualified:
            priceQualified,

        legs:
            evaluatedLegs,

        reasons:
            reasons
    };
}


module.exports = {
    qualifyPackage
};