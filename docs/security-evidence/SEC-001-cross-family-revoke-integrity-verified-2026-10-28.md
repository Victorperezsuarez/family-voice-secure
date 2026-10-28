# SEC-001 — Verificacion de integridad posterior a revocacion cruzada

Fecha: 2026-10-28. Entorno: vela-staging. Fuente: captura de consulta SQL de solo lectura.

Invitacion ID: `8b5af84f-0c86-4652-b01d-b4c0d308454a`.
Familia B: `f578da2d-6980-4f7e-968b-498907e90fc0`.
Consulta: SELECT id, family_id, status, revoked_by, revoked_at FROM public.vela_family_invitations WHERE id = '8b5af84f-0c86-4652-b01d-b4c0d308454a';
Resultado: family_id coincide con B, status=`pending`, revoked_by=NULL, revoked_at=NULL.

Junto con la prueba anterior (RPC de revocacion desde administrador de familia A: revocacion_permitida=false), confirma rechazo de revocacion entre familias sin mutacion de la invitacion. PASS del escenario probado.

Decision MVP: comprobar pertenencia a la familia concreta para operaciones administrativas, ademas del rol. SEC-001 sigue abierto para concurrencia y casos limite. Sin cambios en produccion.
