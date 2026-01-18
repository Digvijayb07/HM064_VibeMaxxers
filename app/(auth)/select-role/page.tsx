"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Code, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateUserRole } from "@/lib/auth-actions";

type UserRole = "company" | "developer";

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const roles = [
    {
      id: "company" as const,
      label: "Company",
      description: "Post projects and hire developers",
      icon: Briefcase,
    },
    {
      id: "developer" as const,
      label: "Developer",
      description: "Find projects and submit proposals",
      icon: Code,
    },
  ];

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateUserRole(selectedRole);
      // Redirect is handled by the server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="mx-auto max-w-lg shadow-lg w-full">
        <CardHeader className="px-8 pt-8 pb-6">
          <CardTitle className="text-2xl">Welcome! 🎉</CardTitle>
          <CardDescription>
            To get started, please select your account type
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid gap-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    disabled={isLoading}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all text-left",
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isLoading && "opacity-50 cursor-not-allowed",
                    )}>
                    {selectedRole === role.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        selectedRole === role.id ? "bg-primary/10" : "bg-muted",
                      )}>
                      <role.icon
                        className={cn(
                          "h-6 w-6",
                          selectedRole === role.id
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base">{role.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!selectedRole || isLoading}
              size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
