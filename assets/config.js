/* ===== Seedline sales config: the ONLY file to edit for prices, Stripe links, and the access gate. ===== */
window.SEEDLINE={
  /* Prices shown on /pricing/. Change here only. */
  PRICE_BUSINESS:299,          // one-time, per business
  PRICE_ACCOUNTANT:99,         // per month, unlimited clients

  /* Paste the Stripe Payment Link URLs here (e.g. "https://buy.stripe.com/abc123"). */
  STRIPE_LINK_BUSINESS:"STRIPE_LINK_BUSINESS",
  STRIPE_LINK_ACCOUNTANT:"STRIPE_LINK_ACCOUNTANT",

  /* Paid-access gate. Keep false until Stripe links work and codes exist. */
  GATE_ENABLED:false,
  /* SHA-256 hex hashes of valid access codes (uppercase code, trimmed). Generate with:
     echo -n "SEED-XXXX-XXXX" | sha256sum                                              */
  ACCESS_CODE_HASHES:[],
  SUPPORT_EMAIL:"dhruva@mail.grokbot.com"
};
