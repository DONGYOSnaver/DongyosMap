// 지도 생성 (attributionControl: false 설정으로 저작권 표시 완벽 제거)
const map = L.map('map', {
  center: [37.5665, 126.9780],
  zoom: 13,
  minZoom: 3,
  maxZoom: 19,
  zoomControl: false,
  attributionControl: false,
  scrollWheelZoom: true,
  zoomAnimation: true
});

// 일반지도 레이어
const streetMap = L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19
  }
);

// 위성지도 레이어
const satelliteMap = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 19
  }
);

// 기본 위성지도 설정
satelliteMap.addTo(map);

// 줌 인
function zoomIn() {
  map.zoomIn();
}

// 줌 아웃
function zoomOut() {
  map.zoomOut();
}

// 서울 초기 위치로 복귀
function resetMap() {
  map.flyTo([37.5665, 126.9780], 13, {
    duration: 1.5
  });
}

// 지도 레이어 전환
function changeMap(type) {
  if (type === 'satellite') {
    map.removeLayer(streetMap);
    satelliteMap.addTo(map);

    document.getElementById('satBtn').classList.add('active');
    document.getElementById('streetBtn').classList.remove('active');
  } else {
    map.removeLayer(satelliteMap);
    streetMap.addTo(map);

    document.getElementById('streetBtn').classList.add('active');
    document.getElementById('satBtn').classList.remove('active');
  }
}

/* ===== 드롭다운 메뉴 제어 ===== */
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
const menuUser = document.getElementById("menuUser");

function openMenu() {
  menuPanel.classList.add("open");
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.setAttribute("aria-label", "메뉴 닫기");
}

function closeMenu() {
  menuPanel.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "메뉴 열기");
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#menuBtn")) {
    menuPanel.classList.contains("open") ? closeMenu() : openMenu();
  } else if (!e.target.closest("#menuPanel")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// authchange 이벤트 수신하여 메뉴 유저 표시 업데이트
document.addEventListener("authchange", (e) => {
  const user = e.detail.user;
  if (menuUser) {
    menuUser.textContent = user ? user.split("@")[0] + "님" : "";
  }
  if (!user) closeMenu();
});

// 확대 수치 표시 업데이트
map.on('zoomend', () => {
  document.getElementById('zoomLevel').textContent = map.getZoom();
});

// 장소 검색 이벤트 (Nominatim API)
document.getElementById('search').addEventListener('keydown', async function(e) {
  if (e.key !== 'Enter') return;

  const keyword = this.value.trim();
  if (!keyword) return;

  try {
    const response = await fetch(
      'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(keyword)
    );

    const results = await response.json();

    if (results.length > 0) {
      const place = results[0];
      map.flyTo(
        [Number(place.lat), Number(place.lon)],
        17,
        { duration: 1.5 }
      );
    } else {
      alert('검색 결과가 없습니다.');
    }
  } catch(error) {
    alert('검색 오류가 발생했습니다.');
  }
});