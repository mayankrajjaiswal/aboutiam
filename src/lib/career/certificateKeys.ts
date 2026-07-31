// Generated once (ECDSA P-256, Web Crypto `generateKey`) and committed to the repo.
// See the honesty caveat at the top of certificateSigner.ts: because this is a pure
// client-side app, this private key ships in the browser bundle like everything else
// — it is technically inspectable by anyone, even though it's only ever *used* inside
// the visitor's own browser at certificate-generation time and never transmitted.
export const CERTIFICATE_PUBLIC_KEY_JWK: JsonWebKey = {
  key_ops: ['verify'],
  ext: true,
  kty: 'EC',
  x: 'p3q1sHFQg5ULL2IvOut91LPxT9GLAF7nRIZ6XEcmI_w',
  y: 'PuQbIPQX0Dj0RFTbMYFI8SdWSbH2fnfTH7bAz30JymY',
  crv: 'P-256',
}

export const CERTIFICATE_PRIVATE_KEY_JWK: JsonWebKey = {
  key_ops: ['sign'],
  ext: true,
  kty: 'EC',
  x: 'p3q1sHFQg5ULL2IvOut91LPxT9GLAF7nRIZ6XEcmI_w',
  y: 'PuQbIPQX0Dj0RFTbMYFI8SdWSbH2fnfTH7bAz30JymY',
  crv: 'P-256',
  d: 'UogqBtX43Ha_I2OclxSJFcXO9yYRZ6zcKAInpS0i06s',
}
