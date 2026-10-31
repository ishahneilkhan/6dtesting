/* HOSTNEIL — edit this file on GitHub (pencil icon) to change contact & payment details.
   Leave a value empty ("") to hide it. Never put passwords or secret keys here: this file is public. */
window.HN_CONFIG = {
  WHATSAPP: "",          // digits only, e.g. "8801XXXXXXXXX"
  EMAIL: "",             // support email shown on Contact page
  API_BASE: "",          // leave empty until the Cloudflare Worker API is live, e.g. "https://hostneil.com"
  TERMS_VERSION: "2026-10-31",
  PAYMENT: {
    bkash: { number: "", type: "Personal" },
    nagad: { number: "", type: "Personal" },
    bank:  { name: "", accountName: "", number: "", branch: "" }
  }
};
