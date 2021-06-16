import * as fs from 'fs'
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
    compiler.hooks.emit.tap('pseudolocalizer', compilation => {
      pseudoloc.option.startDelimiter = '{{'
      pseudoloc.option.endDelimiter = '}}'

      const translations = JSON.parse(
        fs.readFileSync('src/shared/' + this.baseLocalizationsPath).toString()
      );
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
