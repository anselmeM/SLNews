import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-[480px] flex flex-col items-center justify-center">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-surface-container-lowest shadow-xl rounded-3xl border border-outline-variant/30 p-6 sm:p-8",
              headerTitle: "text-2xl font-black text-on-surface tracking-tight",
              headerSubtitle: "text-sm text-on-surface-variant font-medium",
              formButtonPrimary:
                "bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl py-3 text-sm shadow-md transition-all",
              formFieldInput:
                "rounded-2xl border-outline-variant/50 focus:border-primary focus:ring-primary text-sm",
              footerActionLink: "text-primary font-bold hover:underline",
            },
          }}
        />
      </div>
    </div>
  );
}
