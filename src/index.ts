import * as _ from 'lodash'
import * as pseudoloc from 'pseudoloc'
import { Compiler, WebpackError, sources, Compilation } from 'webpack'

/*
 * Generates pseudolocalization localizations for localization testing
 */
export class PseudolocalizerPlugin {
  private pseudoLocalizationsPath = 'locales/qps-ploc.json'

  public constructor(private baseLocalizationsPath: string) {
  }

  public apply(compiler: Compiler): void {
    const { RawSource } = sources;

    compiler.hooks.thisCompilation.tap(
      'pseudolocalizer',
      compilation => {
        compilation.hooks.processAssets.tap(
          { name: 'pseudolocalizer', stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
          assets => {
            pseudoloc.option.startDelimiter = '{{'
            pseudoloc.option.endDelimiter = '}}'

            if (!(this.baseLocalizationsPath in assets)) {
              compilation.errors.push(
                new WebpackError(`Failed to find ${this.baseLocalizationsPath} in ${_.join(_.keys(compilation.assets), ',')}.Unable to pseudolocalize file`)
              )
              return
            }

            const translations = JSON.parse(compilation.assets[this.baseLocalizationsPath].source().toString())
            const pseudolocalizedTranslations = this.pseudolocalizeTranslations(translations)

            compilation.emitAsset(
              this.pseudoLocalizationsPath,
              new RawSource(pseudolocalizedTranslations)
            )
          }
        )
      }
    )
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
