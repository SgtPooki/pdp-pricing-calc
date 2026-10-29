# pdp-pricing-calc

Storage cost calculator for Filecoin Onchain Cloud: https://sgtpooki.github.io/pdp-pricing-calc/

Compares uploading files as-is against packing them into larger pieces, for 2 copies by default (each copy is its own data set). All math comes from `estimateOnboardingCost` and `estimateStorageCost` in [`@filoz/synapse-core`](https://www.npmjs.com/package/@filoz/synapse-core), priced from the live on-chain price list.

Static page, no build. `npm install && npm test` runs the checks.
