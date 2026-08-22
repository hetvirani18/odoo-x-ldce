import { AuthShell } from "./AuthPanel.jsx";
import { Button, Field, Input, Textarea } from "../components/ui.jsx";
import { IconCamera } from "../components/icons.jsx";

export function RegisterScreen({ onNavigate }) {
  return (
    <AuthShell
      side={
        <div className="max-w-sm">
          <p className="font-display text-[28px] font-medium leading-tight">
            “Every great trip starts with one honest first step: this form.”
          </p>
          <p className="mt-4 text-[14px] text-white/70">
            Takes under a minute — we promise.
          </p>
        </div>
      }
    >
      <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
        Join GlobeTrotter
      </p>
      <h1 className="font-display text-[30px] font-semibold text-ink">Create your account</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft">
        Already have one?{" "}
        <button onClick={() => onNavigate("login")} className="cursor-pointer font-medium text-coral-ink underline underline-offset-2">
          Log in instead
        </button>
      </p>

      <form
        className="mt-7 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onNavigate("login");
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-border bg-surface-2 text-ink-faint transition-colors hover:border-coral hover:text-coral-ink">
            <IconCamera size={22} />
          </div>
          <div>
            <p className="text-[13.5px] font-medium text-ink">Profile photo</p>
            <p className="text-[12.5px] text-ink-faint">Optional — PNG or JPG</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="First name">
            <Input placeholder="Het" />
          </Field>
          <Field label="Last name">
            <Input placeholder="Virani" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Email address">
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Phone number">
            <Input type="tel" placeholder="+1 555 000 0000" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="City">
            <Input placeholder="Ahmedabad" />
          </Field>
          <Field label="Country">
            <Input placeholder="India" />
          </Field>
        </div>
        <Field label="Additional information">
          <Textarea placeholder="Travel style, dietary notes, anything we should know…" />
        </Field>

        <Button type="submit" size="lg" className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
