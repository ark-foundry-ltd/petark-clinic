// lib/custom-roles.ts
import api from "@/lib/api";
import axiosError from "axios";

export interface CustomRole {
  _id: string;
  clinicId: string;
  name: string;
  permissions: string[];
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomRoleListResponse {
  count: number;
  data: CustomRole[];
}

export async function listCustomRoles(): Promise<CustomRoleListResponse> {
  try {
    const res = await api.get<CustomRoleListResponse>("/roles/custom");
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch custom roles");
    }
    throw new Error("An unexpected error occurred while fetching custom roles");
  }
}

export interface CreateCustomRolePayload {
  name: string;
  permissions: string[];
}

export interface CustomRoleResponse {
  message: string;
  data: CustomRole;
}

export async function createCustomRole(
  payload: CreateCustomRolePayload
): Promise<CustomRoleResponse> {
  try {
    const res = await api.post<CustomRoleResponse>("/roles/custom", payload);
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to create custom role");
    }
    throw new Error("An unexpected error occurred while creating the custom role");
  }
}

export interface UpdateCustomRolePayload {
  name?: string;
  permissions?: string[];
}

export async function updateCustomRole(
  roleId: string,
  payload: UpdateCustomRolePayload
): Promise<CustomRoleResponse> {
  try {
    const res = await api.patch<CustomRoleResponse>(`/roles/custom/${roleId}`, payload);
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to update custom role");
    }
    throw new Error("An unexpected error occurred while updating the custom role");
  }
}

export async function deleteCustomRole(roleId: string): Promise<{ message: string }> {
  try {
    const res = await api.delete<{ message: string }>(`/roles/custom/${roleId}`);
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to delete custom role");
    }
    throw new Error("An unexpected error occurred while deleting the custom role");
  }
}