/**
 * Products Page Logic & Supabase CRUD
 */

// --- Supabase Data Fetchers & Savers ---
async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching products:', error.message);
        showToast('Gagal memuat data produk', 'error');
        return [];
    }
}

async function getProductsByUmkm(umkmId) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('umkm_id', umkmId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching products by UMKM:', error.message);
        return [];
    }
}

async function insertProduct(productData) {
    try {
        showLoading();
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        showToast('Berhasil menambahkan produk', 'success');
    } catch (error) {
        console.error('Error inserting product:', error.message);
        showToast('Gagal menambahkan produk', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function updateProduct(id, productData) {
    try {
        showLoading();
        const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id);
        if (error) throw error;
        showToast('Berhasil mengubah produk', 'success');
    } catch (error) {
        console.error('Error updating product:', error.message);
        showToast('Gagal mengubah produk', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function deleteProduct(id) {
    try {
        showLoading();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        showToast('Berhasil menghapus produk', 'success');
    } catch (error) {
        console.error('Error deleting product:', error.message);
        showToast('Gagal menghapus produk', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// --- Public Page UI Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('productList');
    if (!productList) return;

    const searchInput = document.getElementById('searchProduct');
    const sortSelect = document.getElementById('sortProduct');
    
    showLoading();
    let allProducts = await getProducts();
    let allUMKM = await getUMKM();
    hideLoading();
    
    // Map UMKM names to products for easier display and search
    let enrichedProducts = allProducts.map(p => {
        const umkm = allUMKM.find(u => u.id == p.umkm_id);
        return {
            ...p,
            umkmName: umkm ? umkm.name : 'Unknown'
        };
    });

    let searchQuery = '';
    let sortType = 'newest';

    function renderProducts(data) {
        productList.innerHTML = '';
        
        if (data.length === 0) {
            productList.innerHTML = `
                <div class="col-span-full text-center py-5">
                    <p class="text-muted">Tidak ada produk yang ditemukan.</p>
                </div>
            `;
            return;
        }

        data.forEach((item, index) => {
            const delay = (index % 5) + 1;
            const card = document.createElement('div');
            card.className = `card reveal stagger-${delay}`;
            
            // Format Price
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price);
            
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${item.image || 'https://via.placeholder.com/800'}" alt="${item.name}" class="card-img" loading="lazy">
                </div>
                <div class="card-body">
                    <small class="text-primary mb-2 block" style="font-weight: 600;"><i class="fas fa-store-alt"></i> ${item.umkmName}</small>
                    <h3 class="card-title mb-2">${item.name}</h3>
                    <p class="text-main font-bold mb-4" style="font-size: 1.25rem;">${formattedPrice}</p>
                    
                    <div style="margin-top: auto;">
                        <a href="detail.html?id=${item.umkm_id}" class="btn btn-primary" style="width: 100%; border-radius: var(--radius-sm); padding: 0.5rem; font-size: 0.875rem;">
                            Beli di Toko <i class="fas fa-shopping-bag"></i>
                        </a>
                    </div>
                </div>
            `;
            productList.appendChild(card);
        });

        setTimeout(() => {
            if (typeof initScrollReveal === 'function') initScrollReveal();
        }, 100);
    }

    function applyFilters() {
        let filtered = [...enrichedProducts];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(lowerQuery) ||
                item.umkmName.toLowerCase().includes(lowerQuery)
            );
        }

        if (sortSelect) {
            if (sortSelect.value === 'price-asc') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (sortSelect.value === 'price-desc') {
                filtered.sort((a, b) => b.price - a.price);
            } else if (sortSelect.value === 'name-asc') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortSelect.value === 'name-desc') {
                filtered.sort((a, b) => b.name.localeCompare(a.name));
            } else {
                // newest (default order - already sorted by API)
            }
        }

        renderProducts(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFilters();
        });
    }

    renderProducts(enrichedProducts);
});
