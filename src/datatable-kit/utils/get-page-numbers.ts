/**
 * DataTable Kit - Page Numbers Utility
 * 
 * Calculate visible page numbers for pagination component
 */

/**
 * Generate page numbers array for pagination
 * 
 * @example
 * ```ts
 * // Current page 5, total 10 pages, show 5 numbers
 * getPageNumbers(5, 10, 5)
 * // Returns: [3, 4, 5, 6, 7]
 * 
 * // Current page 1, total 10 pages
 * getPageNumbers(1, 10, 5)
 * // Returns: [1, 2, 3, 4, 5]
 * 
 * // Current page 10, total 10 pages
 * getPageNumbers(10, 10, 5)
 * // Returns: [6, 7, 8, 9, 10]
 * ```
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  // Validate inputs
  if (totalPages <= 0) return []
  if (currentPage < 1) currentPage = 1
  if (currentPage > totalPages) currentPage = totalPages
  if (maxVisible < 1) maxVisible = 1

  // If total pages less than max visible, show all
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // Calculate start and end positions
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1

  // Adjust if end exceeds total pages
  if (end > totalPages) {
    end = totalPages
    start = Math.max(1, end - maxVisible + 1)
  }

  // Generate array
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Generate page numbers with ellipsis for large page counts
 * 
 * @example
 * ```ts
 * getPageNumbersWithEllipsis(5, 20, 3)
 * // Returns: [1, '...', 4, 5, 6, '...', 20]
 * 
 * getPageNumbersWithEllipsis(1, 20, 3)
 * // Returns: [1, 2, 3, '...', 20]
 * 
 * getPageNumbersWithEllipsis(20, 20, 3)
 * // Returns: [1, '...', 18, 19, 20]
 * ```
 */
export function getPageNumbersWithEllipsis(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | string)[] {
  // Validate inputs
  if (totalPages <= 0) return []
  if (currentPage < 1) currentPage = 1
  if (currentPage > totalPages) currentPage = totalPages

  // Total numbers to show (current + siblings on each side + first + last + 2 ellipsis)
  const totalNumbers = siblingCount * 2 + 3
  const totalBlocks = totalNumbers + 2

  // If total pages fit in available space, show all
  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const shouldShowLeftEllipsis = leftSiblingIndex > 2
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1

  const ELLIPSIS = '...'

  // Case 1: No left ellipsis, show right ellipsis
  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftRange = Array.from(
      { length: siblingCount * 2 + 2 },
      (_, i) => i + 1
    )
    return [...leftRange, ELLIPSIS, totalPages]
  }

  // Case 2: Show left ellipsis, no right ellipsis
  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightRange = Array.from(
      { length: siblingCount * 2 + 2 },
      (_, i) => totalPages - siblingCount * 2 - 1 + i
    )
    return [1, ELLIPSIS, ...rightRange]
  }

  // Case 3: Show both ellipsis
  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    )
    return [1, ELLIPSIS, ...middleRange, ELLIPSIS, totalPages]
  }

  return []
}

/**
 * Calculate pagination info
 * 
 * @example
 * ```ts
 * getPaginationInfo(2, 10, 100)
 * // Returns: {
 * //   from: 11,
 * //   to: 20,
 * //   total: 100,
 * //   currentPage: 2,
 * //   totalPages: 10
 * // }
 * ```
 */
export function getPaginationInfo(
  currentPage: number,
  pageSize: number,
  totalItems: number
): {
  from: number
  to: number
  total: number
  currentPage: number
  totalPages: number
} {
  const totalPages = Math.ceil(totalItems / pageSize)
  const validPage = Math.max(1, Math.min(currentPage, totalPages))
  
  const from = (validPage - 1) * pageSize + 1
  const to = Math.min(validPage * pageSize, totalItems)

  return {
    from,
    to,
    total: totalItems,
    currentPage: validPage,
    totalPages,
  }
}
