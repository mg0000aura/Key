# PÂNICO CHEATS — Vercel + Firebase Key API

Esta versão usa o **Firebase Realtime Database** do projeto:

`mg00-ed424`

O Firebase Web config fornecido foi colocado em `lib/firebase.js`. A `apiKey` do Firebase Web **não é uma senha de banco** e não deve ser usada como segredo administrativo.

## 1. Firebase

No Firebase Console:

1. Abra o projeto `mg00-ed424`.
2. Vá em **Realtime Database** e crie/ative o banco.
3. Vá em **Project settings → Service accounts → Generate new private key**.
4. Baixe o JSON da conta de serviço.
5. No Vercel, crie a variável:
   `FIREBASE_SERVICE_ACCOUNT_JSON`
   e cole o JSON inteiro como valor.
6. Crie também:
   `ADMIN_SECRET`
   com uma senha longa e aleatória.

A conta de serviço fica somente no servidor. **Nunca coloque o JSON da conta de serviço no APK.**

## 2. Estrutura no Firebase

A API cria automaticamente:

`panicoKeys/<KEY>`

Exemplo:
```json
{
  "key": "PANICO-ABCDE-12345-FGHIJ-67890",
  "product": "PÂNICO CHEATS",
  "device": "",
  "expiresAt": 1760000000000,
  "revoked": false,
  "cert": "panico-firebase",
  "createdAt": 1750000000000
}
```

## 3. Criar uma Key

```bash
curl -X POST "https://SEU-DOMINIO.vercel.app/api/admin/keys" \
  -H "x-admin-secret: SUA_ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"days":30,"product":"PÂNICO CHEATS"}'
```

`days: 0` = sem expiração.

## 4. Validar

```bash
curl -X POST "https://SEU-DOMINIO.vercel.app/api/connect" \
  -H "content-type: application/json" \
  -d '{"key":"PANICO-ABCDE-12345-FGHIJ-67890","device":"teste-01","product":"PÂNICO CHEATS"}'
```

Também aceita `access_key`, `accessKey`, `token`, `license` e `license_key`.

## 5. Listar / bloquear / liberar / apagar

Listar:
```bash
curl "https://SEU-DOMINIO.vercel.app/api/admin/keys" \
  -H "x-admin-secret: SUA_ADMIN_SECRET"
```

Revogar:
```bash
curl -X PATCH "https://SEU-DOMINIO.vercel.app/api/admin/keys" \
  -H "x-admin-secret: SUA_ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"SUA-KEY","revoked":true}'
```

Liberar:
```bash
curl -X PATCH "https://SEU-DOMINIO.vercel.app/api/admin/keys" \
  -H "x-admin-secret: SUA_ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"SUA-KEY","revoked":false}'
```

Apagar:
```bash
curl -X DELETE "https://SEU-DOMINIO.vercel.app/api/admin/keys" \
  -H "x-admin-secret: SUA_ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"SUA-KEY"}'
```

## Compatibilidade com o APK

A análise do `LEO MODZ VIP LAUNCHER.apk` encontrou:

- `https://freepanel.in/connect`
- `freefirenLogin`
- `nLogin`
- `nIsAuth`
- `status`, `active`, `facts`, `cert`, `reason`, `device`
- a mensagem `Enter an access key.`
- a mensagem `Key rejected for this device or product.`

Portanto o endpoint `/api/connect` foi desenhado para manter esses nomes de campos na resposta.

**Mas não é seguro afirmar compatibilidade 100% apenas por strings do APK.** A biblioteca `libkeydockguard.so` é nativa e o contrato completo do POST não fica exposto pelo texto do APK. Primeiro teste a API com curl; depois precisamos observar o payload real do launcher para ajustar qualquer campo que faltar.

## Importante

Não use o `ADMIN_SECRET` no APK. O APK deve chamar apenas `/api/connect`.

Se você publicou a API Key do Firebase em um local público, isso normalmente não é equivalente a expor uma senha: a Web API key é um identificador do projeto. A segurança real dos dados deve ficar nas regras do Firebase e/ou na conta de serviço usada pelo servidor.
