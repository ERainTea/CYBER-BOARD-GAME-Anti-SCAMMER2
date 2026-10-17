/**
 * @file src/UI/GameGuideModal.js
 * @description หน้ากติกาและวิธีการเล่น Cyber Board Game (Rules & How to Play)
 * แสดงกฎกติกาการแข่งขัน ลำดับขั้นตอน และรายละเอียดโหมดออฟไลน์/ออนไลน์อย่างชัดเจน
 * ภาษาไทย 100%
 */

export class GameGuideModal {
  /**
   * เปิด Modal หน้ากติกาและวิธีเล่น
   * @param {Object} options
   * @param {Function} [options.onClose] - Callback เมื่อปิดหน้าต่าง
   * @param {boolean} [options.isGameActive=false] - สถานะว่าเปิดขณะกำลังแข่งหรือไม่ (สำหรับแสดงสถานะหยุดเกม)
   */
  static show({ onClose, isGameActive = false } = {}) {
    const existingOverlay = document.getElementById('game-guide-modal-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const modal = new GameGuideModal(onClose, isGameActive);
    modal.render();
  }

  constructor(onClose, isGameActive = false) {
    this.onCloseCallback = onClose;
    this.isGameActive = isGameActive;
  }

  /**
   * เรนเดอร์โครงสร้าง Modal ลงใน document.body
   */
  render() {
    const overlay = document.createElement('div');
    overlay.id = 'game-guide-modal-overlay';
    overlay.className = 'modal-overlay game-guide-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(2, 6, 23, 0.92);
      backdrop-filter: blur(10px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.25s ease-out;
    `;

    overlay.innerHTML = `
      <div class="modal-content guide-modal-container" style="
        width: 100%;
        max-width: 960px;
        height: 90vh;
        max-height: 840px;
        background: #0f172a;
        border: 2px solid #3b82f6;
        border-radius: 16px;
        box-shadow: 0 0 40px rgba(59, 130, 246, 0.35);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #f8fafc;
        font-family: 'Plus Jakarta Sans', sans-serif;
      ">
        <!-- แถบด้านบนของ Modal (Header) -->
        <header style="
          padding: 1.1rem 1.5rem;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-shrink: 0;
        ">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="font-size: 2.2rem; background: rgba(59, 130, 246, 0.15); border-radius: 12px; padding: 0.2rem 0.6rem; border: 1px solid rgba(59, 130, 246, 0.3);">📖</div>
            <div>
              <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #60a5fa; display: flex; align-items: center; gap: 0.5rem;">
                <span>กติกาและวิธีการเล่น CYBER BOARD GAME Anti SCAMMER</span>
              </h2>
              <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: #94a3b8;">
                กติกา ขั้นตอนการเล่น และรายละเอียดโหมดการแข่งขัน CYBER BOARD GAME Anti SCAMMER
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            ${
              this.isGameActive
                ? `<span style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 20px; display: flex; align-items: center; gap: 0.4rem;">
                    <span>⏸️</span> <span>เกมหยุดชั่วคราว</span>
                  </span>`
                : ''
            }
            <button id="guide-modal-close-btn" style="
              background: rgba(239, 68, 68, 0.15);
              border: 1px solid #ef4444;
              color: #fca5a5;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              font-size: 1.2rem;
              font-weight: bold;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
            " title="ปิดหน้าต่าง">✕</button>
          </div>
        </header>

        <!-- พื้นที่เนื้อหาหลัก (Body Content) -->
        <div id="guide-modal-body" style="
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
          background: #0f172a;
        ">
          ${this.getRulesSectionHTML()}
        </div>

        <!-- แถบด้านล่าง (Footer Bar) -->
        <footer style="
          padding: 0.85rem 1.5rem;
          background: #1e293b;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        ">
          <span style="font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 0.4rem;">
            <span>💡</span> <span>คำแนะนำ: ศึกษากติกาและโหมดการเล่นเพื่อวางแผนกลยุทธ์สู่เส้นชัย</span>
          </span>
          <button id="guide-modal-bottom-close-btn" style="
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 0.6rem 1.5rem;
            border-radius: 8px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s;
          ">
            ${this.isGameActive ? '▶️ กลับเข้าสู่การแข่งขัน' : 'ปิดหน้าต่าง'}
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.bindEvents(overlay);
  }

  /**
   * ผูกเหตุการณ์ปุ่ม
   * @param {HTMLElement} overlay
   */
  bindEvents(overlay) {
    const closeBtn = overlay.querySelector('#guide-modal-close-btn');
    const bottomCloseBtn = overlay.querySelector('#guide-modal-bottom-close-btn');

    const handleClose = () => {
      window.removeEventListener('keydown', handleKeyDown);
      overlay.remove();
      if (typeof this.onCloseCallback === 'function') {
        this.onCloseCallback();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (closeBtn) closeBtn.onclick = handleClose;
    if (bottomCloseBtn) bottomCloseBtn.onclick = handleClose;

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        handleClose();
      }
    };
  }

  /**
   * ดึง HTML โครงสร้างกติกาทั้งหมดของเกม
   */
  getRulesSectionHTML() {
    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 880px; margin: 0 auto;">
        
        <!-- ส่วนที่ 1: วิธีการเล่น (How to Play) -->
        <div style="background: #1e293b; border-radius: 14px; padding: 1.35rem; border: 1px solid rgba(59, 130, 246, 0.3); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <span style="font-size: 1.6rem;">📜</span>
            <div>
              <h3 style="margin: 0; color: #60a5fa; font-size: 1.25rem; font-weight: 800;">วิธีการเล่น</h3>
              <p style="margin: 0.15rem 0 0 0; color: #94a3b8; font-size: 0.85rem;">กติกาและลำดับขั้นตอนการแข่งขันหลัก</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- ข้อ 1 -->
            <div style="background: rgba(15, 23, 42, 0.7); border-left: 4px solid #38bdf8; border-radius: 10px; padding: 1rem 1.15rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
                <span style="background: #0284c7; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">1</span>
                <h4 style="margin: 0; color: #38bdf8; font-size: 1.05rem; font-weight: 700;">จัดลำดับผู้เล่นที่จุดเริ่มต้น</h4>
              </div>
              <p style="margin: 0; color: #f1f5f9; font-size: 0.95rem; font-weight: 600; line-height: 1.6;">
                นำตัวผู้เล่นมาที่จุดเริ่มต้นและผลัดกันทอยลูกเต๋า ผู้เล่นที่ได้แต้มมากจะเป็นผู้เล่นก่อนตามลำดับคะแนน
              </p>
              <p style="margin: 0.35rem 0 0 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">
                <i>(ผู้เล่นทุกคนจะเริ่มต้นที่จุด START ช่องที่ 0 ในรอบแรกระบบจะให้ทุกคนทอยเต๋า 1 ครั้งเพื่อจัดคิวการเล่นตามคะแนนจากมากไปน้อย)</i>
              </p>
            </div>

            <!-- ข้อ 2 -->
            <div style="background: rgba(15, 23, 42, 0.7); border-left: 4px solid #fbbf24; border-radius: 10px; padding: 1rem 1.15rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
                <span style="background: #d97706; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">2</span>
                <h4 style="margin: 0; color: #fbbf24; font-size: 1.05rem; font-weight: 700;">เริ่มเล่นและเดินตามช่องพิเศษ</h4>
              </div>
              <p style="margin: 0; color: #f1f5f9; font-size: 0.95rem; font-weight: 600; line-height: 1.6;">
                ผู้เล่นผลัดกันทอยลูกเต๋า และเดินตามกระดานเท่ากับ แต้มที่ได้ หากผู้เล่นเดินไปตกยังช่องพิเศษ ให้ผู้เล่น ปฏิบัติตามคำสั่งนั้น
              </p>
              <div style="margin-top: 0.6rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.6rem;">
                <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #6ee7b7;">
                  🟢 <b>ช่องรางวัลพิเศษ:</b> ได้รับผลประโยชน์ เช่น เดินหน้าโบนัส หรือได้สิทธิ์ทอยเต๋าเพิ่ม
                </div>
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #fca5a5;">
                  🔴 <b>ช่องบทลงโทษ:</b> ได้รับผลกระทบ เช่น เดินถอยหลัง, หยุดเดิน 1 ตา หรือกลับจุดเริ่มต้น
                </div>
              </div>
            </div>

            <!-- ข้อ 3 -->
            <div style="background: rgba(15, 23, 42, 0.7); border-left: 4px solid #a855f7; border-radius: 10px; padding: 1rem 1.15rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
                <span style="background: #9333ea; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">3</span>
                <h4 style="margin: 0; color: #c084fc; font-size: 1.05rem; font-weight: 700;">การตัดสินผู้ชนะ</h4>
              </div>
              <p style="margin: 0; color: #f1f5f9; font-size: 0.95rem; font-weight: 600; line-height: 1.6;">
                ผู้ที่มาถึงเส้นชัยก่อนคือผู้ชนะ
              </p>
              <p style="margin: 0.35rem 0 0 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">
                <i>(ผู้เล่นคนแรกที่สามารถนำตัวหมากเคลื่อนที่มาถึงช่องเส้นชัย FINISH จะได้รับชัยชนะและจบเกมทันที)</i>
              </p>
            </div>
          </div>
        </div>

        <!-- ส่วนที่ 2: ช่องพิเศษ ช่องสีแดง (พฤติกรรมเสี่ยง) และช่องสีเขียว (พฤติกรรมปลอดภัย) -->
        <div style="background: #1e293b; border-radius: 14px; padding: 1.35rem; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <span style="font-size: 1.6rem;">🎯</span>
            <div>
              <h3 style="margin: 0; color: #f59e0b; font-size: 1.25rem; font-weight: 800;">ข้อมูลช่องพิเศษบนกระดาน (ช่องสีเขียว & ช่องสีแดง)</h3>
              <p style="margin: 0.15rem 0 0 0; color: #94a3b8; font-size: 0.85rem;">พฤติกรรมปลอดภัย (รางวัลเดินหน้า) และพฤติกรรมเสี่ยง (บทลงโทษถอยหลัง/หยุดเล่น)</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem;">
            <!-- ตารางช่องสีเขียว -->
            <div style="background: rgba(6, 78, 59, 0.25); border: 1.5px solid #10b981; border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #34d399;">
                <span style="font-size: 1.3rem;">🟢</span>
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800;">ช่องสีเขียว (พฤติกรรมปลอดภัย และรางวัลเดินหน้า)</h4>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 3:</b> <span style="color: #e2e8f0;">เช็กชื่อบัญชีก่อนโอน</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินหน้า 2 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 7:</b> <span style="color: #e2e8f0;">ตรวจสอบ Link ก่อนคลิก</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินหน้า 3 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 15:</b> <span style="color: #e2e8f0;">ไม่ลงทุนช่องทางที่ไม่น่าเชื่อถือ</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินหน้า 4 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 20:</b> <span style="color: #e2e8f0;">รหัสผ่านปลอดภัย ไม่ซ้ำกัน</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินอีกครั้ง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 25:</b> <span style="color: #e2e8f0;">ไม่โอนเงินให้เจ้าหน้าที่ปลอม</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินหน้า 4 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 32:</b> <span style="color: #e2e8f0;">โทรหา 1441 ทันทีเมื่อถูกหลอก</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินหน้า 2 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #6ee7b7;">ช่อง 36:</b> <span style="color: #e2e8f0;">ไม่หลงเชื่องานออนไลน์ รายได้ดีเกินจริง</span></div>
                  <span style="background: #059669; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">เดินหน้า 3 ช่อง</span>
                </div>
              </div>
            </div>

            <!-- ตารางช่องสีแดง -->
            <div style="background: rgba(127, 29, 29, 0.25); border: 1.5px solid #ef4444; border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #f87171;">
                <span style="font-size: 1.3rem;">🔴</span>
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800;">ช่องสีแดง (พฤติกรรมเสี่ยง และบทลงโทษ)</h4>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 9:</b> <span style="color: #e2e8f0;">กู้เงิน SMS เสี่ยงโดนหลอก</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">ถอยหลัง 3 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 12:</b> <span style="color: #e2e8f0;">กด Link ลงทะเบียนรับของฟรี ทำให้ข้อมูลรั่ว</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">ถอยหลัง 8 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 18:</b> <span style="color: #e2e8f0;">พนันออนไลน์ พาเสียหาย</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">กลับไปจุดเริ่มต้น</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 23:</b> <span style="color: #e2e8f0;">รักออนไลน์ เสี่ยงถูกหลอก</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">ถอยหลัง 4 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 30:</b> <span style="color: #e2e8f0;">แชร์ข่าวปลอม โดยไม่ตรวจสอบ</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">ถอยหลัง 3 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 35:</b> <span style="color: #e2e8f0;">ซื้อของผิดกฎหมายออนไลน์</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">ถอยหลัง 4 ช่อง</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div><b style="color: #fca5a5;">ช่อง 38:</b> <span style="color: #e2e8f0;">รีบโอน เสี่ยงคอลเซ็นเตอร์</span></div>
                  <span style="background: #dc2626; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 800; white-space: nowrap;">หยุดเล่น 1 รอบ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ส่วนที่ 3: โหมดการเล่น (Game Modes) & ขั้นตอนก่อนสร้างห้อง -->
        <div style="background: #1e293b; border-radius: 14px; padding: 1.35rem; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <span style="font-size: 1.6rem;">🕹️</span>
            <div>
              <h3 style="margin: 0; color: #38bdf8; font-size: 1.25rem; font-weight: 800;">โหมดการเล่นและการเตรียมตัว</h3>
              <p style="margin: 0.15rem 0 0 0; color: #94a3b8; font-size: 0.85rem;">รายละเอียดโหมดออฟไลน์, โหมดออนไลน์ และสิ่งที่ต้องทำก่อนสร้างห้อง</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
            <!-- โหมดออฟไลน์ -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #34d399;">
                <span style="font-size: 1.4rem;">🎮</span>
                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800;">1. โหมดออฟไลน์ (Offline / Local)</h4>
              </div>
              <p style="margin: 0; color: #cbd5e1; font-size: 0.88rem; line-height: 1.5;">
                เล่นร่วมกันบนหน้าจออุปกรณ์เดียวกัน (Pass & Play) สำหรับ 2 - 4 คน โดยไม่ต้องใช้อินเทอร์เน็ต
              </p>
              <div style="background: rgba(30, 41, 59, 0.8); border-radius: 8px; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-weight: 700; color: #a7f3d0; font-size: 0.85rem; margin-bottom: 0.4rem;">📌 ขั้นตอนการเล่น:</div>
                <ol style="margin: 0; padding-left: 1.2rem; color: #cbd5e1; font-size: 0.83rem; line-height: 1.6;">
                  <li>กดปุ่ม <b>"เริ่มเกม (Offline / Local)"</b> จากหน้าเมนูหลัก</li>
                  <li>เลือกจำนวนผู้เล่นที่ต้องการ (2, 3 หรือ 4 คน)</li>
                  <li>ตั้งชื่อผู้เล่น และเลือกสี/ตัวละครหมากของแต่ละคน (แดง, น้ำเงิน, เขียว, เหลือง)</li>
                  <li>เข้าสู่กระดานเกมและผลัดกันทอยเต๋าเล่นได้ทันที</li>
                </ol>
              </div>
            </div>

            <!-- โหมดออนไลน์ -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #2563eb; border-radius: 12px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #60a5fa;">
                <span style="font-size: 1.4rem;">🌐</span>
                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800;">2. โหมดออนไลน์ (Multiplayer)</h4>
              </div>
              <p style="margin: 0; color: #cbd5e1; font-size: 0.88rem; line-height: 1.5;">
                เล่นกับเพื่อนข้ามเครื่องผ่านระบบเครือข่ายอินเทอร์เน็ตแบบ Real-time พร้อมระบบซิงโครไนซ์ตำแหน่งและการทอยเต๋า
              </p>
              <div style="background: rgba(30, 41, 59, 0.8); border-radius: 8px; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-weight: 700; color: #93c5fd; font-size: 0.85rem; margin-bottom: 0.4rem;">📌 ก่อนสร้างห้อง / เข้าเล่น มีขั้นตอนดังนี้:</div>
                <ul style="margin: 0; padding-left: 1.2rem; color: #cbd5e1; font-size: 0.83rem; line-height: 1.6;">
                  <li><b>การตั้งค่าก่อนสร้างห้อง (Host):</b>
                    <div style="margin-left: 0.5rem; color: #94a3b8; font-size: 0.8rem; margin-top: 0.2rem;">
                      • ตั้งชื่อผู้เล่นของตนเอง<br>
                      • เลือกจำนวนผู้เล่นสูงสุดในห้อง (2, 3 หรือ 4 คน)<br>
                      • กดสร้างห้อง และรับ <b>รหัสห้อง 6 หลัก (Room Code)</b> เพื่อส่งให้เพื่อน
                    </div>
                  </li>
                  <li style="margin-top: 0.35rem;"><b>การเข้าร่วมห้อง (Join):</b> กรอกรหัสห้อง 6 หลัก และตั้งชื่อผู้เล่น แล้วกดเข้าร่วมห้อง</li>
                  <li style="margin-top: 0.35rem;"><b>ในห้องรอ (Lobby):</b> ผู้เล่นทุกคนเลือกตัวละครหมาก (ห้ามซ้ำกัน) แล้วกดยืนยัน <b>"พร้อม"</b></li>
                  <li style="margin-top: 0.35rem;"><b>เริ่มเกม:</b> เมื่อทุกคนพร้อม หัวหน้าห้อง (Host) จะกดปุ่ม <b>"เริ่มเกม"</b> เพื่อเข้าสู่กระดานพร้อมกัน</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}
