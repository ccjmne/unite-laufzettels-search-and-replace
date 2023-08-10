export function make<T extends keyof HTMLElementTagNameMap>(
  type: T,
  { id, classes, styles, attrs, content, parent }: {
    id?: string;
    classes?: string[];
    styles?: Partial<CSSStyleDeclaration>;
    attrs?: Record<string, string>;
    content?: string | HTMLElement[];
    parent?: HTMLElement;
  } = {},
): HTMLElementTagNameMap[T] {
  const e = document.createElement(type)
  if (typeof id !== 'undefined') {
    e.id = id
  }

  if (typeof classes !== 'undefined') {
    classes.forEach(c => e.classList.add(c))
  }

  if (typeof styles !== 'undefined') {
    Object.assign(e.style, styles)
  }

  if (typeof attrs !== 'undefined') {
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v))
  }

  if (typeof parent !== 'undefined') {
    parent.appendChild(e)
  }

  if (typeof content === 'string') {
    e.textContent = content
  }

  if (Array.isArray(content)) {
    content.forEach(child => e.appendChild(child))
  }

  return e
}

export function poll(when: () => boolean, interval = 10): Promise<void> {
  return new Promise<void>(resolve => {
    const i = setInterval(() => {
      if (when()) {
        clearInterval(i)
        resolve()
      }
    }, interval)
  })
}
