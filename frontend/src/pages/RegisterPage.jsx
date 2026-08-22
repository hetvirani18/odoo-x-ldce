import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button, Field, Input } from '../components/ui/ui.jsx';
import { IconCamera } from '../components/ui/icons.jsx';
import { signupSchema } from '../features/auth/schemas.js';
import { useSignupMutation, useUploadPhotoMutation } from '../features/auth/authApi.js';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [signup, { isLoading: isSigningUp }] = useSignupMutation();
    const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadPhotoMutation();
    const fileInputRef = useRef(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
    });

    const isLoading = isSigningUp || isUploadingPhoto;

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const onSubmit = async ({ firstName, lastName, confirmPassword: _confirmPassword, ...values }) => {
        try {
            await signup({ ...values, name: `${firstName} ${lastName}`.trim() }).unwrap();
            if (photoFile) {
                const formData = new FormData();
                formData.append('photo', photoFile);
                try {
                    await uploadPhoto(formData).unwrap();
                } catch {
                    // Account was created successfully; photo can be added later from the profile page.
                }
            }
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

            <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-center gap-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-surface-2 text-ink-faint transition-colors hover:border-coral hover:text-coral-ink"
                    >
                        {photoPreview ? (
                            <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <IconCamera size={22} />
                        )}
                    </button>
                    <div>
                        <p className="text-[13.5px] font-medium text-ink">Profile photo</p>
                        <p className="text-[12.5px] text-ink-faint">Optional — PNG or JPG</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                    <Field label="First name" error={errors.firstName?.message}>
                        <Input placeholder="Het" {...register('firstName')} />
                    </Field>
                    <Field label="Last name" error={errors.lastName?.message}>
                        <Input placeholder="Virani" {...register('lastName')} />
                    </Field>
                </div>
                <Field label="Email address" error={errors.email?.message}>
                    <Input type="email" placeholder="you@example.com" {...register('email')} />
                </Field>
                <div className="grid grid-cols-2 gap-3.5">
                    <Field label="Password" error={errors.password?.message}>
                        <Input type="password" placeholder="••••••••" {...register('password')} />
                    </Field>
                    <Field label="Confirm password" error={errors.confirmPassword?.message}>
                        <Input type="password" placeholder="••••••••" {...register('confirmPassword')} />
                    </Field>
                </div>

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
