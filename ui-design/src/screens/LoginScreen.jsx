import { AuthShell } from "./AuthPanel.jsx";
import { Button, Field, Input } from "../components/ui.jsx";
import { IconLock, IconMail } from "../components/icons.jsx";

export function LoginScreen({ onNavigate }) {
  return (
    <AuthShell
      side={
        <div className="max-w-sm">
          <p className="font-display text-[28px] font-medium leading-tight">
            “Plan the trip. Chase the sunrise. Skip the spreadsheets.”
          </p>
          <p className="mt-4 text-[14px] text-white/70">
            Itineraries, budgets and community tips — all in one place.
          </p>
        </div>
      }
    >
      <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
        Welcome back
      </p>
      <h1 className="font-display text-[30px] font-semibold text-ink">Log in to your account</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft">
        New here?{" "}
        <button onClick={() => onNavigate("register")} className="cursor-pointer font-medium text-coral-ink underline underline-offset-2">
          Create an account
        </button>
      </p>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onNavigate("landing");
        }}
      >
        <Field label="Username or email">
          <Input icon={<IconMail size={17} />} placeholder="you@example.com" defaultValue="hetvirani87@gmail.com" />
        </Field>
        <Field label="Password">
          <Input icon={<IconLock size={17} />} type="password" placeholder="••••••••" defaultValue="••••••••••" />
        </Field>

        <div className="mt-1 flex items-center justify-between text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border accent-[oklch(66%_0.17_35)]" />
            Remember me
          </label>
          <button type="button" className="cursor-pointer font-medium text-ink-soft hover:text-ink">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
