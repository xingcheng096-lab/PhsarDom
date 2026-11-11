export function activityEntry({ actor, module, entityType, entityId, action, before = null, after = null, result = 'success', timestamp = new Date().toISOString() }) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp, actorId: actor?.key || 'system', actorName: actor?.name || 'System', actorRole: actor?.label || 'System', module, entityType, entityId, action, before, after, result }
}
