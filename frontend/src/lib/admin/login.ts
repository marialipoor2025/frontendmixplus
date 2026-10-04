import { permissionsForRole } from "@/lib/admin/permissions";
import type { AdminRole, AdminSession, AdminUser } from "@/types/admin";

type MockAccount = {
  email: string;
  password: string;
  id: string;
  displayName: string;
  role: AdminRole;
};

const ACCOUNTS: MockAccount[] = [
  {
    email: "admin@mixplus.ir",
    password: "admin123",
    id: "adm-1",
    displayName: "مدیر MixPlus",
    role: "super_admin",
  },
  {
    email: "catalog@mixplus.ir",
    password: "catalog123",
    id: "adm-2",
    displayName: "مدیر کاتالوگ",
    role: "catalog_manager",
  },
  {
    email: "ops@mixplus.ir",
    password: "ops123",
    id: "adm-3",
    displayName: "مدیر عملیات",
    role: "ops_manager",
  },
  {
    email: "support@mixplus.ir",
    password: "support123",
    id: "adm-4",
    displayName: "پشتیبان فروش",
    role: "support",
  },
];

/** Mock admin login until Identity staff APIs exist. */
export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminSession> {
  await new Promise((r) => setTimeout(r, 350));
  const normalized = email.trim().toLowerCase();
  const account = ACCOUNTS.find(
    (a) => a.email === normalized && a.password === password,
  );
  if (!account) {
    throw new Error("ایمیل یا رمز عبور نادرست است");
  }
  const user: AdminUser = {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    permissions: permissionsForRole(account.role),
  };
  return {
    accessToken: `mock-admin.${account.id}.${Date.now()}`,
    user,
  };
}

export const MOCK_ADMIN_ACCOUNTS = ACCOUNTS.map(({ email, password, role }) => ({
  email,
  password,
  role,
}));
