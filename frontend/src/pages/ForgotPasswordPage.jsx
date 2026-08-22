import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Button, Field, Input } from '../components/ui/ui.jsx';
import { IconMail } from '../components/ui/icons.jsx';
import { forgotPasswordSchema } from '../features/auth/schemas.js';
import { useForgotPasswordMutation } from '../features/auth/authApi.js';

export default function ForgotPasswordPage() {
    const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (values) => {
        try {
            await forgotPassword(values).unwrap();
        } catch {
            // Response is intentionally generic to avoid email enumeration; show the same success state.
        }
    };

    if (isSuccess) {
        return (
            <div>
                <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                    Check your inbox
                </p>
                <h1 className="font-display text-[30px] font-semibold text-ink">Reset link sent</h1>
                <p className="mt-3 text-[14.5px] text-ink-soft">
                    If an account exists for that email, we've sent a link to reset your password. It expires in 30
                    minutes.
                </p>
                <Link
                    to="/login"
                    className="mt-6 inline-block font-medium text-coral-ink underline underline-offset-2"
                >
                    Back to login
                </Link>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                Forgot password
            </p>
            <h1 className="font-display text-[30px] font-semibold text-ink">Reset your password</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft">
                Enter your email and we'll send you a link to get back into your account.
            </p>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Email" error={errors.email?.message}>
                    <Input icon={<IconMail size={17} />} placeholder="you@example.com" {...register('email')} />
                </Field>

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? 'Sending link…' : 'Send reset link'}
                </Button>

                <p className="mt-1 text-center text-[13.5px] text-ink-soft">
                    Remembered it?{' '}
                    <Link to="/login" className="font-medium text-coral-ink underline underline-offset-2">
                        Log in instead
                    </Link>
                </p>
            </form>
        </div>
    );
}
