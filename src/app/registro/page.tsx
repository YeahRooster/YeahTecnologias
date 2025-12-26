'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './registro.module.css';

export default function RegistroPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombreCompleto: '',
        domicilio: '',
        telefono: '',
        cuitCuil: '',
        nombreLocal: '',
        localidad: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validar contraseñas
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...userData } = formData;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrarse');
            }

            // Guardar en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirigir a Mi Cuenta
            router.push('/cuenta');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Crear Cuenta</h1>
                <p className={styles.subtitle}>Completá tus datos para registrarte en Yeah! Tecnologías</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <h2>Datos de Acceso</h2>
                        <div className={styles.field}>
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="password">Contraseña *</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repetí tu contraseña"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Datos Personales</h2>
                        <div className={styles.field}>
                            <label htmlFor="nombreCompleto">Nombre Completo *</label>
                            <input
                                type="text"
                                id="nombreCompleto"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleChange}
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="telefono">Teléfono *</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="+54 9 11 1234-5678"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="cuitCuil">CUIT / CUIL *</label>
                                <input
                                    type="text"
                                    id="cuitCuil"
                                    name="cuitCuil"
                                    value={formData.cuitCuil}
                                    onChange={handleChange}
                                    placeholder="20-12345678-9"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Datos del Negocio</h2>
                        <div className={styles.field}>
                            <label htmlFor="nombreLocal">Nombre del Local *</label>
                            <input
                                type="text"
                                id="nombreLocal"
                                name="nombreLocal"
                                value={formData.nombreLocal}
                                onChange={handleChange}
                                placeholder="Mi Negocio S.R.L."
                                required
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="domicilio">Domicilio *</label>
                                <input
                                    type="text"
                                    id="domicilio"
                                    name="domicilio"
                                    value={formData.domicilio}
                                    onChange={handleChange}
                                    placeholder="Av. Corrientes 1234"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="localidad">Localidad *</label>
                                <input
                                    type="text"
                                    id="localidad"
                                    name="localidad"
                                    value={formData.localidad}
                                    onChange={handleChange}
                                    placeholder="Buenos Aires"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className={styles.loginLink}>
                    ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link>
                </div>
            </div>
        </div>
    );
}
