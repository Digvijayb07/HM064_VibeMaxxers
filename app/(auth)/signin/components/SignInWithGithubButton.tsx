"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { Github } from "lucide-react";
import { useState } from "react";

export default function SignInWithGithubButton() {
  const [loading, setLoading] = useState(false);

  const handleGithubSignIn = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("GitHub login error:", error.message);
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={handleGithubSignIn}
      disabled={loading}
    >
      <Github className="h-4 w-4" />
      {loading ? "Connecting..." : "Continue with GitHub"}
    </Button>
  );
}
