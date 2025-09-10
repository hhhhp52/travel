import React, { useEffect, useState } from 'react';
import './App.css';
import { fmtWithTpe } from './time';
import { getItinerary, DayEntry } from './itinerary';



function App() {
  // Itinerary data from JSON
  const itineraryData = getItinerary();
  const itineraryIds = itineraryData.days.map(d => d.id);
  const itineraryLabels = itineraryData.days.map(d => d.label);
  const [activeDayId, setActiveDayId] = useState<string>(itineraryIds[0]);
  type Page = 'home' | 'itinerary' | 'packing' | 'transport';
  const [page, setPage] = useState<Page>('home');
  // Smooth scrolling for inner-page anchors
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  // Observe itinerary sections to highlight the one closest to viewport center
  useEffect(() => {
    if (page !== 'itinerary') return;

    const getBestSection = () => {
      const centerY = window.innerHeight / 2;
      const visible: { id: string; dist: number }[] = [];
      itineraryIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const padding = 12;
        const isVisible = r.bottom > padding && r.top < window.innerHeight - padding;
        if (isVisible) {
          const mid = (r.top + r.bottom) / 2;
          const dist = Math.abs(mid - centerY);
          visible.push({ id, dist });
        }
      });
      if (visible.length) {
        visible.sort((a, b) => a.dist - b.dist);
        const best = visible[0];
        if (best.id && best.id !== activeDayId) setActiveDayId(best.id);
      }
    };

    const obs = new IntersectionObserver(getBestSection, { root: null, rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

    itineraryIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    getBestSection();

    return () => obs.disconnect();
  }, [page, itineraryIds, activeDayId]);

  return (
    <div className="site">
      <header className="topbar">
        <div className="brand">旅行計畫</div>
        <nav className="tabs">
          <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>首頁</button>
          <button className={page === 'itinerary' ? 'active' : ''} onClick={() => setPage('itinerary')}>行程</button>
          <button className={page === 'packing' ? 'active' : ''} onClick={() => setPage('packing')}>準備用品</button>
          <button className={page === 'transport' ? 'active' : ''} onClick={() => setPage('transport')}>交通概覽</button>
        </nav>
      </header>

      {page === 'home' && (
        <main className="content page">
          <div className="page-grid">
            <aside className="inner-sidebar">
              <a href="#intro">旅程敘述</a>
              <a href="#countries">國家總覽</a>
              <a href="#members">參與成員</a>
            </aside>
            <div className="page-body">
              <section id="intro" className="card hero">
                <h1>這次旅行的小宇宙 ✨</h1>
                <p>環遊歐洲與非洲精華路線：德國 → 葡萄牙 → 西班牙 → 冰島 → 坦尚尼亞 → 英國。以輕鬆可愛的步調探索城市、美食與自然奇景。</p>
                <ul className="tags">
                  <li>城市散步</li>
                  <li>美食咖啡</li>
                  <li>自然風景</li>
                </ul>
              </section>
              <section id="countries" className="card">
                <h2>國家總覽</h2>
                <ul className="country-list">
                  <li><strong>德國</strong>：歷史與啤酒文化，柏林/慕尼黑城市漫遊。</li>
                  <li><strong>葡萄牙</strong>：里斯本坡城、蛋撻與法朵音樂。</li>
                  <li><strong>西班牙</strong>：巴塞隆納高第建築與小吃 Tapas。</li>
                  <li><strong>冰島</strong>：瀑布、黑沙灘與極光（視季節）。</li>
                  <li><strong>坦尚尼亞</strong>：野生動物 Safari 與乞力馬札羅山景。</li>
                  <li><strong>英國</strong>：倫敦博物館、劇院與市集文化。</li>
                </ul>
              </section>
              <section id="members" className="card">
                <h2>參與成員</h2>
                <p>目前預計 2-4 位旅伴，分工：規劃/交通、住宿/餐廳、攝影/記錄、駕駛/導航。</p>
              </section>
              <footer className="footer">
                <small>小提示：在右側邊欄可快速跳至各區塊。</small>
              </footer>
            </div>
          </div>
        </main>
      )}

      {page === 'itinerary' && (
        <main className="content page">
          <div className="page-grid">
            <aside className="inner-sidebar">
              {itineraryLabels.map((label, i) => (
                <a key={itineraryIds[i]} href={`#${itineraryIds[i]}`} className={activeDayId === itineraryIds[i] ? 'active' : ''}>{label}</a>
              ))}
            </aside>
            <div className="page-body">
                {itineraryData.days.map((d: DayEntry, idx: number, arr: DayEntry[]) => (
                  <div key={d.id}>
                    <section id={d.id} className={`card day-section ${idx % 2 === 1 ? 'alt' : ''}`}>
                      <header className="day-header">
                        <div className="chip">{d.date}</div>
                        <h3>{d.location}</h3>
                      </header>
                      <div className="mini-rows">
                        <div className="mini-row"><span className="mini-label">氣候</span><span className="mini-value">{d.weather}</span></div>
                        <div className="mini-row"><span className="mini-label">日出日落</span><span className="mini-value">日出：{d.sunrise} · 日落：{d.sunset}</span></div>
                        <div className="mini-row"><span className="mini-label">建議穿搭</span><span className="mini-value">{d.wear}</span></div>
                      </div>
                      {d.timeline && d.timeline.length > 0 && (
                        <div className="section-block">
                          <h4 style={{margin:"10px 0 6px"}}>行程概覽</h4>
                          <ol className="flight-timeline">
                            {d.timeline.map((t, i) => (
                              <li key={i}>
                                <div className="time-col">
                                  <span className="badge">{t.time}</span>
                                  {t.price ? <span className="under-time-price">{t.price}</span> : null}
                                </div>
                                <div className="flight-main">
                                  {t.text}
                                  {t.subpoints && t.subpoints.length > 0 && (
                                    <ul>
                                      {t.subpoints.map((sp, j) => {
                                        const m = typeof sp === 'string' ? sp.match(/€\s?\d+(?:\.\d+)?/i) : null;
                                        const price = m ? m[0].replace(/\s+/g, '') : null; // normalize like "€5.3"
                                        const text = m ? sp.replace(m[0], '').replace(/\s{2,}/g, ' ').trim() : sp;
                                        return (
                                          <li key={j}>
                                            {price ? <span className="price-pill" style={{marginRight:6}}>{price}</span> : null}
                                            {text as string}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {d.notes && <p className="notes">備註：{d.notes}</p>}
                    </section>
                    {idx < arr.length - 1 && <hr className="day-divider" aria-hidden="true" />}
                  </div>
                ))}
            </div>
          </div>
        </main>
      )}

      {page === 'packing' && (
        <main className="content page">
          <section className="card">
            <h2>準備用品 Checklist（針對行程地點）</h2>
            <ul className="checklist">
              <li><input type="checkbox" id="passport" /> <label htmlFor="passport">護照、簽證（申根/英國/坦尚尼亞 eVisa 如需）</label></li>
              <li><input type="checkbox" id="finance" /> <label htmlFor="finance">信用卡（可免海外手續費）、部分現金（歐元、英鎊、坦尚先令）</label></li>
              <li><input type="checkbox" id="adaptor" /> <label htmlFor="adaptor">轉接頭：歐規 C/F、英規 G、坦尚尼亞常見 D/G</label></li>
              <li><input type="checkbox" id="med" /> <label htmlFor="med">常備藥品與腸胃/暈車藥、防蚊液、晒後修護</label></li>
              <li><input type="checkbox" id="layers" /> <label htmlFor="layers">洋蔥式保暖（冰島）、防風防水外套與登山鞋</label></li>
              <li><input type="checkbox" id="safari" /> <label htmlFor="safari">Safari 裝備：中性色長袖、望遠鏡、相機長焦、帽子</label></li>
              <li><input type="checkbox" id="rain" /> <label htmlFor="rain">輕便雨具（葡萄牙/英國/冰島可能陣雨）</label></li>
              <li><input type="checkbox" id="tech" /> <label htmlFor="tech">行動電源、萬國充、Type-C/Lightning 線材、旅充插頭</label></li>
              <li><input type="checkbox" id="docs" /> <label htmlFor="docs">旅遊保險、國際駕照（冰島/坦尚尼亞自駕若需）</label></li>
            </ul>
          </section>
        </main>
      )}

      {page === 'transport' && (
        <main className="content page">
          {/* 航班資訊：獨立區塊，使用時間軸樣式分段顯示，降低密度感 */}
          <section className="card transport-section">
            <header className="section-header">
              <h2>航班概覽</h2>
              <p className="section-sub">依旅程分段呈現：去程 → 歐洲內/火車 → 北歐 → 非洲 → 返程</p>
            </header>

            <div className="flight-groups">
              <div className="flight-group">
                <h3 className="group-title">去程/台北 → 新加坡 → 法蘭克福</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">09/12 Fri</span>
                    <div className="flight-main"><strong>新加坡航空 SQ879</strong> {fmtWithTpe('TPE','09/12 Fri','17:45')} → {fmtWithTpe('SIN','09/12 Fri','22:15')} <span className="muted">· Boeing 787-10/桃園 T2 → 樟宜</span></div>
                  </li>
                  <li>
                    <span className="badge">09/12–13</span>
                    <div className="flight-main"><strong>新加坡航空 SQ26</strong> {fmtWithTpe('SIN','09/12 Fri','23:55')} T3 → {fmtWithTpe('FRA','09/13 Sat','07:05')} T1 <span className="muted">翌日抵達</span></div>
                  </li>
                </ol>
              </div>

              <div className="flight-group">
                <h3 className="group-title">歐洲內移動/德國 → 葡萄牙</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">09/16 Mon</span>
                    <div className="flight-main"><strong>漢莎航空 LH1178</strong> {fmtWithTpe('FRA','09/16 Mon','13:55')} T1 → {fmtWithTpe('OPO','09/16 Mon','15:45')}</div>
                  </li>
                </ol>
              </div>

              <div className="flight-group">
                <h3 className="group-title">北歐段/葡萄牙 → 冰島 → 法國</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">09/25–26</span>
                    <div className="flight-main"><strong>TAP 葡萄牙航空 TP5600</strong> {fmtWithTpe('LIS','09/25 Thu','22:00')} T1 → {fmtWithTpe('KEF','09/26 Fri','01:50')}</div>
                  </li>
                  <li>
                    <span className="badge">10/02 Thu</span>
                    <div className="flight-main"><strong>Icelandair 冰島航空 FI546</strong> {fmtWithTpe('KEF','10/02 Thu','10:30')} → {fmtWithTpe('CDG','10/02 Thu','15:55')} T1</div>
                  </li>
                </ol>
              </div>

              <div className="flight-group">
                <h3 className="group-title">非洲段/法國 → 盧安達 → 吉力馬札羅</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">10/02 Thu</span>
                    <div className="flight-main"><strong>RwandAir 盧安達航空 WB701</strong> {fmtWithTpe('CDG','10/02 Thu','21:30')} → {fmtWithTpe('KGL','10/03 Fri','06:30')} (+1)</div>
                  </li>
                  <li>
                    <span className="badge">10/03 Fri</span>
                    <div className="flight-main"><strong>RwandAir 盧安達航空 WB440</strong> {fmtWithTpe('KGL','10/03 Fri','11:55')} → {fmtWithTpe('JRO','10/03 Fri','14:40')}</div>
                  </li>
                </ol>
              </div>

              <div className="flight-group">
                <h3 className="group-title">返程/吉力馬札羅 → 盧安達 → 倫敦 → 新加坡 → 台北</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">10/10 Fri</span>
                    <div className="flight-main"><strong>RwandAir 盧安達航空 WB440</strong> {fmtWithTpe('JRO','10/10 Fri','15:10')} → {fmtWithTpe('KGL','10/10 Fri','17:55')}</div>
                  </li>
                  <li>
                    <span className="badge">10/10–11</span>
                    <div className="flight-main"><strong>RwandAir 盧安達航空 WB712</strong> {fmtWithTpe('KGL','10/10 Fri','22:30')} → {fmtWithTpe('LHR','10/11 Sat','07:30')}</div>
                  </li>
                  <li>
                    <span className="badge">10/14–15</span>
                    <div className="flight-main"><strong>新加坡航空 SQ317</strong> {fmtWithTpe('LHR','10/14 Tue','11:25')} T2 → {fmtWithTpe('SIN','10/15 Wed','07:30')}</div>
                  </li>
                  <li>
                    <span className="badge">10/15 Wed</span>
                    <div className="flight-main"><strong>新加坡航空 SQ878</strong> {fmtWithTpe('SIN','10/15 Wed','11:45')} T3 → {fmtWithTpe('TPE','10/15 Wed','16:40')} <span className="muted">· 桃園 T2</span></div>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 地面交通與租車：採用與航班概覽一致的群組＋時間軸樣式 */}
          <section className="card transport-section">
            <header className="section-header">
              <h2>地面交通與租車</h2>
              <p className="section-sub">依區段分組：葡萄牙內（大眾交通）→ 南歐自駕 → 冰島自駕 → 坦尚尼亞旅行團</p>
            </header>

            <div className="flight-groups">
              {/* 葡萄牙內：大眾交通 */}
              <div className="flight-group">
                <h3 className="group-title">葡萄牙內/大眾交通</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">09/19 Thu</span>
                    <div className="flight-main"><strong>CP 火車 IC 524</strong> Porto Campanha {fmtWithTpe('OPO','2025/09/19 Fri','12:45')} → Lisboa Oriente {fmtWithTpe('LIS','2025/09/19 Fri','15:52')} <span className="muted">· 城際列車</span></div>
                  </li>
                  <li>
                    <span className="badge">城市內</span>
                    <div className="flight-main">波爾圖/里斯本：地鐵、電車、步行 <span className="muted">· 使用交通卡</span></div>
                  </li>
                </ol>
              </div>

              {/* 9/19–9/21 南歐自駕：葡萄牙 → 西班牙（塞維利亞） */}
              <div className="flight-group">
                <h3 className="group-title">南歐自駕/葡萄牙 → 西班牙（塞維利亞）</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">09/19–09/21</span>
                    <div className="flight-main"><strong>自駕路段</strong> 阿爾加維/阿連特茹（如適用） → 塞維利亞 <span className="muted">· 注意跨國租車條款與通行費</span></div>
                  </li>
                </ol>
              </div>

              {/* 冰島：純自駕 */}
              <div className="flight-group">
                <h3 className="group-title">冰島/純自駕</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">全程</span>
                    <div className="flight-main"><strong>四驅自駕</strong> 含滿保（CDW/GP/SAAP 建議）、下載離線地圖 <span className="muted">· 注意風速、F-Road 與路況</span></div>
                  </li>
                </ol>
              </div>

              {/* 坦尚尼亞：旅行團 */}
              <div className="flight-group">
                <h3 className="group-title">坦尚尼亞/旅行團交通</h3>
                <ol className="flight-timeline">
                  <li>
                    <span className="badge">10/03–10/10</span>
                    <div className="flight-main"><strong>旅行團安排</strong> 機場接送＋園區內 4x4 車輛移動 <span className="muted">· 行程內含交通</span></div>
                  </li>
                </ol>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
