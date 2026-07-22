/**
 * Products Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('productList');
    if (!productList) return;

    const searchInput = document.getElementById('searchProduct');
    const sortSelect = document.getElementById('sortProduct');
    
    let allProducts = getProducts();
    let allUMKM = getUMKM();
    
    // Map UMKM names to products for easier display and search
    let enrichedProducts = allProducts.map(p => {
        const umkm = allUMKM.find(u => u.id == p.umkmId);
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
                    <img src="${item.image}" alt="${item.name}" class="card-img" loading="lazy">
                </div>
                <div class="card-body">
                    <small class="text-primary mb-2 block" style="font-weight: 600;"><i class="fas fa-store-alt"></i> ${item.umkmName}</small>
                    <h3 class="card-title mb-2">${item.name}</h3>
                    <p class="text-main font-bold mb-4" style="font-size: 1.25rem;">${formattedPrice}</p>
                    
                    <div style="margin-top: auto;">
                        <a href="detail.html?id=${item.umkmId}" class="btn btn-primary" style="width: 100%; border-radius: var(--radius-sm); padding: 0.5rem; font-size: 0.875rem;">
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
                // newest (default order)
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
