# SEC-001 - Invitacion pendiente para prueba entre familias

Fecha: 2026-10-28. Entorno: vela-staging.

Captura de herramienta manual: resultado `Invitacion creada`, invitation_id `8b5af84f-0c86-4652-b01d-b4c0d308454a`, expires_at `2026-11-04T20:43:36.268748+00:00`. Contexto de prueba: invitacion creada desde cuenta administradora de familia B, family_id `f578da2d-6980-4f7e-968b-498907e90fc0`. No se registro token privado.

Estado: creacion confirmada; aun no se ha probado revocacion desde administrador de otra familia. Siguiente: cerrar sesion, iniciar con administrador de familia A, introducir invitation_id y ejecutar prueba 10. Resultado esperado: revocacion denegada. Verificar posteriormente con SELECT que la invitacion sigue pending y no tiene metadatos de revocacion.
