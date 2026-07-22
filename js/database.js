/**
 * UMKM Gundih Digital - Database LocalStorage Handler
 */

const STORAGE_KEYS = {
    UMKM: 'umkm_data',
    PRODUCTS: 'produk_data',
    DOCS: 'dokumentasi_data',
    STATS: 'web_stats'
};

// Initialize Dummy Data if LocalStorage is empty
function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.UMKM)) {
        const dummyUMKM = [
            {
                id: 1,
                name: 'Kopi Kenangan Gundih',
                owner: 'Budi Santoso',
                category: 'Kuliner',
                desc: 'Kopi susu gula aren terbaik di kelurahan Gundih dengan biji kopi pilihan nusantara.',
                address: 'Jl. Gundih Raya No. 10',
                rt: '01',
                rw: '02',
                phone: '081234567890',
                wa: '6281234567890',
                hours: '08:00 - 22:00',
                lat: '-7.24716',
                lng: '112.73551',
                image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
                year: '2021'
            },
            {
                id: 2,
                name: 'Gundih Craft',
                owner: 'Siti Aminah',
                category: 'Kerajinan',
                desc: 'Kerajinan tangan dari daur ulang sampah plastik menjadi tas cantik dan bernilai jual tinggi.',
                address: 'Jl. Gundih Gang 2 No. 15',
                rt: '03',
                rw: '02',
                phone: '085678901234',
                wa: '6285678901234',
                hours: '09:00 - 17:00',
                lat: '-7.24816',
                lng: '112.73651',
                image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800',
                year: '2019'
            },
            {
                id: 3,
                name: 'Boutique Fashion Ibu',
                owner: 'Ibu Ratna',
                category: 'Fashion',
                desc: 'Menjual berbagai macam pakaian wanita muslimah dengan bahan yang nyaman dipakai sehari-hari.',
                address: 'Jl. Margodadi No. 5',
                rt: '02',
                rw: '03',
                phone: '081345678901',
                wa: '6281345678901',
                hours: '10:00 - 20:00',
                lat: '-7.24916',
                lng: '112.73751',
                image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
                year: '2020'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.UMKM, JSON.stringify(dummyUMKM));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        const dummyProducts = [
            { id: 1, umkmId: 1, name: 'Es Kopi Susu Gula Aren', price: 15000, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800' },
            { id: 2, umkmId: 1, name: 'Americano', price: 12000, image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=800' },
            { id: 3, umkmId: 2, name: 'Tas Daur Ulang Elegan', price: 45000, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800' },
            { id: 4, umkmId: 3, name: 'Gamis Syar\'i', price: 150000, image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=800' }
        ];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(dummyProducts));
    }

    if (!localStorage.getItem(STORAGE_KEYS.DOCS)) {
        const dummyDocs = [
            { id: 1, title: 'Kunjungan KKN BBK 8 UNAIR', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800', date: '2026-07-10' },
            { id: 2, title: 'Pelatihan Digitalisasi UMKM', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800', date: '2026-07-15' }
        ];
        localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(dummyDocs));
    }
}

// Data Fetchers
function getUMKM() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UMKM)) || [];
}

function getUMKMById(id) {
    const data = getUMKM();
    return data.find(item => item.id == id);
}

function getProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [];
}

function getProductsByUmkm(umkmId) {
    const products = getProducts();
    return products.filter(p => p.umkmId == umkmId);
}

function getDocs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS)) || [];
}

// Data Savers
function saveUMKM(data) {
    localStorage.setItem(STORAGE_KEYS.UMKM, JSON.stringify(data));
}

function saveProducts(data) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
}

function saveDocs(data) {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(data));
}

// Image to Base64 Converter
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Compress Image using Canvas before saving to Base64 (to prevent LocalStorage full)
function compressImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed WebP (or JPEG if WebP not supported)
                resolve(canvas.toDataURL('image/webp', 0.8));
            };
        };
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
});
