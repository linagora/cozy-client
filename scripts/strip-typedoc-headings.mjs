/**
 * Used to replace typedoc headings level 4/5 by emphasis text.
 * Otherwise, the headings are present in the right navigation and
 * this is too much.
 */

'use strict'

import { visit } from 'unist-util-visit'

const typedocHeadingsToStrip = {
  'Defined in': true,
  Parameters: true,
  Returns: true,
  'Type declaration': true,
  'Inherited from': true,
  Overrides: true
}

const isTypedocHeadingToStrip = node => {
  return (
    node.type === 'heading' &&
    node.children.length == 1 &&
    (node.depth == 4 || node.depth == 5) &&
    typedocHeadingsToStrip[node.children[0].value]
  )
}

export default function () {
  function transform(node) {
    if (isTypedocHeadingToStrip(node)) {
      node.type = 'emphasis'
    }
    return node
  }

  function transformer(tree) {
    visit(tree, n => {
      return transform(n)
    })
  }

  return transformer
}
