const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
let dataProduk = [], dataUMKM = [];
let keranjang = [], keranjangQty = {};

fetch(`${sheetBase}/produk`).then(res => res.json()).then(data => {
  dataProduk = data.filter(p => p.status === "aktif");
  renderProduk(dataProduk);
}).catch(err => console.error("Gagal load produk:", err));

fetch(`${sheetBase}/umkm`).then(res => res.json()).then(data => {
  dataUMKM = data;
  renderFilter(data);
}).catch(err => console.error("Gagal load UMKM:", err));

function renderProduk(list) {
  const container = document.getElementById("produk-list");
  container.innerHTML = list.map(p => {
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
          <button class="btn-fav" onclick="toggleFav('${p.id_produk}', this)">➕ Keranjang</button>
        </div>
      </div>
    </div>`;
  }).join("");
  updateCartIcon();
}

function renderFilter(umkmList) {
  const kecamatan = [...new Set(umkmList.map(u => u.kecamatan))].sort();
  const filter = document.getElementById("filter-kecamatan");
  filter.innerHTML = `<option value="">-- Semua Kecamatan --</option>` + kecamatan.map(k => `<option value="${k}">${k}</option>`).join("");
}

document.getElementById("filter-kecamatan").addEventListener("change", (e) => {
  const val = e.target.value;
  if (val) {
    const umkmId = dataUMKM.filter(u => u.kecamatan === val).map(u => u.id_umkm);
    const filtered = dataProduk.filter(p => umkmId.includes(p.id_umkm));
    renderProduk(filtered);
  } else {
    renderProduk(dataProduk);
  }
});

document.getElementById("search-input").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  const filtered = dataProduk.filter(p => p.nama_produk.toLowerCase().includes(keyword));
  renderProduk(filtered);
});

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

window.toggleFav = function(id, el) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Anda harus login terlebih dahulu.");
    window.location.href = "login.html";
    return;
  }
  if (keranjang.includes(id)) {
    keranjang = keranjang.filter(i => i !== id);
    delete keranjangQty[id];
    el.classList.remove("selected");
    el.innerText = "➕ Keranjang";
  } else {
    keranjang.push(id);
    keranjangQty[id] = 1;
    el.classList.add("selected");
    el.innerText = "🛒 Hapus";
  }
  updateCartIcon();
};

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

function updateCartIcon() {
  const icon = document.getElementById("floating-cart");
  const count = document.getElementById("cart-count");
  if (keranjang.length > 0) {
    icon.style.display = "flex";
    count.innerText = keranjang.length;
  } else {
    icon.style.display = "none";
  }
}

document.getElementById("floating-cart").addEventListener("click", () => {
  alert("Untuk review dan checkout keranjang, silakan buka halaman profil UMKM terlebih dahulu.");
});
