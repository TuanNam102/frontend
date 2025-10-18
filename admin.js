// === PRODUCT CLASS DEFINITION ===
class Product {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.price = data.price || 0;
        this.image = data.image || '';
        this.category = data.category || 'điện thoại';
        this.description = data.description || '';
        this.hot = data.hot || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Validation methods
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length === 0) {
            errors.push('Tên sản phẩm không được để trống');
        }
        
        if (!this.price || this.price <= 0) {
            errors.push('Giá sản phẩm phải lớn hơn 0');
        }
        
        if (!this.image || this.image.trim().length === 0) {
            errors.push('Hình ảnh sản phẩm không được để trống');
        }
        
        if (!this.category || this.category.trim().length === 0) {
            errors.push('Danh mục sản phẩm không được để trống');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Format price for display
    formatPrice() {
        return new Intl.NumberFormat('vi-VN').format(this.price) + ' ₫';
    }

    // Generate product name from filename
    static generateNameFromFile(filename) {
        return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    }

    // Create product from file
    static fromFile(file, options = {}) {
        const product = new Product({
            name: Product.generateNameFromFile(file.name),
            price: options.price || 1000000,
            category: options.category || 'điện thoại',
            description: options.description || `Sản phẩm ${Product.generateNameFromFile(file.name)}`,
            hot: options.hot || false
        });
        
        return product;
    }

    // Convert to API format
    toAPIFormat() {
        return {
            name: this.name,
            price: this.price,
            image: this.image,
            category: this.category,
            description: this.description,
            hot: this.hot
        };
    }

    // Update product data
    update(data) {
        Object.keys(data).forEach(key => {
            if (this.hasOwnProperty(key) && key !== 'id') {
                this[key] = data[key];
            }
        });
        this.updatedAt = new Date().toISOString();
    }

    // Clone product
    clone() {
        return new Product({
            id: this.id,
            name: this.name,
            price: this.price,
            image: this.image,
            category: this.category,
            description: this.description,
            hot: this.hot,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
    }

    // Get display info
    getDisplayInfo() {
        return {
            id: this.id,
            name: this.name,
            price: this.formatPrice(),
            image: this.image,
            category: this.category,
            description: this.description,
            hot: this.hot,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productListBody = document.getElementById('admin-product-list');
    const addProductBtn = document.getElementById('add-product-btn');
    const bulkUploadBtn = document.getElementById('bulk-upload-btn');
    const modal = document.getElementById('product-modal');
    const bulkModal = document.getElementById('bulk-upload-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeButton = document.querySelector('.close-button');
    const bulkCloseButton = document.getElementById('bulk-close-button');
    const productForm = document.getElementById('product-form');

    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const productCategoryInput = document.getElementById('product-category');
    const productDescriptionInput = document.getElementById('product-description');
    const productHotInput = document.getElementById('product-hot');
    
    // Image upload elements
    const imageUploadArea = document.getElementById('image-upload-area');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImageBtn = document.getElementById('remove-image');
    const removeImageAltBtn = document.getElementById('remove-image-alt');
    const uploadLink = document.querySelector('.upload-link');
    
    // Bulk upload elements
    const bulkUploadArea = document.getElementById('bulk-upload-area');
    const bulkFileInput = document.getElementById('bulk-file-input');
    const bulkSelectFiles = document.getElementById('bulk-select-files');
    const bulkPreviewContainer = document.getElementById('bulk-preview-container');
    const bulkPreviewGrid = document.getElementById('bulk-preview-grid');
    const clearAllFilesBtn = document.getElementById('clear-all-files');
    const processBulkUploadBtn = document.getElementById('process-bulk-upload');
    const bulkProgress = document.getElementById('bulk-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const API_URL = 'http://localhost:3000/products';
    
    // Image upload functionality
    let selectedFile = null;
    
    // Bulk upload functionality
    let selectedFiles = [];
    
    const handleFileSelect = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF)');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }
        
        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            imageUploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
    };
    
    const resetImageUpload = () => {
        selectedFile = null;
        productImageInput.value = '';
        imagePreview.style.display = 'none';
        imageUploadArea.style.display = 'flex';
        previewImg.src = '';
    };
    
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    
    // Bulk upload functions
    const handleBulkFileSelect = (files) => {
        const fileArray = Array.from(files);
        const validFiles = [];
        
        fileArray.forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} không phải là ảnh hợp lệ`);
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} quá lớn (tối đa 5MB)`);
                return;
            }
            
            validFiles.push(file);
        });
        
        if (validFiles.length > 10) {
            alert('Tối đa 10 file cùng lúc');
            return;
        }
        
        selectedFiles = [...selectedFiles, ...validFiles];
        renderBulkPreview();
    };
    
    const renderBulkPreview = () => {
        if (selectedFiles.length === 0) {
            bulkPreviewContainer.style.display = 'none';
            return;
        }
        
        bulkPreviewContainer.style.display = 'block';
        bulkPreviewGrid.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'bulk-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="item-info">
                        <div class="item-name">${file.name}</div>
                        <div class="item-size">${formatFileSize(file.size)}</div>
                    </div>
                    <button class="remove-item" data-index="${index}">×</button>
                `;
                bulkPreviewGrid.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    };
    
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const removeBulkFile = (index) => {
        selectedFiles.splice(index, 1);
        renderBulkPreview();
    };
    
    const clearAllBulkFiles = () => {
        selectedFiles = [];
        renderBulkPreview();
    };
    
    const processBulkUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Vui lòng chọn ít nhất một file');
            return;
        }
        
        bulkProgress.style.display = 'block';
        bulkPreviewContainer.style.display = 'none';
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            try {
                // Convert file to base64
                const imageData = await convertFileToBase64(file);
                
                // Generate product name from filename
                const productName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
                
                // Create product data
                const productData = {
                    name: productName,
                    price: 1000000, // Default price
                    image: imageData,
                    category: "điện thoại", // Default category
                    description: `Sản phẩm ${productName}`,
                    hot: false
                };
                
                // Send to API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
                
                // Update progress
                const progress = ((i + 1) / selectedFiles.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${i + 1}/${selectedFiles.length} files processed`;
                
            } catch (error) {
                console.error('Error processing file:', file.name, error);
                errorCount++;
            }
        }
        
        // Show results
        setTimeout(() => {
            alert(`Hoàn thành! Thành công: ${successCount}, Lỗi: ${errorCount}`);
            bulkProgress.style.display = 'none';
            clearAllBulkFiles();
            closeBulkModal();
            fetchAndRenderProducts();
        }, 1000);
    };
    
    const openBulkModal = () => {
        bulkModal.style.display = 'block';
        clearAllBulkFiles();
    };
    
    const closeBulkModal = () => {
        bulkModal.style.display = 'none';
        clearAllBulkFiles();
    };

    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const products = await response.json();
            productListBody.innerHTML = '';
            const formatter = new Intl.NumberFormat('vi-VN');

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td><img src="${product.image}" alt="${product.name}"></td>
                    <td>${product.name}</td>
                    <td>${formatter.format(product.price)} ₫</td>
                    <td>${product.category}</td>
                    <td class="action-buttons">
                        <button class="admin-button btn-edit" data-id="${product.id}">Sửa</button>
                        <button class="admin-button danger btn-delete" data-id="${product.id}">Xóa</button>
                    </td>
                `;
                productListBody.appendChild(row);
            });
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            productListBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Không thể tải dữ liệu sản phẩm. Vui lòng kiểm tra lại json-server.</td></tr>`;
        }
    };

    const openModal = (title, product = null) => {
        modalTitle.textContent = title;
        productForm.reset();
        productIdInput.value = '';
        resetImageUpload();
        
        if (product) {
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productCategoryInput.value = product.category;
            productDescriptionInput.value = product.description;
            productHotInput.checked = product.hot;
            
            // If product has an image URL, show it in preview
            if (product.image) {
                previewImg.src = product.image;
                imagePreview.style.display = 'block';
                imageUploadArea.style.display = 'none';
            }
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        let imageData = '';
        
        // If a new file is selected, convert it to base64
        if (selectedFile) {
            try {
                imageData = await convertFileToBase64(selectedFile);
            } catch (error) {
                alert('Lỗi khi xử lý file ảnh. Vui lòng thử lại.');
                return;
            }
        } else if (previewImg.src && previewImg.src.startsWith('data:')) {
            // If editing existing product and no new file selected, keep existing image
            imageData = previewImg.src;
        } else if (previewImg.src) {
            // If it's a URL (existing product), keep the URL
            imageData = previewImg.src;
        } else {
            alert('Vui lòng chọn ảnh cho sản phẩm.');
            return;
        }
        
        const productData = {
            name: productNameInput.value,
            price: parseInt(productPriceInput.value, 10),
            image: imageData,
            category: productCategoryInput.value,
            description: productDescriptionInput.value,
            hot: productHotInput.checked,
        };

        const id = productIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert(`Đã ${id ? 'cập nhật' : 'thêm'} sản phẩm thành công!`);
                closeModal();
                fetchAndRenderProducts();
            } else {
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi lưu sản phẩm:', error);
        }
    };

    const handleProductAction = async (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');
        if (!id) return;

        // Xử lý nút Sửa
        if (target.classList.contains('btn-edit')) {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                const product = await response.json();
                openModal('Chỉnh sửa sản phẩm', product);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin sản phẩm:', error);
            }
        }

        // Xử lý nút Xóa
        if (target.classList.contains('btn-delete')) {
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    
                    if (response.ok) {
                        alert('Đã xóa sản phẩm thành công!');
                        fetchAndRenderProducts();
                    } else {
                        alert(`Xóa sản phẩm thất bại. Lỗi: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa sản phẩm:', error);
                    alert(`Lỗi kết nối: ${error.message}`);
                }
            }
        }
    };

    // === GÁN SỰ KIỆN ===
    addProductBtn.addEventListener('click', () => openModal('Thêm sản phẩm mới'));
    bulkUploadBtn.addEventListener('click', openBulkModal);
    closeButton.addEventListener('click', closeModal);
    bulkCloseButton.addEventListener('click', closeBulkModal);
    window.addEventListener('click', (e) => { 
        if (e.target == modal) closeModal();
        if (e.target == bulkModal) closeBulkModal();
    });
    productForm.addEventListener('submit', handleFormSubmit);
    productListBody.addEventListener('click', handleProductAction);
    
    // Image upload event listeners
    imageUploadArea.addEventListener('click', () => productImageInput.click());
    uploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        productImageInput.click();
    });
    
    productImageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    removeImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetImageUpload();
    });
    
    removeImageAltBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetImageUpload();
    });
    
    // Drag and drop events
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
    });
    
    imageUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
    });
    
    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    // Bulk upload event listeners
    bulkUploadArea.addEventListener('click', () => bulkFileInput.click());
    bulkSelectFiles.addEventListener('click', (e) => {
        e.preventDefault();
        bulkFileInput.click();
    });
    
    bulkFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleBulkFileSelect(e.target.files);
        }
    });
    
    clearAllFilesBtn.addEventListener('click', clearAllBulkFiles);
    processBulkUploadBtn.addEventListener('click', processBulkUpload);
    
    // Bulk drag and drop events
    bulkUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        bulkUploadArea.classList.add('dragover');
    });
    
    bulkUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        bulkUploadArea.classList.remove('dragover');
    });
    
    bulkUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        bulkUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleBulkFileSelect(files);
        }
    });
    
    // Handle remove individual files in bulk preview
    bulkPreviewGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            removeBulkFile(index);
        }
    });
    
    fetchAndRenderProducts();
});