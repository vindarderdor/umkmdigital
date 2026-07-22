/**
 * Admin Dashboard UI and CRUD Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
    // Session Check
    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Image Upload Preview Logic (Shared)
    const imageInput = document.getElementById('imageInput');
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    let currentImageBase64OrUrl = '';
    window.selectedFileToUpload = null;

    if (imageInput && previewImg && uploadPlaceholder) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validation
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
                if (!validTypes.includes(file.type)) {
                    showToast('Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.', 'error');
                    e.target.value = '';
                    return;
                }

                if (file.size > 5 * 1024 * 1024) { // 5MB
                    showToast('Ukuran file maksimal 5MB!', 'error');
                    e.target.value = '';
                    return;
                }

                window.selectedFileToUpload = file;
                const localUrl = URL.createObjectURL(file);
                previewImg.src = localUrl;
                previewImg.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
                currentImageBase64OrUrl = ''; // will be uploaded later
            }
        });
    }

    window.resetImagePreview = function() {
        window.selectedFileToUpload = null;
        currentImageBase64OrUrl = '';
        if (imageInput) imageInput.value = '';
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'flex';
        }
    }

    // ==========================================
    // 1. CRUD UMKM Logic
    // ==========================================
    const umkmTableBody = document.getElementById('umkmTableBody');
    if (umkmTableBody) {
        let umkmData = [];
        let deleteTargetId = null;

        async function loadUMKMTable() {
            showLoading();
            umkmData = await getUMKM();
            renderUMKMTable();
            hideLoading();
        }

        function renderUMKMTable() {
            umkmTableBody.innerHTML = '';
            if (umkmData.length === 0) {
                umkmTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Belum ada data UMKM</td></tr>`;
                return;
            }

            umkmData.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="${item.image || 'https://via.placeholder.com/40'}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${item.owner}</td>
                    <td><span class="badge badge-primary">${item.category}</span></td>
                    <td>RT ${item.rt || '-'}/RW ${item.rw || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon edit" onclick="editUMKM(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete" onclick="deleteUMKMModal(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                umkmTableBody.appendChild(tr);
            });
        }

        loadUMKMTable();

        const umkmForm = document.getElementById('umkmForm');
        if (umkmForm) {
            umkmForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('umkmId').value;
                const payload = {
                    name: document.getElementById('name').value,
                    owner: document.getElementById('owner').value,
                    category: document.getElementById('category').value,
                    desc: document.getElementById('desc').value,
                    phone: document.getElementById('phone').value,
                    wa: document.getElementById('wa').value,
                    hours: document.getElementById('hours').value,
                    address: document.getElementById('address').value,
                    rt: document.getElementById('rt').value,
                    rw: document.getElementById('rw').value,
                    lat: document.getElementById('lat').value,
                    lng: document.getElementById('lng').value,
                    year: document.getElementById('year').value
                };

                try {
                    let finalImageUrl = currentImageBase64OrUrl;
                    if (window.selectedFileToUpload) {
                        showLoading();
                        finalImageUrl = await uploadImage(window.selectedFileToUpload);
                    } else if (!id && !finalImageUrl) {
                        showToast('Wajib mengunggah foto!', 'error');
                        return;
                    }
                    
                    if (finalImageUrl) payload.image = finalImageUrl;

                    if (id) {
                        await updateUMKM(id, payload);
                    } else {
                        await insertUMKM(payload);
                    }
                    
                    closeModal('umkmModal');
                    loadUMKMTable();
                } catch (err) {
                    console.error('Error saving UMKM:', err);
                }
            });
        }

        window.editUMKM = (id) => {
            const item = umkmData.find(u => u.id == id);
            if (item) {
                document.getElementById('modalTitle').innerText = 'Edit UMKM';
                document.getElementById('umkmId').value = item.id;
                document.getElementById('name').value = item.name;
                document.getElementById('owner').value = item.owner;
                document.getElementById('category').value = item.category;
                document.getElementById('desc').value = item.desc || '';
                document.getElementById('phone').value = item.phone || '';
                document.getElementById('wa').value = item.wa || '';
                document.getElementById('hours').value = item.hours || '';
                document.getElementById('address').value = item.address || '';
                document.getElementById('rt').value = item.rt || '';
                document.getElementById('rw').value = item.rw || '';
                document.getElementById('lat').value = item.lat || '';
                document.getElementById('lng').value = item.lng || '';
                document.getElementById('year').value = item.year || '';
                
                currentImageBase64OrUrl = item.image;
                if(previewImg) {
                    previewImg.src = item.image || '';
                    previewImg.style.display = item.image ? 'block' : 'none';
                }
                if(uploadPlaceholder) uploadPlaceholder.style.display = item.image ? 'none' : 'flex';
                window.selectedFileToUpload = null;
                openModal('umkmModal');
            }
        };

        window.deleteUMKMModal = (id) => {
            deleteTargetId = id;
            openModal('deleteModal');
        };

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async () => {
                if (deleteTargetId) {
                    try {
                        await deleteUMKM(deleteTargetId);
                        closeModal('deleteModal');
                        loadUMKMTable();
                        deleteTargetId = null;
                    } catch(e) {}
                }
            });
        }
        
        const btnCreate = document.getElementById('btnCreateUMKM');
        if(btnCreate) {
             btnCreate.addEventListener('click', () => {
                document.getElementById('modalTitle').innerText = 'Tambah UMKM Baru';
                if(umkmForm) umkmForm.reset();
                document.getElementById('umkmId').value = '';
                resetImagePreview();
                openModal('umkmModal');
            });
        }
    }

    // ==========================================
    // 2. CRUD Produk Logic
    // ==========================================
    const productTableBody = document.getElementById('productTableBody');
    if (productTableBody) {
        let productsData = [];
        let umkmData = [];
        let deleteTargetId = null;

        async function loadProductTable() {
            showLoading();
            const [pData, uData] = await Promise.all([getProducts(), getUMKM()]);
            productsData = pData;
            umkmData = uData;
            
            // Populate UMKM Select
            const umkmSelect = document.getElementById('umkmSelect');
            if (umkmSelect) {
                umkmSelect.innerHTML = '<option value="" disabled selected>Pilih UMKM</option>';
                umkmData.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.id;
                    opt.innerText = u.name;
                    umkmSelect.appendChild(opt);
                });
            }

            renderProductTable();
            hideLoading();
        }

        function renderProductTable() {
            productTableBody.innerHTML = '';
            if (productsData.length === 0) {
                productTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Belum ada data produk</td></tr>`;
                return;
            }

            productsData.forEach(item => {
                const tr = document.createElement('tr');
                const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price);
                const umkm = umkmData.find(u => u.id == item.umkm_id);
                const umkmName = umkm ? umkm.name : 'Unknown';

                tr.innerHTML = `
                    <td>
                        <img src="${item.image || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                    </td>
                    <td class="font-bold">${item.name}</td>
                    <td><span class="badge badge-accent"><i class="fas fa-store"></i> ${umkmName}</span></td>
                    <td class="text-primary font-bold">${formattedPrice}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon edit" onclick="editProduct(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete" onclick="deleteProductModal(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                productTableBody.appendChild(tr);
            });
        }

        loadProductTable();

        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const id = document.getElementById('productId').value;
                const payload = {
                    umkm_id: document.getElementById('umkmSelect').value,
                    name: document.getElementById('name').value,
                    price: document.getElementById('price').value
                };

                try {
                    let finalImageUrl = currentImageBase64OrUrl;
                    if (window.selectedFileToUpload) {
                        showLoading();
                        finalImageUrl = await uploadImage(window.selectedFileToUpload);
                    } else if (!id && !finalImageUrl) {
                        showToast('Wajib mengunggah foto produk!', 'error');
                        return;
                    }
                    
                    if (finalImageUrl) payload.image = finalImageUrl;

                    if (id) {
                        await updateProduct(id, payload);
                    } else {
                        await insertProduct(payload);
                    }

                    closeModal('productModal');
                    loadProductTable();
                } catch(err) {
                    console.error('Error saving product:', err);
                }
            });
        }

        window.editProduct = (id) => {
            const item = productsData.find(p => p.id == id);
            if (item) {
                document.getElementById('modalTitle').innerText = 'Edit Produk';
                document.getElementById('productId').value = item.id;
                document.getElementById('umkmSelect').value = item.umkm_id;
                document.getElementById('name').value = item.name;
                document.getElementById('price').value = item.price;
                
                currentImageBase64OrUrl = item.image;
                if(previewImg) {
                    previewImg.src = item.image || '';
                    previewImg.style.display = item.image ? 'block' : 'none';
                }
                if(uploadPlaceholder) uploadPlaceholder.style.display = item.image ? 'none' : 'flex';
                window.selectedFileToUpload = null;
                openModal('productModal');
            }
        };

        window.deleteProductModal = (id) => {
            deleteTargetId = id;
            openModal('deleteModal');
        };

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async () => {
                if (deleteTargetId) {
                    try {
                        await deleteProduct(deleteTargetId);
                        closeModal('deleteModal');
                        loadProductTable();
                        deleteTargetId = null;
                    } catch(e) {}
                }
            });
        }
        
        const btnCreate = document.getElementById('btnCreateProduct');
        if(btnCreate) {
             btnCreate.addEventListener('click', () => {
                if (umkmData.length === 0) {
                    showToast('Tambahkan UMKM terlebih dahulu!', 'error');
                    return;
                }
                document.getElementById('modalTitle').innerText = 'Tambah Produk Baru';
                if(productForm) productForm.reset();
                document.getElementById('productId').value = '';
                resetImagePreview();
                openModal('productModal');
            });
        }
    }

    // ==========================================
    // 3. CRUD Dokumentasi Logic
    // ==========================================
    const docTableBody = document.getElementById('docTableBody');
    if (docTableBody) {
        let docsData = [];
        let deleteTargetId = null;

        async function loadDocTable() {
            showLoading();
            docsData = await getDocs();
            renderDocTable();
            hideLoading();
        }

        function renderDocTable() {
            docTableBody.innerHTML = '';
            if (docsData.length === 0) {
                docTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Belum ada dokumentasi</td></tr>`;
                return;
            }

            docsData.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.title}" style="width: 80px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                    </td>
                    <td class="font-bold">${item.title}</td>
                    <td>${item.date}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon delete" onclick="deleteDocModal(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                docTableBody.appendChild(tr);
            });
        }

        loadDocTable();

        const docForm = document.getElementById('docForm');
        if (docForm) {
            docForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('title').value;
                const date = document.getElementById('date').value;

                if (!window.selectedFileToUpload) {
                    showToast('Wajib mengunggah foto!', 'error');
                    return;
                }

                try {
                    showLoading();
                    const imageUrl = await uploadImage(window.selectedFileToUpload);
                    
                    await insertDoc({ title, date, image: imageUrl });
                    
                    closeModal('docModal');
                    loadDocTable();
                } catch(err) {
                    console.error('Error saving doc:', err);
                }
            });
        }

        window.deleteDocModal = (id) => {
            deleteTargetId = id;
            openModal('deleteModal');
        };

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async () => {
                if (deleteTargetId) {
                    try {
                        await deleteDoc(deleteTargetId);
                        closeModal('deleteModal');
                        loadDocTable();
                        deleteTargetId = null;
                    } catch(e) {}
                }
            });
        }
        
        const btnCreate = document.getElementById('btnCreateDoc');
        if(btnCreate) {
             btnCreate.addEventListener('click', () => {
                if(docForm) docForm.reset();
                resetImagePreview();
                
                // Set default date to today
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('date').value = today;
                
                openModal('docModal');
            });
        }
    }
});
