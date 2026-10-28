# SEC-001 - Revocacion entre familias denegada

Fecha: 2026-10-28. Entorno: vela-staging.

Prueba manual: usuario administrador de familia A (UID `2a98f820-55b7-41e6-a882-c4ebb7e7edfa`) intento revocar invitacion `8b5af84f-0c86-4652-b01d-b4c0d308454a`, creada para la familia B. Respuesta RPC: `revocacion_permitida=false`, `resultado=null`, `error=Invitation not found or not authorized`.

Resultado: PASS de denegacion de revocacion entre familias en el escenario probado. Pendiente: verificacion independiente de integridad en SQL, esperando status pending, revoked_by NULL y revoked_at NULL. No registrar tokens privados. Sin cambios a produccion.
