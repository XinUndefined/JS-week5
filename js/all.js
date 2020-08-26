import zh_TW from './zh_TW.js';
VeeValidate.localize('tw', zh_TW);
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
VeeValidate.configure({
    classes: {
        valid: 'is-valid',
        invalid: 'is-invalid',
    }
});
Vue.component('loading', VueLoading);
Vue.component('pagination', {
    template: `<nav aria-label="Page navigation example">
        <ul class="pagination">
          <li class="page-item" :class="{'disabled': innerPagination.current_page == 1}">
            <a class="page-link" href="#" aria-label="Previous" @click.prevent="changePage(innerPagination.current_page - 1)">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          <li v-for="item in innerPagination.total_pages" 
              :key="item" class="page-item" 
              :class="{'active': item === innerPagination.current_page}">
            <a class="page-link" href="#" @click.prevent="changePage(item)">{{ item }}</a>
          </li>
          <li
            class="page-item" :class="{'disabled': innerPagination.current_page === innerPagination.total_pages}">
            <a class="page-link" href="#" aria-label="Next" @click.prevent="changePage(innerPagination.current_page + 1)">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
        </nav>`,
    data() {
        return {};
    },
    props: ['innerPagination'],
    methods: {
        changePage(onePage) {
            this.$emit('change-page', onePage);
        }
    },
});

Vue.filter('money', function (num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return 'NT ' + parts.join('.');
  });

let app = new Vue({
    el: '#app',
    data: {
        uuid: '20f81077-1b58-4538-baa0-999ec629e11b',
        token: '',
        products: [],
        pagination: {},
        cartProducts: [],
        cartTotal: 0,
        form: {
            name: '',
            email: '',
            tel: '',
            address: '',
            payment: '',
            message: '',
        },
        isLoading: false,
    },
    created() {
        this.getProduct();
        this.getCart();
    },
    methods: {
        getProduct(page) {
            this.isLoading = true;
            const url = `https://course-ec-api.hexschool.io/api/${this.uuid}/ec/products?page=${page}`;
            axios.get(url)
                .then(res => {
                    this.products = res.data.data;
                    this.pagination = res.data.meta.pagination;
                    window.scrollTo(0, 0);
                    this.isLoading = false;
                })
        },
        addCart(item) {
            this.isLoading = true;
            let url = `https://course-ec-api.hexschool.io/api/${this.uuid}/ec/shopping`;
            let product = {
                "product": item.id,
                "quantity": "1"
            };
            axios.post(url, product)
                .then(res => {
                    console.log(res);
                    this.getCart();
                    this.isLoading = false;
                })
                .catch(error => {
                    this.isLoading = false;
                    alert('購物車內已有此商品');
                    this.isLoading = false;
                })
        },
        getCart() {
            this.isLoading = true;
            let url = `https://course-ec-api.hexschool.io/api/${this.uuid}/ec/shopping`;
            axios.get(url)
                .then(res => {
                    let data = res.data.data
                    let totalPrice = 0;
                    this.cartProducts = data;
                    data.forEach(item => {
                        totalPrice += (item.quantity * item.product.price);
                    });
                    this.cartTotal= totalPrice;
                    this.isLoading = false;
                })
        },
        deleteCart(item) {
            this.isLoading = true;
            let url = `https://course-ec-api.hexschool.io/api/${this.uuid}/ec/shopping/${item.product.id}`
            axios.delete(url)
                .then(res => {
                    this.getCart();
                    this.isLoading = false;
                })
        },
        clearAll() {
            this.isLoading = true;
            let url = `https://course-ec-api.hexschool.io/api/${this.uuid}/ec/shopping/all/product`
            axios.delete(url)
                .then(res => {
                    this.getCart();
                    this.isLoading = false;
                })
        },
        editCart(which, item) {
            this.isLoading = true;
            let url = `https://course-ec-api.hexschool.io/api/${this.uuid}/ec/shopping`;

            switch (which) {
                case 'plus':
                    let productPlus = {
                        "product": item.product.id,
                        "quantity": item.quantity + 1,
                    }
                    axios.patch(url, productPlus)
                        .then(res => {
                            this.getCart();
                            this.isLoading = false;
                        })
                    break;
                case 'minus':
                    if (item.quantity != 1) {
                        let productMinus = {
                            "product": item.product.id,
                            "quantity": item.quantity - 1,
                        }
                        axios.patch(url, productMinus)
                            .then(res => {
                                this.getCart();
                                this.isLoading = false;
                            })
                    } else {
                        this.isLoading = false;
                    }
                    break;

                default:
                    break;
            }


        }
    },
})