// FECHA O MENU RESPONSIVO
document.getElementById('close-menu').onclick = function fechaMenu() {
    let menuCollapsed = document.getElementById('navcol-1');
    menuCollapsed.classList.toggle('show');
}

// FAZ A ABERTURA DO MEGA MENU
$('.open-mega-menu').on('click', function (event) {
    let divToUse = $(this).closest('div').find('.dropdown-menu.mega-menu-header');
    $(divToUse).toggleClass('show');
});

// FAZ A ABERTIRA DOS SUBMENUS DO MEGA MENU
$('.dropdown-submenu .dropdown-toggle').on('click', function (event) {
    let divToUse = $(this).closest('li').find('.dropdown-menu.submenu');
    $('.search-modal').addClass('d-none');
    $(divToUse).toggleClass('show');
});

// FAZ A FUNÇÃO DE ABRIR O CAMPO DE BUSCA NO HEADER
$('.open-search-box').on('click', function (event) {
    if(!$('.main-header .bell-modal').hasClass('d-none')) {
        $('.main-header .bell-modal').addClass('d-none');
    }
	
    if(!$('.main-header .cart-modal').hasClass('d-none')) {
        $('.main-header .cart-modal').addClass('d-none');
    }

    let divToUse = $(this).closest('.search-container').find('.input-group');

    if($('.main-header .input-group').hasClass('d-none')) {
        $(divToUse).removeClass('d-none');
        return;
    }

    let secondCheck = $(this).closest('.search-container').find('.input-group').find('input');

    if(secondCheck[0].value == '') {
        $(divToUse).addClass('d-none');
        return;
    }
});

// VERIFICAÇÃO DO CAMPO INPUT PRA VER SE TÁ PREENCHIDO
$('.main-header .input-group input[name=busca]').on('keyup', function (event) {
    if(this.value != '' || this.value != null) {
        if($('.search-modal.d-none')) {
            $('.search-modal').removeClass('d-none');
        }
    } else {
        $('.search-modal').addClass('d-none');
    }
});

// VERIFICAÇÃO DO CAMPO INPUT PRA VER SE TÁ PREENCHIDO
$('.main-header .input-group input[name=busca]').on('change', function (event) {
    if(this.value == '' || this.value == null) {
        $('.search-modal').addClass('d-none');
    }
});

// VERIFICAÇÃO DO CAMPO INPUT PRA VER SE TÁ PREENCHIDO
$('.main-header .input-group input[name=busca]').on('click', function (event) {
    if(this.value != '' && this.value != null) {
        $('.search-modal').removeClass('d-none');
    }
});

// ABRE A MODAL DE SINO
$('.open-bell-modal').on('click', function (event) {
    if(!$('.main-header .search-modal').hasClass('d-none')) {
        $('.search-modal').addClass('d-none');
    }

    let divToUse = $(this).closest('.bell-container').find('.bell-modal');
    $(divToUse).toggleClass('d-none');
});

// ABRE A MODAL DE CESTA
$('.open-cart-modal').on('click', function (event) {
    if(!$('.main-header .search-modal').hasClass('d-none')) {
        $('.search-modal').addClass('d-none');
    }

    let divToUse = $(this).closest('.cart-container').find('.cart-modal');
    $(divToUse).toggleClass('d-none');
});

// $(document).ready(function(){
// 	AOS.init();
// });

// FAZ O EVENTLISTENER PRA PEGAR O CLICK FORA DA MODAL
document.addEventListener("click", function(event) {
    if(!$(event.target).closest('.search-modal').length &&
    !$(event.target).closest('.open-search-box').length &&
    !$(event.target).closest('input.search').length) {
        if(!$('.main-header .search-modal').hasClass('d-none')) {
            $('.main-header .search-modal').addClass('d-none');
        }
    }

    if(!$(event.target).closest('.dropdown-menu.mega-menu:visible').length &&
    !$(event.target).closest('.nav-item.dropdown').length) {
        $('.dropdown-menu.mega-menu:visible').removeClass('show');
    }

    if(!$(event.target).closest('.cart-modal:visible').length &&
    !$(event.target).closest('.open-cart-modal').length) {
        $('.cart-modal:visible').addClass('d-none');
    }
	
    if(!$(event.target).closest('.bell-modal:visible').length &&
    !$(event.target).closest('.open-bell-modal').length) {
        $('.bell-modal:visible').addClass('d-none');
    }
});