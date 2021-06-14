import * as _ from 'lodash'
import * as pseudoloc from 'pseudoloc'
import { Compiler } from 'webpack'

/*
 * Generates pseudolocalization localizations for localization testing
 */
export class PseudolocalizerPlugin {
  private pseudoLocalizationsPath = 'locales/qps-ploc.json'

  public constructor(private baseLocalizationsPath: string) {
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.emit.tap('pseudolocalizer', (compilation) => {
      pseudoloc.option.startDelimiter = '{{'
      pseudoloc.option.endDelimiter = '}}'

      if (!(this.baseLocalizationsPath in compilation.assets)) {
        compilation.errors.push(`Failed to find ${this.baseLocalizationsPath} in ${_.join(_.keys(compilation.assets), ',')}. Unable to pseudolocalize file`)
        return
      }

      const translations = JSON.parse(compilation.assets[this.baseLocalizationsPath].source())
      const pseudolocalizedTranslations = this.pseudolocalizeTranslations(translations)

      compilation.assets[this.pseudoLocalizationsPath] = {
        source: () => pseudolocalizedTranslations,
        size: () => pseudolocalizedTranslations.length,
      }
    })
  }

  private pseudolocalizeTranslations(translations): string {
    return JSON.stringify(
      _.cloneDeepWith(translations, value =>
        _.isString(value)
          ? pseudoloc.str(value)
          : undefined)
    )
  }
}
