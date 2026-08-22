import api from "@/lib/api";
import axiosError from "axios";

export type StaffRole = "vet" | "receptionist" | "sales";
export type StaffStatus = "invited" | "active" | "revoked";

export interface Staff {
  _id: string;
  fullname: string;
  email: string;
  role: StaffRole;
  clinicId: string;
  status: StaffStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResponse {
  status: string;
  count: number;
  data: Staff[];
}

export async function getStaff(): Promise<StaffListResponse> {
  try {
    const res = await api.get<StaffListResponse>("/staff");
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
    throw new Error("An unexpected error occurred while fetching staff");
  }
}

export interface InviteStaffPayload {
  fullname: string;
  email: string;
  role: StaffRole;
}

export interface InviteStaffResponse {
  status: string;
  message: string;
}

export async function inviteStaff(
  payload: InviteStaffPayload
): Promise<InviteStaffResponse> {
  try {
    const res = await api.post<InviteStaffResponse>(
      "/staff/invite",
      payload
    );
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to invite staff");
    }
    throw new Error("An unexpected error occurred while inviting staff");
  }
}

// ─── Staff Login ────────────────────────────────────────────────────────────

export interface StaffLoginPayload {
  email: string;
  password: string;
}

// Two distinct shapes the backend can return from the same endpoint —
// a first-time login (temp password) never returns a token, it returns
// actionRequired so the frontend can route to the password-set screen.
export interface StaffLoginForceResetResponse {
  status: string;
  message: string;
  actionRequired: "FORCE_PASSWORD_RESET";
  userId: string;
}

export interface StaffLoginSuccessResponse {
  status: string;
  token: string;
  data: {
    user: {
      id: string;
      email: string;
      role: StaffRole;
      clinicId: string;
    };
  };
}

export type StaffLoginResponse =
  | StaffLoginForceResetResponse
  | StaffLoginSuccessResponse;

export async function loginStaff(
  payload: StaffLoginPayload
): Promise<StaffLoginResponse> {
  try {
    const res = await api.post<StaffLoginResponse>("/staff/login", payload);
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to log in");
    }
    throw new Error("An unexpected error occurred while logging in");
  }
}

// ─── Complete Staff Setup (first-time login, temp password → real password) ──

export interface CompleteStaffSetupPayload {
  userId: string;
  newPassword: string;
}

export interface CompleteStaffSetupResponse {
  status: string;
  token: string;
  message: string;
}

export async function completeStaffSetup(
  payload: CompleteStaffSetupPayload
): Promise<CompleteStaffSetupResponse> {
  try {
    const res = await api.post<CompleteStaffSetupResponse>(
      "/staff/complete-setup",
      payload
    );
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to complete account setup");
    }
    throw new Error("An unexpected error occurred while completing setup");
  }
}

// ─── Update Staff Role ────────────────────────────────────────────────────────

export interface UpdateStaffRolePayload {
  role: StaffRole;
}

export interface UpdateStaffRoleResponse {
  status: string;
  message: string;
  data: { staffId: string; role: StaffRole };
}

export async function updateStaffRole(
  staffId: string,
  payload: UpdateStaffRolePayload
): Promise<UpdateStaffRoleResponse> {
  try {
    const res = await api.patch<UpdateStaffRoleResponse>(
      `/staff/${staffId}/role`,
      payload
    );
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to update staff role");
    }
    throw new Error("An unexpected error occurred while updating staff role");
  }
}

// ─── Revoke / Restore Staff Access ────────────────────────────────────────────

export interface StaffAccessResponse {
  status: string;
  message: string;
  data: { staffId: string; status: StaffStatus };
}

export async function revokeStaffAccess(staffId: string): Promise<StaffAccessResponse> {
  try {
    const res = await api.patch<StaffAccessResponse>(`/staff/${staffId}/revoke`);
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to revoke staff access");
    }
    throw new Error("An unexpected error occurred while revoking staff access");
  }
}

export async function restoreStaffAccess(staffId: string): Promise<StaffAccessResponse> {
  try {
    const res = await api.patch<StaffAccessResponse>(`/staff/${staffId}/restore`);
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to restore staff access");
    }
    throw new Error("An unexpected error occurred while restoring staff access");
  }
}