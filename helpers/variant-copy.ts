import { ProductVariant } from '../models'

/**
 * Deep-clones a variant group so it can be saved onto another category/product as a
 * brand new record. All ids (variant + options) are stripped so the backend creates
 * fresh rows, and the parent references (productId/categoryId) are dropped.
 */
export const cloneVariantForCopy = (variant: ProductVariant): ProductVariant => {
  const clone = JSON.parse(JSON.stringify(variant))

  clone.id = null
  delete clone.productId
  delete clone.categoryId

  clone.options = (clone.options || []).map((option: any, index: number) => ({
    ...option,
    id: null,
    orderIndex: index
  }))

  return clone
}

/**
 * Returns a new variant list where `sourceVariant` has been copied into
 * `existingVariants`. If a group with the same (case-insensitive, trimmed) name already
 * exists it is replaced in place — keeping the existing group's id so it is updated
 * rather than orphaned — otherwise the copy is appended. Order indexes are re-assigned.
 */
export const mergeVariantByName = (
  existingVariants: Array<ProductVariant>,
  sourceVariant: ProductVariant
): Array<ProductVariant> => {
  const merged = (existingVariants || []).map(v => ({ ...v }))
  const clone = cloneVariantForCopy(sourceVariant)

  const targetName = (clone.name || '').trim().toLowerCase()
  const existingIndex = merged.findIndex(
    v => (v.name || '').trim().toLowerCase() === targetName
  )

  if (existingIndex !== -1) {
    // Replace in place, keeping the existing group's id so this is an update.
    clone.id = merged[existingIndex].id
    merged.splice(existingIndex, 1, clone)
  } else {
    merged.push(clone)
  }

  merged.forEach((variant, index) => {
    variant.orderIndex = index
  })

  return merged
}
