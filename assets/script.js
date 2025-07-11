const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
let dataProduk = [], dataUMKM = [];

fetch(`${sheetBase}/produk`)
  .then(res => res.json())
  .then(data => {
    dataProduk = data.filter(p => p.status === "aktif");
    renderProduk(dataProduk);
    renderKategori(dataProduk); // buat dropdown kategori
  });

fetch(`${sheetBase}/umkm`)
  .then(res => res.json())
  .then(data => {
    dataUMKM = data;
    renderKecamatan(data);
  });

function renderProduk(list) {
  const container = document.getElementById("produk-list");
  container.innerHTML = list.map(p => {
    const umkm = dataUMKM.find(u => u.id_umkm === p.id_umkm);
    return `
      <div class="produk-card">
        <div class="produk-img" onclick="showDetail('${p.nama_produk}', \`${p.deskripsi_produk}\`, '${p.gambar_url}', '${parseInt(p.harga).toLocaleString()}')">
          <img src="${p.gambar_url}" alt="${p.nama_produk}" />
        </div>
        <div class="produk-info">
          <h3 class="produk-nama">${p.nama_produk}</h3>
          <p class="produk-harga">Rp ${parseInt(p.harga).toLocaleString()}</p>
          <div class="produk-actions">
            <button class="btn-wa" onclick="handleWAClick('${p.id_umkm}', '${p.nama_produk}')">Pesan via WA</button>
            <button class="btn-visit" onclick="window.location.href='umkm.html?id=${p.id_umkm}'">🔍 Kunjungi UMKM</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderKecamatan(umkmList) {
  const kecamatanSet = new Set(umkmList.map(u => u.kecamatan));
  const filter = document.getElementById("filter-kecamatan");
  filter.innerHTML = `<option value="">-- Semua Kecamatan --</option>` +
    [...kecamatanSet].sort().map(k => `<option value="${k}">${k}</option>`).join("");
}

function renderKategori(produkList) {
  const kategoriSet = new Set(produkList.map(p => p.kategori));
  const filter = document.getElementById("filter-kategori");
  filter.innerHTML = `<option value="">-- Semua Kategori --</option>` +
    [...kategoriSet].sort().map(k => `<option value="${k}">${k}</option>`).join("");
}

// Filter berdasarkan dropdown kategori & kecamatan
document.getElementById("filter-kecamatan").addEventListener("change", applyFilters);
document.getElementById("filter-kategori").addEventListener("change", applyFilters);

function applyFilters() {
  const valKec = document.getElementById("filter-kecamatan").value;
  const valKat = document.getElementById("filter-kategori").value;
  let result = [...dataProduk];

  if (valKec) {
    const umkmId = dataUMKM.filter(u => u.kecamatan === valKec).map(u => u.id_umkm);
    result = result.filter(p => umkmId.includes(p.id_umkm));
  }
  if (valKat) {
    result = result.filter(p => p.kategori === valKat);
  }
  renderProduk(result);
}

// Pencarian
document.getElementById("search-input").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = dataProduk.filter(p => p.nama_produk.toLowerCase().includes(keyword));
  renderProduk(filtered);
});

// Modal detail produk
window.showDetail = function(nama, deskripsi, gambar, harga) {
  const modal = document.getElementById("produk-modal");
  modal.querySelector(".modal-nama").innerText = nama;
  modal.querySelector(".modal-deskripsi").innerHTML = deskripsi.replace(/\n/g, "<br>");
  modal.querySelector(".modal-gambar").src = gambar;
  modal.querySelector(".modal-harga").innerText = "Rp " + harga;
  modal.querySelector(".modal-gambar").onclick = function () {
    this.classList.toggle("zoomed");
  };
  modal.style.display = "flex";
};

document.getElementById("modal-close").onclick = () => {
  document.getElementById("produk-modal").style.display = "none";
};

// WA tombol
window.handleWAClick = function(id_umkm, nama_produk) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Silakan login terlebih dahulu untuk menghubungi via WA.");
    window.location.href = "login.html";
    return;
  }
  const umkm = dataUMKM.find(u => u.id_umkm === id_umkm);
  if (!umkm) return;
  window.open(`https://wa.me/${umkm.kontak_wa}?text=Halo%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(nama_produk)}`, '_blank');
};
