"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  GradientFrame,
  ProfileButton,
  ProfileCard,
  ProfileShell,
} from "@/components/profile/ProfileShell";
import { identityLabel } from "@/components/profile/profileNav";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getPersonalInfo,
  savePersonalInfo,
  type PersonalInfo,
} from "@/lib/profile/personalInfo";

export default function PersonalInfoPage() {
  const { user } = useAuth();
  const [info, setInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    nationalId: "",
    birthDate: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInfo(getPersonalInfo());
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    savePersonalInfo(info);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ProfileShell title="اطلاعات حساب">
      <ProfileCard>
        <GradientFrame radius="rounded-lg" className="mb-5">
          <div className="rounded-[7px] bg-white px-3 py-3 text-sm">
            <p className="text-xs text-[var(--color-muted)]">شناسه ورود</p>
            <p className="mt-1 font-bold" dir="ltr">
              {user ? identityLabel(user) : "—"}
            </p>
          </div>
        </GradientFrame>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="نام"
              value={info.firstName}
              onChange={(v) => setInfo((s) => ({ ...s, firstName: v }))}
            />
            <Field
              label="نام خانوادگی"
              value={info.lastName}
              onChange={(v) => setInfo((s) => ({ ...s, lastName: v }))}
            />
            <Field
              label="کد ملی"
              value={info.nationalId}
              onChange={(v) => setInfo((s) => ({ ...s, nationalId: v }))}
              dir="ltr"
            />
            <Field
              label="تاریخ تولد"
              value={info.birthDate}
              onChange={(v) => setInfo((s) => ({ ...s, birthDate: v }))}
              placeholder="مثلاً 1370/01/01"
              dir="ltr"
            />
          </div>

          <ProfileButton type="submit" className="px-5 text-sm">
            ذخیره تغییرات
          </ProfileButton>
          {saved ? (
            <p className="text-xs font-medium text-[var(--color-success)]">ذخیره شد.</p>
          ) : null}
        </form>
      </ProfileCard>
    </ProfileShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-[var(--color-neutral-700)]">{label}</span>
      <GradientFrame radius="rounded-lg">
        <input
          value={value}
          dir={dir}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-[7px] bg-white px-3 py-2.5 text-sm outline-none"
        />
      </GradientFrame>
    </label>
  );
}
