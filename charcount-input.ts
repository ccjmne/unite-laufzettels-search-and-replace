import { Observable, Subject, fromEvent, map, startWith, takeUntil } from 'rxjs'

import { make } from './utils'

export const TAG = 'charcount-input'

const textArea = document.createElement('textarea')
function decodeHTMLEntities(text: string): string {
  textArea.innerHTML = text
  return textArea.value
}

export class CharcountInput extends HTMLElement {

  private readonly disconnect$: Subject<true> = new Subject()
  private input: HTMLInputElement
  private count: HTMLSpanElement

  public get value(): string {
    return this.input.value
  }

  public set value(value: string) {
    this.input.value = value
    this.input.dispatchEvent(new Event('input'))
  }

  public get disabled(): boolean {
    return this.input.disabled
  }

  public set disabled(disabled: boolean) {
    this.input.disabled = disabled
  }

  constructor(name: string, label: string) {
    super()
    this.style.display = 'grid'
    this.input = make('input', { attrs: { name } })
    this.count = make('span', { content: 'character count: 0', styles: { textAlign: 'right' } })
    this.appendChild(make('label', { attrs: { for: name }, styles: { letterSpacing: '1px' }, content: label }))
    this.appendChild(this.input)
    this.appendChild(this.count)
  }

  public get change$(): Observable<string> {
    return fromEvent<InputEvent>(this.input, 'input').pipe(
      map(({ target }) => (target as HTMLInputElement).value),
      startWith(this.input.value),
      takeUntil(this.disconnect$),
    )
  }

  public connectedCallback(): void {
    this.change$
      .pipe(map(value => [value.length, decodeHTMLEntities(value).length]))
      .subscribe(([length, decodedLength]) => {
        this.count.textContent = `character count: ${length}`
        if (decodedLength !== length) {
          this.count.textContent += ` (${decodedLength} once decoded)`
        }
      })
  }

  public disconnectedCallback(): void {
    this.disconnect$.next(true)
  }

}

customElements.define(TAG, CharcountInput)
