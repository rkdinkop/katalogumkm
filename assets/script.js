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
  const filterKategori = document.getElementById("filter-kategori");
  const filterKecamatan = document.getElementById("filter-kecamatan");
  const produkList = document.getElementById("produk-list");

  // Generate dropdown filter kategori dan kecamatan
  const semuaKategori = [...new Set(produk.map(p => p.kategori).filter(k => k))];
  const semuaKecamatan = [...new Set(produk.map(p => p.kecamatan).filter(k => k))];

  filterKategori.innerHTML = '<option value="">Semua Kategori</option>' + semuaKategori.map(k => `<option value="${k}">${k}</option>`).join('');
  filterKecamatan.innerHTML = '<option value="">Semua Kecamatan</option>' + semuaKecamatan.map(k => `<option value="${k}">${k}</option>`).join('');

  function renderProduk(keyword = "", kategori = "", kecamatan = "") {
    const hasil = produk.filter(p => {
      const u = umkm.find(u => u.id_umkm === p.id_umkm);
      return (
        p.status === "aktif" &&
        (p.nama_produk.toLowerCase().includes(keyword.toLowerCase()) ||
         u?.nama_umkm.toLowerCase().includes(keyword.toLowerCase())) &&
        (kategori ? p.kategori === kategori : true) &&
        (kecamatan ? p.kecamatan === kecamatan : true)
      );
    });

    produkList.innerHTML = hasil.map(p => {
      const u = umkm.find(u => u.id_umkm === p.id_umkm);
      return `
        <div class="produk-card">
          <div class="produk-img">
            <img src="${p.gambar_url}" alt="${p.nama_produk}" />
          </div>
          <div class="produk-info">
            <h3 class="produk-nama">${p.nama_produk}</h3>
            <p class="produk-harga">Rp ${parseInt(p.harga).toLocaleString()}</p>
            <p class="produk-umkm">${u?.nama_umkm || "UMKM"} - ${p.kecamatan}</p>
            <div class="produk-actions">
              <a href="umkm.html?id=${u?.id_umkm}" class="btn-detail">Lihat UMKM</a>
              <a href="https://wa.me/${u?.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}" class="btn-wa" target="_blank">Pesan via WA</a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render awal
  renderProduk();

  // Event pencarian & filter
  searchInput.addEventListener("input", () => {
    renderProduk(searchInput.value, filterKategori.value, filterKecamatan.value);
  });

  filterKategori.addEventListener("change", () => {
    renderProduk(searchInput.value, filterKategori.value, filterKecamatan.value);
  });

  filterKecamatan.addEventListener("change", () => {
    renderProduk(searchInput.value, filterKategori.value, filterKecamatan.value);
  });

})
.catch(error => {
  console.error("Gagal memuat data dari Google Sheets:", error);
});

