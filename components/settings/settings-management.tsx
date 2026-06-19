"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, FileLock2, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { PharmacySettingsForm } from "@/components/settings/pharmacy-settings-form";
import { UserManagement } from "@/components/settings/user-management";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import type { AppRole } from "@/lib/auth/types";
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
        error instanceof Error
          ? error.message
          : "Pharmacy settings could not be saved.",
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
        error instanceof Error
          ? error.message
          : "The user role could not be changed.",
      ),
  });

  if (settingsQuery.isLoading) return <LoadingState />;
  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <ErrorState
        title="Settings could not be loaded"
        message={
          settingsQuery.error instanceof Error
            ? settingsQuery.error.message
            : "The settings page is unavailable."
        }
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
            ? "Manage pharmacy details, staff roles, and setup guidance."
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

      <StorageFoundation />
    </div>
  );
}

function StorageFoundation() {
  return (
    <Card>
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <HardDrive className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold">Private document storage</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional foundation for future receipt or purchase-document files.
          </p>
        </div>
      </div>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <StorageNote
          icon={FileLock2}
          title="Keep the bucket private"
          description="Create a private bucket named pharmacy-documents. Do not make business files publicly accessible."
        />
        <StorageNote
          icon={Database}
          title="Uploads are not enabled yet"
          description="Receipts already download as PDF. File uploads are deferred until a clear document workflow is required."
        />
        <p className="sm:col-span-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          Setup instructions and recommended Storage policies are documented in
          the Supabase README. No document-management or patient-file feature is
          included.
        </p>
      </CardContent>
    </Card>
  );
}

function StorageNote({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileLock2;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
