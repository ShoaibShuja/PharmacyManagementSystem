"use client";

import { ShieldCheck, UserRoundCog, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppRole } from "@/lib/auth/types";
import type { ManagedUser } from "@/lib/settings/types";

const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  pharmacist: "Pharmacist",
  cashier: "Cashier",
};

type PendingRoleChange = {
  user: ManagedUser;
  role: AppRole;
};

export function UserManagement({
  users,
  currentUserId,
  isPending,
  onRoleChange,
}: {
  users: ManagedUser[];
  currentUserId: string;
  isPending: boolean;
  onRoleChange: (userId: string, role: AppRole) => Promise<void>;
}) {
  const [pendingChange, setPendingChange] =
    useState<PendingRoleChange | null>(null);
  const counts = useMemo(
    () => ({
      admin: users.filter((user) => user.role === "admin").length,
      pharmacist: users.filter((user) => user.role === "pharmacist").length,
      cashier: users.filter((user) => user.role === "cashier").length,
    }),
    [users],
  );

  return (
    <>
      <Card>
        <div className="flex items-start gap-3 border-b px-5 py-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <UsersRound className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Users and roles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review staff accounts created in Supabase Authentication and set
              their application role.
            </p>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-3 gap-2 border-b p-4">
            <RoleCount label="Admins" value={counts.admin} />
            <RoleCount label="Pharmacists" value={counts.pharmacist} />
            <RoleCount label="Cashiers" value={counts.cashier} />
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center">
              <UserRoundCog className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No staff profiles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create users in Supabase Authentication. Their profiles will
                appear here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-52">Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <p className="font-medium">
                            {user.full_name.trim() || "Name not provided"}
                            {user.id === currentUserId ? " (You)" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_active ? "secondary" : "outline"}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <RoleSelect
                            user={user}
                            currentUserId={currentUserId}
                            onChange={(role) =>
                              setPendingChange({ user, role })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="divide-y md:hidden">
                {users.map((user) => (
                  <div key={user.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {user.full_name.trim() || "Name not provided"}
                          {user.id === currentUserId ? " (You)" : ""}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant={user.is_active ? "secondary" : "outline"}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <RoleSelect
                      user={user}
                      currentUserId={currentUserId}
                      onChange={(role) => setPendingChange({ user, role })}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={pendingChange !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setPendingChange(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change this user&apos;s role?</DialogTitle>
            <DialogDescription>
              {pendingChange
                ? `${pendingChange.user.full_name.trim() || pendingChange.user.email} will become ${roleLabels[pendingChange.role]}. Their menu and permissions will change the next time authorization is checked.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4 text-primary" />
              Role access
            </div>
            <p className="mt-2 text-muted-foreground">
              Admin has full access. Pharmacist manages pharmacy operations.
              Cashier handles sales and read-only medicine lookup.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setPendingChange(null)}
            >
              Keep current role
            </Button>
            <Button
              disabled={isPending || !pendingChange}
              onClick={async () => {
                if (!pendingChange) return;
                try {
                  await onRoleChange(
                    pendingChange.user.id,
                    pendingChange.role,
                  );
                  setPendingChange(null);
                } catch {
                  // Mutation feedback is shown by the parent.
                }
              }}
            >
              {isPending ? "Changing role..." : "Change role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RoleSelect({
  user,
  currentUserId,
  onChange,
}: {
  user: ManagedUser;
  currentUserId: string;
  onChange: (role: AppRole) => void;
}) {
  const isCurrentUser = user.id === currentUserId;
  return (
    <div>
      <Select
        value={user.role}
        disabled={isCurrentUser}
        onValueChange={(value: AppRole) => onChange(value)}
      >
        <SelectTrigger aria-label={`Role for ${user.email}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="pharmacist">Pharmacist</SelectItem>
          <SelectItem value="cashier">Cashier</SelectItem>
        </SelectContent>
      </Select>
      {isCurrentUser ? (
        <p className="mt-1 text-xs text-muted-foreground">
          You cannot change your own role.
        </p>
      ) : null}
    </div>
  );
}

function RoleCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
