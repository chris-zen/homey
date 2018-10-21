export function floatMapper (digits) {
  return value => parseFloat(parseFloat(value).toFixed(digits))
}

export function identityMapper () {
  return value => value
}

export default { floatMapper, identityMapper }
