export function assertPermission(can, role, module, action) { if (!can(role, module, action)) throw new Error(`Unauthorized: ${action} ${module}`) }
