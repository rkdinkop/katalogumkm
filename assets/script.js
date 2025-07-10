const sheetBase = "https://opensheet.elk.sh/18m_LNkymanQNHmZYV-O_4vdp_eyS3solzsaxVi20KZE/produk";

// Ambil data produk & UMKM
Promise.all([
  fetch(`${sheetBase}/produk`).then(res => res.json()),
  fetch(`${sheetBase}/umkm`).then(res => res.json()),
  fetch(`${sheetBase}/pengaturan`).then(res => res.json())
]).then(([produk, umkm, pengaturan]) => {
  document.getElementById("site-title").innerText = pengaturan.find(p => p.key === 'site_title')?.value || "Katalog UMKM";
  document.getElementById("footer-text").innerText = pengaturan.find(p => p.key === 'text_footer')?.value || "";

  const search = document.getElementById("search");
  const produkList = document.getElementById("produk-list");

  // Render produk
  function renderProduk(keyword = "") {
    const hasil = produk.filter(p => {
      return (
        p.status === "aktif" &&
        (p.nama_produk.toLowerCase().includes(keyword.toLowerCase()) ||
         umkm.find(u => u.id_umkm === p.id_umkm)?.nama_umkm.toLowerCase().includes(keyword.toLowerCase()))
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
          <a href="https://wa.me/${u?.kontak_wa}?text=Saya%20tertarik%20dengan%20produk%20${encodeURIComponent(p.nama_produk)}" target="_blank">Pesan via WA</a>
        </div>`;
    }).join("");
  }

  renderProduk();

  search.addEventListener("input", (e) => {
    renderProduk(e.target.value);
  });
});
