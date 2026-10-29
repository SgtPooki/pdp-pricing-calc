import { estimateOnboardingCost, estimateStorageCost } from '@filoz/synapse-core/warm-storage'
import { TIME_CONSTANTS } from '@filoz/synapse-core/utils'

export const KiB = 1024n
export const MiB = KiB * 1024n
export const GiB = MiB * 1024n
export const TiB = GiB * 1024n

/** Packing targets compared against storing each file as its own piece. */
export const PACK_SIZES = [1n * GiB, 32n * GiB, 64n * GiB]

// ponytail: files larger than the max piece size are counted as one piece each; split them if that matters
function strategy(label, pieceBytes, { priceList, totalBytes, months, piecesPerCall }) {
  const pieceCount = (totalBytes + pieceBytes - 1n) / pieceBytes
  const onboarding = estimateOnboardingCost({
    priceList,
    sizeInBytes: totalBytes,
    pieceCount,
    piecesPerAddPiecesCall: piecesPerCall,
  })
  const storage = estimateStorageCost({
    priceList,
    sizeInBytes: totalBytes,
    durationInEpochs: BigInt(months) * TIME_CONSTANTS.EPOCHS_PER_MONTH,
  })
  return {
    label,
    pieceBytes,
    pieceCount,
    onboarding,
    storage,
    total: onboarding.fees.total + storage.total,
  }
}

/** One data set, one copy: each file as its own piece vs packed into larger pieces. */
export function compare({ priceList, totalBytes, fileBytes, months, piecesPerCall = 126n }) {
  const opts = { priceList, totalBytes, months, piecesPerCall }
  return [
    strategy('Upload each file as-is', fileBytes, opts),
    ...PACK_SIZES.filter((size) => size > fileBytes).map((size) =>
      strategy(`Pack into ${size / GiB} GiB pieces`, size, opts)
    ),
  ]
}
