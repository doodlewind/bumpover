import { Bumpover } from './index'
import convert from 'xml-js'

export class XMLBumpover extends Bumpover {
  constructor (rules = [], options = []) {
    super(rules, options)
    this.options = {
      ...this.options,
      childrenKey: 'elements',
      serializer: convert.js2xml,
      deserializer: convert.xml2js
    }
  }
}
