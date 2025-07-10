const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
let keranjang = [];

Promise.all([
  fetch(`${sheetBase}/produk`).then(res => res.json()),
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/pengaturan`).then(res => res.json())
])
.then(([produk, umkm, pengaturan]) => {
  if (Array.isArray(pengaturan)) {
    document.getElementById("site-title").innerText = pengaturan.find(p => p.key === 'site_title')?.value || "Katalog UMKM";
    document.getElementById("footer-text").innerText = pengaturan.find(p => p.key === 'text_footer')?.value || "";
  }

  const searchInput = document.getElementById("search");
  const filterKategori = document.getElementById("filter-kategori");
  const filterKecamatan = document.getElementById("filter-kecamatan");
  const produkList = document.getElementById("produk-list");

  const semuaKategori = [...new Set(produk.map(p => p.kategori).filter(Boolean))];
  const semuaKecamatan = [...new Set(produk.map(p => p.kecamatan).filter(Boolean))];

  filterKategori.innerHTML = '<option value="">Semua Kategori</option>' + semuaKategori.map(k => `<option value="${k}">${k}</option>`).join('');
  filterKecamatan.innerHTML = '<option value="">Semua Kecamatan</option>' + semuaKecamatan.map(k => `<option value="${k}">${k}</option>`).join('');

  function renderProduk(keyword = "", kategori = "", kecamatan = "") {
    const hasil = produk.filter(p => {
      const u = umkm.find(u => u.id_umkm === p.id_umkm);
      return (
        p.status === "aktif" &&
        (p.nama_produk.toLowerCase().includes(keyword.toLowerCase()) || u?.nama_umkm.toLowerCase().includes(keyword.toLowerCase())) &&
        (kategori ? p.kategori === kategori : true) &&
        (kecamatan ? p.kecamatan === kecamatan : true)
      );
    });

    produkList.innerHTML = hasil.map(p => {
      const u = umkm.find(u => u.id_umkm === p.id_umkm);
      const isFav = keranjang.includes(p.id_produk);
      return `
        <div class="produk-card">
          <div class="produk-img" onclick="showDetail('${p.nama_produk}', \`${p.deskripsi}\`, '${p.gambar_url}', '${parseInt(p.harga).toLocaleString()}')">
            <img src="${p.gambar_url}" alt="${p.nama_produk}" />
          </div>
          <div class="produk-info">
            <h3 class="produk-nama">${p.nama_produk}</h3>
            <p class="produk-harga">Rp ${parseInt(p.harga).toLocaleString()}</p>
            <p class="produk-umkm">${u?.nama_umkm || "UMKM"} - ${p.kecamatan}</p>
            <div class="produk-actions">
              <a href="umkm.html?id=${u?.id_umkm}" class="btn-detail">Lihat UMKM</a>
              <button class="btn-wa" onclick="window.open('https://wa.me/${u?.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}', '_blank')">Pesan via WA</button>
              <button class="btn-fav ${isFav ? 'selected' : ''}" onclick="toggleFav('${p.id_produk}', this)">${isFav ? '🛒 Hapus' : '➕ Keranjang'}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleFav = function(id, el) {
    if (keranjang.includes(id)) {
      keranjang = keranjang.filter(i => i !== id);
      el.classList.remove('selected');
      el.innerText = '➕ Keranjang';
    } else {
      keranjang.push(id);
      el.classList.add('selected');
      el.innerText = '🛒 Hapus';
    }
    console.log("Keranjang:", keranjang);
  }

  window.showDetail = function(nama, deskripsi, gambar, harga) {
    const modal = document.getElementById("produk-modal");
    modal.querySelector(".modal-nama").innerText = nama;
    modal.querySelector(".modal-deskripsi").innerHTML = deskripsi.replace(/\n/g, "<br>");
    modal.querySelector(".modal-gambar").src = gambar;
    modal.querySelector(".modal-harga").innerText = "Rp " + harga;
    modal.style.display = "flex";
  }

  document.getElementById("modal-close").onclick = () => {
    document.getElementById("produk-modal").style.display = "none";
  }

  renderProduk();
  searchInput.addEventListener("input", () => renderProduk(searchInput.value, filterKategori.value, filterKecamatan.value));
  filterKategori.addEventListener("change", () => renderProduk(searchInput.value, filterKategori.value, filterKecamatan.value));
  filterKecamatan.addEventListener("change", () => renderProduk(searchInput.value, filterKategori.value, filterKecamatan.value));
})
.catch(error => {
  console.error("Gagal memuat data dari Google Sheets:", error);
});
