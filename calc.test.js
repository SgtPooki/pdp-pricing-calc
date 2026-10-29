import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compare, GiB, MiB, TiB } from './calc.js'

// Mainnet price list as of 2026-10-29 (USDFC, 18 decimals).
const e = (usd) => BigInt(Math.round(usd * 1000)) * 10n ** 15n
const priceList = {
  rates: { storagePerTibPerMonth: e(2.5), datasetFeePerMonth: e(0.12), cdnEgressPerTib: e(7), cacheMissEgressPerTib: e(7) },
  fees: { createDataSetFee: e(0.025), addPiecesBaseFee: e(0.008), addPiecesPerPieceFee: e(0.003), schedulePieceRemovalsFee: e(0.007), terminateFee: e(0.006) },
  lockups: { lifecycleReserveTarget: e(0.5), replenishThreshold: e(0.025), defaultLockupPeriod: 86400n, cdnLockupAmount: e(0.7), cacheMissLockupAmount: e(0.3), cdnLockupPeriod: 14400n },
}

test('packing 10 TiB of 10 MiB files cuts piece fees from thousands to cents', () => {
  const [oneByOne, asIs, , , packed64] = compare({ priceList, totalBytes: 10n * TiB, fileBytes: 10n * MiB, months: 12 })
  assert.equal(oneByOne.onboarding.addPiecesCalls, 1048576n)
  assert.ok(oneByOne.onboarding.fees.total > asIs.onboarding.fees.total)
  assert.equal(asIs.pieceCount, 1048576n)
  assert.equal(packed64.pieceCount, 160n)
  assert.ok(asIs.onboarding.fees.total > e(3000))
  assert.ok(packed64.onboarding.fees.total < e(1))
})

test('skips pack sizes not larger than the files', () => {
  const rows = compare({ priceList, totalBytes: 10n * TiB, fileBytes: 32n * GiB, months: 1 })
  assert.deepEqual(rows.map((r) => r.pieceBytes), [32n * GiB, 32n * GiB, 64n * GiB])
})
