import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button, Field, Input } from '../components/ui/ui.jsx';
import { IconLock } from '../components/ui/icons.jsx';
import { resetPasswordSchema } from '../features/auth/schemas.js';
import { useResetPasswordMutation } from '../features/auth/authApi.js';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { token, new_password: '', confirmPassword: '' },
    });

    const onSubmit = async (values) => {
        try {
            await resetPassword(values).unwrap();
        } catch (err) {
            setError('root', {
                message: err?.data?.error?.message ?? 'This reset link is invalid or has expired.',
            });
        }
    };

    if (!token) {
        return (
            <div>
                <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                    Reset password
                </p>
                <h1 className="font-display text-[30px] font-semibold text-ink">Link missing or invalid</h1>
                <p className="mt-3 text-[14.5px] text-ink-soft">
                    This reset link is missing its token. Request a new one to continue.
                </p>
                <Link
                    to="/forgot-password"
                    className="mt-6 inline-block font-medium text-coral-ink underline underline-offset-2"
                >
                    Request a new link
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div>
                <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                    All set
                </p>
                <h1 className="font-display text-[30px] font-semibold text-ink">Password reset</h1>
                <p className="mt-3 text-[14.5px] text-ink-soft">
                    Your password has been updated. You can log in with your new password now.
                </p>
                <Button size="lg" className="mt-6 w-full" onClick={() => navigate('/login', { replace: true })}>
                    Go to login
                </Button>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                Reset password
            </p>
            <h1 className="font-display text-[30px] font-semibold text-ink">Choose a new password</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft">Make it at least 6 characters.</p>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('token')} value={token} />
                <Field label="New password" error={errors.new_password?.message}>
                    <Input
                        icon={<IconLock size={17} />}
                        type="password"
                        placeholder="••••••••"
                        {...register('new_password')}
                    />
                </Field>
                <Field label="Confirm new password" error={errors.confirmPassword?.message}>
                    <Input
                        icon={<IconLock size={17} />}
                        type="password"
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                    />
                </Field>

                {errors.root?.message && <p className="text-[13px] text-coral-ink">{errors.root.message}</p>}

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? 'Resetting…' : 'Reset password'}
                </Button>
            </form>
        </div>
    );
}
