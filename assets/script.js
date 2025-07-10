const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";

// Fetch data dari semua sheet yang dibutuhkan
Promise.all([
  fetch(`${sheetBase}/produk`).then(res => res.json()),
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/pengaturan`).then(res => res.json())
])
.then(([produk, umkm, pengaturan]) => {
  // Debug log
  console.log("Produk:", produk);
  console.log("UMKM:", umkm);
  console.log("Pengaturan:", pengaturan);

  // Cek apakah data pengaturan valid
  if (Array.isArray(pengaturan)) {
    const siteTitle = pengaturan.find(p => p.key === 'site_title')?.value || "Katalog UMKM";
    const footerText = pengaturan.find(p => p.key === 'text_footer')?.value || "";

    document.getElementById("site-title").innerText = siteTitle;
    document.getElementById("footer-text").innerText = footerText;
  } else {
    console.warn("Pengaturan tidak valid atau gagal dimuat.");
  }

  // Referensi elemen pencarian dan daftar produk
  const searchInput = document.getElementById("search");
  const produkList = document.getElementById("produk-list");

  // Fungsi render produk
  function renderProduk(keyword = "") {
    const hasil = produk.filter(p => {
      const umkmData = umkm.find(u => u.id_umkm === p.id_umkm);
      return (
        p.status === "aktif" &&
        (
          p.nama_produk.toLowerCase().includes(keyword.toLowerCase()) ||
          umkmData?.nama_umkm.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });

    produkList.innerHTML = hasil.map(p => {
      const u = umkm.find(u => u.id_umkm === p.id_umkm);
      return `
        <div class="produk-item">
          <img src="${p.gambar_url}" alt="${p.nama_produk}" width="100%" />
          <h3>${p.nama_produk}</h3>
          <p>Rp ${parseInt(p.harga).toLocaleString()}</p>
          <p><strong>${u?.nama_umkm || "UMKM"}</strong> - ${p.kecamatan}</p>
          <a href="umkm.html?id=${u?.id_umkm}" target="_blank">Lihat UMKM</a><br>
          <a href="https://wa.me/${u?.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}" target="_blank">Pesan via WA</a>
        </div>
      `;
    }).join("");
  }

  // Render awal
  renderProduk();

  // Event pencarian
  searchInput.addEventListener("input", (e) => {
    renderProduk(e.target.value);
  });

})
.catch(error => {
  console.error("Gagal memuat data dari Google Sheets:", error);
});
