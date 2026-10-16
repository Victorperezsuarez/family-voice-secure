# Vela — plan de cierre de vulnerabilidad de invitaciones (BORRADOR, NO EJECUTAR)

Estado: propuesta para revisión. No demuestra que la vulnerabilidad esté cerrada.

## Riesgo identificado
La política INSERT de family_users «Users can join families» debe inspeccionarse íntegramente: si solo verifica user_id = auth.uid(), no comprueba invitación ni rol. La política de inserción de family_invitations usa comprobación de admin, pero otras políticas permisivas pueden ampliar acceso. RLS combina políticas permisivas mediante OR.

## Requisitos de implementación
1. Respaldar esquema y políticas efectivas de families, family_users, family_invitations, custom_roles y triggers. Verificar los SQL reales de todas las políticas, no solo sus nombres.
2. Auditar funciones SECURITY DEFINER, propietario, search_path y permisos EXECUTE; revisar triggers de creación de familia y asignación de roles.
3. Definir una función transaccional de aceptación de invitación: usuario autenticado, email verificado correspondiente al destinatario, invitación válida/no vencida/no usada, familia existente, rol limitado a roles permitidos. Marcar consumida e insertar membresía atómicamente; impedir reuso y condiciones de carrera.
4. Revocar inserción directa de membresías desde cliente, manteniendo un procedimiento seguro para crear membresía inicial del creador. Revisar también UPDATE/DELETE de roles y membresías.
5. Revisar políticas de invitaciones para impedir que una política INSERT alternativa permita invitaciones sin admin.
6. Aplicar cambios primero en entorno de prueba; usar migración versionada y plan de reversión. No ejecutar cambios directamente en producción sin respaldo y pruebas.
7. Probar dos familias, usuario sin sesión, usuario autenticado ajeno, invitación caducada, correo distinto, token reutilizado, escalada de rol, administración legítima y creador de familia. Confirmar lectura/escritura y rutas directas API.

## Estado
- GitHub: AuthProvider y ProtectedRoute están presentes en rama audit/mvp-security-foundation.
- Supabase: capturas previas muestran políticas y funciones, pero no prueban su seguridad efectiva.
- Pendiente: SQL de políticas actuales y definición completa de invitación/aceptación, pruebas y despliegue.

**NO ejecutar SQL de producción ni declarar el riesgo cerrado hasta superar las pruebas.**
