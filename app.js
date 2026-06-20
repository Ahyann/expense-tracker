const pengeluaran = [
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
    html += `<p>${item.kategori} - Rp${item.jumlah} (${item.tanggal})</p>`;
  });

  wadah.innerHTML = html;
}

render();

function hitungTotal() {
  let total = 0;

  pengeluaran.forEach(function(item) {
    total += item.jumlah;
  });

  document.getElementById("total").innerHTML = "Total: Rp" + total;
}

hitungTotal();

function tambahPengeluaran() {
  const jumlah = Number(document.getElementById("input-jumlah").value);
  const kategori = document.getElementById("input-kategori").value;
  const tanggal = document.getElementById("input-tanggal").value;
  const catatan = document.getElementById("input-catatan").value;

  const baru = {
    id: Date.now(),
    jumlah: jumlah,
    kategori: kategori,
    tanggal: tanggal,
    catatan: catatan
  };

  pengeluaran.push(baru);

  render();
  hitungTotal();
}

document.getElementById("btn-tambah").addEventListener("click", tambahPengeluaran);


console.log(pengeluaran);