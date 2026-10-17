/**
 * @file src/Board/BoardRenderer.js
 * @description คลาสจัดการเรนเดอร์กระดานเกม (BoardRenderer)
 * อ่านข้อมูลตำแหน่งและประเภทช่องจาก boardMap.json เท่านั้น ห้าม Hardcode ตำแหน่งใน JS
 * พร้อมรองรับระบบ Debug Mode แสดงหมายเลข, พิกัด X/Y, เส้นเชื่อมการเดิน, และสีตามประเภทช่อง
 */

import defaultBoardMap from './boardMap.json';

export class BoardRenderer {
  /**
   * @param {Array<Object>} [boardMapData] - รายการข้อมูลช่องจาก boardMap.json
   * @param {Object} [options] - ตัวเลือกเพิ่มเติม
   * @param {number} [options.imageWidth=1821] - ความกว้างจริงของรูปภาพบอร์ด (พิกเซล)
   * @param {number} [options.imageHeight=1284] - ความสูงจริงของรูปภาพบอร์ด (พิกเซล)
   * @param {boolean} [options.isDebugMode=false] - สถานะเริ่มต้นเปิด/ปิด Debug Mode
   */
  constructor(boardMapData = defaultBoardMap, options = {}) {
    this.imageWidth = options.imageWidth || 1821;
    this.imageHeight = options.imageHeight || 1284;
    this.isDebugMode = false;

    this.boardMap = [];
    this.validationResult = { isValid: true, errors: [], unmappedTiles: [] };

    // ตรวจสอบข้อมูลพิกัดที่ผู้เล่นเคยปรับแต่งและบันทึกไว้ใน localStorage (V2 เพื่อใช้พิกัดทางการล่าสุด 40 ช่อง)
    let initialData = boardMapData;
    try {
      localStorage.removeItem('CYBER_BOARD_MAP_CALIBRATION'); // ล้างพิกัดเก่าก่อน V2
      const saved = localStorage.getItem('CYBER_BOARD_MAP_CALIBRATION_V2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          // ผสานพิกัด x, y ที่ปรับจูนไว้ โดยรักษาข้อมูลข้อความชื่อช่อง/บทลงโทษล่าสุดจาก boardMap.json ไม่ให้ข้อความตกหล่น
          initialData = boardMapData.map((masterTile) => {
            const calib = parsed.find((p) => p.tile === masterTile.tile);
            if (calib && typeof calib.x === 'number' && typeof calib.y === 'number') {
              return { ...masterTile, x: calib.x, y: calib.y };
            }
            return { ...masterTile };
          });
        }
      }
    } catch {
      // ใช้ค่าเริ่มต้น
    }

    this.setBoardMap(initialData);
  }

  /**
   * กำหนดและตรวจสอบข้อมูล boardMap.json
   * @param {Array<Object>} data - ข้อมูลช่องกระดาน
   */
  setBoardMap(data) {
    if (!Array.isArray(data) || data.length === 0) {
      this.validationResult = {
        isValid: false,
        errors: ['[BoardRenderer Error] ข้อมูล boardMap.json ว่างเปล่าหรือไม่ใช่ Array'],
        unmappedTiles: ['ALL'],
      };
      this.boardMap = [];
      return;
    }

    this.boardMap = data;
    this.validationResult = this.validateBoardMap(data);
  }

  /**
   * ตรวจสอบความถูกต้องและต่อเนื่องของช่อง ตั้งแต่ Start ถึง Finish (Phase 5.5 ข้อ 14 & 15)
   * @param {Array<Object>} mapData - ข้อมูลช่อง
   * @returns {{isValid: boolean, errors: Array<string>, unmappedTiles: Array<number>}}
   */
  validateBoardMap(mapData) {
    const errors = [];
    const unmappedTiles = [];

    // เรียงตามหมายเลข tile 1..N
    const sortedMap = [...mapData].sort((a, b) => a.tile - b.tile);

    // ตรวจสอบว่ามีช่อง Start และ Finish หรือไม่
    const startTile = sortedMap.find((t) => t.type === 'start');
    const finishTile = sortedMap.find((t) => t.type === 'finish');

    if (!startTile) {
      errors.push('ไม่พบช่องประเภท "start" ใน boardMap.json');
    }
    if (!finishTile) {
      errors.push('ไม่พบช่องประเภท "finish" ใน boardMap.json');
    }

    // ตรวจสอบพิกัด X, Y และความต่อเนื่องของหมายเลขช่อง
    for (let i = 0; i < sortedMap.length; i++) {
      const tileObj = sortedMap[i];
      const expectedTileNum = i + 1;

      if (tileObj.tile !== expectedTileNum) {
        errors.push(`ลำดับช่องขาดความต่อเนื่อง: คาดหวังช่องที่ ${expectedTileNum} แต่พบช่องที่ ${tileObj.tile}`);
      }

      if (
        typeof tileObj.x !== 'number' ||
        typeof tileObj.y !== 'number' ||
        isNaN(tileObj.x) ||
        isNaN(tileObj.y)
      ) {
        unmappedTiles.push(tileObj.tile);
        errors.push(`ช่องที่ ${tileObj.tile} ไม่สามารถระบุตำแหน่ง X, Y ได้อย่างชัดเจน`);
      }
    }

    const isValid = errors.length === 0 && unmappedTiles.length === 0;

    if (!isValid) {
      console.warn('[BoardRenderer Validation Warning]', errors);
    }

    return { isValid, errors, unmappedTiles };
  }

  /**
   * เปิด/ปิด Debug Mode
   * @param {boolean} [flag] - ค่าที่ต้องการตั้ง หากไม่ระบุจะเป็นการ toggle
   */
  toggleDebugMode(flag) {
    if (typeof flag === 'boolean') {
      this.isDebugMode = flag;
    } else {
      this.isDebugMode = !this.isDebugMode;
    }
    return this.isDebugMode;
  }

  /**
   * ดึงสีประจำประเภทช่องสำหรับแสดงผลใน Debug Mode
   * @param {string} type - ประเภทช่อง ('start' | 'normal' | 'green' | 'red' | 'finish')
   * @returns {{bg: string, border: string, text: string, name: string}}
   */
  getTileTypeTheme(type) {
    switch (type) {
      case 'start':
        return { bg: '#3b82f6', border: '#60a5fa', text: '#ffffff', name: 'Start' };
      case 'green':
        return { bg: '#10b981', border: '#34d399', text: '#ffffff', name: 'Green' };
      case 'red':
        return { bg: '#ef4444', border: '#f87171', text: '#ffffff', name: 'Red' };
      case 'finish':
        return { bg: '#a855f7', border: '#c084fc', text: '#ffffff', name: 'Finish' };
      case 'normal':
      default:
        return { bg: '#64748b', border: '#94a3b8', text: '#ffffff', name: 'Normal' };
    }
  }

  /**
   * แปลงพิกัดพิกเซล (x, y) เป็นเปอร์เซ็นต์ relative กับขนาดรูปภาพบอร์ด
   * @param {number} x - พิกัด X พิกเซล
   * @param {number} y - พิกัด Y พิกเซล
   * @returns {{xPercent: number, yPercent: number}}
   */
  getTilePercentCoordinates(x, y) {
    const xPercent = (x / this.imageWidth) * 100;
    const yPercent = (y / this.imageHeight) * 100;
    return { xPercent, yPercent };
  }

  /**
   * ดึงข้อมูลช่องจาก tile index (1-based)
   * @param {number} tileNumber - หมายเลขช่อง (1 ถึง N)
   * @returns {Object|null}
   */
  getTileData(tileNumber) {
    return this.boardMap.find((t) => t.tile === tileNumber) || null;
  }

  /**
   * เรนเดอร์เส้นเชื่อมการเดินทุกช่องต่อเนื่องกัน (SVG Polyline) สำหรับ Debug Mode
   * @returns {string} HTML/SVG String
   */
  renderConnectingLinesSVG() {
    if (!this.isDebugMode || this.boardMap.length === 0) return '';

    const sorted = [...this.boardMap].sort((a, b) => a.tile - b.tile);
    const points = sorted
      .map((t) => {
        const { xPercent, yPercent } = this.getTilePercentCoordinates(t.x, t.y);
        return `${xPercent.toFixed(2)},${yPercent.toFixed(2)}`;
      })
      .join(' ');

    return `
      <svg 
        class="board-debug-svg-path" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style="
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 15;
        "
      >
        <defs>
          <linearGradient id="debugPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="40%" stop-color="#34d399" />
            <stop offset="75%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#f43f5e" />
          </linearGradient>
          <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- เส้นเรืองแสงพื้นหลัง -->
        <polyline 
          points="${points}" 
          fill="none" 
          stroke="url(#debugPathGrad)" 
          stroke-width="1.6" 
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.45"
          filter="url(#pathGlow)"
        />
        <!-- เส้นประนำทางการเดินตัวหมาก -->
        <polyline 
          points="${points}" 
          fill="none" 
          stroke="url(#debugPathGrad)" 
          stroke-width="0.9" 
          stroke-dasharray="1.5, 0.8" 
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  }

  /**
   * เรนเดอร์การ์ดและมาร์กเกอร์แสดงพิกัดบนรูปกระดาน (In-Board Overlay Badges)
   * แสดงหมายเลขช่อง (#1 ถึง #40), ชื่อ/ข้อความประจำช่อง, ประเภทช่อง (Start, Normal, Green, Red, Finish)
   * และพิกัดรูปภาพภาพจริงทั้ง พิกเซล (Px: X, Y) และ เปอร์เซ็นต์ (%: X%, Y%) เหนือทุกช่อง
   * @returns {string} HTML String
   */
  renderTileOverlays() {
    if (this.boardMap.length === 0 || !this.isDebugMode) return '';

    return this.boardMap
      .map((t) => {
        const { xPercent, yPercent } = this.getTilePercentCoordinates(t.x, t.y);
        const theme = this.getTileTypeTheme(t.type);
        const titleText = t.title || t.label || (t.type === 'start' ? 'จุดเริ่มต้น' : t.type === 'finish' ? 'เส้นชัย' : 'ช่องทางเดิน');
        const actionBadgeHtml = t.actionText
          ? `<div class="badge-action-val" style="
              display: inline-block;
              margin: 2px 0 3px 0;
              padding: 1.5px 6px;
              background: ${t.type === 'green' ? 'rgba(16, 185, 129, 0.28)' : t.type === 'red' ? 'rgba(239, 68, 68, 0.28)' : 'rgba(255,255,255,0.12)'};
              border: 1px solid ${t.type === 'green' ? '#10b981' : t.type === 'red' ? '#ef4444' : '#94a3b8'};
              border-radius: 4px;
              color: ${t.type === 'green' ? '#6ee7b7' : t.type === 'red' ? '#fca5a5' : '#f1f5f9'};
              font-size: 0.62rem;
              font-weight: 800;
              white-space: nowrap;
              text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            ">
              ${t.type === 'green' ? '🌟 ' : t.type === 'red' ? '⚡ ' : ''}${t.actionText}
            </div>`
          : '';

        return `
          <div 
            class="board-debug-tile-badge board-debug-tile-marker"
            id="debug-tile-badge-${t.tile}"
            data-tile="${t.tile}"
            data-x="${t.x}"
            data-y="${t.y}"
            style="
              position: absolute;
              left: ${xPercent}%;
              top: ${yPercent}%;
              transform: translate(-50%, -50%);
              pointer-events: auto;
              cursor: move;
              z-index: 26;
              display: flex;
              flex-direction: column;
              align-items: center;
              user-select: none;
            "
            title="ช่อง #${t.tile} (${theme.name}: ${titleText})&#10;${t.actionText ? 'คำสั่ง: ' + t.actionText + '&#10;' : ''}📍 พิกัดภาพจริง: Px=(${t.x}, ${t.y}) | %: (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%)&#10;💡 คลิกค้างลากเพื่อขยับปรับจูนตำแหน่งได้"
          >
            <!-- สัญลักษณ์เป้าเล็งจุดกึ่งกลาง (Center Target Crosshair) -->
            <div class="center-crosshair-ring" style="
              width: 22px;
              height: 22px;
              border: 2px solid ${theme.border || '#38bdf8'};
              border-radius: 50%;
              background: rgba(15, 23, 42, 0.65);
              box-shadow: 0 0 10px ${theme.border || '#38bdf8'};
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 2px;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            ">
              <!-- จุดกึ่งกลางสีขาว -->
              <div style="
                width: 5px;
                height: 5px;
                background: #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 4px #ffffff;
              "></div>
              <!-- เส้น Crosshair แนวนอนและตั้ง -->
              <div style="position: absolute; width: 100%; height: 1px; background: ${theme.border || '#38bdf8'}; opacity: 0.85;"></div>
              <div style="position: absolute; height: 100%; width: 1px; background: ${theme.border || '#38bdf8'}; opacity: 0.85;"></div>
            </div>

            <!-- การ์ดระบุข้อมูลช่องและพิกัด (In-Board Overlay Badge) -->
            <div class="tile-debug-card" style="
              background: rgba(15, 23, 42, 0.95);
              border: 1.5px solid ${theme.border || '#38bdf8'};
              border-radius: 7px;
              padding: 4px 7px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
              color: #f8fafc;
              font-family: 'Fira Code', 'Segoe UI', monospace;
              font-size: 0.64rem;
              text-align: center;
              white-space: normal;
              word-break: break-word;
              line-height: 1.25;
              min-width: 90px;
              max-width: 155px;
              backdrop-filter: blur(4px);
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            ">
              <!-- แถวที่ 1: หมายเลขช่อง + ประเภทช่อง -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 4px; font-weight: 800;">
                <span style="color: #ffffff; font-size: 0.74rem;">#${t.tile}</span>
                <span style="background: ${theme.bg}; color: #ffffff; padding: 0.5px 5px; border-radius: 3px; font-size: 0.58rem; text-transform: uppercase;">${theme.name}</span>
              </div>
              <!-- แถวที่ 2: ชื่อ/ข้อความประจำช่อง แสดงเต็มครบถ้วนไม่ขาดหาย -->
              <div class="badge-title-val" style="color: #fef08a; font-size: 0.64rem; font-weight: 700; margin: 2px 0 1px 0; word-break: break-word; line-height: 1.25;">
                ${titleText}
              </div>
              <!-- แถวพิเศษ: รางวัล / บทลงโทษ หากมี -->
              ${actionBadgeHtml}
              <!-- แถวที่ 3: พิกัดรูปภาพจริง พิกเซล (Px: X, Y) -->
              <div class="badge-px-val" style="color: #60a5fa; font-size: 0.58rem; font-weight: 700;">
                Px: (${t.x}, ${t.y})
              </div>
              <!-- แถวที่ 4: พิกัดเปอร์เซ็นต์ (%: X%, Y%) -->
              <div class="badge-pct-val" style="color: #34d399; font-size: 0.55rem; font-weight: 600;">
                %: (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%)
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * เรนเดอร์โครงสร้างกระดานเกมทั้งหมดพร้อมเลเยอร์ Debug และ Tile
   * @param {string} boardImageUrl - URL รูปภาพกระดานเกม
   * @param {string} [tokensHtml=''] - HTML ตัวหมากผู้เล่น
   * @returns {string} HTML String
   */
  renderBoardContainerHTML(boardImageUrl, tokensHtml = '') {
    // หากตรวจสอบพบว่ามีช่องไม่ชัดเจน หรือข้อมูลผิดพลาด ให้รายงานข้อผิดพลาด
    if (!this.validationResult.isValid) {
      return `
        <div class="board-error-container" style="padding: 2rem; background: #1e1e2d; color: #ef4444; border-radius: 12px; border: 1px solid #ef4444; margin: 1rem;">
          <h3 style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">⚠️ รายงานความผิดพลาดการวิเคราะห์บอร์ดเกม</h3>
          <p style="margin-bottom: 1rem;">ไม่สามารถระบุตำแหน่งช่องได้อย่างชัดเจนจากรูปภาพต้นฉบับ:</p>
          <ul style="list-style-type: disc; padding-left: 1.5rem; line-height: 1.6;">
            ${this.validationResult.errors.map((err) => `<li>${err}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    const svgLines = this.renderConnectingLinesSVG();
    const tileOverlays = this.renderTileOverlays();

    return `
      <div class="board-image-wrapper ${this.isDebugMode ? 'debug-active-board' : ''}" id="board-image-wrapper" style="position: relative; width: 100%; user-select: none;">
        <img 
          src="${boardImageUrl}" 
          alt="กระดานเกมการเงิน" 
          class="board-image" 
          id="board-image"
          style="width: 100%; height: auto; display: block;"
        />

        <!-- เลเยอร์เส้นพาดผ่านทางเดิน (SVG Path) ใน Debug Mode -->
        ${svgLines}

        <!-- เลเยอร์มาร์กเกอร์แสดงพิกัดบนรูปกระดาน (In-Board Overlay Badges) -->
        <div class="board-tiles-overlay-layer" id="board-tiles-overlay-layer">
          ${tileOverlays}
        </div>

        <!-- เลเยอร์แสดงตัวหมากของผู้เล่นบนกระดาน -->
        <div class="board-tokens-layer" id="board-tokens-layer">
          ${tokensHtml}
        </div>

        <!-- ระบบเมาส์และหมุดคลิกตรวจสอบพิกัดแบบเรียลไทม์ (Interactive Mouse & Click Inspector) -->
        ${
          this.isDebugMode
            ? `<!-- ป้าย HUD ลอยตามปลายเมาส์ -->
              <div id="debug-mouse-hud" class="debug-mouse-hud" style="
                position: absolute;
                display: none;
                pointer-events: none;
                z-index: 45;
                background: rgba(15, 23, 42, 0.95);
                border: 1.5px solid #38bdf8;
                border-radius: 8px;
                padding: 6px 12px;
                color: #38bdf8;
                font-family: 'Fira Code', monospace;
                font-size: 0.75rem;
                font-weight: 700;
                box-shadow: 0 8px 24px rgba(0,0,0,0.85), 0 0 10px rgba(56, 189, 248, 0.3);
                transform: translate(15px, 15px);
                white-space: nowrap;
              ">📍 เมาส์: Px: (-, -) | %: (-%, -%)</div>
              
              <!-- หมุดคลิกตรวจสอบพิกัดบนกระดาน (Click Pinpoint) -->
              <div id="debug-click-pin" class="debug-click-pin" style="
                position: absolute;
                display: none;
                pointer-events: none;
                z-index: 40;
                width: 24px;
                height: 24px;
                transform: translate(-50%, -50%);
              ">
                <div style="position: absolute; inset: 0; border: 2.5px solid #f43f5e; border-radius: 50%; box-shadow: 0 0 14px #f43f5e; animation: pulsePin 1.5s infinite;"></div>
                <div style="position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; background: #ffffff; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 6px #ffffff;"></div>
              </div>

              <!-- การ์ดแสดงค่าพิกัดล่าสุดที่คลิกปักหมุด -->
              <div id="debug-click-card" class="debug-click-card" style="
                position: absolute;
                display: none;
                z-index: 42;
                background: rgba(15, 23, 42, 0.96);
                border: 2px solid #f43f5e;
                border-radius: 8px;
                padding: 8px 12px;
                color: #ffffff;
                font-family: 'Fira Code', monospace;
                font-size: 0.74rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.9), 0 0 16px rgba(244, 63, 94, 0.4);
                transform: translate(-50%, -125%);
                white-space: nowrap;
                pointer-events: auto;
              "></div>`
            : ''
        }
      </div>
    `;
  }

  /**
   * อัปเดตพิกัดของช่องที่ระบุในหน่วยพิกเซล (X, Y)
   * @param {number} tileNumber - หมายเลขช่อง (1 ถึง N)
   * @param {number} x - พิกัด X พิกเซล
   * @param {number} y - พิกัด Y พิกเซล
   */
  updateTileCoordinates(tileNumber, x, y) {
    const tile = this.boardMap.find((t) => t.tile === tileNumber);
    if (!tile) return null;

    tile.x = Math.max(0, Math.min(this.imageWidth, Math.round(x)));
    tile.y = Math.max(0, Math.min(this.imageHeight, Math.round(y)));

    const { xPercent, yPercent } = this.getTilePercentCoordinates(tile.x, tile.y);
    return { tile, x: tile.x, y: tile.y, xPercent, yPercent };
  }

  /**
   * บันทึกข้อมูลพิกัดปัจจุบันลง localStorage เพื่อให้คงอยู่แม้รีเฟรช
   */
  saveCalibration() {
    try {
      localStorage.setItem('CYBER_BOARD_MAP_CALIBRATION_V2', JSON.stringify(this.boardMap));
      return true;
    } catch (e) {
      console.error('Failed to save board calibration to localStorage', e);
      return false;
    }
  }

  /**
   * คืนค่าพิกัดเริ่มต้น และลบข้อมูลออกจาก localStorage
   */
  resetCalibration() {
    try {
      localStorage.removeItem('CYBER_BOARD_MAP_CALIBRATION');
      localStorage.removeItem('CYBER_BOARD_MAP_CALIBRATION_V2');
    } catch {}
    this.setBoardMap(JSON.parse(JSON.stringify(defaultBoardMap)));
    return this.boardMap;
  }

  /**
   * ส่งออกข้อมูล boardMap ปัจจุบันในรูปแบบ JSON String
   */
  exportJSON() {
    return JSON.stringify(this.boardMap, null, 2);
  }

  /**
   * ผูก Event Listeners สำหรับการลากมาร์กเกอร์และ Hover ตรวจสอบพิกัดในโหมด Debug
   * @param {HTMLElement} rootContainer - DOM Container หลัก
   * @param {Function} [onTileMoved] - Callback เมื่อพิกัดช่องเปลี่ยน (tileNum, x, y, xp, yp)
   */
  attachDebugInteractions(rootContainer, onTileMoved = null) {
    const wrapper = rootContainer.querySelector('#board-image-wrapper');
    if (!wrapper || !this.isDebugMode) return;

    const hud = rootContainer.querySelector('#debug-mouse-hud');
    const pin = rootContainer.querySelector('#debug-click-pin');
    const pinCard = rootContainer.querySelector('#debug-click-card');
    const img = rootContainer.querySelector('#board-image');

    // 1. ตรวจสอบพิกัดเมาส์แบบ Real-time บนรูปภาพ (Mouse Hover HUD)
    const handleMouseMove = (e) => {
      if (!img) return;
      const rect = img.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        if (hud) hud.style.display = 'none';
        return;
      }

      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const xPercent = (relX / rect.width) * 100;
      const yPercent = (relY / rect.height) * 100;

      const imgX = Math.round((relX / rect.width) * this.imageWidth);
      const imgY = Math.round((relY / rect.height) * this.imageHeight);

      if (hud) {
        hud.style.display = 'block';
        hud.style.left = `${xPercent}%`;
        hud.style.top = `${yPercent}%`;
        hud.innerHTML = `📍 <b>เมาส์:</b> Px: (${imgX}, ${imgY}) | %: (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%)`;
      }
    };

    const handleMouseLeave = () => {
      if (hud) hud.style.display = 'none';
    };

    // 2. คลิกบนกระดานเพื่อปักหมุดพิกัด (Click Pinpoint & Card)
    const handleClick = (e) => {
      if (!img) return;
      // หากคลิกที่ตัวการ์ดหมุด ให้ข้ามไป
      if (e.target.closest('#debug-click-card') || e.target.closest('.board-debug-tile-marker')) return;

      const rect = img.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const xPercent = (relX / rect.width) * 100;
      const yPercent = (relY / rect.height) * 100;
      const imgX = Math.round((relX / rect.width) * this.imageWidth);
      const imgY = Math.round((relY / rect.height) * this.imageHeight);

      if (pin) {
        pin.style.display = 'block';
        pin.style.left = `${xPercent}%`;
        pin.style.top = `${yPercent}%`;
      }

      // ค้นหาช่องที่ใกล้เคียงที่สุดในรัศมี
      let nearestInfo = '';
      const nearestTile = this.boardMap.find((t) => {
        const dx = t.x - imgX;
        const dy = t.y - imgY;
        return Math.sqrt(dx * dx + dy * dy) < 80;
      });
      if (nearestTile) {
        const theme = this.getTileTypeTheme(nearestTile.type);
        nearestInfo = `
          <div style="margin-top: 6px; padding: 4px 6px; background: rgba(30, 41, 59, 0.8); border: 1px solid ${theme.border || '#38bdf8'}; border-radius: 6px; font-size: 0.68rem; line-height: 1.35;">
            <div style="color: #fef08a; font-weight: 700;">#${nearestTile.tile} (${theme.name}): ${nearestTile.title || nearestTile.name || ''}</div>
            ${nearestTile.actionText ? `<div style="color: ${nearestTile.type === 'green' ? '#6ee7b7' : '#fca5a5'}; font-weight: 700; margin-top: 2px;">⚡ คำสั่ง: ${nearestTile.actionText}</div>` : ''}
          </div>
        `;
      }

      if (pinCard) {
        pinCard.style.display = 'block';
        pinCard.style.left = `${xPercent}%`;
        pinCard.style.top = `${yPercent}%`;
        pinCard.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 4px; border-bottom: 1px solid rgba(244, 63, 94, 0.4); padding-bottom: 3px;">
            <span style="font-weight: 800; color: #f43f5e; font-size: 0.74rem;">🎯 หมุดพิกัดที่คลิก</span>
            <button id="btn-close-pin-card" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; padding: 0 2px;">✕</button>
          </div>
          <div style="color: #60a5fa; font-weight: 700; margin-bottom: 2px;">Px: X = ${imgX}px, Y = ${imgY}px</div>
          <div style="color: #34d399; font-size: 0.68rem; margin-bottom: 4px;">%: X = ${xPercent.toFixed(1)}%, Y = ${yPercent.toFixed(1)}%</div>
          ${nearestInfo}
          <button id="btn-copy-pin-coord" style="margin-top: 6px; background: #f43f5e; color: #ffffff; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.68rem; font-weight: 700; cursor: pointer; width: 100%; transition: background 0.2s ease;">📋 คัดลอกพิกัด</button>
        `;

        const btnCloseCard = pinCard.querySelector('#btn-close-pin-card');
        if (btnCloseCard) {
          btnCloseCard.onclick = (ev) => {
            ev.stopPropagation();
            pinCard.style.display = 'none';
            if (pin) pin.style.display = 'none';
          };
        }

        const btnCopy = pinCard.querySelector('#btn-copy-pin-coord');
        if (btnCopy) {
          btnCopy.onclick = async (ev) => {
            ev.stopPropagation();
            const coordStr = `"x": ${imgX}, "y": ${imgY}`;
            try {
              await navigator.clipboard.writeText(coordStr);
              btnCopy.textContent = '✓ คัดลอกพิกัดแล้ว!';
              btnCopy.style.background = '#10b981';
              setTimeout(() => {
                if (btnCopy) {
                  btnCopy.textContent = '📋 คัดลอกพิกัด';
                  btnCopy.style.background = '#f43f5e';
                }
              }, 1800);
            } catch {
              console.log(coordStr);
            }
          };
        }
      }

      if (hud) {
        hud.style.display = 'block';
        hud.innerHTML = `🎯 <b>คลิกพิกัด:</b> Px: (${imgX}, ${imgY}) | %: (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%)`;
      }
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    wrapper.addEventListener('click', handleClick);

    // 3. ระบบลากและวางมาร์กเกอร์ช่อง (Drag & Drop Tile Markers)
    const markers = wrapper.querySelectorAll('.board-debug-tile-marker');
    markers.forEach((marker) => {
      const tileNum = parseInt(marker.getAttribute('data-tile'), 10);
      if (isNaN(tileNum)) return;

      let isDragging = false;

      const onMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        marker.style.cursor = 'grabbing';
        marker.style.zIndex = '35';
        marker.style.transform = 'translate(-50%, -50%) scale(1.15)';

        const onMouseMoveDrag = (ev) => {
          if (!isDragging || !img) return;
          const rect = img.getBoundingClientRect();
          const relX = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
          const relY = Math.max(0, Math.min(rect.height, ev.clientY - rect.top));

          const xPercent = (relX / rect.width) * 100;
          const yPercent = (relY / rect.height) * 100;
          const imgX = Math.round((relX / rect.width) * this.imageWidth);
          const imgY = Math.round((relY / rect.height) * this.imageHeight);

          // อัปเดตตำแหน่ง DOM ทันที
          marker.style.left = `${xPercent}%`;
          marker.style.top = `${yPercent}%`;
          marker.setAttribute('data-x', imgX);
          marker.setAttribute('data-y', imgY);
          marker.setAttribute('data-xp', xPercent.toFixed(2));
          marker.setAttribute('data-yp', yPercent.toFixed(2));

          // อัปเดตข้อความใน marker card
          const pxDiv = marker.querySelector('.badge-px-val');
          const pctDiv = marker.querySelector('.badge-pct-val');
          if (pxDiv) pxDiv.textContent = `Px: (${imgX}, ${imgY})`;
          if (pctDiv) pctDiv.textContent = `%: (${xPercent.toFixed(1)}%, ${yPercent.toFixed(1)}%)`;

          // อัปเดตข้อมูลใน boardMap
          const updated = this.updateTileCoordinates(tileNum, imgX, imgY);

          // อัปเดตเส้น Polyline
          this.updatePolylineSVG(wrapper);

          // เรียก Callback เพื่ออัปเดตตัวหมากที่อยู่บนช่องนั้น
          if (onTileMoved && updated) {
            onTileMoved(tileNum, imgX, imgY, xPercent, yPercent);
          }
        };

        const onMouseUpDrag = () => {
          if (!isDragging) return;
          isDragging = false;
          marker.style.cursor = 'pointer';
          marker.style.zIndex = '15';
          marker.style.transform = 'translate(-50%, -50%) scale(1)';
          window.removeEventListener('mousemove', onMouseMoveDrag);
          window.removeEventListener('mouseup', onMouseUpDrag);
        };

        window.addEventListener('mousemove', onMouseMoveDrag);
        window.addEventListener('mouseup', onMouseUpDrag);
      };

      marker.addEventListener('mousedown', onMouseDown);
    });
  }

  /**
   * อัปเดตเส้น SVG Polyline ให้เชื่อมต่อตามพิกัดปัจจุบัน
   * @param {HTMLElement} wrapper 
   */
  updatePolylineSVG(wrapper) {
    const polyline = wrapper.querySelector('.board-debug-svg-path polyline');
    if (!polyline) return;

    const sorted = [...this.boardMap].sort((a, b) => a.tile - b.tile);
    const points = sorted
      .map((t) => {
        const { xPercent, yPercent } = this.getTilePercentCoordinates(t.x, t.y);
        return `${xPercent.toFixed(2)},${yPercent.toFixed(2)}`;
      })
      .join(' ');

    polyline.setAttribute('points', points);
  }
}
