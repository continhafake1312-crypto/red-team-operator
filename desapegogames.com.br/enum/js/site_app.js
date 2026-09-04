var base_url = 'https://desapegogames.com.br/';

var qtdNotificacoes = 0;

ion.sound({
	sounds: [
		{name: "button_tiny"}
	],
	path: base_url + "assets/site/sounds/",
	preload: true,
	multiplay: true,
	volume: 0.9
});

$(function() {
	$('[data-toggle="tooltip"], .enable-tooltip').tooltip({ boundary: 'window' });
	
	busca();
	notificacoes();
	carrinho();
	
	setInterval(function(){ notificacoes(1); }, 180000);
});

function busca() {
	$('.main-header .input-group input[name=busca]').on('keyup', function (event) {
		if(this.value != '' && this.value != null) {
			$.ajax({
				url: base_url + 'busca.html',
				type: 'POST',
				dataType: 'html',
				data: 'pesquisar=' + this.value,
				success: function(data) {
					$('.header-busca').html(data);
				}
			});
		}
	});
}

function notificacoes(sound = 0) {
	$.ajax({
		url: base_url + 'notificacoes.html',
		type: 'POST',
		dataType: 'html',
		data: '',
		success: function(data) {
			var totalNotificacoes = $(data).filter("input[name='notificacoes-total']").val();
			if(totalNotificacoes != undefined) {
				$('.header-notificacoes-qtd').html(totalNotificacoes);
				if(totalNotificacoes > 0) {
					$('.header-notificacoes-qtd').addClass('bg-danger');
				}
				if(sound && qtdNotificacoes != totalNotificacoes) {
					ion.sound.play("button_tiny");
				}
				
				qtdNotificacoes = totalNotificacoes;
			} else {
				$('.header-notificacoes-qtd').html('0').removeClass('bg-danger');
				
				qtdNotificacoes = 0;
			}
			$('.header-notificacoes').html(data);
		}
	});
}

function carrinho() {
	$.ajax({
		url: base_url + 'carrinho.html',
		type: 'POST',
		dataType: 'html',
		data: '',
		success: function(data) {
			$('.header-carrinho-qtd').html($(data).filter(".result").length);
			$('.header-carrinho').html(data);
		}
	});
}