import React from "react";
import { SignUpForm } from "./components/SignUpform";

const page = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-grid-pattern/5 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/[0.02] bg-[size:32px_32px] [mask-image:radial-gradient(white,transparent_85%)] pointer-events-none" />
      <div className="w-full max-w-lg mx-auto relative">
        <SignUpForm />
      </div>
    </div>
  );
};

export default page;
