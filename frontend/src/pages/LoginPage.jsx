import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button, Field, Input } from '../components/ui/ui.jsx';
import { IconLock, IconMail } from '../components/ui/icons.jsx';
import { loginSchema } from '../features/auth/schemas.js';
import { useLoginMutation } from '../features/auth/authApi.js';

export default function LoginPage() {
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (values) => {
        try {
            await login(values).unwrap();
            navigate('/', { replace: true });
        } catch (err) {
            setError('root', { message: err?.data?.error?.message ?? 'Login failed. Please try again.' });
        }
    };

    return (
        <div>
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                Welcome back
            </p>
            <h1 className="font-display text-[30px] font-semibold text-ink">Log in to your account</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft">
                New here?{' '}
                <Link to="/register" className="font-medium text-coral-ink underline underline-offset-2">
                    Create an account
                </Link>
            </p>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Email" error={errors.email?.message}>
                    <Input icon={<IconMail size={17} />} placeholder="you@example.com" {...register('email')} />
                </Field>
                <Field label="Password" error={errors.password?.message}>
                    <Input icon={<IconLock size={17} />} type="password" placeholder="••••••••" {...register('password')} />
                </Field>

                <div className="mt-1 flex items-center justify-end text-[13px]">
                    <Link to="/forgot-password" className="font-medium text-ink-soft hover:text-ink">
                        Forgot password?
                    </Link>
                </div>

                {errors.root?.message && (
                    <p className="text-[13px] text-coral-ink">{errors.root.message}</p>
                )}

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in…' : 'Log in'}
                </Button>
            </form>
        </div>
    );
}
