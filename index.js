import fs from "fs";
import { Parser } from "@json2csv/plainjs";

async function fetchDataAndSaveToCSV() {
  const baseUrl = "https://api-sscasn.bkn.go.id/2024/portal/spf?pengadaan_kd=2";
  const kodeRefPend = "5101087"; // Disesuaikan dengan kode pendidikan
  const headers = {
    Origin: "https://sscasn.bkn.go.id",
  };

  const itemsPerPage = 10;
  let totalData = 0;
  let offset = 0;
  let dataArr = [];

  try {
    do {
      const response = await fetch(
        `${baseUrl}&kode_ref_pend=${kodeRefPend}&offset=${offset}`,
        { method: "GET", headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const dataJson = await response.json();
      const metaTotal = dataJson["data"]["meta"]["total"];
      const data = dataJson["data"]["data"];

      if (metaTotal !== 0 && totalData === 0) {
        totalData = metaTotal;
      }

      const formattedData = data.map((item) => ({
        "Link Detail": `https://sscasn.bkn.go.id/detailformasi/${item.formasi_id}`,
        Jabatan: item.jabatan_nm,
        Instansi: item.ins_nm,
        "Unit Kerja": item.lokasi_nm,
        Formasi: `${item.jp_nama} ${item.formasi_nm}`,
        "Penghasilan (Min)": item.gaji_min,
        "Penghasilan (Max)": item.gaji_max,
        "Jumlah Kebutuhan": item.jumlah_formasi,
        "Jumlah Lulus Verifikasi": item.jumlah_ms,
      }));

      dataArr.push(...formattedData);

      offset += itemsPerPage;

      console.clear();
      console.log(`Loading... ${Math.floor((offset / totalData) * 100)}%`);
    } while (offset < totalData);

    const csvParser = new Parser();
    const csv = csvParser.parse(dataArr);

    fs.writeFileSync(`formasi_${kodeRefPend}.csv`, csv);
    console.log(
      `Data berhasil disimpan ke dalam file formasi_${kodeRefPend}.csv!`
    );
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

fetchDataAndSaveToCSV();
