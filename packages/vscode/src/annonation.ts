import { relative } from 'path'
import type { DecorationOptions, ExtensionContext, StatusBarItem } from 'vscode'
import { DecorationRangeBehavior, MarkdownString, Range, window, workspace } from 'vscode'
import type { UnocssPluginContext } from '@unocss/core'
import { INCLUDE_COMMENT_IDE, getMatchedPositions } from './integration'
import { log } from './log'
import { getPrettiedMarkdown, isCssId, throttle } from './utils'

export async function registerAnnonations(
  cwd: string,
  context: UnocssPluginContext,
  status: StatusBarItem,
  ext: ExtensionContext,
) {
  const { sources } = await context.ready
  const { uno, filter } = context
  let underline: boolean = workspace.getConfiguration().get('unocss.underline') ?? true
  ext.subscriptions.push(workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('unocss.underline')) {
      underline = workspace.getConfiguration().get('unocss.underline') ?? true
      updateAnnotation()
    }
  }))

  workspace.onDidSaveTextDocument(async (doc) => {
    if (sources.includes(doc.uri.fsPath)) {
      try {
        await context.reloadConfig()
        log.appendLine(`Config reloaded by ${relative(cwd, doc.uri.fsPath)}`)
      }
      catch (e) {
        log.appendLine('Error on loading config')
        log.appendLine(String(e))
      }
    }
  })

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const NoneDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  async function updateAnnotation(editor = window.activeTextEditor) {
    try {
      const doc = editor?.document
      if (!doc)
        return reset()

      const code = doc.getText()
      const id = doc.uri.fsPath

      if (!code || (!code.includes(INCLUDE_COMMENT_IDE) && !isCssId(id) && !filter(code, id)))
        return reset()

      const result = await uno.generate(code, { id, preflights: false, minify: true })

      const ranges: DecorationOptions[] = (
        await Promise.all(
          getMatchedPositions(code, Array.from(result.matched))
            .map(async (i): Promise<DecorationOptions> => {
              try {
                const md = await getPrettiedMarkdown(uno, i[2])
                return {
                  range: new Range(doc.positionAt(i[0]), doc.positionAt(i[1])),
                  get hoverMessage() {
                    return new MarkdownString(md)
                  },
                }
              }
              catch (e) {
                log.appendLine(`Failed to parse ${i[2]}`)
                log.appendLine(String(e))
                return undefined!
              }
            }),
        )
      ).filter(Boolean)

      if (underline) {
        editor.setDecorations(NoneDecoration, [])
        editor.setDecorations(UnderlineDecoration, ranges)
      }
      else {
        editor.setDecorations(UnderlineDecoration, [])
        editor.setDecorations(NoneDecoration, ranges)
      }

      status.text = `UnoCSS: ${result.matched.size}`
      status.tooltip = new MarkdownString(`${result.matched.size} utilities used in this file`)
      status.show()

      function reset() {
        editor?.setDecorations(UnderlineDecoration, [])
        editor?.setDecorations(NoneDecoration, [])
        status.hide()
      }
    }
    catch (e) {
      log.appendLine('Error on annotation')
      log.appendLine(String(e))
    }
  }

  const throttledUpdateAnnotation = throttle(updateAnnotation, 200)

  window.onDidChangeActiveTextEditor(updateAnnotation)
  workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      throttledUpdateAnnotation()
  })

  await updateAnnotation()
}
