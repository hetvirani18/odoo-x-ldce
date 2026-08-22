import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button, Field, Input, Badge } from '../../components/ui/ui.jsx';
import { IconLock, IconMail, IconShield } from '../../components/ui/icons.jsx';
import { loginSchema } from '../../features/auth/schemas.js';
import { useLoginMutation, useGetMeQuery } from '../../features/auth/authApi.js';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { data: me } = useGetMeQuery();
    const [login, { isLoading }] = useLoginMutation();

    useEffect(() => {
        if (me?.user?.role === 'admin') {
            navigate('/admin/users', { replace: true });
        }
    }, [me, navigate]);

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
            const { user } = await login(values).unwrap();
            if (user?.role !== 'admin') {
                setError('root', { message: 'Access denied: Administrator privileges required.' });
                return;
            }
            navigate('/admin/users', { replace: true });
        } catch (err) {
            setError('root', {
                message: err?.data?.error?.message ?? err?.data?.message ?? 'Login failed. Please verify admin credentials.',
            });
        }
    };

    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-bg">
                    <IconShield size={14} />
                </span>
                <Badge tone="neutral">Admin Portal</Badge>
            </div>
            <h1 className="font-display text-[30px] font-semibold text-ink">Admin Sign In</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft">
                Sign in with your administrator account to access platform analytics, manage users, and configure settings.
            </p>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Admin Email" error={errors.email?.message}>
                    <Input icon={<IconMail size={17} />} placeholder="admin@example.com" {...register('email')} />
                </Field>
                <Field label="Password" error={errors.password?.message}>
                    <Input icon={<IconLock size={17} />} type="password" placeholder="••••••••" {...register('password')} />
                </Field>

                {errors.root?.message && (
                    <p className="text-[13px] text-coral-ink">{errors.root.message}</p>
                )}

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? 'Authenticating…' : 'Sign in to Admin Panel'}
                </Button>
            </form>

            <div className="mt-6 border-t border-border-soft pt-4 text-center">
                <Link to="/login" className="text-[13px] text-ink-soft hover:text-ink">
                    ← Back to traveler sign in
                </Link>
            </div>
        </div>
    );
}
