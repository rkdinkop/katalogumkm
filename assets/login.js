function simpanLogin(nama, wa) {
  fetch("https://script.google.com/macros/s/AKfycbwcrkAzqU2QaG9JIXlc7SPMI_TVRlqxMIPUqQGgpJ8/exec", {
    method: "POST",
    body: JSON.stringify({ nama: nama, wa: wa }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then(res => res.json())
  .then(res => console.log("Login dicatat:", res))
  .catch(err => console.error("Gagal simpan log:", err));
}
