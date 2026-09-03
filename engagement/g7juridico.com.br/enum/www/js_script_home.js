
var UrlSite2 =  window.location.href;
if (UrlSite2.indexOf("homologacao.g7juridico")=="-1") {
	var UrlSite = "http://homologacao.g7juridico.com.br/";
} else if (UrlSite2.indexOf("blackfriday.g7juridico")=="-1") {
	var UrlSite = "http://blackfriday.g7juridico.com.br/";
} else {
	var UrlSite = "https://www.g7juridico.com.br/";
}

//======================= PRINCIPAIS =======================//
	//========= Abre Modal ==============//

	function abre(urlAbre,idAbre) {
		$.ajax({
		type: "get",
		url: urlAbre,
		success: function(retorno){

			$("#"+ idAbre +"").html(retorno);

			if (idAbre=="ModalPadrao") {
				if($('#ModalPadrao').is(':visible')) {
				} else {
					$('#ModalPadrao').modal('toggle');
				}
			}
		}
		})
	}
	//========= Abre Modal ==============//
	
	//========= MOSTRA E ESCONDE ==============//
	function esconde(div){
		$("#"+ div +"").hide();
	}

	function mostra(div){
		$("#"+ div +"").show();
	}


	//========= ABRE E FECHA COM TOGGLE ==============//
	function efeito_abre(div){
		$("#"+div+"").slideToggle();
	}


	//========= TAMANHO DA TELA ==============//
	function verificaTamanho() {
		document.getElementById("DivTamanhoTela").innerHTML = $(window).width() + 17;

	}


	//========= MENU MOBILE ==============//
	function EfeitoMenu(div){
		$("#"+ div +"").toggle("slide",{direction:"left"});
	}

	function EfeitoMenu2(div){
		$("#"+ div +"").toggle("slide",{direction:"right"});
	}

	// -- menu categorias
	function EfeitoMenuCategorias(div){
		$("#"+ div +"").slideToggle("fast");
	}
	
	function Avisos(){
	$.ajax({
	type: "get",
	cache: false,
	url: "verifica_aviso.php",
	success: function(retorno){
		if(retorno != ""){
			retorno = retorno.replace(/\r|\n/g, "");

			if(retorno != ""){
				$("#ModalPadrao").html(retorno);
				if($('#ModalPadrao').is(':visible')) {
				} else {
					$('#ModalPadrao').modal('toggle');
				}
			}
		}
	}
	});
}

function BotaoPiscar(acao) {
                            
	if (acao=="Botao1") {
		$("#BotaoPisca").addClass("Botao2");
		setTimeout("BotaoPiscar('Botao2');",700);
	} else {
		$("#BotaoPisca").removeClass("Botao2");
		setTimeout("BotaoPiscar('Botao1');",700);
	}

}



function FiltrarCategoria(codigo, ordem) {
	if (codigo=="T") {

		$('a[data-categoria]').fadeIn();

		var total_curso = $(".linha_blocos").find("a[data-todos-ordem]").length;

		for (i=1;i<=total_curso;i++) {
			$('.linha_blocos').append($(`[data-todos-ordem="`+ i +`"]`));
		}

	} else {

		$('a[data-categoria]').each(function() {
			const categorias = $(this).attr('data-categoria');
			if (categorias.includes('['+ codigo +']')) {
				$(this).fadeIn();
			} else {
				$(this).hide();
			}
		});

		if (ordem!="") {
			const arrayOrdem = ordem.split(',').map(Number);
			arrayOrdem.forEach(curso => {
				const elemento = document.querySelector(`[data-curso-combo="${curso}"]`);
				if (elemento) {
					$('.linha_blocos').append($(`[data-curso-combo="${curso}"]`));
				}
			});
		}
	}
}
