"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  GradientFrame,
  ProfileButton,
  ProfileCard,
  ProfileOutlineButton,
  ProfileShell,
} from "@/components/profile/ProfileShell";
import { mockAddresses, type ProfileAddress } from "@/lib/mocks/profile";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<ProfileAddress[]>(mockAddresses);
  const [editing, setEditing] = useState<ProfileAddress | null>(null);

  const sorted = useMemo(
    () => [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [addresses],
  );

  function remove(id: string) {
    setAddresses((list) => list.filter((a) => a.id !== id));
  }

  function setDefault(id: string) {
    setAddresses((list) =>
      list.map((a) => ({ ...a, isDefault: a.id === id })),
    );
  }

  function save(address: ProfileAddress) {
    setAddresses((list) => {
      const exists = list.some((a) => a.id === address.id);
      const next = exists
        ? list.map((a) => (a.id === address.id ? address : a))
        : [...list, address];
      if (address.isDefault) {
        return next.map((a) => ({ ...a, isDefault: a.id === address.id }));
      }
      return next;
    });
    setEditing(null);
  }

  return (
    <ProfileShell title="آدرس‌ها">
      <div className="mb-3 flex justify-end">
        <ProfileButton
          type="button"
          onClick={() =>
            setEditing({
              id: `addr-${Date.now()}`,
              title: "",
              receiverName: "",
              phone: "",
              province: "",
              city: "",
              postalCode: "",
              addressLine: "",
              isDefault: addresses.length === 0,
            })
          }
        >
          افزودن آدرس
        </ProfileButton>
      </div>

      {editing ? (
        <AddressForm
          value={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState message="هنوز آدرسی ثبت نکرده‌اید." />
      ) : (
        <ul className="space-y-3">
          {sorted.map((addr) => (
            <li key={addr.id}>
              <ProfileCard>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">
                      {addr.title || "آدرس"}
                      {addr.isDefault ? (
                        <span className="ms-2 rounded bg-[var(--color-primary-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                          پیش‌فرض
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-neutral-700)]">
                      {addr.receiverName} · <span dir="ltr">{addr.phone}</span>
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">
                      {addr.province}، {addr.city} — {addr.addressLine}
                      {addr.postalCode ? ` · کدپستی ${addr.postalCode}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  <button
                    type="button"
                    className="text-[var(--color-icon-secondary)]"
                    onClick={() => setEditing(addr)}
                  >
                    ویرایش
                  </button>
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      className="text-[var(--color-icon-secondary)]"
                      onClick={() => setDefault(addr.id)}
                    >
                      پیش‌فرض
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-[var(--color-primary)]"
                    onClick={() => remove(addr.id)}
                  >
                    حذف
                  </button>
                </div>
              </ProfileCard>
            </li>
          ))}
        </ul>
      )}
    </ProfileShell>
  );
}

function AddressForm({
  value,
  onSave,
  onCancel,
}: {
  value: ProfileAddress;
  onSave: (a: ProfileAddress) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(value);

  return (
    <ProfileCard className="mb-4">
      <h2 className="mb-3 text-sm font-bold">فرم آدرس</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["title", "عنوان"],
            ["receiverName", "گیرنده"],
            ["phone", "موبایل"],
            ["province", "استان"],
            ["city", "شهر"],
            ["postalCode", "کدپستی"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            <span className="mb-1 block text-xs text-[var(--color-muted)]">{label}</span>
            <GradientFrame radius="rounded-lg">
              <input
                value={form[key]}
                dir={key === "phone" || key === "postalCode" ? "ltr" : undefined}
                onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                className="w-full rounded-[7px] bg-white px-3 py-2 text-sm outline-none"
              />
            </GradientFrame>
          </label>
        ))}
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-xs text-[var(--color-muted)]">نشانی کامل</span>
          <GradientFrame radius="rounded-lg">
            <textarea
              value={form.addressLine}
              rows={3}
              onChange={(e) => setForm((s) => ({ ...s, addressLine: e.target.value }))}
              className="w-full rounded-[7px] bg-white px-3 py-2 text-sm outline-none"
            />
          </GradientFrame>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((s) => ({ ...s, isDefault: e.target.checked }))}
          />
          آدرس پیش‌فرض
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ProfileButton type="button" onClick={() => onSave(form)}>
          ذخیره
        </ProfileButton>
        <ProfileOutlineButton type="button" onClick={onCancel} className="w-auto">
          انصراف
        </ProfileOutlineButton>
      </div>
    </ProfileCard>
  );
}
