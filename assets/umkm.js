const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
const urlParams = new URLSearchParams(window.location.search);
const umkmId = urlParams.get('id');

Promise.all([
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/produk`).then(res => res.json())
])
.then(([umkm, produk]) => {
  const dataUmkm = umkm.find(u => u.id_umkm === umkmId);
  const produkUMKM = produk.filter(p => p.id_umkm === umkmId && p.status === 'aktif');

  if (!dataUmkm) {
    document.getElementById("umkm-profil").innerHTML = "<p>UMKM tidak ditemukan.</p>";
    return;
  }

  // Render Profil UMKM
  document.getElementById("umkm-profil").innerHTML = `
    <h2>${dataUmkm.nama_umkm}</h2>
    <p>Alamat: ${dataUmkm.alamat}</p>
    <p>Kecamatan: ${dataUmkm.kecamatan}</p>
    <p><a href="https://wa.me/${dataUmkm.kontak_wa}" target="_blank">Hubungi via WA</a></p>
    ${dataUmkm.latitude && dataUmkm.longitude ? `<iframe width="100%" height="200" src="https://maps.google.com/maps?q=${dataUmkm.latitude},${dataUmkm.longitude}&hl=id&z=15&output=embed"></iframe>` : ''}
  `;

  // Render Produk UMKM
  document.getElementById("umkm-produk").innerHTML = produkUMKM.map(p => `
    <div class="produk-card">
      <img src="${p.gambar_url}" alt="${p.nama_produk}" width="100%" />
      <h3>${p.nama_produk}</h3>
      <p>Rp ${parseInt(p.harga).toLocaleString()}</p>
      <a href="https://wa.me/${dataUmkm.kontak_wa}?text=Saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}" target="_blank">Pesan via WA</a>
    </div>
  `).join('');
})
.catch(err => {
  console.error('Gagal memuat data UMKM:', err);
  document.getElementById("umkm-profil").innerHTML = "<p>Terjadi kesalahan memuat data.</p>";
});
