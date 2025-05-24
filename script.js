const alanlar = [
  "Seçilen Kişi", "Türü", "Cinsiyeti", "Irkı", "Cille Türü", "Elementi",
  "Cille Özelliği", "İlk Görülmesi", "Filmde Var Mı", "Cillenin Uçabilirliği",
  "Yaşadığı Zaman", "Cillesi Oldu Mu?"
];

let karakterler = [];
let secilenKisi = null;
let tahminSayisi = 0;
let currentIndex = -1;
let oyunBitti = false;


async function veriYukle() {
  const response = await fetch('characters.json');
  karakterler = await response.json();
  secilenKisi = karakterler[Math.floor(Math.random() * karakterler.length)];
}

function baslikSatiriOlustur() {
  const baslikContainer = document.getElementById("baslikSatiri");
  baslikContainer.innerHTML = "";

  // Boş kutu: Seçilen Kişi görseli ile hizalamak için
  const bosKutu = document.createElement("div");
  bosKutu.className = "veri-kutusu veri-baslik";
  bosKutu.style.backgroundColor = "transparent";
  bosKutu.style.border = "none";
  bosKutu.textContent = ""; // boş içerik
  baslikContainer.appendChild(bosKutu);

  alanlar.slice(1).forEach(alan => {
    const baslik = document.createElement("div");
    baslik.className = "veri-kutusu veri-baslik";
    baslik.textContent = alan;
    baslik.style.backgroundColor = "rgba(255, 255, 255, 0)";
    baslik.style.color = "#000";
    baslikContainer.appendChild(baslik);
  });

  baslikContainer.style.display = "flex";
}

function karakterSecildi(ad) {
  if (oyunBitti) return;
  const karakter = karakterler.find(k => k["Seçilen Kişi"].toLowerCase() === ad.toLowerCase());
  const container = document.getElementById("tahminSonuclari");

  if (!karakter || Array.from(container.children).some(c => c.dataset.ad === ad)) return;

  tahminSayisi++;
  let kazanildi = true;

  if (tahminSayisi === 1) {
    baslikSatiriOlustur();
  }

  const tahminBlok = document.createElement("div");
  tahminBlok.className = "tahmin-blok";
  tahminBlok.dataset.ad = ad;

  const resim = document.createElement("img");
  const resimYolu = `images/${karakter["Seçilen Kişi"]}`;
  resim.src = `${resimYolu}.jpg`;
  resim.onerror = () => {
    resim.onerror = null;
    resim.src = `${resimYolu}.jpeg`;
  };
  resim.alt = karakter["Seçilen Kişi"];
  resim.className = "karakter-foto";
  tahminBlok.appendChild(resim);

  const veriKutulari = document.createElement("div");
  veriKutulari.className = "veri-kutulari";

  alanlar.slice(1).forEach((alan, index) => {
    const kutu = document.createElement("div");
    kutu.className = "veri-kutusu";
    kutu.textContent = karakter[alan] || "Yok";
    kutu.style.animationDelay = `${index * 0.3}s`;

    if (karakter[alan] === secilenKisi[alan]) {
      kutu.classList.add("green");
    } else {
      kutu.classList.add("red");
      kazanildi = false;
    }

    veriKutulari.appendChild(kutu);
  });

  tahminBlok.appendChild(veriKutulari);
  container.prepend(tahminBlok);

    if (kazanildi) {
    oyunBitti = true; // 🔒 Artık başka tahmin yapılmasın
    setTimeout(() => {
      document.getElementById("kazandinMesaji").style.display = "block";
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 4100);
  }

  document.getElementById("karakterInput").value = "";

}

function oneriFiltrele(girdi) {
  const liste = document.getElementById("oneriListesi");
  liste.innerHTML = "";
  if (!girdi) {
    liste.style.display = "none";
    return;
  }

  const eslesenler = karakterler
    .map(k => k["Seçilen Kişi"])
    .filter(ad => ad.toLowerCase().includes(girdi.toLowerCase()))
    .slice(0, 8);

  if (eslesenler.length === 0) {
    liste.style.display = "none";
    return;
  }

  eslesenler.forEach(ad => {
    const oge = document.createElement("li");
    oge.textContent = ad;
    oge.addEventListener("click", () => {
      document.getElementById("karakterInput").value = ad;
      liste.innerHTML = "";
      liste.style.display = "none";
      karakterSecildi(ad);
    });
    liste.appendChild(oge);
  });

  liste.style.display = "block";
}

document.addEventListener("DOMContentLoaded", async () => {
  await veriYukle();

  const input = document.getElementById("karakterInput");
  const liste = document.getElementById("oneriListesi");
  const btn = document.getElementById("tahminEtBtn");

  input.addEventListener("input", () => {
    currentIndex = -1;
    oneriFiltrele(input.value);
  });

  input.addEventListener("keydown", e => {
    const ogeler = Array.from(liste.getElementsByTagName("li"));
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentIndex < ogeler.length - 1) currentIndex++;
      ogeler.forEach((li, i) => li.classList.toggle("selected", i === currentIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentIndex > 0) currentIndex--;
      ogeler.forEach((li, i) => li.classList.toggle("selected", i === currentIndex));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentIndex >= 0 && ogeler[currentIndex]) {
        ogeler[currentIndex].click();
      } else {
        const ad = input.value.trim();
        karakterSecildi(ad);
        liste.innerHTML = "";
        liste.style.display = "none";
      }
    }
  });

  btn.addEventListener("click", () => {
    const ad = input.value.trim();
    karakterSecildi(ad);
    input.value = "";
    liste.innerHTML = "";
    liste.style.display = "none";
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".input-button-container")) {
      liste.innerHTML = "";
      liste.style.display = "none";
    }
  });
});
