let pengeluaran = [
  {
    id: 1,
    jumlah: 25000,
    kategori: "Makanan",
    tanggal: "2026-06-20",
    catatan: "Makan siang"
  },
  {
    id: 2,
    jumlah: 50000,
    kategori: "Transportasi",
    tanggal: "2026-06-21",
    catatan: "Bensin"
  }
];

function render() {
  const wadah = document.getElementById("daftar-pengeluaran");
  let html = "";

  pengeluaran.forEach(function(item) {
    html += `
      <p>
        ${item.kategori} - Rp${item.jumlah} (${item.tanggal})
        <button onclick="hapusPengeluaran(${item.id})">Hapus</button>
      </p>
    `;
  });

  wadah.innerHTML = html;
}

function hitungTotal() {
  let total = 0;

  pengeluaran.forEach(function(item) {
    total += item.jumlah;
  });

  document.getElementById("total").innerHTML = "Total: Rp" + total;
}

function tambahPengeluaran() {
  const jumlah = Number(document.getElementById("input-jumlah").value);
  const kategori = document.getElementById("input-kategori").value;
  const tanggal = document.getElementById("input-tanggal").value;
  const catatan = document.getElementById("input-catatan").value;

  // Validasi: semua field harus diisi, jumlah harus lebih dari 0
  if (!jumlah || !kategori || !tanggal || !catatan) {
    alert("Semua field harus diisi!");
    return;
  }

  if (jumlah <= 0) {
    alert("Jumlah harus lebih dari 0!");
    return;
  }

  const baru = {
    id: Date.now(),
    jumlah: jumlah,
    kategori: kategori,
    tanggal: tanggal,
    catatan: catatan
  };

  pengeluaran.push(baru);
  simpanData();
  render();
  hitungTotal();
}

function hapusPengeluaran(id) {
  pengeluaran = pengeluaran.filter(function(item) {
    return item.id !== id;
  });
  simpanData();
  render();
  hitungTotal();
}

function simpanData() {
  localStorage.setItem("pengeluaran", JSON.stringify(pengeluaran));
}

function muatData() {
  const data = localStorage.getItem("pengeluaran");
  if (data) {
    pengeluaran = JSON.parse(data);
  }
}

document.getElementById("btn-tambah").addEventListener("click", tambahPengeluaran);
muatData();
render();
hitungTotal();

console.log(pengeluaran);