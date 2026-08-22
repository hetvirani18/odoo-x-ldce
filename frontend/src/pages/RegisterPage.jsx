import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button, Field, Input } from '../components/ui/ui.jsx';
import { IconLock, IconMail, IconUser } from '../components/ui/icons.jsx';
import { signupSchema } from '../features/auth/schemas.js';
import { useSignupMutation } from '../features/auth/authApi.js';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [signup, { isLoading }] = useSignupMutation();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    });

    const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }) => {
        try {
            await signup(values).unwrap();
            navigate('/', { replace: true });
        } catch (err) {
            setError('root', { message: err?.data?.error?.message ?? 'Registration failed. Please try again.' });
        }
    };

    return (
        <div>
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-coral-ink">
                Join GlobeTrotter
            </p>
            <h1 className="font-display text-[30px] font-semibold text-ink">Create your account</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft">
                Already have one?{' '}
                <Link to="/login" className="font-medium text-coral-ink underline underline-offset-2">
                    Log in instead
                </Link>
            </p>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Name" error={errors.name?.message}>
                    <Input icon={<IconUser size={17} />} placeholder="Het Virani" {...register('name')} />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                    <Input icon={<IconMail size={17} />} placeholder="you@example.com" {...register('email')} />
                </Field>
                <Field label="Password" error={errors.password?.message}>
                    <Input icon={<IconLock size={17} />} type="password" placeholder="••••••••" {...register('password')} />
                </Field>
                <Field label="Confirm password" error={errors.confirmPassword?.message}>
                    <Input icon={<IconLock size={17} />} type="password" placeholder="••••••••" {...register('confirmPassword')} />
                </Field>

                {errors.root?.message && (
                    <p className="text-[13px] text-coral-ink">{errors.root.message}</p>
                )}

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account…' : 'Create account'}
                </Button>
            </form>
        </div>
    );
}
