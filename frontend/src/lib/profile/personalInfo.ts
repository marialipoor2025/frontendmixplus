export type PersonalInfo = {
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
};

const KEY = "mixplus.personalInfo";

export function getPersonalInfo(): PersonalInfo {
  if (typeof window === "undefined") {
    return emptyPersonalInfo();
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyPersonalInfo();
    return { ...emptyPersonalInfo(), ...(JSON.parse(raw) as PersonalInfo) };
  } catch {
    return emptyPersonalInfo();
  }
}

export function savePersonalInfo(info: PersonalInfo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(info));
}

function emptyPersonalInfo(): PersonalInfo {
  return { firstName: "", lastName: "", nationalId: "", birthDate: "" };
}
