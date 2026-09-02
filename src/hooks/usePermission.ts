import { useAuth } from '@/store/useAuth'
import { UserRole } from '@/db'

type Permission =
  | 'view_pos'
  | 'view_inventory'
  | 'manage_inventory'
  | 'view_customers'
  | 'manage_customers'
  | 'view_history'
  | 'view_reports'
  | 'view_settings'
  | 'manage_users'
  | 'open_cash_drawer'

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_pos',
    'view_inventory',
    'manage_inventory',
    'view_customers',
    'manage_customers',
    'view_history',
    'view_reports',
    'view_settings',
    'manage_users',
    'open_cash_drawer',
  ],
  manager: [
    'view_pos',
    'view_inventory',
    'manage_inventory',
    'view_customers',
    'manage_customers',
    'view_history',
    'open_cash_drawer',
  ],
  cashier: [
    'view_pos',
    'view_customers',
    'open_cash_drawer',
  ],
  bookkeeper: [
    'view_history',
    'view_reports',
  ],
}

export function usePermission() {
  const { user } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.role) return false
    return rolePermissions[user.role].includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user || !user.role) return false
    return permissions.some((p) => rolePermissions[user.role].includes(p))
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const isManager = (): boolean => {
    return user?.role === 'manager'
  }

  const isCashier = (): boolean => {
    return user?.role === 'cashier'
  }

  const isBookkeeper = (): boolean => {
    return user?.role === 'bookkeeper'
  }

  return {
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isManager,
    isCashier,
    isBookkeeper,
  }
}
