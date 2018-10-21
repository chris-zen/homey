
export function regexFromTopic (topic) {
  const pattern = topic.replace('+', '(.*?)').replace('#', '(.*$)')
  return new RegExp(pattern)
}

export function currentTimestampSecs () {
  return Date.now() / 1000
}

export default { regexFromTopic, currentTimestampSecs }
