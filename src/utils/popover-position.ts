export interface PopoverPositionOptions {
  triggerRect: DOMRect
  menuWidth: number
  menuHeight: number
  align?: 'left' | 'right'
  preferPlacement?: 'top' | 'bottom'
  offset?: number
  viewportPadding?: number
}

export interface PopoverCoordinates {
  top: number
  left: number
}

export function computePopoverPosition({
  triggerRect,
  menuWidth,
  menuHeight,
  align = 'left',
  preferPlacement = 'bottom',
  offset = 6,
  viewportPadding = 12,
}: PopoverPositionOptions): PopoverCoordinates {
  const viewportWidth =
    typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 1024
  const viewportHeight =
    typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 768

  let left =
    align === 'right' ? triggerRect.right - menuWidth : triggerRect.left

  if (left + menuWidth > viewportWidth - viewportPadding) {
    left = viewportWidth - menuWidth - viewportPadding
  }
  if (left < viewportPadding) {
    left = viewportPadding
  }

  const spaceBelow = viewportHeight - triggerRect.bottom - viewportPadding - offset
  const spaceAbove = triggerRect.top - viewportPadding - offset

  let top: number
  if (preferPlacement === 'top') {
    if (spaceAbove >= menuHeight || spaceAbove >= spaceBelow) {
      top = triggerRect.top - menuHeight - offset
    } else {
      top = triggerRect.bottom + offset
    }
  } else {
    if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
      top = triggerRect.bottom + offset
    } else {
      top = triggerRect.top - menuHeight - offset
    }
  }

  if (top + menuHeight > viewportHeight - viewportPadding) {
    top = viewportHeight - menuHeight - viewportPadding
  }
  if (top < viewportPadding) {
    top = viewportPadding
  }

  return { top, left }
}

