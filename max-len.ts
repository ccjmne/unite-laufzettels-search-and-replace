import { ReplaySubject, Subject, from, fromEvent, map, switchMap, withLatestFrom } from 'rxjs'

import { CharcountInput } from './charcount-input'
import { make, poll } from './utils'

async function toggleEdit(): Promise<unknown> {
  await poll(() => document.querySelectorAll('img.gwt-Image').length >= 3)
  return (Array.from(document.querySelectorAll('img.gwt-Image')).at(-1)!).dispatchEvent(new MouseEvent('click'))
}

async function getTextArea(): Promise<HTMLTextAreaElement> {
  if (document.querySelector('textarea') === null) {
    await toggleEdit()
  }

  return document.querySelector('textarea')!
}

function init() {
  const panel = make('div', {
    parent: document.body,
    styles: {
      position: 'fixed',
      top: '10vh',
      right: '0px',
      transform: 'translate(100%)',
      background: 'ghostwhite',
      color: 'darkSlateGrey',
      border: '1px solid #ff9900',
      borderRight: '0',
      borderRadius: '0 0 0 10px',
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.16)) drop-shadow(0 3px 6px rgba(0,0,0,0.23))',
      transition: 'transform 150ms ease-out',
    },
  })

  make('button', {
    parent: panel,
    content: '◀',
    styles: {
      height: '50px',
      width: '60px',
      background: '#ffcc66',
      color: 'darkSlateGrey',
      cursor: 'pointer',
      position: 'absolute',
      top: '-1px',
      left: '0',
      transform: 'translate(-100%)',
      border: '1px solid #ff9900',
      borderRight: '0',
      borderRadius: '10px 0 0 10px',
    },
  }).addEventListener('click', function toggleExpand() {
    panel.style.transform = this.textContent === '◀' ? 'translate(0%)' : 'translate(100%)'
    this.textContent = this.textContent === '◀' ? '▶' : '◀'
  })

  const main = make('form', {
    parent: panel,
    attrs: { action: 'javascript:void(0)' }, // eslint-disable-line no-script-url
    styles: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'stretch',
      gap: '5px',
      margin: '20px',
      width: '350px',
    },
  })

  const search = new CharcountInput('search', 'Search string')
  const replace = new CharcountInput('replace', 'Replacement')
  const apply = make('button', { content: 'No matches', attrs: { type: 'submit', disabled: 'true' } })
  const undo = make('button', { content: 'Undo', attrs: { disabled: 'true' } })

  main.appendChild(search)
  main.appendChild(replace)

  make('div', {
    parent: main,
    content: [apply, undo],
    styles: {
      background: 'rgb(195, 217, 255)',
      margin: '5px -20px -20px',
      padding: '12px 20px 12px',
      borderTop: '1px solid rgb(135, 179, 255)',
      borderBottomLeftRadius: '10px',
      display: 'grid',
      gridTemplate: 'auto / auto auto',
      gap: '10px',
    },
  })

  search.change$.pipe(
    switchMap(searchStr => from(getTextArea()).pipe(
      map(textArea => [textArea, searchStr] as const),
    )),
  ).subscribe(([textArea, searchStr]) => {
    const matches = searchStr.length === 0 ? 0 : textArea.value.match(new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))?.length ?? 0
    apply.textContent = matches ? `Replace ${matches} matches` : 'No matches'
    apply.disabled = !matches
  })

  async function update(replacment: string, undoable: boolean): Promise<void> {
    const textArea = await getTextArea()
    textArea.value = replacment
    textArea.dispatchEvent(new Event('change', { bubbles: true }))

    search.disabled = true
    replace.disabled = true
    apply.disabled = true
    undo.disabled = true
    await poll(() => document.body.innerHTML.search('XML wird geprueft und formatiert') !== -1)
    await poll(() => document.body.innerHTML.search('XML wird geprueft und formatiert') === -1)

    search.value = ''
    replace.value = ''
    search.disabled = false
    replace.disabled = false
    apply.disabled = false
    undo.disabled = !undoable
    await toggleEdit()
  }

  const update$: Subject<[string, string]> = new ReplaySubject(1)
  fromEvent(apply, 'click').pipe(
    switchMap(() => from(getTextArea()).pipe(map(textArea => [textArea.value, textArea.value.replaceAll(search.value, replace.value)]))),
  ).subscribe(update$)

  update$.subscribe(([, cur]) => void update(cur, true))

  fromEvent(undo, 'click')
    .pipe(withLatestFrom(update$))
    .subscribe(([, [prev]]) => void update(prev, false))
}

// TODO: better init, also clean up when changing pages

let oldHref: string | null = null
const observer = new MutationObserver(mutations => mutations.forEach(() => {
  if (oldHref !== document.location.href) {
    oldHref = document.location.href

    if (/^#(CommissionOrder|ORDER):C?\d+(-\d+)?$/.test(window.location.hash)) {
      init()
    }
  }
}))

observer.observe(document.body, { childList: true, subtree: true })
