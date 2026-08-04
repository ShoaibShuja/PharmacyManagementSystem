"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PharmacySettingsForm } from "@/components/settings/pharmacy-settings-form";
import { UserManagement } from "@/components/settings/user-management";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import type { AppRole } from "@/lib/auth/types";
import { getUserErrorMessage } from "@/lib/errors";
import {
  changeUserRole,
  getSettingsPageData,
  updatePharmacySettings,
} from "@/lib/settings/api";
import type { PharmacySettingsFormValues } from "@/lib/settings/schema";

const queryKey = ["settings"] as const;

export function SettingsManagement({
  role,
  currentUserId,
}: {
  role: AppRole;
  currentUserId: string;
}) {
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: [...queryKey, role],
    queryFn: () => getSettingsPageData(role),
  });

  const settingsMutation = useMutation({
    mutationFn: (values: PharmacySettingsFormValues) =>
      updatePharmacySettings(values, currentUserId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["medicine-catalog"] }),
        queryClient.invalidateQueries({ queryKey: ["sales-page"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ]);
      toast.success("Pharmacy settings saved.");
    },
    onError: (error) =>
      toast.error(
        getUserErrorMessage(
          error,
          "Pharmacy settings could not be saved.",
        ),
      ),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) =>
      changeUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success("User role changed.");
    },
    onError: (error) =>
      toast.error(
        getUserErrorMessage(
          error,
          "The user role could not be changed.",
        ),
      ),
  });

  if (settingsQuery.isLoading) return <LoadingState />;
  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <ErrorState
        title="Settings could not be loaded"
        message={getUserErrorMessage(
          settingsQuery.error,
          "The settings page is unavailable.",
        )}
        onRetry={() => settingsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={
          isAdmin
            ? "Manage pharmacy details and staff roles."
            : "Review the pharmacy details used across the system."
        }
      />

      <PharmacySettingsForm
        settings={settingsQuery.data.settings}
        canEdit={isAdmin}
        isPending={settingsMutation.isPending}
        onSubmit={(values) => settingsMutation.mutate(values)}
      />

      {isAdmin ? (
        <UserManagement
          users={settingsQuery.data.users}
          currentUserId={currentUserId}
          isPending={roleMutation.isPending}
          onRoleChange={async (userId, nextRole) => {
            await roleMutation.mutateAsync({ userId, role: nextRole });
          }}
        />
      ) : null}
    </div>
  );
}
