/**
 * @file src/Assets/AssetManager.js
 * @description ระบบจัดการและโหลด Asset ทั้งหมดจาก Cloudinary CDN พร้อมระบบ Cache และ Error Handling
 */

/** คลังจัดเก็บ URL ทั้งหมดของ Cloudinary ตามโครงสร้างที่กำหนด */
export const ASSET_MANIFEST = {
  logos: [
    'https://res.cloudinary.com/dedvuatid/image/upload/v1788766516/LogoHero_loo2m6.png',
    'https://res.cloudinary.com/dedvuatid/image/upload/v1786607334/NCSA-Logo_Eng-01_fsswti.png',
    'https://res.cloudinary.com/dedvuatid/image/upload/v1786607741/ThailandCyberAcademy_LOGO-2024-01-removebg-preview_saevpe.png',
  ],
  board: 'https://res.cloudinary.com/dedvuatid/image/upload/v1788766505/S__175775748_hg3m1h.jpg',
};

export class AssetManager {
  constructor() {
    /** @type {Map<string, HTMLImageElement>} แคชรูปภาพทั้งหมด */
    this.cache = new Map();
    /** @type {string[]} รายการความล้มเหลว */
    this.failedUrls = [];
  }

  /**
   * แตกรายการ URL ทั้งหมดออกมาเป็น Flat Array
   * @returns {string[]} รายชื่อ URL ทั้งหมด
   */
  getAllUrls() {
    const urls = [];

    const extract = (obj) => {
      if (typeof obj === 'string') {
        urls.push(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(extract);
      }
    };

    extract(ASSET_MANIFEST);
    return urls;
  }

  /**
   * พรีโหลด Asset ทั้งหมดจาก Manifest พร้อม callback เปอร์เซ็นต์ความคืบหน้า
   * @param {function(number, number, number, string): void} onProgress - (percent, loadedCount, totalCount, currentUrl)
   * @returns {Promise<boolean>}
   */
  async loadAllAssets(onProgress) {
    const allUrls = this.getAllUrls();
    const totalCount = allUrls.length;
    let loadedCount = 0;

    this.failedUrls = [];

    const BATCH_SIZE = 12;
    for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
      const batch = allUrls.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (url) => {
          try {
            await this.loadImage(url);
          } catch (error) {
            console.warn(`[AssetManager Warning] ไม่สามารถโหลดไฟล์: ${url}`, error);
            this.failedUrls.push(url);
          } finally {
            loadedCount++;
            const percent = Math.floor((loadedCount / totalCount) * 100);
            if (typeof onProgress === 'function') {
              onProgress(percent, loadedCount, totalCount, url);
            }
          }
        })
      );
    }

    return this.failedUrls.length === 0;
  }

  /**
   * โหลดและแคชรูปภาพผ่าน URL
   * @param {string} url - URL รูปภาพ
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(url) {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  }

  /**
   * ดึง URL ของ Asset (Alias เพื่อความสะดวกในการเรียก assetManager.get)
   * @param {string} keyPath - Key หรือ Path (เช่น 'board', 'BOARD', 'logo')
   * @returns {string} URL ของ Asset
   */
  get(keyPath) {
    if (!keyPath) return '';
    return this.getUrl(keyPath) || this.getUrl(keyPath.toLowerCase()) || '';
  }

  /**
   * ดึงรูปภาพจากแคช
   * @param {string} url - URL ของรูปภาพ
   * @returns {HTMLImageElement | undefined}
   */
  getImage(url) {
    return this.cache.get(url);
  }

  /**
   * ดึง URL ของ Asset จาก Key หรือ KeyPath (เช่น 'board', 'logo', 'goodCards.cover')
   * @param {string} keyPath - Key หรือ Path
   * @returns {string} URL ของ Asset
   */
  getUrl(keyPath) {
    if (!keyPath) return '';
    if (keyPath.startsWith('http://') || keyPath.startsWith('https://')) {
      return keyPath;
    }
    const parts = keyPath.split('.');
    let current = ASSET_MANIFEST;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return '';
      }
    }
    return typeof current === 'string' ? current : '';
  }
}

export const assetManager = new AssetManager();
