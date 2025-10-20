const API_URL = 'https://my-json-server.typicode.com/tuannam102/backend/products';
const productListBody = document.getElementById('admin-product-list');
const addProductBtn = document.getElementById('add-product-btn');
const modal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');

const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productImageUpload = document.getElementById('product-image');
const productCategoryInput = document.getElementById('product-category');
const productDescriptionInput = document.getElementById('product-description');
const productHotInput = document.getElementById('product-hot');

class Course { 
    constructor(id, name, price, image, category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
    }
    // Render giao diện của SẢN PHẨM
    render() {
        const formatter = new Intl.NumberFormat('vi-VN');
        return `
            <tr>
                <td>${this.id}</td>
                <td><img src="${this.image}" alt="${this.name}" style="width: 60px; height: 60px; object-fit: cover;"></td>
                <td>${this.name}</td>
                <td>${formatter.format(this.price)} ₫</td>
                <td>${this.category}</td>
                <td class="action-buttons">
                    <button class="admin-button btn-edit" data-id="${this.id}">Sửa</button>
                    <button class="admin-button danger btn-delete" data-id="${this.id}">Xóa</button>
                </td>
            </tr>
        `;
    }
}

// 3. CÁC HÀM XỬ LÝ
function getAndRenderProducts() {
    fetch(API_URL)
        .then(response => response.json())
        .then(products => {
            let html = "";
            products.forEach(item => {
                // Sử dụng 'new Course' để tạo đối tượng
                const course = new Course(item.id, item.name, item.price, item.image, item.category);
                html += course.render();
            });
            productListBody.innerHTML = html;
        })
        .catch(error => console.error("Lỗi khi tải sản phẩm: ", error));
}

// 4. XỬ LÝ SỰ KIỆN

// Mở Modal
if (addProductBtn) {
    console.log('Adding click listener to addProductBtn');
    addProductBtn.addEventListener('click', () => {
        console.log('Add product button clicked');
        modalTitle.textContent = 'Thêm sản phẩm mới';
        productForm.reset();
        productForm.removeAttribute('data-mode');
        modal.style.display = 'block';
    });
} else {
    console.error('addProductBtn not found!');
}

// Xử lý submit form (Thêm hoặc Sửa)
if (productForm) {
    productForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const file = productImageUpload.files[0];
        let imageUrl = '';
        if (file) {
            imageUrl = `img/${file.name}`;
        } else {
            // Nếu không có file mới, giữ nguyên ảnh cũ
            const existingImage = document.querySelector('#image-preview img');
            if (existingImage) {
                imageUrl = existingImage.src;
            }
        }
        
        const productData = {
            name: productNameInput.value,
            price: parseInt(productPriceInput.value),
            image: imageUrl,
            category: productCategoryInput.value,
            description: productDescriptionInput.value,
            hot: productHotInput.checked,
        };

        if (productForm.getAttribute('data-mode') === 'edit') {
            const id = productIdInput.value;
            fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            })
            .then(() => location.reload())
            .catch(error => console.error("Lỗi khi cập nhật: ", error));
        } else {
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            })
            .then(() => location.reload())
            .catch(error => console.error("Lỗi khi thêm mới: ", error));
        }
    });
}

// Bấm nút Sửa hoặc Xóa trên danh sách
if (productListBody) {
    console.log('Adding click listener to productListBody');
    productListBody.addEventListener('click', (event) => {
        console.log('Click detected on:', event.target);
        const editButton = event.target.closest('.btn-edit');
        const deleteButton = event.target.closest('.btn-delete');

        if (editButton) {
            console.log('Edit button clicked, id:', editButton.getAttribute('data-id'));
            const id = editButton.getAttribute('data-id');
            productForm.setAttribute('data-mode', 'edit');
            modalTitle.textContent = 'Chỉnh sửa sản phẩm';

            fetch(`${API_URL}/${id}`)
                .then(response => response.json())
                .then(product => {
                    console.log('Product data loaded:', product);
                    productIdInput.value = product.id;
                    productNameInput.value = product.name;
                    productPriceInput.value = product.price;
                    // Hiển thị ảnh hiện tại
                    const imagePreview = document.getElementById('image-preview');
                    const previewImg = document.getElementById('preview-img');
                    if (product.image) {
                        previewImg.src = product.image;
                        imagePreview.style.display = 'block';
                    }
                    productCategoryInput.value = product.category;
                    productDescriptionInput.value = product.description;
                    productHotInput.checked = product.hot;
                    modal.style.display = "block";
                })
                .catch(error => console.error("Lỗi khi load sản phẩm: ", error));
        }

        if (deleteButton) {
            console.log('Delete button clicked, id:', deleteButton.getAttribute('data-id'));
            const id = deleteButton.getAttribute('data-id');
            if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                console.log('Confirming delete for id:', id);
                fetch(`${API_URL}/${id}`, { method: 'DELETE' })
                .then(() => {
                    console.log('Delete successful, reloading...');
                    location.reload();
                })
                .catch(error => console.error("Lỗi khi xóa: ", error));
            }
        }
    });
} else {
    console.error('productListBody not found!');
}

// Đóng modal khi bấm ra ngoài
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
        productForm.removeAttribute('data-mode');
        productForm.reset();
    }
});

// Xử lý upload ảnh
const imageUploadArea = document.getElementById('image-upload-area');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');

if (imageUploadArea && productImageUpload) {
    // Click vào area để mở file dialog
    imageUploadArea.addEventListener('click', () => {
        productImageUpload.click();
    });

    // Xử lý khi chọn file
    productImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
                imageUploadArea.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Xóa ảnh
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            imagePreview.style.display = 'none';
            imageUploadArea.style.display = 'block';
            productImageUpload.value = '';
        });
    }
}

// Đóng modal khi click vào nút X
const closeButton = document.querySelector('.close-button');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        productForm.removeAttribute('data-mode');
        productForm.reset();
        imagePreview.style.display = 'none';
        imageUploadArea.style.display = 'block';
    });
}

// 5. CHẠY HÀM LẦN ĐẦU KHI TẢI TRANG
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing admin...');
    
    // Debug: Check if elements exist
    console.log('Elements check:');
    console.log('productListBody:', productListBody);
    console.log('addProductBtn:', addProductBtn);
    console.log('modal:', modal);
    console.log('productForm:', productForm);
    
    getAndRenderProducts();
});