/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import TechnicalIndicator from '../TechnicalIndicator'
import { VOL } from '../technicalIndicatorType'

export default class Volume extends TechnicalIndicator {
  constructor () {
    super({
      name: VOL,
      calcParams: [5, 10, 20],
      isVolumeTechnicalIndicator: true,
      baseValue: 0,
      minValue: 0,
      plots: [
        { key: 'ma5', line: 'line' },
        { key: 'ma10', line: 'line' },
        { key: 'ma20', line: 'line' },
        {
          key: 'num',
          type: 'bar',
          referenceValue: 0,
          color: (data, options) => {
            const kLineData = data.currentData.kLineData || {}
            if (kLineData.close > kLineData.open) {
              return options.bar.upColor
            } else if (kLineData.close < kLineData.open) {
              return options.bar.downColor
            }
            return options.bar.noChangeColor
          }
        }
      ]
    })
  }

  regeneratePlots (params) {
    const plots = []
    params.forEach(p => {
      plots.push({ key: `ma${p}`, type: 'line' })
    })
    plots.push({
      key: 'num',
      type: 'bar',
      referenceValue: 0,
      color: (data, options) => {
        const kLineData = data.currentData.kLineData || {}
        if (kLineData.close > kLineData.open) {
          return options.bar.upColor
        } else if (kLineData.close < kLineData.open) {
          return options.bar.downColor
        }
        return options.bar.noChangeColor
      }
    })
    return plots
  }

  calcTechnicalIndicator (dataList, calcParams) {
    const paramCount = calcParams.length
    const volSums = []
    const result = []
    this._calc(dataList, i => {
      const volume = dataList[i].volume
      const vol = { num: volume }
      for (let j = 0; j < paramCount; j++) {
        volSums[j] = (volSums[j] || 0) + volume
        const p = calcParams[j]
        if (i >= p - 1) {
          vol[this.plots[j].key] = volSums[j] / p
          volSums[j] -= dataList[i - (p - 1)].volume
        }
      }
      result.push(vol)
    })
    return result
  }
}