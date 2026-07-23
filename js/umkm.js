/**
 * UMKM Page Logic & Supabase CRUD
 */

// --- Supabase Data Fetchers & Savers ---
async function getUMKM() {
    try {
        const { data, error } = await supabase
            .from('umkm')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching UMKM:', error.message);
        showToast('Gagal memuat data UMKM', 'error');
        return [];
    }
}

async function getUMKMById(id) {
    try {
        const { data, error } = await supabase
            .from('umkm')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching UMKM by ID:', error.message);
        return null;
    }
}

async function insertUMKM(umkmData) {
    try {
        showLoading();
        const { error } = await supabase.from('umkm').insert([umkmData]);
        if (error) throw error;
        showToast('Berhasil menambahkan UMKM', 'success');
    } catch (error) {
        console.error('Error inserting UMKM:', error.message);
        showToast('Gagal menambahkan UMKM', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function updateUMKM(id, umkmData) {
    try {
        showLoading();
        const { error } = await supabase
            .from('umkm')
            .update(umkmData)
            .eq('id', id);
        if (error) throw error;
        showToast('Berhasil mengubah UMKM', 'success');
    } catch (error) {
        console.error('Error updating UMKM:', error.message);
        showToast('Gagal mengubah UMKM', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function deleteUMKM(id) {
    try {
        showLoading();
        const { error } = await supabase
            .from('umkm')
            .delete()
            .eq('id', id);
        if (error) throw error;
        showToast('Berhasil menghapus UMKM', 'success');
    } catch (error) {
        console.error('Error deleting UMKM:', error.message);
        showToast('Gagal menghapus UMKM', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// --- Public Page UI Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    const umkmList = document.getElementById('umkmList');
    if (!umkmList) return; // Not on UMKM list page

    const searchInput = document.getElementById('searchUMKM');
    const filterButtons = document.querySelectorAll('.filter-btn');

    showLoading();
    let allUMKM = await getUMKM();
    hideLoading();

    let currentFilter = 'Semua';
    let searchQuery = '';

    function renderUMKM(data) {
        umkmList.innerHTML = '';
        
        if (data.length === 0) {
            umkmList.innerHTML = `
                <div class="col-span-full text-center py-5">
                    <p class="text-muted">Tidak ada UMKM yang ditemukan.</p>
                </div>
            `;
            return;
        }

        data.forEach((item, index) => {
            const delay = (index % 5) + 1;
            const card = document.createElement('div');
            card.className = `card reveal stagger-${delay}`;
            
            // Random rating for demo
            const rating = (Math.random() * (5 - 4) + 4).toFixed(1);
            
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${item.image || 'https://via.placeholder.com/800'}" alt="${item.name}" class="card-img" loading="lazy">
                    <span class="badge badge-primary card-badge"><i class="fas fa-tag"></i> ${item.category}</span>
                </div>
                <div class="card-body">
                    <div class="flex justify-between items-center mb-3">
                        <small class="text-muted flex items-center gap-1"><i class="fas fa-map-marker-alt text-danger"></i> RT ${item.rt || '-'}/RW ${item.rw || '-'}</small>
                        <span class="text-accent font-bold" style="font-size: 0.875rem;"><i class="fas fa-star"></i> ${rating}</span>
                    </div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="text-muted mb-2" style="font-size: 0.875rem;"><i class="fas fa-user-circle text-primary"></i> ${item.owner}</p>
                    <p class="text-muted mb-4" style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.desc || ''}</p>
                    
                    <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <a href="detail.html?id=${item.id}" class="btn btn-outline" style="width: 100%; border-radius: var(--radius-sm); padding: 0.5rem;">
                            Lihat Profil Usaha
                        </a>
                    </div>
                </div>
            `;
            umkmList.appendChild(card);
        });

        // Trigger scroll reveal for newly added elements
        setTimeout(() => {
            if (typeof initScrollReveal === 'function') initScrollReveal();
        }, 100);
    }

    function applyFilters() {
        let filtered = allUMKM;

        // Apply Category Filter
        if (currentFilter !== 'Semua') {
            filtered = filtered.filter(item => {
                if (!item.category) return false;
                const cats = item.category.split(',').map(c => c.trim().toLowerCase());
                return cats.includes(currentFilter.toLowerCase());
            });
        }

        // Apply Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(lowerQuery) ||
                item.owner.toLowerCase().includes(lowerQuery) ||
                item.category.toLowerCase().includes(lowerQuery)
            );
        }

        renderUMKM(filtered);
    }

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('btn-primary'));
            filterButtons.forEach(b => b.classList.add('btn-outline'));
            
            e.target.classList.remove('btn-outline');
            e.target.classList.add('btn-primary');

            currentFilter = e.target.dataset.filter;
            applyFilters();
        });
    });

    // Initial Render
    renderUMKM(allUMKM);
});
