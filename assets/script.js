document.addEventListener("DOMContentLoaded", function () {
  const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE";
  let dataProduk = [], dataUMKM = [];

  // Fetch Produk
  fetch(`${sheetBase}/produk`)
    .then(res => res.json())
    .then(data => {
      dataProduk = data.filter(p => p.status === "aktif");
      renderProduk(dataProduk);
      renderKategori(dataProduk);
    });

  // Fetch UMKM
  fetch(`${sheetBase}/umkm`)
    .then(res => res.json())
    .then(data => {
      dataUMKM = data;
      renderKecamatan(data);
    });

  // Render Produk
  function renderProduk(list) {
    const container = document.getElementById("produk-list");
    container.innerHTML = list.map(p => `
      <div class="produk-card">
        <div class="produk-img" data-nama="${p.nama_produk}" data-deskripsi="${p.deskripsi_produk}" data-gambar="${p.gambar_url}" data-harga="${p.harga}">
          <img src="${p.gambar_url}" alt="${p.nama_produk}" />
        </div>
        <div class="produk-info">
          <h3>${p.nama_produk}</h3>
          <p>Rp ${parseInt(p.harga).toLocaleString()}</p>
          <div class="produk-actions">
            <button class="btn-wa" data-id="${p.id_umkm}" data-produk="${p.nama_produk}">Pesan via WA</button>
            <button onclick="window.location.href='umkm.html?id=${p.id_umkm}'">🔍 Kunjungi UMKM</button>
          </div>
        </div>
      </div>`).join("");

    // Tambahkan event listener untuk WA & Detail Produk
    document.querySelectorAll(".btn-wa").forEach(btn => {
      btn.addEventListener("click", function () {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
          alert("Silakan login terlebih dahulu.");
          const user = JSON.parse(localStorage.getItem("user") || "null");
            if (!user) {
              showLoginPopup(); // tampilkan form login pop-up
              return;
            }

          return;
        }
        const id_umkm = this.getAttribute("data-id");
        const produk = this.getAttribute("data-produk");
        const umkm = dataUMKM.find(u => u.id_umkm === id_umkm);
        if (umkm) {
          window.open(`https://wa.me/${umkm.kontak_wa}?text=Halo,%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(produk)}`, "_blank");
        }
      });
    });

    document.querySelectorAll(".produk-img").forEach(div => {
      div.addEventListener("click", function () {
        showDetail(
          div.getAttribute("data-nama"),
          div.getAttribute("data-deskripsi"),
          div.getAttribute("data-gambar"),
          div.getAttribute("data-harga")
        );
      });
    });
  }

  // Render Kecamatan
  function renderKecamatan(umkmList) {
    const kecamatanSet = new Set(umkmList.map(u => u.kecamatan));
    const filter = document.getElementById("filter-kecamatan");
    if (!filter) return;
    filter.innerHTML = `<option value="">-- Semua Kecamatan --</option>` +
      [...kecamatanSet].sort().map(k => `<option value="${k}">${k}</option>`).join("");
    filter.addEventListener("change", applyFilters);
  }

  // Render Kategori
  function renderKategori(produkList) {
    const kategoriSet = new Set(produkList.map(p => p.kategori));
    const filter = document.getElementById("filter-kategori");
    if (!filter) return;
    filter.innerHTML = `<option value="">-- Semua Kategori --</option>` +
      [...kategoriSet].sort().map(k => `<option value="${k}">${k}</option>`).join("");
    filter.addEventListener("change", applyFilters);
  }

  // Apply Filters
  function applyFilters() {
    const kecamatan = document.getElementById("filter-kecamatan").value;
    const kategori = document.getElementById("filter-kategori").value;
    let hasil = [...dataProduk];

    if (kecamatan) {
      const umkmId = dataUMKM.filter(u => u.kecamatan === kecamatan).map(u => u.id_umkm);
      hasil = hasil.filter(p => umkmId.includes(p.id_umkm));
    }

    if (kategori) {
      hasil = hasil.filter(p => p.kategori === kategori);
    }

    renderProduk(hasil);
  }

  // Form Pencarian
  const inputSearch = document.getElementById("search-input");
  if (inputSearch) {
    inputSearch.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const hasil = dataProduk.filter(p => p.nama_produk.toLowerCase().includes(keyword));
      renderProduk(hasil);
    });
  }

  // Modal Produk
  window.showDetail = function (nama, deskripsi, gambar, harga) {
    const modal = document.getElementById("produk-modal");
    if (!modal) return;
    modal.querySelector(".modal-nama").innerText = nama;
    modal.querySelector(".modal-deskripsi").innerHTML = deskripsi.replace(/\n/g, "<br>");
    modal.querySelector(".modal-gambar").src = gambar;
    modal.querySelector(".modal-harga").innerText = "Rp " + parseInt(harga).toLocaleString();
    modal.style.display = "flex";
  };

  function showLoginPopup() {
  document.getElementById("login-popup").style.display = "flex";
}

document.getElementById("login-close").addEventListener("click", () => {
  document.getElementById("login-popup").style.display = "none";
});

document.getElementById("login-submit").addEventListener("click", () => {
  const nama = document.getElementById("login-nama").value.trim();
  const wa = document.getElementById("login-wa").value.trim();

  if (!nama || !wa.startsWith("62")) {
    alert("Nama dan WA wajib diisi, mulai dengan 62.");
    return;
  }

  const userData = { nama, wa };
  localStorage.setItem("user", JSON.stringify(userData));

  fetch("https://script.google.com/macros/s/AKfycbwcrkAzqU2QaG9JIXlc7SPMI_TVRlqxMIPUqQGgpJ8/exec", {
    method: "POST",
    body: JSON.stringify(userData),
    headers: { "Content-Type": "application/json" }
  }).then(res => res.json())
    .then(() => {
      alert("Login berhasil!");
      document.getElementById("login-popup").style.display = "none";
    }).catch(() => {
      alert("Gagal kirim data login.");
      document.getElementById("login-popup").style.display = "none";
    });
});


  const modalClose = document.getElementById("modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      document.getElementById("produk-modal").style.display = "none";
    });
  }
});
