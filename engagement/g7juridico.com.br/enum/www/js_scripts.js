
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


	//========= MASCARA TELEFONE ==============//
	function mascaraTelefone(objeto){
	if(objeto.value.length == 0){
	objeto.value = '(' + objeto.value;
	}
	if(objeto.value.length == 3){
	objeto.value = objeto.value + ') ';
	}
	if(objeto.value.length == 9){
	objeto.value = objeto.value + '-';
	}
	if(objeto.value.length == 13){
	n=objeto.value.substring(0,9);
	n2=objeto.value.substring(9,15);
	n2=n2.replace(/-/g, "");
	objeto.value = n + '-' + n2;
	}
	if(objeto.value.length == 14){
	n=objeto.value.substring(0,11);
	n=n.replace(/-/g, "");
	n2=objeto.value.substring(11,15);
	objeto.value = n + '-' + n2;
	}
	}


	//========= SOMENTE NUMEROS ==============//
	function SomenteNumero(e){
		var tecla=(window.event)?event.keyCode:e.which;   
		if((tecla>47 && tecla<58)) return true;
		else{
			if (tecla==8 || tecla==0) return true;
		else  return false;
		}
	}


	//========= FORMATAR CAMPOS ==============//
	function formatar(src, mask){
	  var i = src.value.length;
	  var saida = mask.substring(0,1);
	  var texto = mask.substring(i)
	if (texto.substring(0,1) != saida)
	  {
		src.value += texto.substring(0,1);
	  }
	}


	//========= MASCARA CPF/CNPJ ==============// 
	function MascaraCpfCnpj(str) {
	 if (str.value.length > 14)                       
	  str.value = MascaraCnpj(str.value);
	 else                           
	  str.value = MascaraCpf(str.value);
	}


	function MascaraCpf(valor) {
	 valoralor = valor.replace(/\D/g, "");
	 valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
	 valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
	 valor = valor.replace(/(\d{3})(\d)$/, "$1-$2");
	 return valor;
	}


	function MascaraCnpj(valor) {
	 valor = valor.replace(/\D/g, "");
	 valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
	 valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
	 valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
	 valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
	 return valor;
	}


	//========= SELECIONAR ESTADO/CIDADE ==============// 
	function SelecionaCidade(combo){
	var x = combo.selectedIndex;
	var cod = combo.options[x].value;
		$.ajax({
		type: "get",
		url: "pagina_cidades.asp?estado="+ cod +"",
		success: function(retorno){
		$("#DivCidade").html(retorno);  
		}
		})
	}


//======================= /PRINCIPAIS =======================//
	var $w = $(window);
	$w.on("scroll", function(){

		if( $w.scrollTop() > 200 ) {
			$("#Subir").fadeIn(500);
		} else {
			$("#Subir").fadeOut(500);
		}
	});

	function IrAoTopo(){
		$("html, body").animate({ scrollTop: 0 }, "slow");
	}

	function SelecionaAba(evt, cityName) {
    var i, conteudoaba, aba;
    conteudoaba = $(".ConteudoAba");
    for (i = 0; i < conteudoaba.length; i++) {
        conteudoaba[i].style.display = "none";
    }
    aba = $(".Aba");
    for (i = 0; i < aba.length; i++) {
        aba[i].className = aba[i].className.replace(" Selecionada", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " Selecionada";
	}

	var oldValue;

	function Acrescenta(){

		oldValue = $(".quantidade").val()

		var maxVal = $(".quantidade").attr("max");

		if(maxVal){
			if (oldValue < parseFloat(maxVal)) {
			    var newVal = parseFloat(oldValue) + 1;
			    $(".quantidade").val(newVal);
			} else {
			    newVal = maxVal;
			}			
		}else{
			var newVal = parseFloat(oldValue) + 1;
			$(".quantidade").val(newVal);
		}
	}

	function Decrescenta(){

		oldValue = $(".quantidade").val()
		
		var minVal = $(".quantidade").attr("min");

		if(minVal){
			if (oldValue > parseFloat(minVal)) {
			    var newVal = parseFloat(oldValue) - 1;
			    $(".quantidade").val(newVal);
			} else {
			    newVal = minVal;
			}
		}else{
			if (oldValue > 1) {
			    var newVal = parseFloat(oldValue) - 1;
			    $(".quantidade").val(newVal);
			} else {
			    newVal = 1;
			}
		}

	}

	function Rolagem(direcao){
			var qtdRolada = 0;

		qtdRolada = $('.ConteudoCampanhas').scrollLeft();

		switch(direcao){
			case "Esq":
				qtdRolada -= 150;
			break
			case "Dir":
				qtdRolada += 150;
			break
		}
		$('.ConteudoCampanhas').scrollLeft(qtdRolada);
	}


	$(document).ready(function(){	

		// var qtdBlocos = $('.BlocoPrincipal').length + $('.BlocoSecundario').length + $('.BlocoTerciario').length;
  		
  // 		var porcentagem = Math.floor((1/qtdBlocos)*100); 

  // 		var textoPorcentagem = porcentagem + "%";


  // 		 $('.BlocoPrincipal').css('width',textoPorcentagem )
  // 		 $('.BlocoSecundario').css('width',textoPorcentagem )
  // 		 $('.BlocoTerciario').css('width',textoPorcentagem )
  // 		 $('.FileiraCampanhas').css('width',qtdBlocos * 860);
  // 		 $('.ContainerCampanhas').css('width',qtdBlocos * 860);
  // 		 $('.ContainerBlocos').css('width',qtdBlocos * 860);


		$(".bloqueia-enter").on("keydown", function(event) {
			if (event.key === "Enter") {
				event.preventDefault();
			}
		});
	
	});


var StatusMenu = false;
function MenuTelefones(acao) {

	if (acao == "out") {
		StatusMenu = true;
	} else if (acao == "over") {
		StatusMenu = false;
	}

	var BotaoTelefone = $(".BotaoTelefone");
	var ContainerInformacaoTelefone = $(".ContainerInformacaoTelefone");

	if (StatusMenu == false) {
		StatusMenu = true;
		BotaoTelefone.addClass('BotaoAberto');
		ContainerInformacaoTelefone.css({ "display": "inline" });
	} else {
		StatusMenu = false;
		BotaoTelefone.removeClass('BotaoAberto');
		ContainerInformacaoTelefone.css({ "display": "none" });
	}

}

function selecionaFiltro(){
	var x = $('#selectReceitas').html();
	if(x == ""){
	$.ajax({
	type: "get",
	cache: false,
	url: "buscaReceita.php",
	success: function(retorno){
		$("#selectReceitas").html(retorno);
	}
	});
}else{
	$("#selectReceitas").html('');
}
	

}

(function(l,f){function m(){var a=e.elements;return"string"==typeof a?a.split(" "):a}function i(a){var b=n[a[o]];b||(b={},h++,a[o]=h,n[h]=b);return b}function p(a,b,c){b||(b=f);if(g)return b.createElement(a);c||(c=i(b));b=c.cache[a]?c.cache[a].cloneNode():r.test(a)?(c.cache[a]=c.createElem(a)).cloneNode():c.createElem(a);return b.canHaveChildren&&!s.test(a)?c.frag.appendChild(b):b}function t(a,b){if(!b.cache)b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag();
a.createElement=function(c){return!e.shivMethods?b.createElem(c):p(c,a,b)};a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){b.createElem(a);b.frag.createElement(a);return'c("'+a+'")'})+");return n}")(e,b.frag)}function q(a){a||(a=f);var b=i(a);if(e.shivCSS&&!j&&!b.hasCSS){var c,d=a;c=d.createElement("p");d=d.getElementsByTagName("head")[0]||d.documentElement;c.innerHTML="x<style>article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}</style>";
c=d.insertBefore(c.lastChild,d.firstChild);b.hasCSS=!!c}g||t(a,b);return a}var k=l.html5||{},s=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,r=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,j,o="_html5shiv",h=0,n={},g;(function(){try{var a=f.createElement("a");a.innerHTML="<xyz></xyz>";j="hidden"in a;var b;if(!(b=1==a.childNodes.length)){f.createElement("a");var c=f.createDocumentFragment();b="undefined"==typeof c.cloneNode||
"undefined"==typeof c.createDocumentFragment||"undefined"==typeof c.createElement}g=b}catch(d){g=j=!0}})();var e={elements:k.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:"3.7.0",shivCSS:!1!==k.shivCSS,supportsUnknownElements:g,shivMethods:!1!==k.shivMethods,type:"default",shivDocument:q,createElement:p,createDocumentFragment:function(a,b){a||(a=f);
if(g)return a.createDocumentFragment();for(var b=b||i(a),c=b.frag.cloneNode(),d=0,e=m(),h=e.length;d<h;d++)c.createElement(e[d]);return c}};l.html5=e;q(f)})(this,document);

function OperacoesDetalhes(cod){
	$('.blocoDetalhes').slideUp();
	tela = $(window).width();
	var x;
	if(tela<=900){
		x='s';
	}else{
		x='n';
	}
	if(x=='s'){
		if($('#bloco_detalhes'+cod).css('display')=="block"){
		$('#bloco_detalhes'+cod).slideUp();  
		}else{
		$('#bloco_detalhes'+cod).slideDown();
		}
	}
}

function OperacoesModulos(cod){
	$('.modulo_lista').slideUp();
	$(".botao_seta").css({"background":"url('imagens/modulo_seta2.png') center center", "background-repeat":"no-repeat"});

	if($('#modulo_lista'+cod).css('display')=="block"){
		$('#modulo_lista'+cod).slideUp();  
		$("#seta"+cod).css({"background":"url('imagens/modulo_seta2.png')  center center", "background-repeat":"no-repeat"});
	}else{
		$('#modulo_lista'+cod).slideDown();
		$("#seta"+cod).css({"background":"url('imagens/modulo_seta1.png')  center center", "background-repeat":"no-repeat"});
	}
}

function selecionaAba(tipo){
	var pagina ='';

	if(tipo==1){
		pagina='cursos_visao.php';
		$('#aba2').removeClass('aba_selecionada');	
		$('#aba1').addClass('aba_selecionada');		
	}else if(tipo==2){
		pagina='cursos_conteudo.php';
		$('#aba1').removeClass('aba_selecionada');	
		$('#aba2').addClass('aba_selecionada');	
	}

	$.ajax({
	type: "get",
	cache: false,
	url: pagina,
	success: function(retorno){
		$("#aba").html(retorno);
	}
	});
}


//////////////////////////////////////////////////////

function validaNome(){
	var CampoValida = $('#nome').val();

	if (CampoValida.indexOf(" ")=="-1" || CampoValida=="") {
		$("#nome").addClass("BordaErro");
	} else{
		$("#nome").removeClass("BordaErro");
	}
}

//////////////////////////////////////////////////////

function abrirAba(tipo){

	$(".aba").removeClass("selecionada");
	$(".textoAba").hide();

	if(tipo==1){			
		$('#aba1').addClass('selecionada');	
		$(".aba1").fadeIn(300);	
	}
	if(tipo==2){			
		$('#aba2').addClass('selecionada');	
		$(".aba2").fadeIn(300);	
	}
	if(tipo==3){			
		$('#aba3').addClass('selecionada');	
		$(".aba3").fadeIn(300);	
	}
	if(tipo==4){			
		$('#aba4').addClass('selecionada');	
		$(".aba4").fadeIn(300);	
	}
	if(tipo==5){			
		$('#aba5').addClass('selecionada');	
		$(".aba5").fadeIn(300);	
	}
	if(tipo==6){			
		$('#aba6').addClass('selecionada');	
		$(".aba6").fadeIn(300);	
	}
	if(tipo==7){			
		$('#aba7').addClass('selecionada');	
		$(".aba7").fadeIn(300);	
	}
}


//////////////////////////////////////////////////////


// ================== ERIC ================== \\

function BuscaEndereco2(Entrada, Saida){

	if (Entrada != "" && Saida != ""){
		$(Saida).val($(Entrada).val());
	}

}

let timeoutBuscaCep;
function BuscaEndereco(){
	if ($('#CEP').val()!="") {
		if ($('#CEP').val().length === 9) {
			clearTimeout(timeoutBuscaCep);
			timeoutBuscaCep = setTimeout(function () {
				BuscaEnderecoOK();

				$("#cidade").show().val('');
				$("#cidade2").hide().empty();

				$('.camspo_endereco').css('display','flex')
			}, 1000);
		} else {
			$("#CEP").css({"border":"1px solid #D93636"});	
		}
	}
}

function BuscaEnderecoOK(){

	var cep = $('#CEP').val();

	$("#CEP_status").val("N");
	$("#CEP_ibge").val("");
	$("#CEP").css({"border":"1px solid #E3E3E3"});
	
	$("#endereco").val("");
	$("#bairro").val("");
	$("#cidade").val("");
	$("#uf").val("");
	$("#cod_ibge").val("");

	if (cep != ""){

		$.ajax({
		type: "get",
		url: "cadastro_puxar_cep.php?cep="+ cep,
		success: function(retorno){
			retorno = retorno.replace(/\r|\n/g, "");
	
			if (retorno == "CEP não encontrado" || retorno == "") {

				//$("#CEP").css({"border":"1px solid #D93636"});	
				BuscaCepAux(cep)

			}else{

				var dados = retorno.split("|");
				
				endereco = dados[0];
				bairro = dados[1];
				cidade = dados[2];
				uf = dados[3];
				cod_ibge = dados[4];

				if (endereco == ""){
					$("#endereco").prop('readonly', false);
					$("#endereco").css({"background":"#F5F5F5"});
				}else{
					$("#endereco").prop('readonly', true);
					$("#endereco").css({"background":"#D93636"});
				}

				if (bairro == ""){
					$("#bairro").prop('readonly', false);
					$("#bairro").css({"background":"#F5F5F5"});
				}else{
					$("#bairro").prop('readonly', true);
					$("#bairro").css({"background":"#D93636"});
				}

				if (cidade == ""){
					$("#cidade").css({"background":"#F5F5F5"});
				}else{
					$("#cidade").prop('readonly', true);
					$("#cidade").css({"background":"#D93636"});
				}

				if (uf == ""){
					$("#uf").prop('readonly', false);
					$("#uf").css({"background":"#F5F5F5"});
				}else{
					$("#uf").prop('readonly', true);
					$("#uf").css({"background":"#D93636"});
				}

				$("#endereco").val(endereco);
				$("#bairro").val(bairro);
				$("#cidade").val(cidade);			
				$("#uf").val(uf);

				$("#CEP_ibge").val(cod_ibge);
				$("#CEP_status").val("S");

			}

		}
		});

	} else {
		$("#CEP").css({"border":"1px solid #D93636"});	
	}

}

function BuscaCepAux(cep){
	//Consulta o webservice viacep.com.br/
	var cep2 = $("#cep");
    $.getJSON("https://viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {
		if (!("erro" in dados)) {
			var endereco =  dados.logradouro;
            var bairro =   dados.bairro;
			var cidade = dados.localidade;
            var uf = dados.uf;
         	var cod_ibge = dados.ibge;		

			var count = Object.keys(dados).length;
			if (count > 0){						
				if (endereco == ""){
					$("#endereco").prop('readonly', false);
					$("#endereco").css({"background":"#F5F5F5"});
				}else{
					$("#endereco").prop('readonly', true);
					$("#endereco").css({"background":"#D93636"});
				}

				if (bairro == ""){
					$("#bairro").prop('readonly', false);
					$("#bairro").css({"background":"#F5F5F5"});
				}else{
					$("#bairro").prop('readonly', true);
					$("#bairro").css({"background":"#D93636"});
				}

				if (cidade == ""){
					$("#cidade").css({"background":"#F5F5F5"});
				}else{
					$("#cidade").prop('readonly', true);
					$("#cidade").css({"background":"#D93636"});
				}

				if (uf == ""){
					$("#uf").prop('readonly', false);
					$("#uf").css({"background":"#F5F5F5"});
				}else{
					$("#uf").prop('readonly', true);
					$("#uf").css({"background":"#D93636"});
				}

				$("#endereco").val(endereco);
				$("#bairro").val(bairro);
				$("#cidade").val(cidade);			
				$("#uf").val(uf);

				$("#CEP_ibge").val(cod_ibge);
				$("#CEP_status").val("S");
			}else	{		
				//$("#CEP").css({"border":"1px solid #D93636"});		

				$("#endereco").prop('readonly', false);
				$("#endereco").css({"background":"#F5F5F5"});

				$("#bairro").prop('readonly', false);
				$("#bairro").css({"background":"#F5F5F5"});

				$("#cidade").css({"background":"#F5F5F5"});

				$("#uf").prop('readonly', false);
				$("#uf").css({"background":"#F5F5F5"});

				$("#CEP_ibge").val("");
				$("#CEP_status").val("N");
			}
        }else {
			//$("#CEP").css({"border":"1px solid #D93636"});

			$("#endereco").prop('readonly', false);
			$("#endereco").css({"background":"#F5F5F5"});

			$("#bairro").prop('readonly', false);
			$("#bairro").css({"background":"#F5F5F5"});

			$("#cidade").css({"background":"#F5F5F5"});

			$("#uf").prop('readonly', false);
			$("#uf").css({"background":"#F5F5F5"});

			$("#CEP_ibge").val("");
			$("#CEP_status").val("N");
        }
    });
}

function BuscaCidades() {
	var uf = $("#uf").val();
	$("#cidade").hide();
	$("#cidade2").show();

	$.ajax({
	type: "post",
	url: 'cadastro_puxar_cidades.php',
	data: {uf: uf},
	cache: false,
	success: function(retorno){
		var json = JSON.parse(retorno);

		$('#cidade2').empty();
		$('#cidade2').append(`<option value=""></option>`);

		json.forEach(item => {
			$('#cidade2').append(
				`<option value="${item.cidade}|${item.cod_ibge}">
					${item.cidade}
				</option>`
			);
		});

		$('#cidade2').on('change', function () {
			let valor = $(this).val();

			if (valor !== '') {
				let [cidade, ibge] = valor.split('|');

				$('#cidade').val(cidade);
				$('#CEP_ibge').val(ibge);
			}
		});

	}
	})
}

function validaCadastro(){

	$("#btn_enviar").prop('disabled', true).val("Aguarde...").css({"background-color":"#707070"});

	var nome = $('#nome');
	var cpf = $('#cpf');
	var data_nasc = $('#data_nasc');
	var sexo = $('#sexo');
	var fone = $('#fone');
	var cel = $('#cel');

	var cep = $('#CEP');
	var cep_status = $('#CEP_status');
	var cep_ibge= $('#CEP_ibge');

	var endereco = $('#endereco');
	var bairro = $('#bairro');
	var uf = $('#uf');
	var cidade = $('#cidade');

	var endereco2 = $('#endereco2');
	var bairro2 = $('#bairro2');
	var uf2 = $('#uf2');
	var cidade2 = $('#cidade2');

	var numero = $('#numero');
	var complemento = $('#complemento');

	var email = $('#email_cadastro');
	var senha = $('#senha');
	var confirmar = $('#confirmar');
	var erro = 0;

	if (typeof grecaptcha.getResponse() == "undefined" || grecaptcha.getResponse() == "") {
		$("#robo").fadeIn(500);
		erro++;
    } else {
        $("#robo").fadeOut(500);
    }

	if(nome.val() == ""){
		nome.addClass("BordaErro");
		erro++;
	}else{

		var verifica_nome = nome.val().trim()
		var verifica_nome = verifica_nome.split(" ");
		var nome_qtde_caracteres = verifica_nome.length;

		if (parseInt(nome_qtde_caracteres) <= 1){
			nome.addClass("BordaErro");
			erro++;
		}else{
			nome.removeClass("BordaErro");
		}

	}

	if(cpf.val() != ""){

		if(ValidarCPF(cpf.val()) == false){
			cpf.addClass("BordaErro");
			erro++;
		}else{
			cpf.removeClass("BordaErro");
		}

	} else {
		cpf.addClass("BordaErro");
		erro++;	
	}

	if (data_nasc.val().length < 10) {
		data_nasc.addClass("BordaErro");
		erro++;
	} else {
		data_nasc2 = data_nasc.val().split('/');
		var data_nasc3 = data_nasc2[2] +"-"+ data_nasc2[1] +"-"+ data_nasc2[0];

		if (data_valida(data_nasc3)==false){
			data_nasc.addClass("BordaErro");
			erro++;
		}else{
			data_nasc.removeClass("BordaErro");
		}

	}

	if (sexo.val()=="") {
		sexo.addClass("BordaErro");
		erro++;
	}else{
		sexo.removeClass("BordaErro");
	}

	if (fone.val().length < 14) {
		fone.addClass("BordaErro");
		erro++;
	}else{
		fone.removeClass("BordaErro");
	}

	if (cel.val().length < 15) {
		cel.addClass("BordaErro");
		erro++;
	}else{
		cel.removeClass("BordaErro");
	}

	if(cep.val() == "" || cep_status.val() != "S"){
		cep.addClass("BordaErro");
		erro++;
	}else{
		cep.removeClass("BordaErro");
	}

	if(cep_ibge.val() == ""){
		cep.addClass("BordaErro");
		erro++;
	}else{
		cep.removeClass("BordaErro");
	}

	if(endereco.val() == ""){
		endereco2.addClass("BordaErro");
		erro++;
	}else{
		endereco2.removeClass("BordaErro");
	}

	if(numero.val() == ""){
		numero.addClass("BordaErro");
		erro++;
	}else{
		numero.removeClass("BordaErro");
	}
	
	if(bairro.val() == ""){
		bairro2.addClass("BordaErro");
		erro++;
	}else{
		bairro2.removeClass("BordaErro");
	}

	if(uf.val() == ""){
		uf2.addClass("BordaErro");
		erro++;
	}else{
		uf2.removeClass("BordaErro");
	}

	if(cidade.val() == ""){
		cidade2.addClass("BordaErro");
		erro++;
	}else{
		cidade2.removeClass("BordaErro");
	}

	if(senha.val()=="" || confirmar.val() ==""){

		senha.addClass('BordaErro');
		confirmar.addClass('BordaErro');
	  	erro++;

	}else{

		senha.removeClass('BordaErro');
		confirmar.removeClass('BordaErro');
		$( ".MsgErro" ).remove();

		if (senha.val().length < 5){
			
			senha.addClass("BordaErro");
			senha.after("<span class='MsgErro'>Deve conter no mínimo 5 caracteres</span>");
			erro += "N";

		}else{
	
			if (senha.val() != confirmar.val()){

				senha.addClass("BordaErro");
				confirmar.addClass("BordaErro");
				confirmar.after("<span class='MsgErro'>Senhas não conferem</span>");
				erro += "N";

			}else{

				senha.removeClass("BordaErro");
				confirmar.removeClass("BordaErro");

			}

		}

	}

    if(erro==0){
		$('#aluno_cadastrar').submit();
    } else {
		$("#btn_enviar").prop('disabled', false).val("Finalizar Cadastro").css({"background-color":"#333"});
	}

}

function data_valida(date){
    var matches = /(\d{4})[-.\/](\d{2})[-.\/](\d{2})/.exec(date);
    if (matches == null) {
        return false;
    }
    var dia = matches[3];
    var mes = matches[2] - 1;
    var ano = matches[1];
    var data = new Date(ano, mes, dia);
    return data.getDate() == dia && data.getMonth() == mes && data.getFullYear() == ano;
}

function ValidarCPF(cpf){

	//cpf = cpf.replace(/[\d]+/g, "");
	cpf = cpf.replace(".", "");
	cpf = cpf.replace(".", "");
	cpf = cpf.replace("-", "");
   
	if(cpf === ""){
	 return false;
	}
   
	// Elimina CPFs inválidos conhecidos
   
	if(cpf.length !== 11 || cpf === "00000000000" || cpf === "11111111111" || cpf === "22222222222" || cpf === "33333333333" || cpf === "44444444444" || cpf === "55555555555" || cpf === "66666666666" || cpf === "77777777777" || cpf === "88888888888" || cpf === "99999999999") {
	 return false;
	}
   
	// Valida 1 digito
	add = 0;
   
	for (i = 0; i < 9; i ++) {
	 add += parseInt(cpf.charAt(i)) * (10 - i);
	}
   
	rev = 11 - (add % 11);
   
	if (rev === 10 || rev === 11) {
	 rev = 0;
	}
   
	if (rev !== parseInt(cpf.charAt(9))) {
	 return false;
	}
   
	// Valida 2º digito
	add = 0;
   
	for (i = 0; i < 10; i ++) {
	 add += parseInt(cpf.charAt(i)) * (11 - i);
	}
   
	rev = 11 - (add % 11);
   
	if (rev === 10 || rev === 11) {
	 rev = 0;
	}
   
	if (rev !== parseInt(cpf.charAt(10))) {
	 return false;
	}
   
	return true;
   
}

function valida_Cadastro(){

	var invalid;
	var email = $('#email_cadastro');
	var cpf = $('#cpf');
	var celular = $('#celular_cadastro');
	var senha = $('#senha_cadastro');
	var erro = 0;

	$('#cadastrado').addClass('displaynone');
	$('#invalido').addClass('displaynone');
	$('#nomecadastrado').addClass('displaynone');
	$('#cpfcadastrado').addClass('displaynone');
	$('#cpfinvalido').addClass('displaynone');
	$('#celularinvalido').addClass('displaynone');
	$('#senhainvalido').addClass('displaynone');

	invalid = /\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
	if (invalid.test($('#email_cadastro').val()) == false) {
		erro++;
		$('#email_cadastro').css("border","1px solid #ff0000");
		$('#invalido').removeClass('displaynone');
	}else{
		$('#email_cadastro').css("border","1px solid #d4d4d4");
		$('#invalido').addClass('displaynone');
	}

	if(ValidarCPF(cpf.val()) == false){
		$('#cpf').css("border","1px solid #ff0000");
		$('#cpfinvalido').removeClass('displaynone');
		erro++;
	}else{
		$('#cpf').css("border","1px solid #d4d4d4");
		$('#cpfinvalido').addClass('displaynone');
	}

	if (celular.val().length < 15) {
		celular.addClass("BordaErro");
		$('#celularinvalido').removeClass('displaynone');
		erro++;
	}else{
		celular.removeClass("BordaErro");
		$('#celularinvalido').addClass('displaynone');
	}

	if(senha.val()==""){
		senha.addClass('BordaErro');
		$('#senhainvalido').removeClass('displaynone');
		erro++;
	}else{
		if (senha.val().length < 5){
			senha.addClass("BordaErro");
			$('#senhainvalido').removeClass('displaynone');
			erro++;
		}else{
			senha.removeClass("BordaErro");
			$('#senhainvalido').addClass('displaynone');
		}
	}

	var nome = $('#nome');

	if(nome.val() == "" || nome.val().indexOf(" ")=="-1"){
		nome.addClass("BordaErro");
		$('#nomecadastrado').removeClass('displaynone');
		erro++;
	}else{
		nome.removeClass("BordaErro");
		$('#nomecadastrado').addClass('displaynone');
	}

	if(erro == 0){
		$.ajax({
			type: "get",
			cache: false,
			url: "verifica_email_aluno.php?email_cadastro="+email.val() +"&cpf="+ cpf.val(),
			success: function(retorno){
				retorno = retorno.replace(/\r|\n/g, "");

				retorno = retorno.trim();

				if(retorno != "" && retorno != "N|N"){

					retorno2 = retorno.split('|');
					retorno_email = retorno2[0];
					retorno_cpf = retorno2[1];

					retorno_email = retorno_email.trim();
					retorno_cpf = retorno_cpf.trim();

					if (retorno_email=="S") {
						$('#email_cadastro').css("border","1px solid #ff0000");
						$('#cadastrado').removeClass('displaynone');
					} else {
						$('#email_cadastro').css("border","1px solid #d4d4d4");
						$('#invalido').addClass('displaynone');
					}

					if (retorno_cpf=="S") {
						$('#cpf').css("border","1px solid #ff0000");
						$('#cpfcadastrado').removeClass('displaynone');
					} else {
						$('#cpf').css("border","1px solid #d4d4d4");
						$('#cpfinvalido').addClass('displaynone');
					}


				}else{
					$(".btn2").prop('disabled', true).val("Aguarde...").css({"background-color":"#707070"});

					document.cookie = "cadastro = S; path=/";
					//$('#aluno_cadastrar').submit();
					$('#cadastrado').addClass('displaynone');

					PreCadastro();
				}
			}
			});
	}
}

function PreCadastro(){
	$.ajax({
	type: "post",
	data: $("#aluno_cadastrar").serialize(),
	url: "pre_cadastro.php",
	success: function(retorno){
		if (retorno=="Erro") {
			alert('Ocorreu um erro ao se cadastrar');
		} else {
			
			var ref = $("#ref").val();
			var Codigo = $("#Codigo").val();
			AlunoCompraInteresse(Codigo, ref); 

			AlunoSalvarUtm('cadastro');

			window.open(retorno, '_top');
		}
	}
	})
}

function validaLogin(){
	var email = $('#email_login');
	var senha = $('#senha');

	$('#span_login').addClass("displaynone");
	$('#span_login2').addClass("displaynone");

	//console.log(email.val());
	//console.log(senha.val());
	//console.log("login_aluno.php?email="+email.val()+"&senha="+senha.val());

	$.ajax({
	type: "post",
	cache: false,
	url: "login_aluno.php",
	data:{email: email.val(), senha: senha.val()},
	success: function(retorno){
		//console.log(retorno);
		retorno = retorno.replace(/\r|\n/g, "");
		if(retorno == "ok"){
			email.removeClass("BordaErro");
			senha.removeClass("BordaErro");

			var ref = $("#ref").val();
			var Codigo = $("#Codigo").val();
			AlunoCompraInteresse(Codigo, ref); 

			AlunoSalvarUtm('login');

			$('#span_login').addClass("displaynone");
			$('#span_login2').addClass("displaynone");
			$('#aluno_login').submit();

		}else{

			if(retorno == "Erro"){
				email.addClass("BordaErro");
				senha.addClass("BordaErro");
				$('#span_login').removeClass("displaynone");
			} else {
				$('#span_login2').removeClass("displaynone");
				//abre('login_aluno_aviso.php', 'ModalPadrao');
				//window.open('http://2018.g7juridico.com.br/','_top');
			}

		}
	}
	});
}

function VisualizarDicaMostra(){
	$(".span-dica-btn").hide();
	$(".campos-login").hide();
	$(".dica_senha_div").show();
}

function VisualizarDica(){
	var cpf = $('#dica_cpf');
	$(".dica_senha_txt").html("");

	if (cpf.val()=="") {
		cpf.addClass("BordaErro");
	} else {
		cpf.removeClass("BordaErro");

		$.ajax({
		type: "post",
		cache: false,
		url: "dica_senha.php",
		data:{cpf: cpf.val()},
		success: function(retorno){
			retorno = retorno.replace(/\r|\n/g, "");
			if(retorno == "Erro"){
				cpf.addClass("BordaErro");
				$('#span_login_dica').removeClass("displaynone");
			}else{
				$('#togglePassword').css('margin-left','-42px');
				$('#span_login').addClass("displaynone");
				$(".dica_senha").show().html(retorno);

				$(".campos-login").show();
				$(".dica_senha_div").hide();
			}
		}
		});
	}
}

function emailRecuperarSenha(){
	var email = $('#email_recuperar_senha');

	//console.log("email: "+email.val());
	$.ajax({
	type: "get",
	cache: false,
	url: "recuperar_senha.php?email="+email.val(),
	success: function(retorno){
		retorno = retorno.replace(/\r|\n/g, "");
		if(retorno != "inexistente"){
			$('#mensagem').css({"background-color":"#99D15E"});
			$('#mensagem').removeClass("displaynone");
			$('#mensagem').html("Foi enviado um e-mail para "+email.val()+"! Verifique o e-mail para redefinir a senha.");
		}else{
			$('#mensagem').removeClass("displaynone");
			$('#mensagem').css({"background-color":"#d9534f"});
			$('#mensagem').html("E-mail não cadastrado");
		}
		//console.log(retorno);
	}
	});
}

function trocar_senha(){
	var senha = $('#senha');
	var senha2 = $('#senha2');
	var div = $('#div');
	var cod = $('#cod');
	var erro = 0;


	if(senha.val() != senha2.val()){
		senha.addClass("BordaErro");
		senha2.addClass("BordaErro");
		div.removeClass("displaynone");
		erro++;
	}else{
		senha.removeClass("BordaErro");
		senha2.removeClass("BordaErro");
		div.addClass("displaynone");
	}

	if(erro == 0){
		$("#senha").prop("disabled", true);
		$("#senha2").prop("disabled", true);
		$.ajax({
		type: "get",
		cache: false,
		url: "cadastro_redefinir_senha.php?cod="+cod.val()+"&senha="+senha.val(),
		success: function(retorno){
			document.cookie = "redefinir=sucesso";
			window.open('login-cadastro', '_self');
		}
		});
	}
}

function ComprarAgora(Codigo,Ref,Pos){
	document.cookie = "caminho=curso";
	window.open('login/'+ Ref +'/'+ Codigo +'/'+ Pos, '_self');
}

/////////////////////////////////////////////////////////////////////////// ÍNICIO PAGAMENTOS


/// CUPOM

function validaCupom(codigo, referencia){
	var cupom = $('#cupom');
	var cupom_carreira = $('#cupom_carreira');
	var Pos = $('#Pos').val();
	var CompraAntecipada = $('#CompraAntecipada').val();

	$.ajax({
	type: "post",
	cache: false,
	url: 'verifica_cupom.php',
	data: {
		cupom: cupom.val(),
		cupom_cod_curso: codigo,
		cupom_curso_referencia: referencia,
		Pos: Pos,
		CompraAntecipada: CompraAntecipada,
	},
	success: function(retorno){
		var json = JSON.parse(retorno);

		if(json.status == "S" || json.status == "SX"){
			$('#valida').css({"background": "#5cb85c", "cursor":"no-drop"});
			$('#valida').val("Cupom validado!");
			$("#valida").attr('onclick', '');
			$("#cupom").prop('readonly', true);
			cupom.removeClass("BordaErro");

			if (json.status == "SX") {
				$(".cupom-ex-aluno").fadeOut();
			}

			$("#totalSemCompraAntecipada").val(json.totalSemCompraAntecipada);
			$("#totalComCompraAntecipada").val(json.totalComCompraAntecipada);
			ReCalculaValorNovo();

			//Tirar forma de pagamento escolhida
			$("#forma_pagamento").html("");
			// Cartao 2
			$(".img_pagamento2").css("background","url('imagens/2cartao.svg') center top no-repeat");
			$("#font2").css("color","#000");
			$(".bloco_cartoes2").css("background","#FFF");
			// Cartao 1
			$(".img_pagamento1").css("background","url('imagens/1cartao.svg') center top no-repeat");
			$("#font1").css("color","#000");
			$(".bloco_cartoes1").css("background","#FFF");
			// Boleto
			$(".img_pagamento3").css("background","url('imagens/boletoPgto.svg') center top no-repeat");
			$("#font3").css("color","#000");
			$(".bloco_cartoes3").css("background","#FFF");
			// Boleto + Cartao
			$(".img_pagamento4").css("background","url('imagens/cartaoboletoPgto.svg') center top no-repeat");
			$("#font4").css("color","#000");
			$(".bloco_cartoes4").css("background","#FFF");
			// Pix
			$(".img_pagamento5").css("background","url('imagens/pix_preto.svg') center top no-repeat");
			$("#font5").css("color","#000");
			$(".bloco_cartoes5").css("background","#FFF");

		}else{
			$("#cupom").val("");
			cupom.addClass("BordaErro");
		}
	}
	});

}

function RemoverCupomEx(valor_boleto) {
    $("#DivCupomEx").hide();
    $("#DivCupomExOutro").fadeIn();
    $(".div_valor_boleto_xx").html(valor_boleto);

	/*
	//Tirar forma de pagamento escolhida
	$("#forma_pagamento").html("");
	// Cartao 2
	$(".img_pagamento2").css("background","url('imagens/2cartao.svg') center top no-repeat");
	$("#font2").css("color","#000");
	$(".bloco_cartoes2").css("background","#FFF");
	// Cartao 1
	$(".img_pagamento1").css("background","url('imagens/1cartao.svg') center top no-repeat");
	$("#font1").css("color","#000");
	$(".bloco_cartoes1").css("background","#FFF");
	// Boleto
	$(".img_pagamento3").css("background","url('imagens/boletoPgto.svg') center top no-repeat");
	$("#font3").css("color","#000");
	$(".bloco_cartoes3").css("background","#FFF");
	*/
}    

/// BOLETO

function selecionaBoleto(Codigo,ref, horas, Pos, CodMigracao = "", CompraAntecipada = "N", CompraAntecipadaCompra = "N"){

	if(horas){
		horas = $("#horasExtra").val()
	} else {
		horas = "";
	}

	var cupom = $('#cupom').val();
	$(".img_pagamento2").css("background","url('imagens/2cartao.svg') center top no-repeat");
	$("#font2").css("color","#000");
	$(".bloco_cartoes2").css("background","#FFF");
	$(".img_pagamento1").css("background","url('imagens/1cartao.svg') center top no-repeat");
	$("#font1").css("color","#000");
	$(".bloco_cartoes1").css("background","#FFF");
	$(".img_pagamento4").css("background","url('imagens/cartaoboletoPgto.svg') center top no-repeat");
	$("#font4").css("color","#000");
	$(".bloco_cartoes4").css("background","#FFF");

	$(".img_pagamento5").css("background","url('imagens/pix_preto.svg') center top no-repeat");
	$("#font5").css("color","#000");
	$(".bloco_cartoes5").css("background","#FFF");

	$(".img_pagamento3").css("background","url('imagens/boletoPgto_hover.svg') center top no-repeat");
	$("#font3").css("color","#fff");
	$(".bloco_cartoes3").css("background","#000");

	$.ajax({
	type: "get",
	cache: false,
	url: "pagamento_boleto.php?Codigo="+ Codigo +"&ref="+ ref +"&cupom="+cupom + "&horas="+horas + "&Pos="+Pos + "&CodMigracao="+ CodMigracao + "&CompraAntecipada="+ CompraAntecipada + "&CompraAntecipadaCompra="+ CompraAntecipadaCompra,
	success: function(retorno){
		document.cookie = "boleto = S; path=/";
		$("#forma_pagamento").html(retorno);
	}
	});

}

function selecionaPix(Codigo,ref, horas, Pos, CodMigracao = "", CompraAntecipada = "N", CompraAntecipadaCompra = "N"){

	if(horas){
		horas = $("#horasExtra").val()
	} else {
		horas = "";
	}

	var cupom = $('#cupom').val();
	$(".img_pagamento2").css("background","url('imagens/2cartao.svg') center top no-repeat");
	$("#font2").css("color","#000");
	$(".bloco_cartoes2").css("background","#FFF");
	$(".img_pagamento1").css("background","url('imagens/1cartao.svg') center top no-repeat");
	$("#font1").css("color","#000");
	$(".bloco_cartoes1").css("background","#FFF");
	$(".img_pagamento4").css("background","url('imagens/cartaoboletoPgto.svg') center top no-repeat");
	$("#font4").css("color","#000");
	$(".bloco_cartoes4").css("background","#FFF");
	$(".img_pagamento3").css("background","url('imagens/boletoPgto.svg') center top no-repeat");
	$("#font3").css("color","#000");
	$(".bloco_cartoes3").css("background","#FFF");
	
	$(".img_pagamento5").css("background","url('imagens/pix_branco.svg') center top no-repeat");
	$("#font5").css("color","#fff");
	$(".bloco_cartoes5").css("background","#000");

	$.ajax({
		type: "get",
		cache: false,
		url: "pagamento_pix.php?Codigo="+ Codigo +"&ref="+ ref +"&cupom="+cupom + "&horas="+horas + "&Pos="+Pos + "&CodMigracao="+ CodMigracao + "&CompraAntecipada="+ CompraAntecipada + "&CompraAntecipadaCompra="+ CompraAntecipadaCompra,
		success: function(retorno){
			document.cookie = "pix = S; path=/";
			$("#forma_pagamento").html(retorno);
		}
	});

}

function GerarPix(){
	document.cookie = "pagamento = pix; path=/";

	$("#BotaoFinalizarPix").val("Aguarde");
    $("#BotaoFinalizarPix").prop('disabled', true);

    var erro = 0;
	$(".mensagem_erro").hide();
    $('.div_checkTermosBoleto').removeClass('ColorErro');

    if ($('#termosUso:checked').val() == undefined){
        $('.div_checkTermosBoleto').addClass('ColorErro');
        erro++;
    }

	var parametros_utm = GetUtm();

	if($('#CadastroNovo').is(':visible')) {
		var cadastro_alterar = "S";
		var cadastro_nome = $("#cadastro_nome").val();
		var cadastro_email = $("#cadastro_email").val();
		var cadastro_celular = $("#cadastro_celular").val();

		var CEP = $("#CEP").val();
		var CEP_ibge = $("#CEP_ibge").val();
		var CEP_status = $("#CEP_status").val();
		var endereco = $("#endereco").val();
		var numero = $("#numero").val();
		var complemento = $("#complemento").val();
		var bairro = $("#bairro").val();
		var cidade = $("#cidade").val();
		var uf = $("#uf").val();

		if($("#cadastro_nome").val() == ""){
			$("#cadastro_nome").addClass("BordaErro");
			erro++;
		}else{

			var verifica_nome = $("#cadastro_nome").val().trim()
			var verifica_nome = verifica_nome.split(" ");
			var nome_qtde_caracteres = verifica_nome.length;

			if (parseInt(nome_qtde_caracteres) <= 1){
				$("#cadastro_nome").addClass("BordaErro");
				erro++;
			}else{
				$("#cadastro_nome").removeClass("BordaErro");
			}

		}

		var invalid = /\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
		if (invalid.test($("#cadastro_email").val()) == false) {
			$("#cadastro_email").addClass("BordaErro");
			erro++;
		}else{
			$("#cadastro_email").removeClass("BordaErro");
		}

		if ($("#cadastro_celular").val().length < 15) {
			$("#cadastro_celular").addClass("BordaErro");
			erro++;
		}else{
			$("#cadastro_celular").removeClass("BordaErro");
		}

		if($("#CEP").val() == ""){
			$("#CEP").addClass("BordaErro");
			erro++;
		}else{
			$("#CEP").removeClass("BordaErro");
		}

		if($("#endereco").val() == ""){
			$("#endereco").addClass("BordaErro");
			erro++;
		}else{
			$("#endereco").removeClass("BordaErro");
		}

		if($("#numero").val() == ""){
			$("#numero").addClass("BordaErro");
			erro++;
		}else{
			$("#numero").removeClass("BordaErro");
		}

		if($("#bairro").val() == ""){
			$("#bairro").addClass("BordaErro");
			erro++;
		}else{
			$("#bairro").removeClass("BordaErro");
		}

		if($('#cidade2').is(':visible')) {

			if($("#cidade2").val() == ""){
				$("#cidade2").addClass("BordaErro");
				erro++;
			}else{
				$("#cidade2").removeClass("BordaErro");
			}

		} else {

			if($("#cidade").val() == ""){
				$("#cidade").addClass("BordaErro");
				erro++;
			}else{
				$("#cidade").removeClass("BordaErro");
			}

		}

		if($("#uf").val() == ""){
			$("#uf").addClass("BordaErro");
			erro++;
		}else{
			$("#uf").removeClass("BordaErro");
		}

	} else {
		var cadastro_alterar = "N";
		var cadastro_nome = "";
		var cadastro_email = "";
		var cadastro_celular = "";

		var CEP = "";
		var CEP_ibge = "";
		var CEP_status = "";
		var endereco = "";
		var numero = "";
		var complemento = "";
		var bairro = "";
		var cidade = "";
		var uf = "";
	}

    if (erro > 0) {
		$(".mensagem_erro").show();
		$("#BotaoFinalizarPix").val("Prosseguir");
		$("#BotaoFinalizarPix").prop('disabled', false);
	} else {

		$.ajax({
			type:"post",
			url: UrlSite2 + "pagamento_confirmar.php",
			data:{
				quantidade: 1,
				ref: $("#ref").val(),
				pagamento: 'pix',
				Codigo: $("#Codigo").val(),
				cupom: $("#cupom").val(),
				Pos: $("#Pos").val(),
				PosOpcao: $("#PosOpcao").val(),
				CompraAntecipada: $("#CompraAntecipada").val(),
				CompraAntecipadaCompra: $("#CompraAntecipadaCompra").val(),
				CodPedido: $("#CodPedido").val(),
				CodMigracao: $("#CodMigracao").val(),
                cadastro_alterar, cadastro_nome, cadastro_email, cadastro_celular, CEP, CEP_ibge, CEP_status, endereco, numero, complemento, bairro, cidade, uf, parametros_utm
			},
			success: function(retorno){
				console.log(retorno);
				var json = JSON.parse(retorno);
				if(json.status == "S"){
					window.open(UrlSite2 + "confirmacao-pix","_self");
				}else{
					AvisarErros("#PixAviso");
					$("#BotaoFinalizarPix").val("Prosseguir");
					$("#BotaoFinalizarPix").prop('disabled', false);
				}
			}
		})

	}
		
}

function selecionaParcela(){

	var num = $('#parcela');
	var parcelado = $('#valor_parcelado');
	var vista = $('#valor_vista');

	if(num.val() == "1"){

		$.ajax({
		type: "get",
		cache: false,
		url: "pagamento_mostrar_valor.php?valor=" + vista.val(),
		success: function(retorno){
			$('#valor_total').html("R$ " + retorno);
		}
		});

	}else{
		$('#valor_total').html("R$ "+parcelado.val());
	}

}


function pagamentoBoleto(){

	var nome = $('#nome');
	var email = $('#email');
	var cpf = $('#cpf');
	var parcela = $('#parcela');
	var dia_vencimento = $('#dia_vencimento');

	var OpcaoPos = $("#Pos").val();
	var OpcaoPosCod = $("#PosOpcao").val();

	var parametros_utm = GetUtm();
	$("#parametros_utm").val(parametros_utm);
	
	var erro = 0;

    if (OpcaoPos=="S" || OpcaoPos=="X") {
        if(OpcaoPosCod == ""){
            $(".OpcaoPos").addClass("BordaErro");
            erro++;
        }else{
            $(".OpcaoPos").removeClass("BordaErro");
        }
    }

	if(nome.val() == ""){
		nome.addClass("BordaErro");
		erro++;
	}else{
		nome.removeClass("BordaErro");
	}
	if(cpf.val() == ""){
		cpf.addClass("BordaErro");
		erro++;
	}else{
		cpf.removeClass("BordaErro");
	}
	if(parcela.val() == ""){
		parcela.addClass("BordaErro");
		erro++;
	}else{
		parcela.removeClass("BordaErro");
	}
	if (parcela.val() > 1) {
		if(dia_vencimento.val() == ""){
			dia_vencimento.addClass("BordaErro");
			erro++;
		}else{
			dia_vencimento.removeClass("BordaErro");
		}
	}
	if ($('#termosUso:checked').val() == undefined){
        $('.div_checkTermosBoleto').addClass('ColorErro');
        erro++;
    } else {
		$('.div_checkTermosBoleto').removeClass('ColorErro');
	}

	if($('#CadastroNovo').is(':visible')) {
		if($("#cadastro_nome").val() == ""){
			$("#cadastro_nome").addClass("BordaErro");
			erro++;
		}else{

			var verifica_nome = $("#cadastro_nome").val().trim()
			var verifica_nome = verifica_nome.split(" ");
			var nome_qtde_caracteres = verifica_nome.length;

			if (parseInt(nome_qtde_caracteres) <= 1){
				$("#cadastro_nome").addClass("BordaErro");
				erro++;
			}else{
				$("#cadastro_nome").removeClass("BordaErro");
			}

		}

		var invalid = /\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
		if (invalid.test($("#cadastro_email").val()) == false) {
			$("#cadastro_email").addClass("BordaErro");
			erro++;
		}else{
			$("#cadastro_email").removeClass("BordaErro");
		}

		if ($("#cadastro_celular").val().length < 15) {
			$("#cadastro_celular").addClass("BordaErro");
			erro++;
		}else{
			$("#cadastro_celular").removeClass("BordaErro");
		}

		if($("#CEP").val() == ""){
			$("#CEP").addClass("BordaErro");
			erro++;
		}else{
			$("#CEP").removeClass("BordaErro");
		}

		if($("#endereco").val() == ""){
			$("#endereco").addClass("BordaErro");
			erro++;
		}else{
			$("#endereco").removeClass("BordaErro");
		}

		if($("#numero").val() == ""){
			$("#numero").addClass("BordaErro");
			erro++;
		}else{
			$("#numero").removeClass("BordaErro");
		}

		if($("#bairro").val() == ""){
			$("#bairro").addClass("BordaErro");
			erro++;
		}else{
			$("#bairro").removeClass("BordaErro");
		}

		if($('#cidade2').is(':visible')) {

			if($("#cidade2").val() == ""){
				$("#cidade2").addClass("BordaErro");
				erro++;
			}else{
				$("#cidade2").removeClass("BordaErro");
			}

		} else {

			if($("#cidade").val() == ""){
				$("#cidade").addClass("BordaErro");
				erro++;
			}else{
				$("#cidade").removeClass("BordaErro");
			}

		}

		if($("#uf").val() == ""){
			$("#uf").addClass("BordaErro");
			erro++;
		}else{
			$("#uf").removeClass("BordaErro");
		}

	}

	if(erro == 0){
		$(".mensagem_erro").hide();
		document.cookie = "pagamento = boleto; path=/";
		$('#frm_pagamento').submit();
	} else {
		$(".mensagem_erro").show();
	}
}


function selecionaCartaoBoleto(Codigo,ref, horas, Pos, CodMigracao = "", CompraAntecipada = "N", CompraAntecipadaCompra = "N"){

	if(horas){
		horas = $("#horasExtra").val()
	} else {
		horas = "";
	}

	var cupom = $('#cupom').val();
	$(".img_pagamento2").css("background","url('imagens/2cartao.svg') center top no-repeat");
	$("#font2").css("color","#000");
	$(".bloco_cartoes2").css("background","#FFF");

	$(".img_pagamento1").css("background","url('imagens/1cartao.svg') center top no-repeat");
	$("#font1").css("color","#000");
	$(".bloco_cartoes1").css("background","#FFF");

	$(".img_pagamento3").css("background","url('imagens/boletoPgto.svg') center top no-repeat");
	$("#font3").css("color","#000");
	$(".bloco_cartoes3").css("background","#FFF");

	$(".img_pagamento5").css("background","url('imagens/pix_preto.svg') center top no-repeat");
	$("#font5").css("color","#000");
	$(".bloco_cartoes5").css("background","#FFF");

	$(".img_pagamento4").css("background","url('imagens/cartaoboletoPgto_hover.svg') center top no-repeat");
	$("#font4").css("color","#fff");
	$(".bloco_cartoes4").css("background","#000");

	$.ajax({
	type: "get",
	cache: false,
	url: "pagamento_cartao_boleto.php?Codigo="+ Codigo +"&ref="+ ref +"&cupom="+cupom + "&horas="+horas + "&Pos="+Pos + "&CodMigracao="+ CodMigracao + "&CompraAntecipada="+ CompraAntecipada + "&CompraAntecipadaCompra="+ CompraAntecipadaCompra,
	success: function(retorno){
		$("#forma_pagamento").html(retorno);
	}
	});

}

/// CARTÃO

function selecionaCartao1(Codigo,ref, horas, Pos, CodMigracao = "", CompraAntecipada = "N", CompraAntecipadaCompra = "N"){

	if(horas){
		horas = $("#horasExtra").val()
	} else {
		horas = "";
	}

	var cupom = $('#cupom').val();
	$(".img_pagamento2").css("background","url('imagens/2cartao.svg') center top no-repeat");
	$("#font2").css("color","#000");
	$(".bloco_cartoes2").css("background","#FFF");
	$(".img_pagamento3").css("background","url('imagens/boletoPgto.svg') center top no-repeat");
	$("#font3").css("color","#000");
	$(".bloco_cartoes3").css("background","#FFF");
	$(".img_pagamento4").css("background","url('imagens/cartaoboletoPgto.svg') center top no-repeat");
	$("#font4").css("color","#000");
	$(".bloco_cartoes4").css("background","#FFF");

	$(".img_pagamento5").css("background","url('imagens/pix_preto.svg') center top no-repeat");
	$("#font5").css("color","#000");
	$(".bloco_cartoes5").css("background","#FFF");
	
	$(".img_pagamento1").css("background","url('imagens/1cartao_hover.svg') center top no-repeat");
	$("#font1").css("color","#fff");
	$(".bloco_cartoes1").css("background","#000");

	$.ajax({
	type: "get",
	cache: false,
	url: "pagamento_cartao1.php?Codigo="+ Codigo +"&ref="+ ref +"&cupom="+cupom + "&horas="+horas + "&Pos="+Pos + "&CodMigracao="+ CodMigracao + "&CompraAntecipada="+ CompraAntecipada + "&CompraAntecipadaCompra="+ CompraAntecipadaCompra,
	success: function(retorno){
		$("#forma_pagamento").html(retorno);
	}
	});

}

function selecionaCartao2(Codigo,ref, horas, Pos, CodMigracao = "", CompraAntecipada = "N", CompraAntecipadaCompra = "N"){	

	if(horas){
		horas = $("#horasExtra").val()
	} else {
		horas = "";
	}

	var cupom = $('#cupom').val();
	$(".img_pagamento3").css("background","url('imagens/boletoPgto.svg') center top no-repeat");
	$("#font3").css("color","#000");
	$(".bloco_cartoes3").css("background","#FFF");
	$(".img_pagamento1").css("background","url('imagens/1cartao.svg') center top no-repeat");
	$("#font1").css("color","#000");
	$(".bloco_cartoes1").css("background","#FFF");
	$(".img_pagamento4").css("background","url('imagens/cartaoboletoPgto.svg') center top no-repeat");
	$("#font4").css("color","#000");
	$(".bloco_cartoes4").css("background","#FFF");

	$(".img_pagamento5").css("background","url('imagens/pix_preto.svg') center top no-repeat");
	$("#font5").css("color","#000");
	$(".bloco_cartoes5").css("background","#FFF");

	$(".img_pagamento2").css("background","url('imagens/2cartao_hover.svg') center top no-repeat");
	$("#font2").css("color","#fff");
	$(".bloco_cartoes2").css("background","#000");

	$.ajax({
	type: "get",
	cache: false,
	url: "pagamento_cartao2.php?Codigo="+ Codigo +"&ref="+ ref +"&cupom="+cupom + "&horas="+horas + "&Pos="+Pos + "&CodMigracao="+ CodMigracao + "&CompraAntecipada="+ CompraAntecipada + "&CompraAntecipadaCompra="+ CompraAntecipadaCompra,
	success: function(retorno){
		$("#forma_pagamento").html(retorno);
	}
	});

}

function selecionaBandeira(cod, cartao){
	$('.bloco_bandeira').removeClass('bandeira_selecionada');
	$('#cartao').val(cartao);
	$('#bandeira'+cod).addClass('bandeira_selecionada');
}

function selecionaBandeira1(cod, cartao){
	$('.bloco_bandeira2').removeClass('bandeira_selecionada');
	$('#cartao1').val(cartao);
	$('#bandeira'+cod).addClass('bandeira_selecionada');
}

function selecionaBandeira2(cod, cartao){
	$('.bloco_bandeira3').removeClass('bandeira_selecionada');
	$('#cartao2').val(cartao);
	$('#bandeira2_'+cod).addClass('bandeira_selecionada');
}

function totalCartao1(){

	var num = $('#parcela1');
	var parcelado = $('#valor_parcelado1');
	var vista = $('#valor_vista1');

	if(num.val() > 1){
		$('#valor_total').html("R$ "+parcelado.val());
	}else{
		$('#valor_total').html("R$ "+vista.val());
	}

}

function totalCartao2(){
	var parcela1 = $('#parcela1');
	var parcela2 = $('#parcela2');
	var total = $('#valor_total');
	var vista = $('#valor_vista');
	var parcelado = $('#valor_parcelado');
	var vista2 = $('#valor_vista2');
	var parcelado2 = $('#valor_parcelado2');

	if(parcela1.val() > 1 || parcela2.val() > 1){
		total.html("R$ "+ parcelado.val());
		pagamentoSoma(parcelado2.val());
	}else{
		total.html("R$ "+ vista.val());
		pagamentoSoma(vista2.val());
	}
}

function pagamentoSoma(total){

	var ct1 = $('#total_cartao1').val();
	var ct2 = $('#total_cartao2');
	ct1 = ct1.replace(/,/g, "");
	ct1 = ct1.replace(".", "");
	var soma = 0;
	soma = total-ct1;
	//console.log(ct1);


	var tmp = soma+'';
	tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
	if( tmp.length > 6 )
	tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

	ct2.val(tmp);

}

function pagamentoCartao1(){

	var nome = $('#nome');
	var cpf = $('#cpf');
	var cartao = $('#cartao');
	var nome_cartao = $('#nome_cartao');
	var numero_cartao = $('#numero_cartao');
	var validade_mes = $('#validade_mes');
	var validade_ano = $('#validade_ano');
	var cartao_div = $('.bloco_bandeira');
	var cvv = $('#cvv');
	var cpf_titular = $('#cpf_titular');
	var parcela = $('#parcela');
	var erro = 0;

	if(nome.val() == ""){
		nome.addClass("BordaErro");
		erro++;
	}else{
		nome.removeClass("BordaErro");
	}
	if(cpf.val() == ""){
		cpf.addClass("BordaErro");
		erro++;
	}else{
		cpf.removeClass("BordaErro");
	}
	if(cartao.val() == ""){
		cartao_div.addClass("BordaErro");
		erro++;
	}else{
		cartao_div.removeClass("BordaErro");
	}
	if(nome_cartao.val() == ""){
		nome_cartao.addClass("BordaErro");
		erro++;
	}else{
		nome_cartao.removeClass("BordaErro");
	}
	if(numero_cartao.val() == ""){
		numero_cartao.addClass("BordaErro");
		erro++;
	}else{
		numero_cartao.removeClass("BordaErro");
	}
	if(validade_mes.val() == ""){
		validade_mes.addClass("BordaErro");
		erro++;
	}else{
		validade_mes.removeClass("BordaErro");
	}
	if(validade_ano.val() == ""){
		validade_ano.addClass("BordaErro");
		erro++;
	}else{
		validade_ano.removeClass("BordaErro");
	}
	if(cvv.val().length < 3){
		cvv.addClass("BordaErro");
		erro++;
	}else{
		cvv.removeClass("BordaErro");
	}
	if(cpf_titular.val().length < 14){
		cpf_titular.addClass("BordaErro");
		erro++;
	}else{
		cpf_titular.removeClass("BordaErro");
	}
	if(parcela.val() == ""){
		parcela.addClass("BordaErro");
		erro++;
	}else{
		parcela.removeClass("BordaErro");
	}

	if(erro == 0){
		document.cookie = "pagamento = 1cartao; path=/";
		CieloCartaoFinalizarCompra("1");
	}
}

function pagamentoCartao2(){

	var nome = $('#nome');
	var cpf = $('#cpf');
	var total_cartao1 = $('#total_cartao1');
	var cartao1 = $('#cartao1');
	var parcela1 = $('#parcela1');
	var nome_cartao1 = $('#nome_cartao1');
	var numero_cartao1 = $('#numero_cartao1');
	var validade_mes1 = $('#validade_mes1');
	var validade_ano1 = $('#validade_ano1');
	var cvv1 = $('#cvv1');
	var cpf_titular1 = $('#cpf_titular1');
	var total_cartao2 = $('#total_cartao2');
	var cartao2 = $('#cartao2');
	var parcela2 = $('#parcela2');
	var nome_cartao2 = $('#nome_cartao2');
	var numero_cartao2 = $('#numero_cartao2');
	var validade_mes2 = $('#validade_mes2');
	var validade_ano2 = $('#validade_ano2');
	var cvv2 = $('#cvv2');
	var cpf_titular2 = $('#cpf_titular2');
	var cartao1Div = $('.bloco_bandeira2');
	var cartao2Div = $('.bloco_bandeira3');
	var erro = 0;

	if(nome.val() == ""){
		nome.addClass("BordaErro");
		erro++;
	}else{
		nome.removeClass("BordaErro");
	}
	if(cpf.val() == ""){
		cpf.addClass("BordaErro");
		erro++;
	}else{
		cpf.removeClass("BordaErro");
	}
	if(total_cartao1.val() == ""){
		total_cartao1.addClass("BordaErro");
		erro++;
	}else{
		total_cartao1.removeClass("BordaErro");
	}
	if(cartao1.val() == ""){
		cartao1Div.addClass("BordaErro");
		erro++;
	}else{
		cartao1Div.removeClass("BordaErro");
	}
	if(parcela1.val() == ""){
		parcela1.addClass("BordaErro");
		erro++;
	}else{
		parcela1.removeClass("BordaErro");
	}
	if(nome_cartao1.val() == ""){
		nome_cartao1.addClass("BordaErro");
		erro++;
	}else{
		nome_cartao1.removeClass("BordaErro");
	}
	if(numero_cartao1.val() == ""){
		numero_cartao1.addClass("BordaErro");
		erro++;
	}else{
		numero_cartao1.removeClass("BordaErro");
	}
	if(validade_mes1.val() == ""){
		validade_mes1.addClass("BordaErro");
		erro++;
	}else{
		validade_mes1.removeClass("BordaErro");
	}
	if(validade_ano1.val() == ""){
		validade_ano1.addClass("BordaErro");
		erro++;
	}else{
		validade_ano1.removeClass("BordaErro");
	}
	if(cvv1.val() == ""){
		cvv1.addClass("BordaErro");
		erro++;
	}else{
		cvv1.removeClass("BordaErro");
	}
	if(cpf_titular1.val() == ""){
		cpf_titular1.addClass("BordaErro");
		erro++;
	}else{
		cpf_titular1.removeClass("BordaErro");
	}
	if(total_cartao2.val() == ""){
		total_cartao2.addClass("BordaErro");
		erro++;
	}else{
		total_cartao2.removeClass("BordaErro");
	}
	if(cartao2.val() == ""){
		cartao2Div.addClass("BordaErro");
		erro++;
	}else{
		cartao2Div.removeClass("BordaErro");
	}
	if(parcela2.val() == ""){
		parcela2.addClass("BordaErro");
		erro++;
	}else{
		parcela2.removeClass("BordaErro");
	}
	if(nome_cartao2.val() == ""){
		nome_cartao2.addClass("BordaErro");
		erro++;
	}else{
		nome_cartao2.removeClass("BordaErro");
	}
	if(numero_cartao2.val() == ""){
		numero_cartao2.addClass("BordaErro");
		erro++;
	}else{
		numero_cartao2.removeClass("BordaErro");
	}
	if(validade_mes2.val() == ""){
		validade_mes2.addClass("BordaErro");
		erro++;
	}else{
		validade_mes2.removeClass("BordaErro");
	}
	if(validade_ano2.val() == ""){
		validade_ano2.addClass("BordaErro");
		erro++;
	}else{
		validade_ano2.removeClass("BordaErro");
	}
	if(cvv2.val() == ""){
		cvv2.addClass("BordaErro");
		erro++;
	}else{
		cvv2.removeClass("BordaErro");
	}
	if(cpf_titular2.val() == ""){
		cpf_titular2.addClass("BordaErro");
		erro++;
	}else{
		cpf_titular2.removeClass("BordaErro");
	}
	if(erro == 0){
		document.cookie = "pagamento = 2cartao; path=/";
		CieloCartaoFinalizarCompra("2");
	}
	

}

/////////////////////////////////////////////////////////////////////////// FIM PAGAMENTOS

function MostraErro(){
	$('#ErroVagas').removeClass("displaynone");
}

function contato() {
	var nome = $('#nome');
	var email = $('#email_contato');
	var mensagem = $('#mensagem');
	var erro = 0;

	if(nome.val() == ""){
		nome.addClass("BordaErro");
		erro++;
	}else{
		nome.removeClass("BordaErro");
	}
	if(email.val() == ""){
		email.addClass("BordaErro");
		erro++;
	}else{
		nome.removeClass("BordaErro");
	}
	if(mensagem.val() == ""){
		mensagem.addClass("BordaErro");
		erro++;
	}else{
		mensagem.removeClass("BordaErro");
	}

	var robo = $("#robo");
	if (typeof grecaptcha.getResponse() == "undefined" || grecaptcha.getResponse() == "") {
		erro++;
		robo.fadeIn(500);
	} else {
		robo.fadeOut(500);
	}

	if(erro == 0){
		$('#frm_contato').submit();
	}
}

function noticia(filtro){
	if (filtro == ""){
		window.open("/noticias","_self");
	}
	else{
		window.open("/noticias/filtro/"+filtro+"","_self");
	}
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

function CarreiraOpcao(opcao){

	if (opcao == "oab") {
		document.cookie = "carreira-opcao=oab; path=/";
		window.open(UrlSite +'oab', '_self');
	} else {
		document.cookie = "carreira-opcao=juridica; path=/";
		window.open(UrlSite, '_self');
	}

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


function AbreFechaMaisDetalhes(aux){
	var x = aux;
	aux.parent().parent().children('.DadosPagamento').slideToggle(200);
	aux.parent().find('.texto_botao').toggleClass('aberto');
	
	x = aux.parent().find('.texto_botao').html();

	if(x == 'Mais detalhes'){
		aux.parent().find('.texto_botao').html('Ocultar');
	}else{
		aux.parent().find('.texto_botao').html('Mais detalhes');
	}

	
}

function SelecionaOpcaoPos(codigo) {
	$(".OpcaoPos").removeClass("BordaErro");
	$(".OpcaoPos").removeClass("OpcaoPosSel");
	$(".OpcaoPos"+ codigo).addClass("OpcaoPosSel");

	$("#PosOpcao").val(codigo);
}

function e_rc_rd(c, a, v, r, p) {            
	$.ajax({
		type: "post",
		cache: false,
		data: {c:c, a:a, v:v, r:r, p:p},
		url: "evento_recompra.php",
		success: function(retorno){

			if (retorno.reserva == 'A'){

				abre(retorno.url_modal, 'ModalPadrao');

			}else{
				ComprarAgora(c, r, p);
			}

		}
	});
}

function FiltrarCategoria(codigo, ordem) {
	$(".filtro-categoria p").removeClass("sel");
	$(".filtro-categoria-"+ codigo).addClass("sel");

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


function valida_curso_indisponivel(curso, referencia){
	var nome = $('#indisponivel_nome');
	var email = $('#indisponivel_email');
	var erro = 0;

	if (nome.val() == ""){
		erro++;
		nome.css("border","2px solid #ff0000");
		nome.css("background-color","#fff7f7");
	}else{
		nome.css("border","0px");
		nome.css("background-color","#FFF");
	}

	var invalid = /\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
	if (invalid.test(email.val()) == false) {
		erro++;
		email.css("border","2px solid #ff0000");
		email.css("background-color","#fff7f7");
	}else{
		email.css("border","0px");
		email.css("background-color","#FFF");
	}

	if(erro == 0){
		$.ajax({
			type: "post",
			cache: false,
			data: {nome:nome.val(), email:email.val(), curso:curso, referencia:referencia},
			url: "evento_curso_indisponivel.php",
			success: function(retorno){
				console.log(retorno);

				if (retorno == "S") {
					$('#indisponivel_nome').val("");
					$('#indisponivel_email').val("");

					$('#indisponivel_mensagem').fadeIn(200);
					$('#indisponivel_mensagem').css({"background-color":"#5cb85c"});
					$('#indisponivel_mensagem').html("Solicitação enviada com sucesso!");

					setTimeout(function() {
						$('#indisponivel_mensagem').fadeOut(200);
					}, 3000);
				}
			}
		});
	}
}

function GetUtm(){
	const params = new URLSearchParams(window.location.search);

	var uid_mh = params.get('uid_mh');
	var utm_source = params.get('utm_source');
	var utm_medium = params.get('utm_medium');
	var utm_campaign = params.get('utm_campaign');
	var utm_term = params.get('utm_term');
	var utm_content = params.get('utm_content');
	var lp_venda = params.get('lp_venda'); 

	if (utm_source == "" || utm_source == null){
		utm_source = "busca-organica"
	}

	var obj_utm = {
		uid_mh: uid_mh,
		utm_source: utm_source,
		utm_medium: utm_medium,
		utm_campaign: utm_campaign,
		utm_term: utm_term,
		utm_content: utm_content,
		lp_venda: lp_venda
	};

	var json_utm = JSON.stringify(obj_utm);
	return json_utm;
}

function EmailCartaoNegado(){
	$.ajax({
		type: "get",
		cache: false,
		url: "email_cartao_negado.php",
		success: function(retorno){
			
		}
	});
}

function AlunoCompraInteresse(cod_curso, referencia, acao="interesse"){
	$.ajax({
		type: "post",
		cache: false,
		url: "aluno_compra_interesse.php",
		data:{cod_curso, referencia, acao},
		success: function(retorno){
			
		}
	});

}

function AlunoSalvarUtm(origem){
	var parametros_utm = GetUtm();

	$.ajax({
		type: "post",
		cache: false,
		url: "aluno_utm_salvar.php",
		data:{origem, parametros_utm},
		success: function(retorno){
			
		}
	});
}