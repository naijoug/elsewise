/** A topic may retain multiple historical routes/record IDs. Never delete old data on read. */
export function topicIds(id: string): string[] {
  return ['closure', 'feature:closures'].includes(id)
    ? ['feature:closures', 'closure']
    : [id];
}
export function hasTopic(ids: string[], id: string) {
  return topicIds(id).some((key) => ids.includes(key));
}
export function toggledTopic(ids: string[], id: string) {
  return hasTopic(ids, id)
    ? ids.filter((key) => !topicIds(id).includes(key))
    : [...ids, topicIds(id)[0]];
}
